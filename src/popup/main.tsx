import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  canCreateBookmarkInFolder,
  filterFolderOptions,
  findNodeById,
  flattenFolders,
  getDisplayTitle,
  isFolder,
  type BookmarkNode,
  type FolderOption
} from "../features/bookmarks";
import {
  createQuickSaveBookmark,
  createQuickSaveFolder,
  getCurrentTabDetails,
  loadQuickSaveInitialState,
  openWorkspace,
  type PopupPageDetails
} from "../features/popup";
import type { QuickSaveInitialState } from "../features/quick-save";
import "./styles.css";

type PopupTab = "save" | "manage" | "settings";

const SAVE_CLOSE_DELAY_MS = 650;

function PopupApp() {
  const [activeTab, setActiveTab] = useState<PopupTab>("save");
  const [pageDetails, setPageDetails] = useState<PopupPageDetails>();
  const [tree, setTree] = useState<BookmarkNode[]>([]);
  const [recentFolderIds, setRecentFolderIds] = useState<string[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [autoClose, setAutoClose] = useState(true);

  const folderOptions = useMemo(
    () => flattenFolders(tree).filter((option) => canCreateBookmarkInFolder(option.node)),
    [tree]
  );
  const folderOptionMap = useMemo(
    () => new Map(folderOptions.map((option) => [option.id, option])),
    [folderOptions]
  );
  const selectedFolder = selectedFolderId ? findNodeById(tree, selectedFolderId) : undefined;
  const selectedOption = selectedFolderId ? folderOptionMap.get(selectedFolderId) : undefined;
  const selectedTitle = selectedFolder ? getDisplayTitle(selectedFolder) : "";
  const selectedPath = selectedOption?.path ?? selectedTitle;
  const searchResults = useMemo(() => {
    const normalized = query.trim();
    return normalized ? filterFolderOptions(folderOptions, normalized).slice(0, 4) : [];
  }, [folderOptions, query]);
  const recentFolders = useMemo(
    () =>
      recentFolderIds
        .map((folderId) => folderOptionMap.get(folderId))
        .filter((option): option is FolderOption => Boolean(option))
        .slice(0, 3),
    [folderOptionMap, recentFolderIds]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [details, initialState] = await Promise.all([
          getCurrentTabDetails(),
          loadQuickSaveInitialState()
        ]);

        if (cancelled) {
          return;
        }

        setPageDetails(details);
        setTitle(details.title);
        applyInitialState(initialState);
        setStatus(details.canSave ? "" : details.error ?? "当前页面不支持保存。");
      } catch (cause) {
        if (!cancelled) {
          setStatus(cause instanceof Error ? cause.message : "无法初始化 Popup。");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        window.close();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function applyInitialState(state: QuickSaveInitialState) {
    setTree(state.tree);
    setRecentFolderIds(state.recentFolderIds);
    const defaultFolder = state.defaultFolderId
      ? findNodeById(state.tree, state.defaultFolderId)
      : findFirstWritableFolder(state.tree);

    if (defaultFolder && isFolder(defaultFolder)) {
      setSelectedFolderId(defaultFolder.id);
    }
  }

  async function save(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!pageDetails?.canSave) {
      setStatus("当前页面不支持保存。");
      return;
    }

    if (!selectedFolderId) {
      setStatus("请选择保存位置。");
      return;
    }

    setSaving(true);
    setStatus("");
    try {
      await createQuickSaveBookmark({
        parentId: selectedFolderId,
        title,
        url: pageDetails.url,
        note,
        previewImageUrl: pageDetails.previewImageUrl
      });
      setRecentFolderIds((current) => [selectedFolderId, ...current.filter((id) => id !== selectedFolderId)].slice(0, 5));
      setStatus(`已保存到 ${selectedTitle || "当前文件夹"}。`);

      if (autoClose) {
        window.setTimeout(() => window.close(), SAVE_CLOSE_DELAY_MS);
      }
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "保存失败。");
    } finally {
      setSaving(false);
    }
  }

  async function createFolder() {
    const normalizedName = folderName.trim();
    if (!normalizedName || !selectedFolderId) {
      setStatus("请输入文件夹名称。");
      return;
    }

    try {
      const response = await createQuickSaveFolder({
        parentId: selectedFolderId,
        title: normalizedName
      });
      setTree(response.state.tree);
      setRecentFolderIds(response.state.recentFolderIds);
      setSelectedFolderId(response.folder.id);
      setFolderName("");
      setCreateOpen(false);
      setQuery("");
      setStatus(`已新建 ${getDisplayTitle(response.folder)}。`);
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "新建文件夹失败。");
    }
  }

  return (
    <main className="popup-shell">
      <header className="popup-header">
        <img src="/icons/icon-128.png" alt="" className="app-logo" />
        <div className="brand-block">
          <h1>我的书签</h1>
          <p>Bookmark Visualizer</p>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="打开完整管理页"
          title="打开完整管理页"
          onClick={() => void openWorkspace()}
        >
          <ExternalLinkIcon />
        </button>
      </header>

      <nav className="popup-tabs" aria-label="Popup 功能">
        <TabButton active={activeTab === "save"} icon={<SaveIcon />} onClick={() => setActiveTab("save")}>
          保存
        </TabButton>
        <TabButton active={activeTab === "manage"} icon={<FolderIcon />} onClick={() => setActiveTab("manage")}>
          管理
        </TabButton>
        <TabButton active={activeTab === "settings"} icon={<SettingsIcon />} onClick={() => setActiveTab("settings")}>
          设置
        </TabButton>
      </nav>

      {activeTab === "save" ? (
        <SaveTab
          autoClose={autoClose}
          createFolder={createFolder}
          createOpen={createOpen}
          folderName={folderName}
          loading={loading}
          note={note}
          pageDetails={pageDetails}
          previewFailed={previewFailed}
          query={query}
          recentFolders={recentFolders}
          save={save}
          saving={saving}
          searchResults={searchResults}
          selectedFolderId={selectedFolderId}
          selectedPath={selectedPath}
          selectedTitle={selectedTitle}
          setAutoClose={setAutoClose}
          setCreateOpen={setCreateOpen}
          setFolderName={setFolderName}
          setNote={setNote}
          setPreviewFailed={setPreviewFailed}
          setQuery={setQuery}
          setSelectedFolderId={setSelectedFolderId}
          setTitle={setTitle}
          status={status}
          title={title}
        />
      ) : null}
      {activeTab === "manage" ? <ManageTab /> : null}
      {activeTab === "settings" ? (
        <SettingsTab autoClose={autoClose} selectedPath={selectedPath} setAutoClose={setAutoClose} />
      ) : null}
    </main>
  );
}

