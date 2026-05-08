import { FolderCascadeRow } from "./FolderCascadeRow";
import { handleCascadeBlur } from "./cascadeBehavior";
import type { FolderCascadeListProps } from "./types";

export function FolderCascadeList({
  folders,
  parentPath,
  activePath,
  highlightedFolderIdSet,
  selectedFolderId,
  currentFolderId,
  disabledLabel,
  onSelect,
  canSelect,
  onOpenFolder,
  canCreateFolder,
  onRowEnter,
  onRegisterAnchor,
  onCascadeEnter,
  onCascadeLeave
}: FolderCascadeListProps) {
  return (
    <div
      className="move-menu-list"
      onPointerEnter={onCascadeEnter}
      onPointerLeave={onCascadeLeave}
      onFocus={onCascadeEnter}
      onBlur={(event) => handleCascadeBlur(event, onCascadeLeave)}
      onWheel={(event) => event.stopPropagation()}
    >
      {folders.map((folder) => (
        <FolderCascadeRow
          key={folder.id}
          folder={folder}
          parentPath={parentPath}
          activePath={activePath}
          highlightedFolderIdSet={highlightedFolderIdSet}
          selectedFolderId={selectedFolderId}
          currentFolderId={currentFolderId}
          disabledLabel={disabledLabel}
          onSelect={onSelect}
          canSelect={canSelect}
          onOpenFolder={onOpenFolder}
          canCreateFolder={canCreateFolder}
          onRowEnter={onRowEnter}
          onRegisterAnchor={onRegisterAnchor}
        />
      ))}
    </div>
  );
}
