import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  canCreateBookmarkInFolder,
  filterFolderOptions,
  findNodeById,
  flattenFolders,
  getDisplayTitle,
  rankFolderOption,
  type BookmarkNode,
  type FolderOption
} from "../features/bookmarks";
import { ExternalLinkIcon, FolderIcon, SaveIcon, SettingsIcon } from "./components/PopupIcons";
import { PopupFooter, type PopupStatusTone } from "./components/PopupFooter";
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
  const [statusTone, setStatusTone] = useState<PopupStatusTone>("idle");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [createParentFolderId, setCreateParentFolderId] = useState<string | undefined>();

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
  const createParentFolder = createParentFolderId
    ? findNodeById(tree, createParentFolderId)
    : undefined;
  const createParentTitle = createParentFolder
    ? getDisplayTitle(createParentFolder)
    : selectedTitle;
  const defaultFolderOption = settings.popupDefaultFolderId
    ? folderOptionMap.get(settings.popupDefaultFolderId)
    : undefined;
  const defaultFolderPath = defaultFolderOption?.path ?? selectedPath;
  const defaultCompactPath = compactFolderPath(defaultFolderPath);
  const searchResults = useMemo(() => {
    const normalized = query.trim();
    return normalized
      ? filterFolderOptions(folderOptions, normalized)
          .sort((left, right) => {
            const rankDiff =
              rankFolderOption(left, normalized) - rankFolderOption(right, normalized);

            if (rankDiff !== 0) {
              return rankDiff;
            }

            return left.path.localeCompare(right.path, "zh-CN");
          })
          .slice(0, 4)
      : [];
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
        setPopupStatus(
          details.canSave ? "" : details.error ?? "当前页面不支持保存。",
          details.canSave ? "idle" : "error"
        );
      } catch (cause) {
        if (!cancelled) {
          setPopupStatus(cause instanceof Error ? cause.message : "无法初始化 Popup。", "error");
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
      setPopupStatus("当前页面不支持保存。", "error");
      return;
    }

    if (!selectedFolderId) {
      setPopupStatus("请选择保存位置。", "error");
      return;
    }

    setSaving(true);
    setPopupStatus("", "idle");
    try {
      await createQuickSaveBookmark({
        parentId: selectedFolderId,
        title,
        url: pageDetails.url,
        note,
        previewImageUrl: pageDetails.previewImageUrl
      });
      setRecentFolderIds((current) => normalizeRecentFolderIds([selectedFolderId, ...current]));
      setPopupStatus(
        settings.popupShowSuccessToast ? `已保存到 ${selectedTitle || "当前文件夹"}。` : "",
        settings.popupShowSuccessToast ? "success" : "idle"
      );

      if (settings.popupAutoCloseAfterSave) {
        window.setTimeout(() => window.close(), SAVE_CLOSE_DELAY_MS);
      }
    } catch (cause) {
      setPopupStatus(cause instanceof Error ? cause.message : "保存失败。", "error");
    } finally {
      setSaving(false);
    }
  }

  async function createFolder() {
    const normalizedName = folderName.trim();
    const parentId = createParentFolderId ?? selectedFolderId;
    if (!normalizedName || !parentId) {
      setPopupStatus("请输入文件夹名称。", "error");
      return;
    }

    setCreatingFolder(true);
    try {
      const response = await createQuickSaveFolder({
        parentId,
        title: normalizedName
      });
      setTree(response.state.tree);
      setRecentFolderIds(response.state.recentFolderIds);
      setSelectedFolderId(response.folder.id);
      setFolderName("");
      setCreateOpen(false);
      setCreateParentFolderId(undefined);
      setQuery("");
      setPopupStatus(`已新建 ${getDisplayTitle(response.folder)}。`, "success");
    } catch (cause) {
      setPopupStatus(cause instanceof Error ? cause.message : "新建文件夹失败。", "error");
    } finally {
      setCreatingFolder(false);
    }
  }

  function setPopupStatus(message: string, tone: PopupStatusTone) {
    setStatus(message);
    setStatusTone(message.trim() ? tone : "idle");
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
            createParentFolderId={createParentFolderId}
            createParentTitle={createParentTitle}
            createFolder={createFolder}
            createOpen={createOpen}
            creatingFolder={creatingFolder}
            folderName={folderName}
            loading={loading}
            note={note}
            pageDetails={pageDetails}
            previewFailed={previewFailed}
            query={query}
            recentFolders={recentFolders}
            save={save}
            searchResults={searchResults}
            selectedFolderId={selectedFolderId}
            selectedPath={selectedPath}
            selectedTitle={selectedTitle}
            setCreateParentFolderId={setCreateParentFolderId}
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

      {activeTab === "save" ? (
        <PopupFooter
          canSave={Boolean(pageDetails?.canSave && selectedFolderId)}
          formId="popup-save-form"
          saving={saving}
          selectedTitle={selectedTitle}
          status={status}
          statusTone={statusTone}
        />
      ) : null}
    </main>
  );
}
