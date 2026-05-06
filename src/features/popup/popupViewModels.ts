import {
  buildFolderPathMap,
  canCreateBookmarkInFolder,
  findNodeById,
  flattenBookmarks,
  getDisplayTitle,
  type BookmarkNode,
  type FolderOption
} from "../bookmarks";

export interface PopupRecentBookmark {
  id: string;
  title: string;
  url: string;
  domain: string;
  folderPath: string;
  savedAtLabel: string;
}

export function compactFolderPath(path: string, maxSegments = 3): string {
  const segments = getDisplayPathSegments(path);

  if (segments.length <= maxSegments) {
    return segments.join(" / ");
  }

  return `${segments[0]} / ... / ${segments[segments.length - 1]}`;
}

export function formatPopupFolderPath(path: string, fallback = "正在读取保存位置"): string {
  const segments = getDisplayPathSegments(path);
  return segments.length > 0 ? segments.join(" / ") : fallback;
}

export function getFolderNameFromPath(path: string): string {
  const segments = getDisplayPathSegments(path);
  return segments.at(-1) ?? "";
}

export function isLargePreviewImage(previewImageUrl?: string, faviconUrl?: string): boolean {
  if (!previewImageUrl) {
    return false;
  }

  if (faviconUrl && previewImageUrl === faviconUrl) {
    return false;
  }

  const normalizedUrl = previewImageUrl.toLocaleLowerCase();
  return !/\/favicon(?:[-_.]|\b)|favicon\.ico\b|apple-touch-icon|\/icons?\//.test(normalizedUrl);
}

export function shouldContainPreviewImage(
  previewImageUrl?: string,
  faviconUrl?: string
): boolean {
  if (!previewImageUrl) {
    return false;
  }

  if (faviconUrl && previewImageUrl === faviconUrl) {
    return true;
  }

  const normalizedUrl = previewImageUrl.toLocaleLowerCase();
  return /\/favicon(?:[-_.]|\b)|favicon\.ico\b|apple-touch-icon|\/icons?\//.test(normalizedUrl);
}

export function selectInitialPopupFolderId({
  fallbackFolderId,
  popupDefaultFolderId,
  recentFolderIds,
  rememberLastFolder,
  tree
}: {
  tree: BookmarkNode[];
  recentFolderIds: string[];
  rememberLastFolder: boolean;
  popupDefaultFolderId?: string;
  fallbackFolderId?: string;
}): string | undefined {
  if (rememberLastFolder) {
    const recentFolderId = recentFolderIds.find((folderId) =>
      canCreateBookmarkInFolder(findNodeById(tree, folderId))
    );

    if (recentFolderId) {
      return recentFolderId;
    }
  }

  if (popupDefaultFolderId && canCreateBookmarkInFolder(findNodeById(tree, popupDefaultFolderId))) {
    return popupDefaultFolderId;
  }

  if (fallbackFolderId && canCreateBookmarkInFolder(findNodeById(tree, fallbackFolderId))) {
    return fallbackFolderId;
  }

  return findFirstWritableFolderId(tree);
}

export function deriveRecentSavedBookmarks(
  tree: BookmarkNode[],
  limit = 3,
  now = Date.now()
): PopupRecentBookmark[] {
  const pathMap = buildFolderPathMap(tree);

  return flattenBookmarks(tree)
    .filter((bookmark) => Boolean(bookmark.url))
    .sort((left, right) => (right.dateAdded ?? 0) - (left.dateAdded ?? 0))
    .slice(0, limit)
    .map((bookmark) => ({
      id: bookmark.id,
      title: getDisplayTitle(bookmark),
      url: bookmark.url ?? "",
      domain: getUrlDomain(bookmark.url),
      folderPath: compactFolderPath(pathMap.get(bookmark.id) ?? ""),
      savedAtLabel: formatRelativeTime(bookmark.dateAdded, now)
    }));
}

export function getFolderCountLabel(option: FolderOption): string {
  const count = option.node.children?.length ?? 0;
  return `${option.title} ${count} 项`;
}

function findFirstWritableFolderId(nodes: BookmarkNode[]): string | undefined {
  for (const node of nodes) {
    if (canCreateBookmarkInFolder(node)) {
      return node.id;
    }

    const nested = node.children ? findFirstWritableFolderId(node.children) : undefined;
    if (nested) {
      return nested;
    }
  }
}

function getDisplayPathSegments(path: string): string[] {
  const segments = path.split(" / ").map((segment) => segment.trim()).filter(Boolean);
  return segments[0] === "Root" || segments[0] === "书签根目录" ? segments.slice(1) : segments;
}

function getUrlDomain(url?: string): string {
  if (!url) {
    return "";
  }

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatRelativeTime(timestamp: number | undefined, now: number): string {
  if (!timestamp) {
    return "";
  }

  const elapsedMs = Math.max(0, now - timestamp);
  const elapsedMinutes = Math.floor(elapsedMs / 60000);

  if (elapsedMinutes < 1) {
    return "刚刚";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} 分钟前`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours} 小时前`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) {
    return `${elapsedDays} 天前`;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit"
  }).format(timestamp);
}
