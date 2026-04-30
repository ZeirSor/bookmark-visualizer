import { isFolder, type BookmarkNode } from "../bookmarks";

export interface DraggedBookmarkSnapshot {
  id: string;
  title: string;
  parentId?: string;
  index?: number;
}

export interface DraggedFolderSnapshot {
  id: string;
  title: string;
  parentId?: string;
  index?: number;
}

export type FolderDropPosition = "before" | "inside" | "after";
export type BookmarkDropPosition = "before" | "after";

export interface FolderDropIntent {
  targetFolder: BookmarkNode;
  position: FolderDropPosition;
}

export interface BookmarkDropIntent {
  targetBookmark: BookmarkNode;
  position: BookmarkDropPosition;
}

export interface BookmarkDropPointer {
  x: number;
  y: number;
}

export interface BookmarkDropRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface FolderMoveDestination {
  parentId: string;
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

export function createDraggedFolderSnapshot(folder: BookmarkNode): DraggedFolderSnapshot {
  return {
    id: folder.id,
    title: folder.title,
    parentId: folder.parentId,
    index: folder.index
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

export function canReorderBookmarkOnIntent(
  dragged: DraggedBookmarkSnapshot | undefined,
  intent: BookmarkDropIntent | undefined
): boolean {
  if (!dragged || !intent || !dragged.parentId || !intent.targetBookmark.parentId) {
    return false;
  }

  if (dragged.id === intent.targetBookmark.id) {
    return false;
  }

  if (dragged.parentId !== intent.targetBookmark.parentId) {
    return false;
  }

  const sourceIndex = dragged.index ?? -1;
  const targetIndex = intent.targetBookmark.index ?? -1;

  if (intent.position === "before" && sourceIndex === targetIndex - 1) {
    return false;
  }

  if (intent.position === "after" && sourceIndex === targetIndex + 1) {
    return false;
  }

  return true;
}

export function getBookmarkReorderDestination(
  dragged: DraggedBookmarkSnapshot,
  intent: BookmarkDropIntent
): FolderMoveDestination {
  if (!intent.targetBookmark.parentId) {
    throw new Error("Cannot reorder a bookmark without a parent folder.");
  }

  const targetIndex = intent.targetBookmark.index ?? 0;
  const rawIndex = intent.position === "before" ? targetIndex : targetIndex + 1;

  return { parentId: intent.targetBookmark.parentId, index: rawIndex };
}

export function getBookmarkCardDropPosition(
  pointer: BookmarkDropPointer,
  rect: BookmarkDropRect
): BookmarkDropPosition {
  const beforeDistance = Math.min(
    Math.abs(pointer.x - rect.left),
    Math.abs(pointer.y - rect.top)
  );
  const afterDistance = Math.min(
    Math.abs(rect.right - pointer.x),
    Math.abs(rect.bottom - pointer.y)
  );

  return beforeDistance <= afterDistance ? "before" : "after";
}

export function canDragFolder(folder: BookmarkNode | undefined): boolean {
  return Boolean(
    folder &&
      isFolder(folder) &&
      folder.parentId &&
      folder.parentId !== "0" &&
      !folder.unmodifiable
  );
}

export function canDropFolderOnIntent(
  dragged: DraggedFolderSnapshot | undefined,
  intent: FolderDropIntent | undefined,
  tree: BookmarkNode[]
): boolean {
  if (!dragged || !intent || !isFolder(intent.targetFolder)) {
    return false;
  }

  const target = intent.targetFolder;

  if (!target.parentId || target.unmodifiable || target.id === dragged.id) {
    return false;
  }

  if (isDescendantFolder(tree, dragged.id, target.id)) {
    return false;
  }

  if (intent.position === "inside") {
    return dragged.parentId !== target.id;
  }

  if (target.parentId === "0") {
    return false;
  }

  if (dragged.parentId === target.parentId) {
    const sourceIndex = dragged.index ?? -1;
    const targetIndex = target.index ?? -1;

    if (intent.position === "before" && sourceIndex === targetIndex - 1) {
      return false;
    }

    if (intent.position === "after" && sourceIndex === targetIndex + 1) {
      return false;
    }
  }

  return true;
}

export function getFolderMoveDestination(
  dragged: DraggedFolderSnapshot,
  intent: FolderDropIntent
): FolderMoveDestination {
  if (intent.position === "inside") {
    return { parentId: intent.targetFolder.id };
  }

  const parentId = intent.targetFolder.parentId;
  if (!parentId) {
    throw new Error("Cannot move folder next to a root node.");
  }

  const targetIndex = intent.targetFolder.index ?? 0;
  const rawIndex = intent.position === "before" ? targetIndex : targetIndex + 1;
  const index =
    dragged.parentId === parentId && typeof dragged.index === "number" && dragged.index < rawIndex
      ? rawIndex - 1
      : rawIndex;

  return { parentId, index };
}

function isDescendantFolder(tree: BookmarkNode[], ancestorId: string, targetId: string): boolean {
  const ancestor = findFolder(tree, ancestorId);

  if (!ancestor?.children) {
    return false;
  }

  return Boolean(findFolder(ancestor.children, targetId));
}

function findFolder(nodes: BookmarkNode[], id: string): BookmarkNode | undefined {
  for (const node of nodes) {
    if (node.id === id && isFolder(node)) {
      return node;
    }

    const match = node.children ? findFolder(node.children, id) : undefined;
    if (match) {
      return match;
    }
  }

  return undefined;
}
