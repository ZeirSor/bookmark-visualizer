import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { FolderCascadeMenu } from "../../components/FolderCascadeMenu";
import {
  buildFolderBreadcrumbItems,
  canCreateBookmarkInFolder,
  filterFolderOptions,
  findNodeById,
  flattenFolders,
  getDisplayTitle,
  isFolder,
  type BookmarkNode,
  type FolderOption
} from "../bookmarks";
import { extractQuickSavePageDetails } from "./pageDetails";
import type {
  QuickSaveCreatePayload,
  QuickSaveInitialState,
  QuickSavePageDetails,
  QuickSaveResponse
} from "./types";

declare global {
  interface Window {
    __bookmarkVisualizerQuickSaveOpen__?: () => void;
    __bookmarkVisualizerQuickSaveClose__?: () => void;
  }
}

const QUICK_SAVE_GET_INITIAL_STATE = "bookmark-visualizer.quickSave.getInitialState";
const QUICK_SAVE_CREATE_BOOKMARK = "bookmark-visualizer.quickSave.createBookmark";
const QUICK_SAVE_CREATE_FOLDER = "bookmark-visualizer.quickSave.createFolder";
const HOST_ID = "bookmark-visualizer-quick-save";
const CLOSE_AFTER_SAVE_MS = 700;

if (window.__bookmarkVisualizerQuickSaveOpen__) {
  window.__bookmarkVisualizerQuickSaveOpen__();
} else {
  window.__bookmarkVisualizerQuickSaveOpen__ = openQuickSave;
  openQuickSave();
}

function openQuickSave() {
  window.__bookmarkVisualizerQuickSaveClose__?.();
  document.getElementById(HOST_ID)?.remove();

  const host = document.createElement("div");
  host.id = HOST_ID;
  document.documentElement.append(host);

  const shadowRoot = host.attachShadow({ mode: "open" });
  shadowRoot.append(createStyle());

  const appRoot = document.createElement("div");
  shadowRoot.append(appRoot);

  const pageDetails = extractQuickSavePageDetails();
  const root = createRoot(appRoot);
  let closed = false;

  function close() {
    if (closed) {
      return;
    }

    closed = true;
    root.unmount();
    host.remove();

    if (!document.getElementById(HOST_ID)) {
      delete window.__bookmarkVisualizerQuickSaveOpen__;
      delete window.__bookmarkVisualizerQuickSaveClose__;
    }
  }

  window.__bookmarkVisualizerQuickSaveClose__ = close;
  root.render(<QuickSaveDialog pageDetails={pageDetails} shadowRoot={shadowRoot} onClose={close} />);
}

