import { isFolder, type BookmarkNode } from "../bookmarks";

export interface DraggedBookmarkSnapshot {
  id: string;
  title: string;
  parentId?: string;
  index?: number;
}

export function createDraggedBookmarkSnapshot(bookmark: BookmarkNode): DraggedBookmarkSnapshot {
  return {
    id: bookmark.id,
    title: bookmark.title,
    parentId: bookmark.parentId,
    index: bookmark.index
  };
}

export function canDropBookmarkOnFolder(
  dragged: DraggedBookmarkSnapshot | undefined,
  targetFolder: BookmarkNode | undefined
): boolean {
  return canMoveBookmarkToFolder(dragged, targetFolder);
}

export function canMoveBookmarkToFolder(
  dragged: DraggedBookmarkSnapshot | undefined,
  targetFolder: BookmarkNode | undefined
): boolean {
  if (!dragged || !targetFolder) {
    return false;
  }

  if (!isFolder(targetFolder) || !targetFolder.parentId || targetFolder.unmodifiable) {
    return false;
  }

  return dragged.parentId !== targetFolder.id;
}
