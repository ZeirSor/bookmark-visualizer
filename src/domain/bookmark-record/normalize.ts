import type { BookmarkRecord, BookmarkRecordMetadataInput } from "./types";
import type { FolderRecord } from "../folder-record";

export interface NormalizedBookmarkTree {
  bookmarks: BookmarkRecord[];
  folders: FolderRecord[];
  folderPathByBrowserId: Map<string, string>;
}

export interface NormalizeBookmarkTreeOptions {
  metadataByBrowserId?: Record<string, BookmarkRecordMetadataInput>;
  now?: string;
}

export function normalizeBookmarkTree(
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  options: NormalizeBookmarkTreeOptions = {}
): NormalizedBookmarkTree {
  const now = options.now ?? new Date().toISOString();
  const metadataByBrowserId = options.metadataByBrowserId ?? {};
  const bookmarks: BookmarkRecord[] = [];
  const folders: FolderRecord[] = [];
  const folderPathByBrowserId = new Map<string, string>();

  function walk(node: chrome.bookmarks.BookmarkTreeNode, parentPath = "") {
    if (isBookmarkNode(node)) {
      bookmarks.push(normalizeBookmarkNode(node, metadataByBrowserId[node.id], parentPath, now));
      return;
    }

    if (!isFolderNode(node)) {
      return;
    }

    const title = getNodeTitle(node);
    const path = parentPath ? `${parentPath} / ${title}` : title;
    folderPathByBrowserId.set(node.id, path);
    folders.push(normalizeFolderNode(node, path, now));
    node.children?.forEach((child) => walk(child, path));
  }

  nodes.forEach((node) => walk(node));
  return { bookmarks, folders, folderPathByBrowserId };
}

export function toBrowserRecordId(browserId: string): string {
  return `browser:${browserId}`;
}

function normalizeBookmarkNode(
  node: chrome.bookmarks.BookmarkTreeNode,
  metadata: BookmarkRecordMetadataInput | undefined,
  folderPath: string,
  now: string
): BookmarkRecord {
  const dateAdded = toIsoDate(node.dateAdded);
  const metadataUpdatedAt = toIsoDate(metadata?.updatedAt);
  const fallbackTimestamp = metadataUpdatedAt ?? dateAdded ?? now;

  return {
    id: toBrowserRecordId(node.id),
    browserBookmarkId: node.id,
    type: "bookmark",
    title: getNodeTitle(node),
    url: node.url ?? "",
    folderId: node.parentId ? toBrowserRecordId(node.parentId) : undefined,
    folderPath,
    note: metadata?.note,
    description: metadata?.summary,
    previewImageUrl: metadata?.previewImageUrl,
    tagIds: [],
    dateAdded,
    createdAt: dateAdded ?? fallbackTimestamp,
    updatedAt: fallbackTimestamp,
    source: "browser",
    syncStatus: "local-only"
  };
}

function normalizeFolderNode(
  node: chrome.bookmarks.BookmarkTreeNode,
  path: string,
  now: string
): FolderRecord {
  const createdAt = toIsoDate(node.dateAdded) ?? now;
  const updatedAt = toIsoDate(node.dateGroupModified) ?? createdAt;

  return {
    id: toBrowserRecordId(node.id),
    browserBookmarkId: node.id,
    title: getNodeTitle(node),
    parentId: node.parentId ? toBrowserRecordId(node.parentId) : undefined,
    index: node.index,
    path,
    createdAt,
    updatedAt,
    source: "browser"
  };
}

function isBookmarkNode(node: chrome.bookmarks.BookmarkTreeNode): boolean {
  return typeof node.url === "string";
}

function isFolderNode(node: chrome.bookmarks.BookmarkTreeNode): boolean {
  return Array.isArray(node.children);
}

function getNodeTitle(node: chrome.bookmarks.BookmarkTreeNode): string {
  if (!node.parentId) {
    return "Root";
  }

  return node.title.trim() || "Untitled";
}

function toIsoDate(timestamp?: number): string | undefined {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
    return undefined;
  }

  return new Date(timestamp).toISOString();
}
