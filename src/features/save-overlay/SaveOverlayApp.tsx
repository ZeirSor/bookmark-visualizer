import { useEffect, useMemo } from "react";
import {
  canCreateBookmarkInFolder,
  findNodeById,
  flattenFolders,
  getDisplayTitle,
  type FolderOption
} from "../bookmarks";
import {
  compactFolderPath,
  deriveRecentSavedBookmarks,
  type PopupPageDetails
} from "../popup";
import { usePopupSaveState } from "../../popup/hooks/usePopupSaveState";
import { SaveOverlayFooter } from "./components/SaveOverlayFooter";
import { SaveOverlayShell } from "./components/SaveOverlayShell";
import { useSaveOverlayActions } from "./hooks/useSaveOverlayActions";
import { useSaveOverlayBootstrap } from "./hooks/useSaveOverlayBootstrap";
import { ManageOverlayTab } from "./tabs/ManageOverlayTab";
import { SaveOverlayTab } from "./tabs/SaveOverlayTab";
import { SettingsOverlayTab } from "./tabs/SettingsOverlayTab";
import { trapFocus } from "../quick-save/focusTrap";

export function SaveOverlayApp({
  pageDetails,
  shadowRoot,
  onClose
}: {
  pageDetails: PopupPageDetails;
  shadowRoot: ShadowRoot;
  onClose(): void;
}) {
  const bootstrap = useSaveOverlayBootstrap(pageDetails);
  const saveState = usePopupSaveState();
  const folderOptions = useMemo(
    () => flattenFolders(bootstrap.tree).filter((option) => canCreateBookmarkInFolder(option.node)),
    [bootstrap.tree]
  );
  const folderOptionMap = useMemo(
    () => new Map(folderOptions.map((option) => [option.id, option])),
    [folderOptions]
  );
  const selectedFolder = bootstrap.selectedFolderId
    ? findNodeById(bootstrap.tree, bootstrap.selectedFolderId)
    : undefined;
  const selectedOption = bootstrap.selectedFolderId
    ? folderOptionMap.get(bootstrap.selectedFolderId)
    : undefined;
  const selectedTitle = selectedFolder ? getDisplayTitle(selectedFolder) : "";
  const selectedPath = selectedOption?.path ?? selectedTitle;
  const createParentFolder = saveState.createParentFolderId
    ? findNodeById(bootstrap.tree, saveState.createParentFolderId)
    : undefined;
  const createParentTitle = createParentFolder ? getDisplayTitle(createParentFolder) : selectedTitle;
  const defaultFolderOption = bootstrap.settings.popupDefaultFolderId
    ? folderOptionMap.get(bootstrap.settings.popupDefaultFolderId)
    : undefined;
  const defaultFolderPath = defaultFolderOption?.path ?? selectedPath;
  const defaultFolderId = defaultFolderOption?.id ?? bootstrap.selectedFolderId;
  const recentFolders = useMemo<FolderOption[]>(
    () =>
      bootstrap.recentFolderIds
        .map((folderId) => folderOptionMap.get(folderId))
        .filter((option): option is FolderOption => Boolean(option)),
    [bootstrap.recentFolderIds, folderOptionMap]
  );
  const recentBookmarks = useMemo(
    () => deriveRecentSavedBookmarks(bootstrap.tree, 3),
    [bootstrap.tree]
  );
  const actions = useSaveOverlayActions({
    settings: bootstrap.settings,
    setSettings: bootstrap.setSettings,
    pageDetails,
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
    setPopupStatus: bootstrap.setPopupStatus,
    onClose
  });

  useEffect(() => {
    function handleKeyDown(rawEvent: Event) {
      const event = rawEvent as KeyboardEvent;
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && (event.key.toLocaleLowerCase() === "s" || event.key === "Enter")) {
        event.preventDefault();
        void actions.save();
        return;
      }

      if (event.key === "Tab") {
        trapFocus(event, shadowRoot);
      }
    }

    shadowRoot.addEventListener("keydown", handleKeyDown);
    return () => shadowRoot.removeEventListener("keydown", handleKeyDown);
  }, [actions, onClose, shadowRoot]);

  return (
    <SaveOverlayShell
      activeTab={bootstrap.activeTab}
      footer={
        bootstrap.activeTab === "save" ? (
          <SaveOverlayFooter
            canSave={Boolean(pageDetails.canSave && bootstrap.selectedFolderId)}
            formId="save-overlay-form"
            saving={saveState.saving}
            selectedTitle={selectedTitle}
            status={bootstrap.status}
            statusTone={bootstrap.statusTone}
            onClose={onClose}
          />
        ) : undefined
      }
      onChangeTab={bootstrap.setActiveTab}
      onClose={onClose}
    >
      {bootstrap.activeTab === "save" ? (
        <SaveOverlayTab
          createFolder={actions.createFolder}
          createOpen={saveState.createOpen}
          createParentTitle={createParentTitle}
          creatingFolder={saveState.creatingFolder}
          folderName={saveState.folderName}
          loading={bootstrap.loading}
          note={saveState.note}
          pageDetails={pageDetails}
          previewFailed={saveState.previewFailed}
          recentFolders={recentFolders}
          save={actions.save}
          selectedFolderId={bootstrap.selectedFolderId}
          selectedPath={selectedPath}
          selectedTitle={selectedTitle}
          setCreateOpen={saveState.setCreateOpen}
          setCreateParentFolderId={saveState.setCreateParentFolderId}
          setFolderName={saveState.setFolderName}
          setNote={saveState.setNote}
          setPreviewFailed={saveState.setPreviewFailed}
          setSelectedFolderId={bootstrap.setSelectedFolderId}
          setTitle={bootstrap.setTitle}
          showThumbnail={bootstrap.settings.popupShowThumbnail}
          title={bootstrap.title}
          tree={bootstrap.tree}
          onManageLocations={() => void actions.openWorkspace()}
        />
      ) : null}

      {bootstrap.activeTab === "manage" ? (
        <ManageOverlayTab
          recentBookmarks={recentBookmarks}
          recentFolders={recentFolders}
          onOpenWorkspace={actions.openWorkspace}
        />
      ) : null}

      {bootstrap.activeTab === "settings" ? (
        <SettingsOverlayTab
          defaultFolderId={defaultFolderId}
          defaultPath={defaultFolderPath}
          recentFolders={recentFolders}
          settings={bootstrap.settings}
          tree={bootstrap.tree}
          updateDefaultFolder={(folderId) => void actions.updateDefaultFolder(folderId)}
          updateSettings={(patch) => void actions.updateSettings(patch)}
          onOpenShortcutSettings={actions.openShortcutSettings}
          onOpenWorkspace={() => actions.openWorkspace()}
        />
      ) : null}
    </SaveOverlayShell>
  );
}
