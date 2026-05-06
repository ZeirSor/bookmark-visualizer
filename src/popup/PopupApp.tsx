import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import { ExternalLinkIcon, FolderIcon, SaveIcon, SettingsIcon } from "./components/PopupIcons";
import { TabButton } from "./components/TabButton";
import { ManageTab } from "./tabs/ManageTab";
import { SaveTab } from "./tabs/SaveTab";
import { SettingsTab } from "./tabs/SettingsTab";
import {
  createQuickSaveBookmark,
  createQuickSaveFolder,
  getCurrentTabDetails,
  loadQuickSaveInitialState,
  openWorkspace,
  type PopupPageDetails
} from "../features/popup";
import type { QuickSaveInitialState } from "../features/quick-save";

type PopupTab = "save" | "manage" | "settings";

const SAVE_CLOSE_DELAY_MS = 650;

export function PopupApp() {
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
