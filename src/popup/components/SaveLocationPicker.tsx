import { useState } from "react";
import { InlineFolderPicker } from "../../components/folder-picker";
import type { BookmarkNode, FolderOption } from "../../features/bookmarks";
import { formatPopupFolderPath, openWorkspace } from "../../features/popup";
import { LocationPathRow } from "./save-location/LocationPathRow";

export function SaveLocationPicker({
  createParentFolderId,
  createParentTitle,
  createFolder,
  createOpen,
  creatingFolder,
  folderName,
  loading,
  recentFolders,
  selectedFolderId,
  selectedPath,
  selectedTitle,
  setCreateParentFolderId,
  setCreateOpen,
  setFolderName,
  setSelectedFolderId,
  tree
}: {
  createParentFolderId?: string;
  createParentTitle: string;
  createFolder(): Promise<void>;
  createOpen: boolean;
  creatingFolder: boolean;
  folderName: string;
  loading: boolean;
  recentFolders: FolderOption[];
  selectedFolderId: string;
  selectedPath: string;
  selectedTitle: string;
  setCreateParentFolderId(value: string | undefined): void;
  setCreateOpen(value: boolean): void;
  setFolderName(value: string): void;
  setSelectedFolderId(value: string): void;
  tree: BookmarkNode[];
}) {
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const displayPath = formatPopupFolderPath(selectedPath);

  return (
    <section className="location-panel" aria-label="保存位置">
      <div className="location-heading">保存位置</div>
      <div
        className="location-picker-shell"
        onKeyDown={(event) => {
          if (event.key === "Escape" && locationMenuOpen) {
            event.preventDefault();
            event.stopPropagation();
            closeLocationMenu();
          }
        }}
      >
        <LocationPathRow
          displayPath={displayPath}
          disabled={loading || !selectedFolderId}
          fullPathTitle={formatPopupFolderPath(selectedPath, "")}
          loading={loading}
          locationMenuOpen={locationMenuOpen}
          pickerMode="dialog"
          onToggleMenu={() => (locationMenuOpen ? closeLocationMenu() : openLocationMenu())}
        />
        {locationMenuOpen ? (
          <InlineFolderPicker
            create={{
              open: createOpen,
              creating: creatingFolder,
              folderName,
              parentTitle: createParentFolderId ? createParentTitle : selectedTitle,
              onOpen: (parentFolderId) => {
                setCreateParentFolderId(parentFolderId ?? selectedFolderId);
                setFolderName("");
                setCreateOpen(true);
              },
              onCancel: cancelCreateFolder,
              onCreate: createFolder,
              onFolderNameChange: setFolderName
            }}
            loading={loading}
            recentFolders={recentFolders}
            selectedFolderId={selectedFolderId}
            tree={tree}
            onManage={() => void openWorkspace()}
            onRequestClose={closeLocationMenu}
            onSelect={selectFolder}
          />
        ) : null}
      </div>
    </section>
  );

  function selectFolder(folderId: string) {
    setSelectedFolderId(folderId);
    setCreateOpen(false);
    setCreateParentFolderId(undefined);
    closeLocationMenu();
  }

  function cancelCreateFolder() {
    setFolderName("");
    setCreateOpen(false);
    setCreateParentFolderId(undefined);
  }

  function openLocationMenu() {
    setCreateOpen(false);
    setCreateParentFolderId(undefined);
    setLocationMenuOpen(true);
  }

  function closeLocationMenu() {
    setLocationMenuOpen(false);
  }
}