function QuickSaveDialog({
  pageDetails,
  shadowRoot,
  onClose
}: {
  pageDetails: QuickSavePageDetails;
  shadowRoot: ShadowRoot;
  onClose(): void;
}) {
  const [tree, setTree] = useState<BookmarkNode[]>([]);
  const [recentFolderIds, setRecentFolderIds] = useState<string[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [browsingFolderId, setBrowsingFolderId] = useState("");
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState(pageDetails.title);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const cascadePortalRef = useRef<HTMLDivElement>(null);

  const rootId = useMemo(() => getRootFolderId(tree), [tree]);
  const folderOptions = useMemo(
    () => flattenFolders(tree).filter((option) => canCreateBookmarkInFolder(option.node)),
    [tree]
  );
  const folderOptionMap = useMemo(
    () => new Map(folderOptions.map((option) => [option.id, option])),
    [folderOptions]
  );
  const searchResults = useMemo(() => {
    const normalized = query.trim();
    return normalized ? filterFolderOptions(folderOptions, normalized).slice(0, 8) : [];
  }, [folderOptions, query]);
  const recentFolders = useMemo(
    () =>
      recentFolderIds
        .map((folderId) => folderOptionMap.get(folderId))
        .filter((option): option is FolderOption => Boolean(option))
        .slice(0, 5),
    [folderOptionMap, recentFolderIds]
  );
  const selectedFolder = selectedFolderId ? findNodeById(tree, selectedFolderId) : undefined;
  const selectedOption = selectedFolderId ? folderOptionMap.get(selectedFolderId) : undefined;
  const selectedFolderTitle = selectedFolder ? getDisplayTitle(selectedFolder) : "";
  const selectedPath = selectedOption?.path ?? selectedFolderTitle;
  const browsingFolder = browsingFolderId ? findNodeById(tree, browsingFolderId) : undefined;
  const browsingChildren = useMemo(
    () => getBrowsingFolders(tree, browsingFolderId || rootId),
    [browsingFolderId, rootId, tree]
  );
  const browsingBreadcrumbItems = useMemo(
    () => buildFolderBreadcrumbItems(tree, browsingFolderId || rootId),
    [browsingFolderId, rootId, tree]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialState() {
      const response = await sendMessage({ type: QUICK_SAVE_GET_INITIAL_STATE });
      if (cancelled) {
        return;
      }

      if (!response.ok || !("state" in response)) {
        setStatus(response.ok ? "无法读取文件夹。" : response.error);
        setLoading(false);
        return;
      }

      applyInitialState(response.state);
      setLoading(false);
      window.setTimeout(() => titleInputRef.current?.focus(), 0);
    }

    void loadInitialState();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(rawEvent: Event) {
      const event = rawEvent as KeyboardEvent;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && (event.key.toLocaleLowerCase() === "s" || event.key === "Enter")) {
        event.preventDefault();
        void save();
        return;
      }

      if (event.key === "Tab") {
        trapFocus(event, shadowRoot);
      }
    }

    shadowRoot.addEventListener("keydown", handleKeyDown);
    return () => shadowRoot.removeEventListener("keydown", handleKeyDown);
  });

  function applyInitialState(state: QuickSaveInitialState) {
    const nextRootId = getRootFolderId(state.tree);
    const defaultFolder = state.defaultFolderId
      ? findNodeById(state.tree, state.defaultFolderId)
      : findFirstWritableFolder(state.tree);

    setTree(state.tree);
    setRecentFolderIds(state.recentFolderIds);

    if (defaultFolder && isFolder(defaultFolder)) {
      setSelectedFolderId(defaultFolder.id);
      setBrowsingFolderId(defaultFolder.parentId ?? nextRootId);
    } else {
      setBrowsingFolderId(nextRootId);
    }
  }

  function selectFolder(folder: BookmarkNode, syncBrowseToParent = false) {
    if (!canCreateBookmarkInFolder(folder)) {
      return;
    }

    setSelectedFolderId(folder.id);
    setStatus("");

    if (syncBrowseToParent) {
      setBrowsingFolderId(folder.parentId ?? rootId);
    }
  }

  function openFolder(folder: BookmarkNode) {
    if (!isFolder(folder)) {
      return;
    }

    setBrowsingFolderId(folder.id);
    setQuery("");
  }

  async function createFolder(parentFolder: BookmarkNode, folderTitle: string) {
    const title = folderTitle.trim();
    if (!title) {
      setStatus("文件夹名称不能为空。");
      return;
    }

    setStatus("");
    const response = await sendMessage({
      type: QUICK_SAVE_CREATE_FOLDER,
      payload: {
        parentId: parentFolder.id,
        title
      }
    });

    if (!response.ok || !("folder" in response)) {
      setStatus(response.ok ? "新建文件夹失败。" : response.error);
      return;
    }

    setTree(response.state.tree);
    setRecentFolderIds(response.state.recentFolderIds);
    setSelectedFolderId(response.folder.id);
    setBrowsingFolderId(response.folder.parentId ?? getRootFolderId(response.state.tree));
    setStatus(`已新建文件夹“${getDisplayTitle(response.folder)}”。`);
  }

  async function save() {
    if (saving) {
      return;
    }

    if (!selectedFolderId) {
      setStatus("请选择保存位置。");
      return;
    }

    const payload: QuickSaveCreatePayload = {
      parentId: selectedFolderId,
      title,
      url: pageDetails.url,
      note,
      previewImageUrl: pageDetails.previewImageUrl
    };

    setSaving(true);
    setStatus("");
    const response = await sendMessage({ type: QUICK_SAVE_CREATE_BOOKMARK, payload });

    if (!response.ok) {
      setSaving(false);
      setStatus(response.error);
      return;
    }

    setStatus(`已保存到 ${selectedFolderTitle}。`);
    window.setTimeout(onClose, CLOSE_AFTER_SAVE_MS);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save();
  }

  return (
    <div className="quick-save-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        ref={dialogRef}
        className="quick-save-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-save-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="quick-save-header">
          <h2 id="quick-save-title">保存当前网页</h2>
          <button className="secondary-button" type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <form className="quick-save-form" onSubmit={handleSubmit}>
          <section className="page-details-grid" aria-label="网页信息">
            <div className="preview-image">
              {pageDetails.previewImageUrl && !previewFailed ? (
                <img
                  src={pageDetails.previewImageUrl}
                  alt=""
                  onError={() => setPreviewFailed(true)}
                />
              ) : (
                <span>无预览图</span>
              )}
            </div>

            <div className="detail-fields">
              <label>
                <span>标题</span>
                <input ref={titleInputRef} value={title} onChange={(event) => setTitle(event.target.value)} />
              </label>
              <label>
                <span>URL</span>
                <input value={pageDetails.url} readOnly onFocus={(event) => event.currentTarget.select()} />
              </label>
              <label>
                <span>备注</span>
                <textarea
                  value={note}
                  rows={3}
                  placeholder="添加一点自己的上下文"
                  onChange={(event) => setNote(event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="save-location-panel" aria-label="保存位置">
            <div className="location-heading">
              <h3>保存位置</h3>
              <p>
                当前保存到：
                <span>{selectedPath || "请选择文件夹"}</span>
              </p>
            </div>

            <div className="location-grid">
              <section className="location-search" aria-label="搜索保存位置">
                <label className="search-box">
                  <SearchIcon />
                  <input
                    value={query}
                    placeholder="搜索文件夹"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  {query ? (
                    <button type="button" aria-label="清空搜索" onClick={() => setQuery("")}>
                      <CloseIcon />
                    </button>
                  ) : null}
                </label>

                <div className="search-results">
                  {query ? <h4>搜索结果（{searchResults.length}）</h4> : <h4>搜索结果</h4>}
                  {query && searchResults.length === 0 ? (
                    <p className="empty-text">没有匹配的文件夹</p>
                  ) : null}
                  {searchResults.map((option) => (
                    <button
                      key={option.id}
                      className={`folder-result ${selectedFolderId === option.id ? "is-selected" : ""}`}
                      type="button"
                      onClick={() => selectFolder(option.node, true)}
                    >
                      <FolderIcon filled={selectedFolderId === option.id} />
                      <span>
                        <strong>{option.title}</strong>
                        <small>{option.path}</small>
                      </span>
                      {selectedFolderId === option.id ? <CheckIcon /> : null}
                    </button>
                  ))}
                </div>

                <div className="recent-folders">
                  <h4>最近使用</h4>
                  {recentFolders.length === 0 ? (
                    <p className="empty-text">保存成功后会显示最近位置</p>
                  ) : (
                    <div>
                      {recentFolders.map((option, index) => (
                        <button key={option.id} type="button" onClick={() => selectFolder(option.node, true)}>
                          {index === 0 ? <ClockIcon /> : <FolderIcon />}
                          <span>{option.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="folder-browser" aria-label="浏览文件夹">
                <div className="browser-heading">
                  <h4>浏览文件夹</h4>
                  {browsingFolder && canCreateBookmarkInFolder(browsingFolder) ? (
                    <CreateFolderAction parentFolder={browsingFolder} onCreate={createFolder} />
                  ) : null}
                </div>

                <FolderBreadcrumb
                  items={browsingBreadcrumbItems}
                  onSelect={(folder) => setBrowsingFolderId(folder.id)}
                />

                <div className="browse-list" ref={cascadePortalRef}>
                  {loading ? <p className="empty-text">正在读取文件夹...</p> : null}
                  {!loading && browsingChildren.length === 0 ? (
                    <p className="empty-text">当前层级没有子文件夹</p>
                  ) : null}
                  {browsingChildren.length > 0 ? (
                    <FolderCascadeMenu
                      nodes={browsingChildren}
                      selectedFolderId={selectedFolderId}
                      disabledLabel="不可保存"
                      onSelect={(folder) => selectFolder(folder)}
                      onOpenFolder={openFolder}
                      canSelect={canCreateBookmarkInFolder}
                      onCreateFolder={(parentFolder) => setBrowsingFolderId(parentFolder.id)}
                      renderCreateAction={(parentFolder) => (
                        <CreateFolderAction parentFolder={parentFolder} onCreate={createFolder} inCascade />
                      )}
                      portalContainer={cascadePortalRef.current ?? shadowRoot}
                    />
                  ) : null}
                </div>
              </section>
            </div>
          </section>

          <p className="status" aria-live="polite">
            {status || "\u00A0"}
          </p>

          <footer className="quick-save-footer">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button" type="submit" disabled={saving || !selectedFolderId}>
              {saving ? "保存中..." : selectedFolderTitle ? `保存到 ${selectedFolderTitle}` : "保存"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function FolderBreadcrumb({
  items,
  onSelect
}: {
  items: Array<{ id: string; title: string; node: BookmarkNode }>;
  onSelect(folder: BookmarkNode): void;
}) {
  if (items.length === 0) {
    return <div className="folder-breadcrumb">Root</div>;
  }

  return (
    <nav className="folder-breadcrumb" aria-label="浏览路径">
      {items.map((item, index) => (
        <span key={item.id}>
          {index > 0 ? <ChevronIcon /> : null}
          <button type="button" onClick={() => onSelect(item.node)}>
            {item.title}
          </button>
        </span>
      ))}
    </nav>
  );
}

function CreateFolderAction({
  parentFolder,
  onCreate,
  inCascade = false
}: {
  parentFolder: BookmarkNode;
  onCreate(parentFolder: BookmarkNode, title: string): Promise<void>;
  inCascade?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await onCreate(parentFolder, title);
    setSaving(false);
    setTitle("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        className={inCascade ? "create-folder-link in-cascade" : "create-folder-link"}
        type="button"
        onClick={() => setOpen(true)}
      >
        新建文件夹...
      </button>
    );
  }

  return (
    <form className={inCascade ? "create-folder-form in-cascade" : "create-folder-form"} onSubmit={submit}>
      <input
        ref={inputRef}
        value={title}
        placeholder="文件夹名称"
        onChange={(event) => setTitle(event.target.value)}
      />
      <button className="primary-button small" type="submit" disabled={saving}>
        Save
      </button>
      <button className="secondary-button small" type="button" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}

function sendMessage(message: unknown): Promise<QuickSaveResponse> {
  return chrome.runtime.sendMessage(message) as Promise<QuickSaveResponse>;
}

function getRootFolderId(tree: BookmarkNode[]): string {
  return tree[0]?.id ?? "";
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

function getBrowsingFolders(tree: BookmarkNode[], browsingFolderId: string): BookmarkNode[] {
  const rootId = getRootFolderId(tree);
  const folder = browsingFolderId ? findNodeById(tree, browsingFolderId) : undefined;

  if (!folder || folder.id === rootId) {
    return (tree[0]?.children ?? []).filter(isFolder);
  }

  return (folder.children ?? []).filter(isFolder);
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function FolderIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? "is-filled" : ""}>
      <path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="check-icon">
      <path d="m7 12 3 3 7-7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="chevron-icon">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function createStyle(): HTMLStyleElement {
  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; color-scheme: light; }
    * { box-sizing: border-box; }
    svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      flex: 0 0 auto;
    }
    .quick-save-layer {
      position: fixed;
      z-index: 2147483647;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 22px;
      font-family: "Helvetica Neue", Arial, ui-sans-serif, system-ui, sans-serif;
      color: #0f172a;
      background: rgb(15 23 42 / 0.18);
    }
    .quick-save-dialog {
      width: min(930px, calc(100vw - 28px));
      max-height: min(780px, calc(100vh - 28px));
      display: grid;
      overflow: auto;
      background: #ffffff;
      border: 1px solid #cfd8e8;
      border-radius: 8px;
    }
    .quick-save-header,
    .quick-save-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 22px;
    }
    .quick-save-header {
      border-bottom: 1px solid #dbe3f0;
    }
    .quick-save-footer {
      border-top: 1px solid #eef2f8;
    }
    h2, h3, h4, p { margin: 0; }
    h2 {
      font-size: 28px;
      line-height: 1.1;
      font-weight: 800;
      letter-spacing: 0;
    }
    h3, h4 {
      font-size: 14px;
      line-height: 1.3;
      font-weight: 800;
      letter-spacing: 0;
    }
    .quick-save-form {
      display: grid;
      gap: 22px;
      padding: 20px 22px 0;
    }
    .page-details-grid {
      display: grid;
      grid-template-columns: 210px minmax(0, 1fr);
      gap: 32px;
      align-items: start;
    }
    .preview-image {
      display: grid;
      width: 210px;
      aspect-ratio: 1 / 1;
      place-items: center;
      overflow: hidden;
      color: #64748b;
      font-size: 13px;
      font-weight: 700;
      background: #f7f7f8;
      border: 1px solid #cfd8e8;
      border-radius: 8px;
    }
    .preview-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .detail-fields {
      display: grid;
      gap: 15px;
    }
    label {
      display: grid;
      gap: 8px;
      color: #5b667a;
      font-size: 14px;
      font-weight: 800;
    }
    input,
    textarea {
      width: 100%;
      min-width: 0;
      color: #111827;
      background: #ffffff;
      border: 1px solid #cfd8e8;
      border-radius: 8px;
      font: inherit;
      font-size: 18px;
      font-weight: 650;
      line-height: 1.35;
      outline: 0;
    }
    input {
      height: 48px;
      padding: 0 16px;
    }
    input[readonly] {
      color: #5b667a;
      background: #f7f7f8;
      cursor: text;
    }
    textarea {
      min-height: 88px;
      resize: vertical;
      padding: 12px 16px;
    }
    input:focus,
    textarea:focus {
      border-color: #002fa7;
      box-shadow: 0 0 0 2px rgb(0 47 167 / 0.16);
    }
    .save-location-panel {
      display: grid;
      gap: 14px;
      padding: 14px;
      border: 1px solid #cfd8e8;
      border-radius: 8px;
    }
    .location-heading {
      display: grid;
      gap: 8px;
    }
    .location-heading p {
      color: #5b667a;
      font-size: 16px;
      font-weight: 700;
    }
    .location-heading span {
      margin-left: 8px;
      color: #002fa7;
      font-weight: 800;
    }
    .location-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.9fr);
      gap: 14px;
    }
    .location-search,
    .folder-browser {
      min-height: 356px;
      padding: 14px;
      border: 1px solid #dbe3f0;
      border-radius: 8px;
      background: #ffffff;
    }
    .location-search {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      gap: 12px;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      padding: 0 12px;
      border: 1px solid #002fa7;
      border-radius: 8px;
    }
    .search-box input {
      height: 42px;
      padding: 0;
      border: 0;
      font-size: 17px;
      font-weight: 600;
    }
    .search-box input:focus {
      box-shadow: none;
    }
    .search-box button {
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      padding: 0;
      color: #334155;
      background: transparent;
      border: 0;
      cursor: pointer;
    }
    .search-results,
    .recent-folders,
    .folder-browser {
      display: grid;
      gap: 10px;
      align-content: start;
    }
    .search-results {
      overflow: auto;
      padding-right: 4px;
      border-bottom: 1px solid #dbe3f0;
      padding-bottom: 10px;
    }
    .folder-result {
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr) 24px;
      align-items: center;
      gap: 12px;
      width: 100%;
      min-height: 58px;
      padding: 8px 10px;
      color: #0f172a;
      text-align: left;
      background: #ffffff;
      border: 1px solid transparent;
      border-radius: 8px;
      cursor: pointer;
    }
    .folder-result:hover,
    .folder-result:focus-visible,
    .folder-result.is-selected {
      background: #f7f7f8;
      border-color: #e3e8f2;
      outline: 0;
    }
    .folder-result svg:first-child {
      width: 30px;
      height: 30px;
      color: #5b667a;
    }
    .folder-result svg.is-filled {
      color: #002fa7;
      fill: #002fa7;
    }
    .folder-result span {
      display: grid;
      gap: 3px;
      min-width: 0;
    }
    .folder-result strong,
    .recent-folders button span,
    .move-folder-button span:not(.move-menu-note) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .folder-result small,
    .empty-text {
      color: #64748b;
      font-size: 13px;
      font-weight: 600;
    }
    .check-icon {
      display: grid;
      width: 20px;
      height: 20px;
      color: #ffffff;
      background: #002fa7;
      border-radius: 999px;
      padding: 3px;
    }
    .recent-folders > div {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .recent-folders button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      max-width: 148px;
      height: 36px;
      padding: 0 12px;
      color: #0f172a;
      background: #ffffff;
      border: 1px solid #cfd8e8;
      border-radius: 7px;
      font: inherit;
      font-size: 13px;
      font-weight: 750;
      cursor: pointer;
    }
    .browser-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .folder-breadcrumb {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      min-height: 28px;
      color: #64748b;
      font-size: 13px;
      font-weight: 700;
    }
    .folder-breadcrumb span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .folder-breadcrumb button {
      padding: 0;
      color: inherit;
      background: transparent;
      border: 0;
      font: inherit;
      cursor: pointer;
    }
    .folder-breadcrumb button:hover,
    .folder-breadcrumb button:focus-visible {
      color: #002fa7;
      outline: 0;
    }
    .chevron-icon {
      width: 14px;
      height: 14px;
    }
    .browse-list {
      position: relative;
      min-height: 266px;
      overflow: visible;
    }
    .move-menu-list {
      display: grid;
      gap: 8px;
      width: 100%;
    }
    .move-folder-row {
      position: relative;
    }
    .move-folder-row.has-children::after {
      position: absolute;
      top: 0;
      right: -12px;
      bottom: 0;
      width: 14px;
      content: "";
    }
    .move-folder-button {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      min-height: 48px;
      padding: 0 12px;
      color: #0f172a;
      background: #ffffff;
      border: 1px solid transparent;
      border-radius: 8px;
      font: inherit;
      font-size: 15px;
      font-weight: 760;
      text-align: left;
      cursor: pointer;
    }
    .move-folder-button:hover,
    .move-folder-button:focus-visible,
    .move-folder-row.is-selected > .move-folder-button {
      background: #f7f7f8;
      border-color: #e3e8f2;
      outline: 0;
    }
    .move-folder-button[aria-disabled="true"] {
      color: #94a3b8;
    }
    .move-folder-row.has-children > .move-folder-button[aria-disabled="true"] {
      cursor: pointer;
    }
    .folder-glyph {
      width: 20px;
      height: 16px;
      border: 1.5px solid currentColor;
      border-top-width: 5px;
      border-radius: 3px;
      flex: 0 0 auto;
    }
    .menu-chevron {
      width: 9px;
      height: 9px;
      margin-left: auto;
      border-top: 1.5px solid currentColor;
      border-right: 1.5px solid currentColor;
      transform: rotate(45deg);
      flex: 0 0 auto;
    }
    .move-menu-note {
      margin-left: auto;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 800;
    }
    .context-submenu {
      position: fixed;
      min-width: 260px;
      max-width: 320px;
      overflow-x: hidden;
      overflow-y: visible;
      overscroll-behavior: contain;
      padding: 8px;
      visibility: hidden;
      pointer-events: none;
      background: #ffffff;
      border: 1px solid #cfd8e8;
      border-radius: 8px;
      opacity: 0;
    }
    .context-submenu.is-floating-cascade {
      visibility: visible;
      pointer-events: auto;
      opacity: 1;
    }
    .create-folder-link {
      min-height: 32px;
      padding: 0 10px;
      color: #002fa7;
      background: #ffffff;
      border: 1px solid #cfd8e8;
      border-radius: 7px;
      font: inherit;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
    }
    .create-folder-link.in-cascade {
      width: 100%;
      margin-top: 8px;
      text-align: left;
    }
    .create-folder-form {
      display: grid;
      grid-template-columns: minmax(120px, 1fr) auto auto;
      gap: 6px;
      align-items: center;
    }
    .create-folder-form.in-cascade {
      margin-top: 8px;
    }
    .create-folder-form input {
      height: 32px;
      padding: 0 8px;
      font-size: 13px;
      font-weight: 650;
    }
    button {
      font-family: inherit;
    }
    .secondary-button,
    .primary-button {
      min-height: 44px;
      padding: 0 18px;
      border-radius: 8px;
      font: inherit;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
    }
    .secondary-button {
      color: #0f172a;
      background: #ffffff;
      border: 1px solid #cfd8e8;
    }
    .primary-button {
      color: #ffffff;
      background: #002fa7;
      border: 1px solid #002fa7;
    }
    .primary-button:disabled {
      cursor: default;
      opacity: 0.55;
    }
    .small {
      min-height: 32px;
      padding: 0 10px;
      font-size: 13px;
    }
    .status {
      min-height: 20px;
      color: #002fa7;
      font-size: 13px;
      font-weight: 750;
    }
    @media (max-width: 760px) {
      .quick-save-layer {
        padding: 10px;
      }
      .quick-save-header,
      .quick-save-footer,
      .quick-save-form {
        padding-left: 14px;
        padding-right: 14px;
      }
      .page-details-grid,
      .location-grid {
        grid-template-columns: 1fr;
      }
      .preview-image {
        width: 100%;
        aspect-ratio: 16 / 9;
      }
      .location-search,
      .folder-browser {
        min-height: auto;
      }
      .context-submenu {
        max-width: calc(100vw - 32px);
      }
    }
  `;

  return style;
}

export {};
