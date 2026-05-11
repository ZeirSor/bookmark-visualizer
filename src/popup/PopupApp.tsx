import { useEffect, useMemo } from "react";
import {
  canCreateBookmarkInFolder,
  findNodeById,
  flattenFolders,
  getDisplayTitle,
  type FolderOption
} from "../features/bookmarks";
import { FolderIcon, SaveIcon, SettingsIcon } from "./components/PopupIcons";
import { PopupFooter } from "./components/PopupFooter";
import { PopupTopBar } from "./components/PopupTopBar";
import { TabButton } from "./components/TabButton";
import { ManageTab } from "./tabs/ManageTab";
import { SaveTab } from "./tabs/SaveTab";
import { SettingsTab } from "./tabs/SettingsTab";
import {
  openWorkspace,
  compactFolderPath,
  deriveRecentSavedBookmarks
} from "../features/popup";
import { usePopupBootstrap } from "./hooks/usePopupBootstrap";
import type { UsePopupBootstrapOptions } from "./hooks/usePopupBootstrap";
import { usePopupSaveActions } from "./hooks/usePopupSaveActions";
import { usePopupSaveState } from "./hooks/usePopupSaveState";

export function PopupApp({
  bootstrapOptions
}: {
  bootstrapOptions?: UsePopupBootstrapOptions;
} = {}) {
  const bootstrap = usePopupBootstrap(bootstrapOptions);
  const saveState = usePopupSaveState();

  const folderOptions = useMemo(
    () => flattenFolders(bootstrap.tree).filter((option) => canCreateBookmarkInFolder(option.node)),
    [bootstrap.tree]
  );
  const folderOptionMap = useMemo(
    () => new Map(folderOptions.map((option) => [option.id, option])),
    [folderOptions]
  );
  const selectedFolder = bootstrap.selectedFolderId ? findNodeById(bootstrap.tree, bootstrap.selectedFolderId) : undefined;
  const selectedOption = bootstrap.selectedFolderId ? folderOptionMap.get(bootstrap.selectedFolderId) : undefined;
  const selectedTitle = selectedFolder ? getDisplayTitle(selectedFolder) : "";
  const selectedPath = selectedOption?.path ?? selectedTitle;
  const createParentFolder = saveState.createParentFolderId
    ? findNodeById(bootstrap.tree, saveState.createParentFolderId)
    : undefined;
  const createParentTitle = createParentFolder
    ? getDisplayTitle(createParentFolder)
    : selectedTitle;
  const defaultFolderOption = bootstrap.settings.popupDefaultFolderId
    ? folderOptionMap.get(bootstrap.settings.popupDefaultFolderId)
    : undefined;
  const defaultFolderPath = defaultFolderOption?.path ?? selectedPath;
  const defaultCompactPath = compactFolderPath(defaultFolderPath);
  const recentFolders = useMemo(
    () =>
      bootstrap.recentFolderIds
        .map((folderId) => folderOptionMap.get(folderId))
        .filter((option): option is FolderOption => Boolean(option)),
    [bootstrap.recentFolderIds, folderOptionMap]
  );
  const recentBookmarks = useMemo(() => deriveRecentSavedBookmarks(bootstrap.tree, 3), [bootstrap.tree]);
  const actions = usePopupSaveActions({
    settings: bootstrap.settings,
    setSettings: bootstrap.setSettings,
    pageDetails: bootstrap.pageDetails,
    selectedFolderId: bootstrap.selectedFolderId,
    setSelectedFolderId: bootstrap.setSelectedFolderId,
    title: bootstrap.title,
    note: saveState.note,
    selectedTitle,
    folderName: saveState.folderName,
    createParentFolderId: saveState.createParentFolderId,
    setRecentFolderIds: bootstrap.setRecentFolderIds,
    setTree: bootstrap.setTree,
    setFolderName: saveState.setFolderName,
    setCreateOpen: saveState.setCreateOpen,
    setCreateParentFolderId: saveState.setCreateParentFolderId,
    setQuery: saveState.setQuery,
    savingState: [saveState.saving, saveState.setSaving],
    creatingState: [saveState.creatingFolder, saveState.setCreatingFolder],
    setPopupStatus: bootstrap.setPopupStatus
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        window.close();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="popup-shell">
      <PopupTopBar
        onViewHistory={() => bootstrap.setActiveTab("manage")}
        onOpenManager={() => void openWorkspace()}
        onClose={() => window.close()}
      />

      <nav className="popup-tabs" aria-label="Popup 功能">
        <TabButton active={bootstrap.activeTab === "save"} icon={<SaveIcon />} onClick={() => bootstrap.setActiveTab("save")}>
          保存
        </TabButton>
        <TabButton active={bootstrap.activeTab === "manage"} icon={<FolderIcon />} onClick={() => bootstrap.setActiveTab("manage")}>
          管理
        </TabButton>
        <TabButton active={bootstrap.activeTab === "settings"} icon={<SettingsIcon />} onClick={() => bootstrap.setActiveTab("settings")}>
          设置
        </TabButton>
      </nav>

      <section className="popup-content">
        {bootstrap.activeTab === "save" ? (
          <SaveTab
            createParentFolderId={saveState.createParentFolderId}
            createParentTitle={createParentTitle}
            createFolder={actions.createFolder}
            createOpen={saveState.createOpen}
            creatingFolder={saveState.creatingFolder}
            folderName={saveState.folderName}
            loading={bootstrap.loading}
            note={saveState.note}
            pageDetails={bootstrap.pageDetails}
            previewFailed={saveState.previewFailed}
            recentFolders={recentFolders}
            save={actions.save}
            selectedFolderId={bootstrap.selectedFolderId}
            selectedPath={selectedPath}
            selectedTitle={selectedTitle}
            setCreateParentFolderId={saveState.setCreateParentFolderId}
            setCreateOpen={saveState.setCreateOpen}
            setFolderName={saveState.setFolderName}
            setNote={saveState.setNote}
            setPreviewFailed={saveState.setPreviewFailed}
            setSelectedFolderId={bootstrap.setSelectedFolderId}
            setTitle={bootstrap.setTitle}
            title={bootstrap.title}
            tree={bootstrap.tree}
            showThumbnail={bootstrap.settings.popupShowThumbnail}
          />
        ) : null}
        {bootstrap.activeTab === "manage" ? (
          <ManageTab recentBookmarks={recentBookmarks} recentFolders={recentFolders} />
        ) : null}
        {bootstrap.activeTab === "settings" ? (
          <SettingsTab
            defaultCompactPath={defaultCompactPath}
            defaultFolderId={defaultFolderOption?.id ?? bootstrap.selectedFolderId}
            defaultPath={defaultFolderPath}
            recentFolders={recentFolders}
            settings={bootstrap.settings}
            tree={bootstrap.tree}
            updateDefaultFolder={(folderId) => void actions.updateDefaultFolder(folderId)}
            updateSettings={(patch) => void actions.updateSettings(patch)}
          />
        ) : null}
      </section>

      {bootstrap.activeTab === "save" ? (
        <PopupFooter
          canSave={Boolean(bootstrap.pageDetails?.canSave && bootstrap.selectedFolderId)}
          formId="popup-save-form"
          saving={saveState.saving}
          selectedTitle={selectedTitle}
          status={bootstrap.status}
          statusTone={bootstrap.statusTone}
        />
      ) : (
        <PopupUtilityFooter
          activeTab={bootstrap.activeTab}
          onClose={() => window.close()}
          onOpenManager={() => void openWorkspace()}
        />
      )}
    </main>
  );
}

function PopupUtilityFooter({
  activeTab,
  onClose,
  onOpenManager
}: {
  activeTab: "manage" | "settings";
  onClose(): void;
  onOpenManager(): void;
}) {
  const primaryLabel = activeTab === "manage" ? "打开完整管理页" : "完成";
  const hint = activeTab === "manage" ? "完整工作台支持批量整理与编辑" : "设置会自动保存";

  return (
    <footer className="popup-footer popup-footer-utility">
      <div className="status-line" aria-live="polite">
        <span>{hint}</span>
      </div>
      <div className="footer-actions">
        <button type="button" className="secondary-action" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="primary-action"
          onClick={activeTab === "manage" ? onOpenManager : onClose}
        >
          {primaryLabel}
        </button>
      </div>
    </footer>
  );
}
