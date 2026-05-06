import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  canCreateBookmarkInFolder,
  filterFolderOptions,
  findNodeById,
  flattenFolders,
  getDisplayTitle,
  type BookmarkNode,
  type FolderOption
} from "../features/bookmarks";
import { ExternalLinkIcon, FolderIcon, SaveIcon, SettingsIcon } from "./components/PopupIcons";
import { PopupFooter } from "./components/PopupFooter";
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
  compactFolderPath,
  deriveRecentSavedBookmarks,
  selectInitialPopupFolderId,
  type PopupPageDetails
} from "../features/popup";
import type { QuickSaveInitialState } from "../features/quick-save";
import {
  defaultSettings,
  loadSettings,
  saveSettings,
  type SettingsState
} from "../features/settings";
import { normalizeRecentFolderIds } from "../features/recent-folders";

type PopupTab = "save" | "manage" | "settings";

const SAVE_CLOSE_DELAY_MS = 650;

export function PopupApp() {
  const [activeTab, setActiveTab] = useState<PopupTab>(defaultSettings.popupDefaultOpenTab);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
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
  const selectedCompactPath = compactFolderPath(selectedPath);
  const defaultFolderOption = settings.popupDefaultFolderId
    ? folderOptionMap.get(settings.popupDefaultFolderId)
    : undefined;
  const defaultFolderPath = defaultFolderOption?.path ?? selectedPath;
  const defaultCompactPath = compactFolderPath(defaultFolderPath);
  const searchResults = useMemo(() => {
    const normalized = query.trim();
    return normalized ? filterFolderOptions(folderOptions, normalized).slice(0, 4) : [];
  }, [folderOptions, query]);
  const recentFolders = useMemo(
    () =>
      recentFolderIds
        .map((folderId) => folderOptionMap.get(folderId))
        .filter((option): option is FolderOption => Boolean(option)),
    [folderOptionMap, recentFolderIds]
  );
  const recentBookmarks = useMemo(() => deriveRecentSavedBookmarks(tree, 3), [tree]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [details, initialState, storedSettings] = await Promise.all([
          getCurrentTabDetails(),
          loadQuickSaveInitialState(),
          loadSettings()
        ]);

        if (cancelled) {
          return;
        }

        setPageDetails(details);
        setSettings(storedSettings);
        setActiveTab(storedSettings.popupDefaultOpenTab);
        setTitle(details.title);
        applyInitialState(initialState, storedSettings);
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

  function applyInitialState(state: QuickSaveInitialState, storedSettings: SettingsState) {
    setTree(state.tree);
    setRecentFolderIds(state.recentFolderIds);
    const initialFolderId = selectInitialPopupFolderId({
      tree: state.tree,
      recentFolderIds: state.recentFolderIds,
      rememberLastFolder: storedSettings.popupRememberLastFolder,
      popupDefaultFolderId: storedSettings.popupDefaultFolderId,
      fallbackFolderId: state.defaultFolderId
    });

    if (initialFolderId) {
      setSelectedFolderId(initialFolderId);
    }
  }

  async function updateSettings(patch: Partial<SettingsState>) {
    const nextSettings = await saveSettings({
      ...settings,
      ...patch
    });
    setSettings(nextSettings);
  }

  async function updateDefaultFolder(folderId: string) {
    setSelectedFolderId(folderId);
    await updateSettings({ popupDefaultFolderId: folderId });
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
      setRecentFolderIds((current) => normalizeRecentFolderIds([selectedFolderId, ...current]));
      setStatus(settings.popupShowSuccessToast ? `已保存到 ${selectedTitle || "当前文件夹"}。` : "");

      if (settings.popupAutoCloseAfterSave) {
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

      <section className="popup-content">
        {activeTab === "save" ? (
          <SaveTab
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
            searchResults={searchResults}
            selectedCompactPath={selectedCompactPath}
            selectedFolderId={selectedFolderId}
            selectedPath={selectedPath}
            selectedTitle={selectedTitle}
            setCreateOpen={setCreateOpen}
            setFolderName={setFolderName}
            setNote={setNote}
            setPreviewFailed={setPreviewFailed}
            setQuery={setQuery}
            setSelectedFolderId={setSelectedFolderId}
            setTitle={setTitle}
            title={title}
            tree={tree}
            showThumbnail={settings.popupShowThumbnail}
          />
        ) : null}
        {activeTab === "manage" ? (
          <ManageTab recentBookmarks={recentBookmarks} recentFolders={recentFolders} />
        ) : null}
        {activeTab === "settings" ? (
          <SettingsTab
            defaultCompactPath={defaultCompactPath}
            defaultFolderId={defaultFolderOption?.id ?? selectedFolderId}
            defaultPath={defaultFolderPath}
            recentFolders={recentFolders}
            settings={settings}
            tree={tree}
            updateDefaultFolder={(folderId) => void updateDefaultFolder(folderId)}
            updateSettings={(patch) => void updateSettings(patch)}
          />
        ) : null}
      </section>

      <PopupFooter
        canSave={Boolean(pageDetails?.canSave && selectedFolderId)}
        formId="popup-save-form"
        isError={pageDetails?.canSave === false}
        saving={saving}
        selectedTitle={selectedTitle}
        status={status}
      />
    </main>
  );
}
