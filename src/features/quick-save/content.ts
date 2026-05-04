import type { BookmarkNode } from "../bookmarks";
import type {
  QuickSaveCreatePayload,
  QuickSaveInitialState,
  QuickSavePageDetails,
  QuickSaveResponse
} from "./types";
import type { QuickSaveCreateFolderPayload } from "./createFolder";

declare global {
  interface Window {
    __bookmarkVisualizerQuickSaveOpen__?: () => void;
  }
}

(() => {
const QUICK_SAVE_GET_INITIAL_STATE = "bookmark-visualizer.quickSave.getInitialState";
const QUICK_SAVE_CREATE_BOOKMARK = "bookmark-visualizer.quickSave.createBookmark";
const QUICK_SAVE_CREATE_FOLDER = "bookmark-visualizer.quickSave.createFolder";
const HOST_ID = "bookmark-visualizer-quick-save";
const SUBMENU_CLOSE_DELAY_MS = 320;
const MENU_EDGE_GAP = 12;
const SUBMENU_GAP = 6;
const MIN_CASCADE_MENU_HEIGHT = 140;
const FLOATING_CASCADE_WIDTH = 260;
const FLOATING_CASCADE_MIN_HEIGHT = 180;
const FLOATING_CASCADE_ROW_HEIGHT = 34;
const FLOATING_CASCADE_PADDING = 12;
const QUICK_SAVE_CASCADE_ROW_BUTTON_CLASS = "move-folder-button";

interface CascadeAnchorRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface CascadeSize {
  width: number;
  height: number;
}

interface CascadePlacement {
  x: number;
  y: number;
  maxHeight: number;
  needsScroll: boolean;
  submenuDirection: "left" | "right";
  submenuBlockDirection: "up" | "down";
}

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
  const floatingRoot = document.createElement("div");
  floatingRoot.className = "quick-save-floating-root";
  shell.append(floatingRoot);

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
  let selectedFolderId = "";
  let selectedFolderTitle = "";
  let tree: BookmarkNode[] = [];
  let closed = false;
  let submenuCloseTimer: number | undefined;
  let activeFolderPath: string[] = [];
  let folderMap = new Map<string, BookmarkNode>();
  let cascadeAnchors = new Map<string, CascadeAnchorRect>();
  let cascadeMenuSizes = new Map<string, CascadeSize>();
  let cascadeLayers = new Map<string, HTMLElement>();

  titleInput.value = pageDetails.title;
  urlInput.value = pageDetails.url;
  folderMenu.addEventListener("wheel", handleMenuWheel, { passive: false });
  folderMenu.addEventListener("pointerenter", clearSubmenuCloseTimer);
  folderMenu.addEventListener("pointerleave", scheduleCloseOpenSubmenus);
  folderMenu.addEventListener("focusin", clearSubmenuCloseTimer);
  folderMenu.addEventListener("focusout", (event) => {
    const nextTarget = event.relatedTarget;
    if (!(nextTarget instanceof Node) || !folderMenu.contains(nextTarget)) {
      scheduleCloseOpenSubmenus();
    }
  });
  const cleanupDrag = enableDialogDrag(dialog, {
    onDragStart: closeOpenSubmenus,
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
    folderMenu.textContent = "";
    closeOpenSubmenus();
    folderMap = buildFolderMap(state.tree);
    const root = document.createElement("div");
    root.className = "move-menu-list";
    renderFolderRows(root, getMenuFolders(state.tree), [], undefined);

    if (!root.hasChildNodes()) {
      const empty = document.createElement("div");
      empty.className = "move-menu-empty";
      empty.textContent = "没有可用文件夹";
      root.append(empty);
    }

    folderMenu.append(root);
    updateRootFolderMenuLayout();
  }

  function renderFolderRows(
    parent: HTMLElement,
    folders: BookmarkNode[],
    parentPath: string[],
    createParent?: BookmarkNode
  ) {
    folders.forEach((folder) => {
      const row = document.createElement("div");
      const writable = canCreateBookmarkInFolder(folder);
      const nestedFolders = folder.children?.filter(isFolder) ?? [];
      const canCreateFolder = writable;
      const hasSubmenu = nestedFolders.length > 0 || canCreateFolder;
      const buttonDisabled = !writable && !hasSubmenu;
      row.className = `move-folder-row ${hasSubmenu ? "has-children" : ""} ${
        selectedFolderId === folder.id ? "is-selected" : ""
      }`;

      const button = document.createElement("button");
      button.type = "button";
      button.className = getCascadeButtonClassName();
      button.disabled = buttonDisabled;
      button.setAttribute("aria-disabled", String(!writable));
      button.innerHTML = `<span class="folder-glyph" aria-hidden="true"></span><span>${escapeHtml(
        getFolderTitle(folder)
      )}</span>${
        !writable ? '<span class="move-menu-note">不可保存</span>' : ""
      }${hasSubmenu ? '<span class="menu-chevron" aria-hidden="true"></span>' : ""}`;
      button.addEventListener("click", () => {
        if (writable) {
          selectFolder(folder);
          renderFolderMenu();
        }
      });
      row.append(button);

      attachCascadeRowBehavior(row, parentPath, folder, hasSubmenu);

      parent.append(row);
    });

    if (createParent && canCreateBookmarkInFolder(createParent)) {
      parent.append(createCreateFolderRow(createParent));
    }
  }

  function createCreateFolderRow(parentFolder: BookmarkNode): HTMLElement {
    const row = document.createElement("div");
    row.className = "move-folder-row move-folder-create-row";

    const button = document.createElement("button");
    button.type = "button";
    button.className = getCascadeButtonClassName("move-folder-create");
    button.textContent = "新建文件夹...";
    button.addEventListener("click", () => showInlineCreateFolder(row, parentFolder));
    row.append(button);

    return row;
  }

  function showInlineCreateFolder(row: HTMLElement, parentFolder: BookmarkNode) {
    row.textContent = "";
    row.classList.add("is-creating");

    const form = document.createElement("form");
    form.className = "create-folder-form";
    form.innerHTML = `
      <input name="folderName" autocomplete="off" placeholder="文件夹名称" />
      <button class="primary-button" type="submit">Save</button>
      <button type="button" data-action="cancel-create">Cancel</button>
    `;
    row.append(form);

    const input = form.elements.namedItem("folderName") as HTMLInputElement;
    const cancelButton = form.querySelector<HTMLButtonElement>('[data-action="cancel-create"]')!;
    cancelButton.addEventListener("click", () => renderFolderMenu());
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      void createFolder(parentFolder, input.value);
    });
    window.setTimeout(() => input.focus(), 0);
  }

  async function createFolder(parentFolder: BookmarkNode, title: string) {
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
    status.textContent = `已新建文件夹“${getFolderTitle(response.folder)}”。`;
  }

  function attachCascadeRowBehavior(
    row: HTMLElement,
    parentPath: string[],
    folder: BookmarkNode,
    hasSubmenu: boolean
  ) {
    function openCascadeRow() {
      clearSubmenuCloseTimer();
      cascadeAnchors.set(folder.id, rectToAnchor(row.getBoundingClientRect()));
      const nextPath = getCascadePathOnRowEnter(parentPath, folder.id, hasSubmenu);

      if (!pathsEqual(activeFolderPath, nextPath)) {
        activeFolderPath = nextPath;
      }

      syncFloatingCascadeLayers();
    }

    row.addEventListener("pointerenter", openCascadeRow);
    row.addEventListener("focusin", openCascadeRow);
  }

  function syncFloatingCascadeLayers() {
    const activeLayerKeys = new Set<string>();

    activeFolderPath.forEach((folderId, index) => {
      const folder = folderMap.get(folderId);
      const anchor = cascadeAnchors.get(folderId);

      if (!folder || !anchor) {
        return;
      }

      const parentPath = activeFolderPath.slice(0, index + 1);
      const layerKey = getCascadeLayerKey(parentPath);
      const layer = cascadeLayers.get(layerKey) ?? createFloatingCascadeLayer(folder, parentPath, layerKey);
      activeLayerKeys.add(layerKey);
      positionFloatingCascadeLayer(layer, anchor, folderId, index);
    });

    removeStaleFloatingCascadeLayers(activeLayerKeys);
  }

  function removeFloatingCascadeLayers() {
    cascadeLayers.forEach((layer) => {
      layer.remove();
    });
    cascadeLayers.clear();
  }

  function createFloatingCascadeLayer(
    folder: BookmarkNode,
    parentPath: string[],
    layerKey: string
  ): HTMLElement {
    const layer = document.createElement("div");
    layer.className = "context-submenu nested-submenu is-floating-cascade";
    layer.setAttribute("role", "menu");
    layer.dataset.cascadeLayer = "true";
    layer.dataset.cascadeLayerKey = layerKey;
    layer.addEventListener("pointerenter", clearSubmenuCloseTimer);
    layer.addEventListener("pointerleave", scheduleCloseOpenSubmenus);
    layer.addEventListener("focusin", clearSubmenuCloseTimer);
    layer.addEventListener("focusout", (event) => {
      const nextTarget = event.relatedTarget;
      if (!(nextTarget instanceof Node) || !layer.contains(nextTarget)) {
        scheduleCloseOpenSubmenus();
      }
    });
    layer.addEventListener("wheel", handleMenuWheel, { passive: false });

    renderFolderRows(layer, getMenuFolders(folder.children ?? []), parentPath, folder);
    floatingRoot.append(layer);
    cascadeLayers.set(layerKey, layer);

    return layer;
  }

  function removeStaleFloatingCascadeLayers(activeLayerKeys: Set<string>) {
    cascadeLayers.forEach((layer, layerKey) => {
      if (!activeLayerKeys.has(layerKey)) {
        layer.remove();
        cascadeLayers.delete(layerKey);
      }
    });
  }

  function positionFloatingCascadeLayer(
    layer: HTMLElement,
    anchor: CascadeAnchorRect,
    folderId: string,
    index: number
  ) {
    const previousSize = cascadeMenuSizes.get(folderId);
    const estimatedSize = previousSize ?? estimateCascadeLayerSize(folderMap.get(folderId));
    const firstPlacement = getCascadeMenuPlacement(
      anchor,
      { width: window.innerWidth, height: window.innerHeight },
      estimatedSize
    );
    applyFloatingCascadePlacement(layer, firstPlacement, index);

    const measuredSize = {
      width: Math.max(layer.offsetWidth || FLOATING_CASCADE_WIDTH, FLOATING_CASCADE_WIDTH),
      height: Math.max(
        layer.scrollHeight || layer.offsetHeight || FLOATING_CASCADE_MIN_HEIGHT,
        FLOATING_CASCADE_MIN_HEIGHT
      )
    };
    cascadeMenuSizes.set(folderId, measuredSize);

    const measuredPlacement = getCascadeMenuPlacement(
      anchor,
      { width: window.innerWidth, height: window.innerHeight },
      measuredSize
    );
    applyFloatingCascadePlacement(layer, measuredPlacement, index);
  }

  function applyFloatingCascadePlacement(
    layer: HTMLElement,
    placement: CascadePlacement,
    index: number
  ) {
    layer.classList.remove("opens-left", "opens-right", "opens-up", "opens-down");
    layer.classList.add(
      `opens-${placement.submenuDirection}`,
      `opens-${placement.submenuBlockDirection}`
    );
    layer.style.left = `${placement.x}px`;
    layer.style.top = `${placement.y}px`;
    layer.style.maxHeight = `${placement.maxHeight}px`;
    layer.style.overflowY = placement.needsScroll ? "auto" : "visible";
    layer.style.overflowX = "hidden";
    layer.style.zIndex = String(30 + index);
  }

  function handleMenuWheel(event: WheelEvent) {
    event.stopPropagation();
  }

  function updateRootFolderMenuLayout() {
    const list = folderMenu.firstElementChild as HTMLElement | null;
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

  function closeOpenSubmenus() {
    clearSubmenuCloseTimer();
    activeFolderPath = [];
    removeFloatingCascadeLayers();
  }

  function clearSubmenuCloseTimer() {
    if (submenuCloseTimer) {
      window.clearTimeout(submenuCloseTimer);
      submenuCloseTimer = undefined;
    }
  }

  function scheduleCloseOpenSubmenus() {
    clearSubmenuCloseTimer();
    submenuCloseTimer = window.setTimeout(closeOpenSubmenus, SUBMENU_CLOSE_DELAY_MS);
  }

  function selectFolder(folder: BookmarkNode) {
    selectedFolderId = folder.id;
    selectedFolderTitle = getFolderTitle(folder);
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
    clearSubmenuCloseTimer();
    removeFloatingCascadeLayers();
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
    syncFloatingCascadeLayers();
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
      z-index: 2147483647;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: rgba(15, 23, 42, 0.18);
    }
    .quick-save-dialog {
      position: relative;
      z-index: 1;
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
    .quick-save-floating-root {
      position: fixed;
      z-index: 2;
      inset: 0;
      pointer-events: none;
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
  for (const node of nodes) {
    if (node.id === id && isFolder(node)) {
      return node;
    }

    const nested = node.children ? findFolder(node.children, id) : undefined;
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function getMenuFolders(nodes: BookmarkNode[]): BookmarkNode[] {
  return nodes.flatMap((node) => {
    if (!isFolder(node)) {
      return [];
    }

    if (!node.parentId) {
      return getMenuFolders(node.children ?? []);
    }

    return [node];
  });
}

function buildFolderMap(nodes: BookmarkNode[]): Map<string, BookmarkNode> {
  const map = new Map<string, BookmarkNode>();

  function walk(folders: BookmarkNode[]) {
    folders.forEach((folder) => {
      map.set(folder.id, folder);
      walk(getMenuFolders(folder.children ?? []));
    });
  }

  walk(getMenuFolders(nodes));
  return map;
}

function estimateCascadeLayerSize(folder: BookmarkNode | undefined): CascadeSize {
  const rowCount = (folder ? getMenuFolders(folder.children ?? []).length : 0) + 1;

  return {
    width: FLOATING_CASCADE_WIDTH,
    height: Math.max(
      FLOATING_CASCADE_MIN_HEIGHT,
      rowCount * FLOATING_CASCADE_ROW_HEIGHT + FLOATING_CASCADE_PADDING
    )
  };
}

function rectToAnchor(rect: DOMRect): CascadeAnchorRect {
  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left
  };
}

function getCascadeMenuPlacement(
  anchor: CascadeAnchorRect,
  viewport: { width: number; height: number },
  menuSize: CascadeSize
): CascadePlacement {
  const minHeight = Math.min(MIN_CASCADE_MENU_HEIGHT, viewport.height - MENU_EDGE_GAP * 2);
  const rightSpace = viewport.width - anchor.right - SUBMENU_GAP - MENU_EDGE_GAP;
  const leftSpace = anchor.left - SUBMENU_GAP - MENU_EDGE_GAP;
  const opensLeft = rightSpace < menuSize.width && leftSpace > rightSpace;
  const rawX = opensLeft
    ? anchor.left - SUBMENU_GAP - menuSize.width
    : anchor.right + SUBMENU_GAP;
  const maxX = Math.max(MENU_EDGE_GAP, viewport.width - menuSize.width - MENU_EDGE_GAP);
  const x = clamp(rawX, MENU_EDGE_GAP, maxX);

  const downSpace = Math.max(0, viewport.height - anchor.top - MENU_EDGE_GAP);
  const upSpace = Math.max(0, anchor.bottom - MENU_EDGE_GAP);
  const opensUp = menuSize.height > downSpace && upSpace > downSpace;
  const availableBlockSpace = Math.max(opensUp ? upSpace : downSpace, minHeight);
  const maxHeight = Math.min(menuSize.height, availableBlockSpace);
  const rawY = opensUp ? anchor.bottom - maxHeight : anchor.top;
  const maxY = Math.max(MENU_EDGE_GAP, viewport.height - maxHeight - MENU_EDGE_GAP);

  return {
    x,
    y: clamp(rawY, MENU_EDGE_GAP, maxY),
    maxHeight,
    needsScroll: menuSize.height > maxHeight,
    submenuDirection: opensLeft ? "left" : "right",
    submenuBlockDirection: opensUp ? "up" : "down"
  };
}

function getCascadePathOnRowEnter(
  parentPath: string[],
  folderId: string,
  hasSubmenu: boolean
): string[] {
  return hasSubmenu ? [...parentPath, folderId] : [...parentPath];
}

function getCascadeLayerKey(path: string[]): string {
  return path.join("/");
}

function pathsEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function getCascadeButtonClassName(extraClassName?: string): string {
  return [QUICK_SAVE_CASCADE_ROW_BUTTON_CLASS, extraClassName].filter(Boolean).join(" ");
}

function isFolder(node: BookmarkNode): boolean {
  return !node.url && Array.isArray(node.children);
}

function canCreateBookmarkInFolder(node: BookmarkNode | undefined): boolean {
  return Boolean(node && isFolder(node) && node.parentId && !node.unmodifiable);
}

function getFolderTitle(node: BookmarkNode): string {
  return node.title.trim() || "Untitled";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[char] ?? char;
  });
}

function escapeCssUrl(value: string): string {
  return value.replace(/["\\\n\r]/g, "");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
})();
