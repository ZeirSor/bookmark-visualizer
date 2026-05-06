import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { FolderCascadeMenu } from "../../components/FolderCascadeMenu";
import {
  CheckIcon,
  ChevronRightIcon,
  CloseIcon,
  FolderIcon,
  RecentIcon,
  SearchIcon
} from "../../components/icons/AppIcons";
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
import {
  QUICK_SAVE_CREATE_BOOKMARK,
  QUICK_SAVE_CREATE_FOLDER,
  QUICK_SAVE_GET_INITIAL_STATE,
  type QuickSaveCreatePayload,
  type QuickSaveInitialState,
  type QuickSavePageDetails,
  type QuickSaveResponse
} from "./types";

const CLOSE_AFTER_SAVE_MS = 700;

export function QuickSaveDialog({
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
                          {index === 0 ? <RecentIcon /> : <FolderIcon />}
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
          {index > 0 ? <ChevronRightIcon className="chevron-icon" /> : null}
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
