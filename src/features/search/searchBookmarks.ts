import { buildFolderPathMap, flattenBookmarks } from "../bookmarks/bookmarkTree";
import type { BookmarkNode } from "../bookmarks/types";

export interface SearchResult {
  bookmark: BookmarkNode;
  folderPath: string;
  score: number;
}

export function searchBookmarks(tree: BookmarkNode[], query: string): SearchResult[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const pathMap = buildFolderPathMap(tree);

  return flattenBookmarks(tree)
    .map((bookmark) => ({
      bookmark,
      folderPath: pathMap.get(bookmark.id) ?? "",
      score: scoreBookmark(bookmark, normalizedQuery)
    }))
    .filter((result) => result.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return (right.bookmark.dateAdded ?? 0) - (left.bookmark.dateAdded ?? 0);
    });
}

function scoreBookmark(bookmark: BookmarkNode, normalizedQuery: string): number {
  const title = bookmark.title.toLocaleLowerCase();
  const url = bookmark.url?.toLocaleLowerCase() ?? "";

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

  return 0;
}