function SaveTab({
  autoClose,
  createFolder,
  createOpen,
  folderName,
  loading,
  note,
  pageDetails,
  previewFailed,
  query,
  recentFolders,
  save,
  saving,
  searchResults,
  selectedFolderId,
  selectedPath,
  selectedTitle,
  setAutoClose,
  setCreateOpen,
  setFolderName,
  setNote,
  setPreviewFailed,
  setQuery,
  setSelectedFolderId,
  setTitle,
  status,
  title
}: {
  autoClose: boolean;
  createFolder(): Promise<void>;
  createOpen: boolean;
  folderName: string;
  loading: boolean;
  note: string;
  pageDetails?: PopupPageDetails;
  previewFailed: boolean;
  query: string;
  recentFolders: FolderOption[];
  save(event?: FormEvent<HTMLFormElement>): Promise<void>;
  saving: boolean;
  searchResults: FolderOption[];
  selectedFolderId: string;
  selectedPath: string;
  selectedTitle: string;
  setAutoClose(value: boolean): void;
  setCreateOpen(value: boolean): void;
  setFolderName(value: string): void;
  setNote(value: string): void;
  setPreviewFailed(value: boolean): void;
  setQuery(value: string): void;
  setSelectedFolderId(value: string): void;
  setTitle(value: string): void;
  status: string;
  title: string;
}) {
  const canSave = Boolean(pageDetails?.canSave && selectedFolderId);
  const previewUrl = pageDetails?.previewImageUrl;

  return (
    <form className="save-tab" onSubmit={(event) => void save(event)}>
      <section className="page-grid" aria-label="当前网页">
        <div className="page-preview">
          {previewUrl && !previewFailed ? (
            <img src={previewUrl} alt="" onError={() => setPreviewFailed(true)} />
          ) : (
            <span>{pageDetails?.domain || "No preview"}</span>
          )}
        </div>
        <div className="field-stack">
          <label>
            <span>标题</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            <span>URL</span>
            <input value={pageDetails?.url ?? ""} readOnly onFocus={(event) => event.currentTarget.select()} />
          </label>
        </div>
      </section>

      <label className="note-field">
        <span>备注</span>
        <textarea
          value={note}
          placeholder="添加一点自己的上下文"
          onChange={(event) => setNote(event.target.value)}
        />
      </label>

      <section className="location-panel" aria-label="保存位置">
        <div className="location-path-row">
          <span>
            <FolderIcon />
          </span>
          <button type="button" className="path-button" onClick={() => void openWorkspace()}>
            {selectedPath || "正在读取保存位置"}
          </button>
          <button
            type="button"
            className="icon-button compact"
            aria-label="打开完整管理页"
            title="打开完整管理页"
            onClick={() => void openWorkspace()}
          >
            <ChevronRightIcon />
          </button>
        </div>

        <div className="folder-search-row">
          <label className="folder-search">
            <SearchIcon />
            <input
              value={query}
              placeholder="搜索文件夹..."
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="icon-button compact"
            aria-label="新建文件夹"
            title="新建文件夹"
            onClick={() => setCreateOpen(!createOpen)}
          >
            <FolderPlusIcon />
          </button>
        </div>

        {query ? (
          <div className="folder-results" aria-label="文件夹搜索结果">
            {searchResults.length === 0 ? <p>没有匹配的文件夹</p> : null}
            {searchResults.map((option) => (
              <button
                key={option.id}
                type="button"
                className={option.id === selectedFolderId ? "is-selected" : ""}
                onClick={() => {
                  setSelectedFolderId(option.id);
                  setQuery("");
                }}
              >
                <FolderIcon />
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.path}</small>
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {createOpen ? (
          <div className="create-folder-row">
            <input
              value={folderName}
              placeholder={`新建在 ${selectedTitle || "当前文件夹"}`}
              onChange={(event) => setFolderName(event.target.value)}
            />
            <button type="button" onClick={() => void createFolder()}>
              新建
            </button>
          </div>
        ) : null}

        <div className="recent-row">
          <div>
            <strong>最近使用</strong>
            <button type="button" onClick={() => void openWorkspace()}>
              管理位置
            </button>
          </div>
          {recentFolders.length === 0 ? (
            <p>{loading ? "正在读取文件夹..." : "保存成功后会显示最近位置"}</p>
          ) : (
            <div className="recent-chips">
              {recentFolders.map((option) => (
                <button key={option.id} type="button" onClick={() => setSelectedFolderId(option.id)}>
                  <FolderIcon />
                  {option.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <label className="auto-close-row">
        <input
          type="checkbox"
          checked={autoClose}
          onChange={(event) => setAutoClose(event.target.checked)}
        />
        保存后自动关闭浮窗
      </label>

      <footer className="popup-footer">
        <div className={`status-line ${pageDetails?.canSave === false ? "is-error" : ""}`} aria-live="polite">
          {status ? (
            status
          ) : (
            <>
              <CheckIcon />
              <span>点击扩展图标保存当前页</span>
            </>
          )}
        </div>
        <div className="footer-actions">
          <button type="button" className="secondary-action" onClick={() => window.close()}>
            取消
          </button>
          <button type="submit" className="primary-action" disabled={saving || !canSave}>
            {saving ? "保存中..." : selectedTitle ? `保存到 ${selectedTitle}` : "保存"}
          </button>
        </div>
      </footer>
    </form>
  );
}

function ManageTab() {
  return (
    <section className="placeholder-tab">
      <h2>管理</h2>
      <p>完整的书签浏览、搜索和整理仍在管理页中完成。</p>
      <button type="button" className="primary-action wide" onClick={() => void openWorkspace()}>
        打开完整管理页
      </button>
    </section>
  );
}

function SettingsTab({
  autoClose,
  selectedPath,
  setAutoClose
}: {
  autoClose: boolean;
  selectedPath: string;
  setAutoClose(value: boolean): void;
}) {
  return (
    <section className="placeholder-tab settings-list">
      <h2>设置</h2>
      <div>
        <strong>快捷键</strong>
        <span>保存当前网页：点击扩展图标</span>
        <span>命令入口：Ctrl + Shift + S</span>
      </div>
      <div>
        <strong>默认保存位置</strong>
        <span>{selectedPath || "正在读取保存位置"}</span>
      </div>
      <label>
        <input
          type="checkbox"
          checked={autoClose}
          onChange={(event) => setAutoClose(event.target.checked)}
        />
        保存后自动关闭浮窗
      </label>
      <button type="button" className="primary-action wide" onClick={() => void openWorkspace()}>
        打开高级设置
      </button>
    </section>
  );
}

function TabButton({
  active,
  children,
  icon,
  onClick
}: {
  active: boolean;
  children: string;
  icon: ReactNode;
  onClick(): void;
}) {
  return (
    <button type="button" className={active ? "is-active" : ""} onClick={onClick}>
      {icon}
      <span>{children}</span>
    </button>
  );
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
}

function IconSvg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

function SaveIcon() {
  return (
    <IconSvg>
      <path d="M12 3v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </IconSvg>
  );
}

function FolderIcon() {
  return (
    <IconSvg>
      <path d="M3 7.5h6l2 2H21v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5" />
    </IconSvg>
  );
}

function SettingsIcon() {
  return (
    <IconSvg>
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
      <path d="M4 12h2" />
      <path d="M18 12h2" />
      <path d="m6.3 6.3 1.4 1.4" />
      <path d="m16.3 16.3 1.4 1.4" />
      <path d="m17.7 6.3-1.4 1.4" />
      <path d="m7.7 16.3-1.4 1.4" />
    </IconSvg>
  );
}

function ExternalLinkIcon() {
  return (
    <IconSvg>
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M12 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6" />
    </IconSvg>
  );
}

function SearchIcon() {
  return (
    <IconSvg>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </IconSvg>
  );
}

function FolderPlusIcon() {
  return (
    <IconSvg>
      <path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M16 13v5" />
      <path d="M13.5 15.5h5" />
    </IconSvg>
  );
}

function ChevronRightIcon() {
  return (
    <IconSvg>
      <path d="m9 6 6 6-6 6" />
    </IconSvg>
  );
}

function CheckIcon() {
  return (
    <IconSvg>
      <path d="m5 12 4 4L19 6" />
    </IconSvg>
  );
}

createRoot(document.getElementById("root")!).render(<PopupApp />);
