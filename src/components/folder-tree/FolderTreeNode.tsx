import { type CSSProperties, type DragEvent } from "react";
import { getDisplayTitle, isBookmark, isFolder } from "../../features/bookmarks";
import {
  canDragFolder,
  canDropBookmarkOnFolder,
  canDropFolderOnIntent
} from "../../features/drag-drop";
import { FolderRenameInput } from "./FolderRenameInput";
import { FolderTreeBookmarkRow } from "./FolderTreeBookmarkRow";
import { getFolderDropPosition } from "./folderTreeDrop";
import type { FolderTreeNodeProps } from "./types";

export function FolderTreeNode({
  node,
  level,
  selectedFolderId,
  showBookmarksInTree,
  expandedFolderIds,
  renamingFolderId,
  draggedBookmark,
  draggedFolder,
  tree,
  activeBookmarkDropFolderId,
  activeBookmarkReorderIntent,
  activeFolderDropIntent,
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
  onFolderContextMenu,
  onActiveBookmarkDropFolderChange,
  onActiveBookmarkReorderIntentChange,
  onActiveFolderDropIntentChange
}: FolderTreeNodeProps) {
  if (isBookmark(node) && !showBookmarksInTree) {
    return null;
  }

  if (isBookmark(node)) {
    return (
      <FolderTreeBookmarkRow
        bookmark={node}
        level={level}
        draggedBookmark={draggedBookmark}
        activeBookmarkReorderIntent={activeBookmarkReorderIntent}
        onSelectBookmark={onSelectBookmark}
        onBookmarkDragStart={onBookmarkDragStart}
        onBookmarkDragEnd={onBookmarkDragEnd}
        onDropBookmarkOnBookmark={onDropBookmarkOnBookmark}
        onActiveBookmarkDropFolderChange={onActiveBookmarkDropFolderChange}
        onActiveBookmarkReorderIntentChange={onActiveBookmarkReorderIntentChange}
      />
    );
  }

  if (!isFolder(node)) {
    return null;
  }

  const isSelected = selectedFolderId === node.id;
  const displayTitle = node.parentId ? getDisplayTitle(node) : "Root";
  const expanded = expandedFolderIds.has(node.id);
  const isRenaming = renamingFolderId === node.id;
  const canDropBookmark = canDropBookmarkOnFolder(draggedBookmark, node);
  const isBookmarkDropTarget = canDropBookmark && activeBookmarkDropFolderId === node.id;
  const canDragCurrentFolder = canDragFolder(node);
  const activeFolderDropPosition =
    activeFolderDropIntent?.targetFolder.id === node.id ? activeFolderDropIntent.position : undefined;
  const visibleChildren = !node.parentId || expanded ? node.children : [];

  function handleDragEnter(event: DragEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (draggedFolder) {
      handleFolderDragOver(event);
      return;
    }

    if (!canDropBookmark) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    onActiveBookmarkReorderIntentChange(undefined);
    onActiveBookmarkDropFolderChange(node.id);
  }

  function handleDragOver(event: DragEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (draggedFolder) {
      handleFolderDragOver(event);
      return;
    }

    if (!canDropBookmark) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    onActiveBookmarkReorderIntentChange(undefined);
    if (activeBookmarkDropFolderId !== node.id) {
      onActiveBookmarkDropFolderChange(node.id);
    }
  }

  function handleFolderDragOver(event: DragEvent<HTMLButtonElement>) {
    if (!draggedFolder) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const intent = {
      targetFolder: node,
      position: getFolderDropPosition(event.clientY, {
        top: rect.top,
        height: rect.height
      })
    };

    if (!canDropFolderOnIntent(draggedFolder, intent, tree)) {
      onActiveFolderDropIntentChange(undefined);
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    onActiveFolderDropIntentChange(intent);
  }

  function handleDragLeave(event: DragEvent<HTMLButtonElement>) {
    event.stopPropagation();

    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    if (activeBookmarkDropFolderId === node.id) {
      onActiveBookmarkDropFolderChange(undefined);
    }

    if (activeFolderDropIntent?.targetFolder.id === node.id) {
      onActiveFolderDropIntentChange(undefined);
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (draggedFolder) {
      const intent = activeFolderDropIntent;
      onActiveFolderDropIntentChange(undefined);

      if (!intent || !canDropFolderOnIntent(draggedFolder, intent, tree)) {
        return;
      }

      event.preventDefault();
      onDropFolder(intent);
      return;
    }

    onActiveBookmarkDropFolderChange(undefined);

    if (!canDropBookmark) {
      return;
    }

    event.preventDefault();
    onDropBookmark(node);
  }

  function handleFolderClick() {
    onSelectFolder(node.id);
    onToggleFolder(node.id);
  }

  function handleFolderDragStart(event: DragEvent<HTMLButtonElement>) {
    if (!canDragCurrentFolder) {
      event.preventDefault();
      return;
    }

    event.stopPropagation();
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", node.id);
    onFolderDragStart(node);
  }

  return (
    <div>
      {node.parentId && isRenaming ? (
        <div
          className={`tree-row folder-row is-selected is-renaming ${
            canDragCurrentFolder ? "can-drag-folder" : ""
          }`}
          style={{ "--level": level } as CSSProperties}
        >
          <span
            className={`tree-caret ${expanded ? "is-expanded" : ""}`}
            aria-hidden="true"
          />
          <span className="folder-glyph" aria-hidden="true" />
          <FolderRenameInput
            folder={node}
            onSave={onRenameFolder}
            onCancel={onCancelRenameFolder}
          />
        </div>
      ) : node.parentId ? (
        <button
          className={`tree-row folder-row ${isSelected ? "is-selected" : ""} ${
            canDropBookmark ? "can-drop" : ""
          } ${isBookmarkDropTarget ? "is-drop-target" : ""} ${
            canDragCurrentFolder ? "can-drag-folder" : ""
          } ${activeFolderDropPosition ? `is-folder-drop-${activeFolderDropPosition}` : ""}`}
          style={{ "--level": level } as CSSProperties}
          type="button"
          draggable={canDragCurrentFolder}
          onClick={handleFolderClick}
          onContextMenu={(event) => onFolderContextMenu(node, event)}
          onDragStart={handleFolderDragStart}
          onDragEnd={onFolderDragEnd}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <span
            className={`tree-caret ${expanded ? "is-expanded" : ""}`}
            aria-hidden="true"
          />
          <span className="folder-glyph" aria-hidden="true" />
          <span className="tree-title">{displayTitle}</span>
        </button>
      ) : null}
      {visibleChildren?.map((child) => (
        <FolderTreeNode
          key={child.id}
          node={child}
          level={node.parentId ? level + 1 : level}
          selectedFolderId={selectedFolderId}
          showBookmarksInTree={showBookmarksInTree}
          expandedFolderIds={expandedFolderIds}
          renamingFolderId={renamingFolderId}
          draggedBookmark={draggedBookmark}
          draggedFolder={draggedFolder}
          tree={tree}
          activeBookmarkDropFolderId={activeBookmarkDropFolderId}
          activeBookmarkReorderIntent={activeBookmarkReorderIntent}
          activeFolderDropIntent={activeFolderDropIntent}
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
          onActiveBookmarkDropFolderChange={onActiveBookmarkDropFolderChange}
          onActiveBookmarkReorderIntentChange={onActiveBookmarkReorderIntentChange}
          onActiveFolderDropIntentChange={onActiveFolderDropIntentChange}
        />
      ))}
    </div>
  );
}
