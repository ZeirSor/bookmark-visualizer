import { describe, expect, it } from "vitest";
import type { BookmarkNode } from "../../../features/bookmarks";
import { getDirectFolders, getFolderDisplayLabel, getFolderStats } from "./workspaceSelectors";

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
});
