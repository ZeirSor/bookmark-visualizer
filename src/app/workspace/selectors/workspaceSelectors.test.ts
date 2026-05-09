import { describe, expect, it } from "vitest";
import type { BookmarkNode } from "../../../features/bookmarks";
import type { ExtensionMetadataState } from "../../../features/metadata";
import {
  filterWorkspaceBookmarkItems,
  getDirectFolders,
  getFolderDisplayLabel,
  getFolderStats,
  sortWorkspaceBookmarkItems
} from "./workspaceSelectors";

describe("workspace selectors", () => {
  it("returns empty stats for a missing folder", () => {
    expect(getDirectFolders(undefined)).toEqual([]);
    expect(getFolderStats(undefined)).toEqual({
      bookmarkCount: 0,
      folderCount: 0,
      updatedAt: undefined
    });
    expect(getFolderDisplayLabel(undefined)).toBe("选择一个文件夹");
  });

  it("counts only direct bookmarks and direct child folders", () => {
    const folder: BookmarkNode = {
      id: "10",
      parentId: "1",
      index: 0,
      title: "AI Tools",
      syncing: false,
      dateAdded: 100,
      dateGroupModified: 200,
      children: [
        {
          id: "100",
          parentId: "10",
          index: 0,
          title: "Grok",
          syncing: false,
          url: "https://grok.com"
        },
        {
          id: "101",
          parentId: "10",
          index: 1,
          title: "Research",
          syncing: false,
          children: [
            {
              id: "102",
              parentId: "101",
              index: 0,
              title: "Nested",
              syncing: false,
              url: "https://nested.example"
            }
          ]
        }
      ]
    };

    expect(getDirectFolders(folder).map((item) => item.id)).toEqual(["101"]);
    expect(getFolderStats(folder)).toEqual({
      bookmarkCount: 1,
      folderCount: 1,
      updatedAt: 200
    });
    expect(getFolderDisplayLabel(folder)).toBe("AI Tools");
  });

  it("falls back to dateAdded when the folder modified date is missing", () => {
    const folder: BookmarkNode = {
      id: "10",
      parentId: "1",
      index: 0,
      title: "Saved",
      syncing: false,
      dateAdded: 300,
      children: []
    };

    expect(getFolderStats(folder).updatedAt).toBe(300);
  });

  it("keeps default bookmark item sorting in input order", () => {
    const items = [
      { bookmark: bookmark("1", "B docs", 200) },
      { bookmark: bookmark("2", "A docs", 100) }
    ];

    expect(sortWorkspaceBookmarkItems(items, "default")).toBe(items);
  });

  it("sorts bookmark items by title and date", () => {
    const items = [
      { bookmark: bookmark("1", "B docs", 200) },
      { bookmark: bookmark("2", "A docs", 100) },
      { bookmark: bookmark("3", "C docs", 300) }
    ];

    expect(sortWorkspaceBookmarkItems(items, "title-asc").map((item) => item.bookmark.id)).toEqual([
      "2",
      "1",
      "3"
    ]);
    expect(sortWorkspaceBookmarkItems(items, "date-newest").map((item) => item.bookmark.id)).toEqual([
      "3",
      "1",
      "2"
    ]);
    expect(sortWorkspaceBookmarkItems(items, "date-oldest").map((item) => item.bookmark.id)).toEqual([
      "2",
      "1",
      "3"
    ]);
  });

  it("filters bookmark items to entries with notes", () => {
    const metadata: ExtensionMetadataState = {
      metadataVersion: 1,
      bookmarkMetadata: {
        "1": { note: "Keep this" },
        "2": { note: "   " }
      }
    };
    const items = [
      { bookmark: bookmark("1", "With note", 200) },
      { bookmark: bookmark("2", "Blank note", 100) },
      { bookmark: bookmark("3", "No note", 300) }
    ];

    expect(
      filterWorkspaceBookmarkItems(items, metadata, { hasNote: true }).map((item) => item.bookmark.id)
    ).toEqual(["1"]);
    expect(filterWorkspaceBookmarkItems(items, metadata, { hasNote: false })).toBe(items);
  });
});

function bookmark(id: string, title: string, dateAdded: number): BookmarkNode {
  return {
    id,
    parentId: "10",
    index: Number(id),
    title,
    syncing: false,
    dateAdded,
    url: `https://example.com/${id}`
  };
}
