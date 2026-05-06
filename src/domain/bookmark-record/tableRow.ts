import type { BookmarkRecord } from "./types";
import type { BookmarkTableRow } from "../table-view";
import type { TagRecord } from "../tag-record";

export function bookmarkRecordsToTableRows(
  bookmarks: BookmarkRecord[],
  tagsById: Record<string, TagRecord> = {}
): BookmarkTableRow[] {
  return bookmarks.map((bookmark) => ({
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    folderPath: bookmark.folderPath ?? "",
    note: bookmark.note,
    tags: bookmark.tagIds.map((tagId) => tagsById[tagId]?.name ?? tagId),
    previewImageUrl: bookmark.previewImageUrl,
    description: bookmark.description,
    createdAt: bookmark.createdAt,
    updatedAt: bookmark.updatedAt,
    lastOperatedAt: bookmark.lastOperatedAt
  }));
}
