import { useState } from "react";
import type { BookmarkDropIntent, FolderDropIntent } from "../features/drag-drop";
import { FolderTreeNode } from "./folder-tree/FolderTreeNode";
import { useFolderTreeAutoScroll } from "./folder-tree/useFolderTreeAutoScroll";
import type { FolderTreeProps } from "./folder-tree/types";

export function FolderTree({
  nodes,
  selectedFolderId,
  showBookmarksInTree,
  expandedFolderIds,
  renamingFolderId,
  draggedBookmark,
  draggedFolder,
  onSelectFolder,
  onToggleFolder,
  onSelectBookmark,
  onBookmarkDragStart,
  onBookmarkDragEnd,
  onRenameFolder,
  onCancelRenameFolder,
  onDropBookmark,
  onDropBookmarkOnBookmark,
  onFolderDragStart,
  onFolderDragEnd,
  onDropFolder,
  onFolderContextMenu
}: FolderTreeProps) {
  const [activeBookmarkDropFolderId, setActiveBookmarkDropFolderId] = useState<string>();
  const [activeBookmarkReorderIntent, setActiveBookmarkReorderIntent] =
    useState<BookmarkDropIntent>();
  const [activeFolderDropIntent, setActiveFolderDropIntent] = useState<FolderDropIntent>();
  const { treeRef, updateAutoScroll, stopAutoScroll, handleWheelDuringDrag } =
    useFolderTreeAutoScroll(Boolean(draggedBookmark || draggedFolder));

  function clearDropState() {
    setActiveBookmarkDropFolderId(undefined);
    setActiveBookmarkReorderIntent(undefined);
    setActiveFolderDropIntent(undefined);
    stopAutoScroll();
  }

  return (
    <nav
      ref={treeRef}
      className="folder-tree"
      aria-label="Bookmark folders"
      onDragOverCapture={(event) => updateAutoScroll(event.clientY)}
      onWheelCapture={handleWheelDuringDrag}
      onDragLeave={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          clearDropState();
        }
      }}
      onDrop={clearDropState}
    >
      {nodes.map((node) => (
        <FolderTreeNode
          key={node.id}
          node={node}
          level={0}
          selectedFolderId={selectedFolderId}
          showBookmarksInTree={showBookmarksInTree}
          expandedFolderIds={expandedFolderIds}
          renamingFolderId={renamingFolderId}
          draggedBookmark={draggedBookmark}
          draggedFolder={draggedFolder}
          activeBookmarkDropFolderId={activeBookmarkDropFolderId}
          activeBookmarkReorderIntent={activeBookmarkReorderIntent}
          activeFolderDropIntent={activeFolderDropIntent}
          tree={nodes}
          onSelectFolder={onSelectFolder}
          onToggleFolder={onToggleFolder}
          onSelectBookmark={onSelectBookmark}
          onBookmarkDragStart={onBookmarkDragStart}
          onBookmarkDragEnd={onBookmarkDragEnd}
          onRenameFolder={onRenameFolder}
          onCancelRenameFolder={onCancelRenameFolder}
          onDropBookmark={onDropBookmark}
          onDropBookmarkOnBookmark={onDropBookmarkOnBookmark}
          onFolderDragStart={onFolderDragStart}
          onFolderDragEnd={onFolderDragEnd}
          onDropFolder={onDropFolder}
          onFolderContextMenu={onFolderContextMenu}
          onActiveBookmarkDropFolderChange={setActiveBookmarkDropFolderId}
          onActiveBookmarkReorderIntentChange={setActiveBookmarkReorderIntent}
          onActiveFolderDropIntentChange={setActiveFolderDropIntent}
        />
      ))}
    </nav>
  );
}
