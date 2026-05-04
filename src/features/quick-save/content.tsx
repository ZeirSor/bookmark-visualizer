import { StrictMode, useEffect, useMemo, useState, type FormEvent } from "react";
import { createRoot, type Root } from "react-dom/client";
import { FolderCascadeMenu } from "../../components/FolderCascadeMenu";
import {
  canCreateBookmarkInFolder,
  findNodeById,
  getDisplayTitle,
  isFolder,
  type BookmarkNode
} from "../bookmarks";
import {
  QUICK_SAVE_CASCADE_EDGE_GAP,
  QUICK_SAVE_CASCADE_MIN_HEIGHT,
  getQuickSaveCascadeButtonClassName,
} from "./cascadeMenu";
import {
  QUICK_SAVE_CREATE_BOOKMARK,
  QUICK_SAVE_CREATE_FOLDER,
  QUICK_SAVE_GET_INITIAL_STATE,
  type QuickSaveCreatePayload,
  type QuickSaveInitialState,
  type QuickSavePageDetails,
  type QuickSaveResponse
} from "./types";
import type { QuickSaveCreateFolderPayload } from "./createFolder";

declare global {
  interface Window {
    __bookmarkVisualizerQuickSaveOpen__?: () => void;
  }
}

(() => {
const HOST_ID = "bookmark-visualizer-quick-save";
const MENU_EDGE_GAP = QUICK_SAVE_CASCADE_EDGE_GAP;
const MIN_CASCADE_MENU_HEIGHT = QUICK_SAVE_CASCADE_MIN_HEIGHT;

if (window.__bookmarkVisualizerQuickSaveOpen__) {
  window.__bookmarkVisualizerQuickSaveOpen__();
} else {
  window.__bookmarkVisualizerQuickSaveOpen__ = openQuickSave;
  openQuickSave();
}

function openQuickSave() {
  document.getElementById(HOST_ID)?.remove();

  const pageDetails = extractQuickSavePageDetails();
  const host = document.createElement("div");
  host.id = HOST_ID;
  document.documentElement.append(host);

  const shadow = host.attachShadow({ mode: "open" });
  shadow.append(createStyle());

  const shell = document.createElement("div");
  shell.className = "quick-save-layer";
  shell.innerHTML = `
    <section class="quick-save-dialog" role="dialog" aria-modal="true" aria-labelledby="quick-save-title">
      <header>
        <div>
          <h2 id="quick-save-title">保存当前网页</h2>
        </div>
        <button class="ghost-button" type="button" data-action="close">Close</button>
      </header>
      <form>
        <div class="preview-row">
          <div class="preview-image" aria-hidden="true"></div>
          <div class="preview-copy">
            <label>标题<input name="title" autocomplete="off" /></label>
            <label>URL<input name="url" autocomplete="off" /></label>
          </div>
        </div>
        <label>备注<textarea name="note" rows="4" placeholder="添加一点自己的上下文"></textarea></label>
        <div class="folder-field">
          <span>保存位置</span>
          <strong data-role="selected-folder">正在读取文件夹...</strong>
          <div class="folder-menu" data-role="folder-menu"></div>
        </div>
        <p class="status" data-role="status" aria-live="polite"></p>
        <footer>
          <button type="button" data-action="cancel">Cancel</button>
          <button class="primary-button" type="submit">Save</button>
        </footer>
      </form>
    </section>
  `;
  shadow.append(shell);

  const dialog = shadow.querySelector<HTMLElement>(".quick-save-dialog")!;
  const form = shadow.querySelector<HTMLFormElement>("form")!;
  const titleInput = form.elements.namedItem("title") as HTMLInputElement;
  const urlInput = form.elements.namedItem("url") as HTMLInputElement;
  const noteInput = form.elements.namedItem("note") as HTMLTextAreaElement;
  const image = shadow.querySelector<HTMLElement>(".preview-image")!;
  const status = shadow.querySelector<HTMLElement>('[data-role="status"]')!;
  const selectedFolder = shadow.querySelector<HTMLElement>('[data-role="selected-folder"]')!;
  const folderMenu = shadow.querySelector<HTMLElement>('[data-role="folder-menu"]')!;
  const saveButton = shadow.querySelector<HTMLButtonElement>(".primary-button")!;
  const folderMenuRoot = document.createElement("div");
  folderMenuRoot.dataset.role = "folder-menu-root";
  folderMenu.append(folderMenuRoot);
  let selectedFolderId = "";
  let selectedFolderTitle = "";
  let tree: BookmarkNode[] = [];
  let closed = false;
  let folderMenuApp: Root | undefined;

  titleInput.value = pageDetails.title;
  urlInput.value = pageDetails.url;
  folderMenu.addEventListener("wheel", stopWheelPropagation, { passive: false });
  const cleanupDrag = enableDialogDrag(dialog, {
    onDragStart: () => {
      renderFolderMenu();
    },
    onDragMove: handleWindowResize
  });
  window.addEventListener("resize", handleWindowResize);
  if (pageDetails.previewImageUrl) {
    image.style.backgroundImage = `url("${escapeCssUrl(pageDetails.previewImageUrl)}")`;
  } else {
    image.textContent = "No image";
  }

  shell.addEventListener("mousedown", (event) => {
    if (event.target === shell) {
      close();
    }
  });
  shadow.querySelectorAll("[data-action='close'], [data-action='cancel']").forEach((button) => {
    button.addEventListener("click", close);
  });
  shadow.addEventListener("keydown", (rawEvent) => {
    const event = rawEvent as KeyboardEvent;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "Tab") {
      trapFocus(event, shadow);
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void save();
  });

  void loadFolders();
  window.setTimeout(() => titleInput.focus(), 0);

  function ensureFolderMenuApp() {
    if (!folderMenuApp) {
      folderMenuApp = createRoot(folderMenuRoot);
    }

    return folderMenuApp;
  }

  async function loadFolders() {
    const response = await sendMessage({ type: QUICK_SAVE_GET_INITIAL_STATE });
    if (!response.ok || !("state" in response)) {
      status.textContent = response.ok ? "无法读取文件夹。" : response.error;
      saveButton.disabled = true;
      return;
    }

    tree = response.state.tree;
    const initialFolder = response.state.defaultFolderId
      ? findFolder(tree, response.state.defaultFolderId)
      : findFirstWritableFolder(tree);
    if (initialFolder) {
      selectFolder(initialFolder);
    }
    renderFolderMenu(response.state);
  }

  function renderFolderMenu(state: QuickSaveInitialState = { tree }) {
    ensureFolderMenuApp().render(
      <StrictMode>
        <QuickSaveFolderMenu
          tree={state.tree}
          selectedFolderId={selectedFolderId}
          portalContainer={shadow}
          onSelect={(folder) => {
            selectFolder(folder);
            renderFolderMenu();
          }}
          onCreateFolder={async (parentFolder, title) => {
            const payload: QuickSaveCreateFolderPayload = {
              parentId: parentFolder.id,
              title
            };

            status.textContent = "";
            const response = await sendMessage({ type: QUICK_SAVE_CREATE_FOLDER, payload });
            if (!response.ok || !("folder" in response)) {
              status.textContent = response.ok ? "新建文件夹失败。" : response.error;
              return;
            }

            tree = response.state.tree;
            selectFolder(response.folder);
            renderFolderMenu(response.state);
            status.textContent = `已新建文件夹“${getDisplayTitle(response.folder)}”。`;
          }}
        />
      </StrictMode>
    );
    updateRootFolderMenuLayout();
  }

  function stopWheelPropagation(event: WheelEvent) {
    event.stopPropagation();
  }

  function updateRootFolderMenuLayout() {
    const list = folderMenu.querySelector<HTMLElement>(".move-menu-list");
    if (!list) {
      return;
    }

    folderMenu.style.maxHeight = "";
    folderMenu.style.overflowY = "visible";
    const rect = folderMenu.getBoundingClientRect();
    const contentHeight = Math.max(list.scrollHeight, 96);
    const availableHeight = Math.max(
      MIN_CASCADE_MENU_HEIGHT,
      window.innerHeight - rect.top - MENU_EDGE_GAP * 2
    );
    const maxHeight = Math.min(contentHeight, availableHeight);
    folderMenu.style.maxHeight = `${maxHeight}px`;
    folderMenu.style.overflowY = contentHeight > maxHeight ? "auto" : "visible";
    folderMenu.style.overflowX = "hidden";
  }

  function selectFolder(folder: BookmarkNode) {
    selectedFolderId = folder.id;
    selectedFolderTitle = getDisplayTitle(folder);
    selectedFolder.textContent = selectedFolderTitle;
  }

  async function save() {
    status.textContent = "";

    if (!selectedFolderId) {
      status.textContent = "请选择保存位置。";
      return;
    }

    const payload: QuickSaveCreatePayload = {
      parentId: selectedFolderId,
      title: titleInput.value,
      url: urlInput.value,
      note: noteInput.value,
      previewImageUrl: pageDetails.previewImageUrl
    };

    saveButton.disabled = true;
    const response = await sendMessage({ type: QUICK_SAVE_CREATE_BOOKMARK, payload });
    if (!response.ok) {
      status.textContent = response.error;
      saveButton.disabled = false;
      return;
    }

    status.textContent = `已保存到 ${selectedFolderTitle}。`;
    window.setTimeout(close, 650);
  }

  function close() {
    if (closed) {
      return;
    }
    closed = true;
    folderMenuApp?.unmount();
    folderMenuApp = undefined;
    cleanupDrag();
    window.removeEventListener("resize", handleWindowResize);

    if (document.getElementById(HOST_ID) === host) {
      host.remove();
    }

    if (!document.getElementById(HOST_ID)) {
      delete window.__bookmarkVisualizerQuickSaveOpen__;
    }
  }

  function handleWindowResize() {
    updateRootFolderMenuLayout();
    renderFolderMenu();
  }
}

function enableDialogDrag(
  dialog: HTMLElement,
  callbacks: { onDragStart(): void; onDragMove(): void }
): () => void {
  let pointerId: number | undefined;
  let startClientX = 0;
  let startClientY = 0;
  let startOffsetX = 0;
  let startOffsetY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let minOffsetX = 0;
  let maxOffsetX = 0;
  let minOffsetY = 0;
  let maxOffsetY = 0;

  function handlePointerDown(event: PointerEvent) {
    if (event.button !== 0 || !canDragDialogFrom(event.target)) {
      return;
    }

    const rect = dialog.getBoundingClientRect();
    pointerId = event.pointerId;
    startClientX = event.clientX;
    startClientY = event.clientY;
    startOffsetX = offsetX;
    startOffsetY = offsetY;
    minOffsetX = startOffsetX + MENU_EDGE_GAP - rect.left;
    maxOffsetX = startOffsetX + window.innerWidth - MENU_EDGE_GAP - rect.right;
    minOffsetY = startOffsetY + MENU_EDGE_GAP - rect.top;
    maxOffsetY = startOffsetY + window.innerHeight - MENU_EDGE_GAP - rect.bottom;
    dialog.classList.add("is-dragging");
    dialog.setPointerCapture(pointerId);
    callbacks.onDragStart();
    event.preventDefault();
  }

  function handlePointerMove(event: PointerEvent) {
    if (pointerId !== event.pointerId) {
      return;
    }

    offsetX = clamp(startOffsetX + event.clientX - startClientX, minOffsetX, maxOffsetX);
    offsetY = clamp(startOffsetY + event.clientY - startClientY, minOffsetY, maxOffsetY);
    dialog.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    callbacks.onDragMove();
  }

  function handlePointerUp(event: PointerEvent) {
    if (pointerId !== event.pointerId) {
      return;
    }

    dialog.classList.remove("is-dragging");
    dialog.releasePointerCapture(pointerId);
    pointerId = undefined;
  }

  dialog.addEventListener("pointerdown", handlePointerDown);
  dialog.addEventListener("pointermove", handlePointerMove);
  dialog.addEventListener("pointerup", handlePointerUp);
  dialog.addEventListener("pointercancel", handlePointerUp);

  return () => {
    dialog.removeEventListener("pointerdown", handlePointerDown);
    dialog.removeEventListener("pointermove", handlePointerMove);
    dialog.removeEventListener("pointerup", handlePointerUp);
    dialog.removeEventListener("pointercancel", handlePointerUp);
  };
}

function canDragDialogFrom(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return !Boolean(
    target.closest(
      "button, input, textarea, label, .folder-menu, .context-submenu, .preview-image, .status"
    )
  );
}

function sendMessage(message: unknown): Promise<QuickSaveResponse> {
  return chrome.runtime.sendMessage(message) as Promise<QuickSaveResponse>;
}

function extractQuickSavePageDetails(
  documentRef: Document = document,
  locationRef: Location = location
): QuickSavePageDetails {
  const url = locationRef.href;
  const title =
    getMetaContent(documentRef, 'meta[property="og:title"]') ||
    getMetaContent(documentRef, 'meta[name="twitter:title"]') ||
    documentRef.title ||
    getHostname(url);
  const previewImageUrl =
    absolutizeUrl(
      getMetaContent(documentRef, 'meta[property="og:image"]') ||
        getMetaContent(documentRef, 'meta[name="twitter:image"]') ||
        getFaviconHref(documentRef) ||
        getFirstImageSrc(documentRef),
      url
    ) || undefined;

  return {
    url,
    title: title.trim() || getHostname(url),
    previewImageUrl
  };
}

function getMetaContent(documentRef: Document, selector: string): string {
  return documentRef.querySelector<HTMLMetaElement>(selector)?.content?.trim() ?? "";
}

function getFaviconHref(documentRef: Document): string {
  return (
    documentRef.querySelector<HTMLLinkElement>('link[rel~="icon"]')?.href?.trim() ||
    documentRef.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]')?.href?.trim() ||
    ""
  );
}

function getFirstImageSrc(documentRef: Document): string {
  const image = Array.from(documentRef.images).find((candidate) => {
    const width = candidate.naturalWidth || candidate.width;
    const height = candidate.naturalHeight || candidate.height;
    return Boolean(candidate.currentSrc || candidate.src) && width >= 80 && height >= 80;
  });

  return image?.currentSrc || image?.src || "";
}

function absolutizeUrl(value: string, baseUrl: string): string {
  if (!value) {
    return "";
  }

  try {
    return new URL(value, baseUrl).href;
  } catch {
    return "";
  }
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname || "Untitled bookmark";
  } catch {
    return "Untitled bookmark";
  }
}

