import {
  canCreateBookmarkInFolder,
  findNodeById,
  isFolder,
  type BookmarkNode
} from "../bookmarks";

export function filterWritableRecentFolderIds(
  tree: BookmarkNode[],
  recentFolderIds: string[]
): string[] {
  return recentFolderIds.filter((folderId) =>
    canCreateBookmarkInFolder(findNodeById(tree, folderId))
  );
}

export function findQuickSaveDefaultFolder(
  tree: BookmarkNode[],
  recentFolderIds: string[]
): BookmarkNode | undefined {
  for (const folderId of recentFolderIds) {
    const folder = findNodeById(tree, folderId);
    if (canCreateBookmarkInFolder(folder)) {
      return folder;
    }
  }

  return findBookmarksBarFolder(tree) ?? findFirstWritableFolder(tree);
}

export function findFirstWritableFolder(nodes: BookmarkNode[]): BookmarkNode | undefined {
  for (const node of nodes) {
    if (canCreateBookmarkInFolder(node)) {
      return node;
    }

    const nested = node.children ? findFirstWritableFolder(node.children) : undefined;
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function findBookmarksBarFolder(nodes: BookmarkNode[]): BookmarkNode | undefined {
  for (const node of nodes) {
    if (
      isFolder(node) &&
      canCreateBookmarkInFolder(node) &&
      node.parentId === "0" &&
      isBookmarksBarTitle(node.title)
    ) {
      return node;
    }

    const nested = node.children ? findBookmarksBarFolder(node.children) : undefined;
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function isBookmarksBarTitle(title: string): boolean {
  const normalized = title.trim().toLocaleLowerCase();
  return normalized === "bookmarks bar" || normalized === "bookmark bar" || normalized === "书签栏";
}
