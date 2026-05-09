import {
  findNodeById,
  getDisplayTitle,
  isBookmark,
  isFolder,
  type BookmarkNode
} from "../../../features/bookmarks";
import type { ExtensionMetadataState } from "../../../features/metadata";
import type { WorkspaceFilters, WorkspaceSortMode } from "../types";

export interface FolderStats {
  bookmarkCount: number;
  folderCount: number;
  updatedAt?: number;
}

interface WorkspaceBookmarkItem {
  bookmark: BookmarkNode;
}

export function getDirectFolders(folder?: BookmarkNode): BookmarkNode[] {
  return folder?.children?.filter(isFolder) ?? [];
}

export function getFolderStats(folder?: BookmarkNode): FolderStats {
  const children = folder?.children ?? [];

  return {
    bookmarkCount: children.filter(isBookmark).length,
    folderCount: children.filter(isFolder).length,
    updatedAt: folder?.dateGroupModified ?? folder?.dateAdded
  };
}

export function getFolderDisplayLabel(folder?: BookmarkNode): string {
  return folder ? getDisplayTitle(folder) : "选择一个文件夹";
}

export function getSelectedBookmarksForAction(
  selectedIds: Set<string>,
  tree: BookmarkNode[]
): BookmarkNode[] {
  return [...selectedIds]
    .map((id) => findNodeById(tree, id))
    .filter((bookmark): bookmark is BookmarkNode => Boolean(bookmark?.url));
}

export function filterWorkspaceBookmarkItems<T extends WorkspaceBookmarkItem>(
  items: T[],
  metadata: ExtensionMetadataState,
  filters: WorkspaceFilters
): T[] {
  if (!filters.hasNote) {
    return items;
  }

  return items.filter((item) => hasBookmarkNote(metadata, item.bookmark.id));
}

export function sortWorkspaceBookmarkItems<T extends WorkspaceBookmarkItem>(
  items: T[],
  sortMode: WorkspaceSortMode
): T[] {
  if (sortMode === "default") {
    return items;
  }

  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const result = compareBookmarks(left.item.bookmark, right.item.bookmark, sortMode);
      return result === 0 ? left.index - right.index : result;
    })
    .map(({ item }) => item);
}

export function hasActiveWorkspaceFilters(filters: WorkspaceFilters): boolean {
  return filters.hasNote;
}

function hasBookmarkNote(metadata: ExtensionMetadataState, bookmarkId: string): boolean {
  return Boolean(metadata.bookmarkMetadata[bookmarkId]?.note?.trim());
}

function compareBookmarks(
  left: BookmarkNode,
  right: BookmarkNode,
  sortMode: WorkspaceSortMode
): number {
  if (sortMode === "title-asc") {
    return getDisplayTitle(left).localeCompare(getDisplayTitle(right), "zh-CN", {
      sensitivity: "base"
    });
  }

  const leftDate = left.dateAdded ?? 0;
  const rightDate = right.dateAdded ?? 0;

  if (sortMode === "date-newest") {
    return rightDate - leftDate;
  }

  if (sortMode === "date-oldest") {
    return leftDate - rightDate;
  }

  return 0;
}

export function formatFolderUpdatedLabel(timestamp?: number): string | undefined {
  if (!timestamp) {
    return undefined;
  }

  const diffMs = Date.now() - timestamp;
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < minuteMs) {
    return "刚刚更新";
  }

  if (diffMs < hourMs) {
    return `上次更新 ${Math.max(1, Math.floor(diffMs / minuteMs))} 分钟前`;
  }

  if (diffMs < dayMs) {
    return `上次更新 ${Math.floor(diffMs / hourMs)} 小时前`;
  }

  return `上次更新 ${new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(timestamp))}`;
}