function createStyle(): HTMLStyleElement {
  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; color-scheme: light; }
    * { box-sizing: border-box; }
    .quick-save-layer {
      position: fixed;
      z-index: 1;
      inset: 0;
      z-index: 2147483647;
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: rgba(15, 23, 42, 0.18);
    }
    .quick-save-dialog {
      display: grid;
      gap: 18px;
      width: min(640px, calc(100vw - 32px));
      max-height: min(760px, calc(100vh - 48px));
      overflow: visible;
      padding: 20px;
      color: #0f172a;
      background: #ffffff;
      border: 1px solid #d7def0;
      border-radius: 8px;
      box-shadow: 0 24px 80px rgba(15, 23, 42, 0.22);
      touch-action: none;
    }
    .quick-save-dialog.is-dragging {
      cursor: grabbing;
      user-select: none;
    }
    header, footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    header {
      padding-bottom: 14px;
      border-bottom: 1px solid #e5e9f4;
      cursor: grab;
    }
    .quick-save-dialog.is-dragging header { cursor: grabbing; }
    h2, p { margin: 0; }
    h2 { font-size: 18px; line-height: 1.2; }
    header p, label, .folder-field > span, .status {
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
    }
    form, .preview-copy {
      display: grid;
      gap: 15px;
    }
    .preview-row {
      display: grid;
      grid-template-columns: 112px minmax(0, 1fr);
      gap: 14px;
    }
    .preview-image {
      display: grid;
      min-height: 112px;
      place-items: center;
      color: #64748b;
      font-size: 12px;
      font-weight: 800;
      background: #f7f9fc center / cover no-repeat;
      border: 1px solid #d7def0;
      border-radius: 8px;
    }
    label, .folder-field {
      display: grid;
      gap: 6px;
    }
    input, textarea {
      width: 100%;
      padding: 9px 10px;
      color: #0f172a;
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      background: #f7f9fc;
      border: 1px solid #d7def0;
      border-radius: 8px;
      outline: 0;
    }
    textarea { min-height: 88px; resize: vertical; }
    input:focus, textarea:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.14);
    }
    .folder-field {
      position: relative;
      padding: 12px;
      background: #f7f9fc;
      border: 1px solid #d7def0;
      border-radius: 8px;
    }
    .folder-field strong {
      color: #0f172a;
      font-size: 13px;
    }
    .folder-menu {
      position: relative;
      max-width: 320px;
      min-height: 96px;
      overflow-x: hidden;
      overflow-y: visible;
      overscroll-behavior: contain;
    }
    .move-menu-list { display: grid; gap: 2px; width: 260px; }
    .move-folder-row { position: relative; }
    .move-folder-row.has-children::after {
      position: absolute;
      top: 0;
      right: -10px;
      bottom: 0;
      width: 12px;
      content: "";
    }
    .move-folder-row.has-children.opens-left::after {
      right: auto;
      left: -10px;
    }
    .move-folder-button {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      width: 100%;
      min-height: 32px;
      padding: 0 9px;
      color: #0f172a;
      font: inherit;
      font-size: 13px;
      text-align: left;
      background: #ffffff;
      border: 0;
      border-radius: 7px;
      cursor: pointer;
    }
    .move-folder-button:hover,
    .move-folder-button:focus-visible,
    .move-folder-row.is-selected > .move-folder-button {
      background: rgba(79, 70, 229, 0.12);
      outline: 0;
    }
    .move-folder-button[aria-disabled="true"] {
      color: #94a3b8;
    }
    .move-folder-row.has-children > .move-folder-button[aria-disabled="true"] {
      cursor: pointer;
    }
    .move-menu-empty,
    .move-menu-note {
      color: #94a3b8;
      font-size: 12px;
      font-weight: 800;
    }
    .move-menu-empty {
      padding: 8px 9px;
    }
    .move-menu-note {
      margin-left: auto;
    }
    .folder-glyph {
      width: 14px;
      height: 11px;
      border: 1px solid currentColor;
      border-top-width: 4px;
      border-radius: 3px;
      opacity: 0.72;
    }
    .menu-chevron {
      width: 7px;
      height: 7px;
      margin-left: auto;
      border-top: 1px solid currentColor;
      border-right: 1px solid currentColor;
      transform: rotate(45deg);
    }
    .context-submenu {
      position: fixed;
      min-width: 240px;
      overflow-x: hidden;
      overflow-y: visible;
      overscroll-behavior: contain;
      padding: 6px;
      visibility: hidden;
      pointer-events: none;
      background: #ffffff;
      border: 1px solid #d7def0;
      border-radius: 8px;
      box-shadow: 0 18px 48px rgba(15, 23, 42, 0.16);
      opacity: 0;
      transform: translateX(-4px);
      transition: opacity 120ms ease, transform 120ms ease, visibility 120ms ease;
    }
    .move-folder-row.opens-left > .context-submenu {
      transform: translateX(4px);
    }
    .context-submenu.is-floating-cascade {
      visibility: visible;
      pointer-events: auto;
      opacity: 1;
      transform: translateX(0);
    }
    .context-submenu.is-floating-cascade.opens-left,
    .context-submenu.is-floating-cascade.opens-right,
    .context-submenu.is-floating-cascade.opens-up,
    .context-submenu.is-floating-cascade.opens-down {
      transform: translateX(0);
    }
    .move-folder-row.has-children:hover > .context-submenu,
    .move-folder-row.has-children:focus-within > .context-submenu,
    .move-folder-row.has-children.is-open > .context-submenu {
      visibility: visible;
      pointer-events: auto;
      opacity: 1;
      transform: translateX(0);
    }
    .move-folder-create {
      color: #4f46e5 !important;
      font-weight: 900;
    }
    .create-folder-form {
      display: grid;
      grid-template-columns: minmax(120px, 1fr) auto auto;
      gap: 6px;
      padding: 4px;
    }
    .create-folder-form input {
      min-width: 0;
      padding: 7px 8px;
    }
    .create-folder-form button {
      min-height: 30px;
      padding: 0 8px;
    }
    .status {
      min-height: 18px;
      color: #4f46e5;
    }
    button {
      min-height: 34px;
      padding: 0 12px;
      color: #0f172a;
      font: inherit;
      font-size: 13px;
      font-weight: 800;
      background: #f7f9fc;
      border: 1px solid #d7def0;
      border-radius: 8px;
      cursor: pointer;
    }
    button:disabled { cursor: default; opacity: 0.62; }
    .primary-button {
      color: #ffffff;
      background: #4f46e5;
      border-color: #4f46e5;
    }
    @media (max-width: 620px) {
      .preview-row { grid-template-columns: 1fr; }
      .preview-image { min-height: 140px; }
      .context-submenu {
        position: static;
        display: none;
        margin: 4px 0 4px 18px;
        box-shadow: none;
        transform: none;
      }
      .context-submenu.is-floating-cascade {
        position: fixed;
        display: block;
        margin: 0;
        box-shadow: 0 18px 48px rgba(15, 23, 42, 0.16);
      }
      .move-folder-row.has-children:hover > .context-submenu,
      .move-folder-row.has-children:focus-within > .context-submenu,
      .move-folder-row.has-children.is-open > .context-submenu {
        display: block;
      }
    }
  `;
  return style;
}

function trapFocus(event: KeyboardEvent, root: ShadowRoot) {
  const focusable = Array.from(
    root.querySelectorAll<HTMLElement>("button, input, textarea, [tabindex]:not([tabindex='-1'])")
  ).filter((element) => !element.hasAttribute("disabled"));
  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && root.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && root.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function findFirstWritableFolder(nodes: BookmarkNode[]): BookmarkNode | undefined {
  for (const node of nodes) {
    if (canCreateBookmarkInFolder(node)) {
      return node;
    }

    const nested = node.children ? findFirstWritableFolder(node.children) : undefined;
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function findFolder(nodes: BookmarkNode[], id: string): BookmarkNode | undefined {
  const node = findNodeById(nodes, id);
  return node && isFolder(node) ? node : undefined;
}

function escapeCssUrl(value: string): string {
  return value.replace(/["\\\n\r]/g, "");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function QuickSaveFolderMenu({
  tree,
  selectedFolderId,
  portalContainer,
  onSelect,
  onCreateFolder
}: {
  tree: BookmarkNode[];
  selectedFolderId?: string;
  portalContainer: ShadowRoot;
  onSelect(folder: BookmarkNode): void;
  onCreateFolder(parentFolder: BookmarkNode, title: string): Promise<void>;
}) {
  const [creatingParentId, setCreatingParentId] = useState<string>();

  useEffect(() => {
    if (!creatingParentId) {
      return;
    }

    const currentParent = findNodeById(tree, creatingParentId);
    if (!currentParent || !canCreateBookmarkInFolder(currentParent)) {
      setCreatingParentId(undefined);
    }
  }, [creatingParentId, tree]);

  const selectedFolder = selectedFolderId ? findNodeById(tree, selectedFolderId) : undefined;

  return (
    <FolderCascadeMenu
      nodes={tree}
      selectedFolderId={selectedFolder?.id}
      disabledLabel="不可保存"
      portalContainer={portalContainer}
      onSelect={onSelect}
      canSelect={(folder) => canCreateBookmarkInFolder(folder)}
      onCreateFolder={(parentFolder) => {
        if (canCreateBookmarkInFolder(parentFolder)) {
          setCreatingParentId(parentFolder.id);
        }
      }}
      renderCreateAction={(parentFolder) =>
        creatingParentId === parentFolder.id && canCreateBookmarkInFolder(parentFolder) ? (
          <QuickSaveCreateFolderForm
            key={`create-${parentFolder.id}`}
            parentFolder={parentFolder}
            onSubmit={async (title) => {
              await onCreateFolder(parentFolder, title);
              setCreatingParentId(undefined);
            }}
            onCancel={() => setCreatingParentId(undefined)}
          />
        ) : (
          <button
            key={`create-${parentFolder.id}`}
            className={getQuickSaveCascadeButtonClassName("move-folder-create")}
            type="button"
            role="menuitem"
            onClick={() => setCreatingParentId(parentFolder.id)}
          >
            新建文件夹...
          </button>
        )
      }
    />
  );
}

function QuickSaveCreateFolderForm({
  parentFolder,
  onSubmit,
  onCancel
}: {
  parentFolder: BookmarkNode;
  onSubmit(title: string): Promise<void>;
  onCancel(): void;
}) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const placeholder = useMemo(() => `在“${getDisplayTitle(parentFolder)}”下新建`, [parentFolder]);

  useEffect(() => {
    return () => {
      setSubmitting(false);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(title);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="move-folder-row move-folder-create-row is-creating">
      <form className="create-folder-form" onSubmit={(event) => void handleSubmit(event)}>
        <input
          name="folderName"
          autoFocus
          autoComplete="off"
          placeholder={placeholder}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button className="primary-button" type="submit" disabled={submitting}>
          Save
        </button>
        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </form>
    </div>
  );
}
})();
