import {
  buildFolderPathMap,
  findNodeById,
  flattenBookmarks,
  isFolder
} from "../bookmarks/bookmarkTree";
import type { BookmarkNode } from "../bookmarks/types";
import type { ExtensionMetadataState } from "../metadata";

export interface SearchResult {
  bookmark: BookmarkNode;
  folderPath: string;
  score: number;
}

export interface SearchBookmarksOptions {
  metadata?: Pick<ExtensionMetadataState, "bookmarkMetadata">;
  scopeRootId?: string;
}

export function searchBookmarks(
  tree: BookmarkNode[],
  query: string,
  options: SearchBookmarksOptions = {}
): SearchResult[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const pathMap = buildFolderPathMap(tree);
  const searchRoots = getSearchRoots(tree, options.scopeRootId);

  return flattenBookmarks(searchRoots)
    .map((bookmark) => ({
      bookmark,
      folderPath: pathMap.get(bookmark.id) ?? "",
      score: scoreBookmark(bookmark, normalizedQuery, options.metadata)
    }))
    .filter((result) => result.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return (right.bookmark.dateAdded ?? 0) - (left.bookmark.dateAdded ?? 0);
    });
}

function getSearchRoots(tree: BookmarkNode[], scopeRootId?: string): BookmarkNode[] {
  if (!scopeRootId) {
    return tree;
  }

  const scopeRoot = findNodeById(tree, scopeRootId);

  if (!scopeRoot || !isFolder(scopeRoot)) {
    return [];
  }

  return [scopeRoot];
}

function scoreBookmark(
  bookmark: BookmarkNode,
  normalizedQuery: string,
  metadata?: Pick<ExtensionMetadataState, "bookmarkMetadata">
): number {
  const title = bookmark.title.toLocaleLowerCase();
  const url = bookmark.url?.toLocaleLowerCase() ?? "";
  const note = metadata?.bookmarkMetadata[bookmark.id]?.note?.toLocaleLowerCase() ?? "";

  if (title === normalizedQuery || url === normalizedQuery) {
    return 100;
  }

  if (title.startsWith(normalizedQuery)) {
    return 80;
  }

  if (title.includes(normalizedQuery)) {
    return 60;
  }

  if (url.includes(normalizedQuery)) {
    return 40;
  }

  if (note.includes(normalizedQuery)) {
    return 20;
  }

  return 0;
}
