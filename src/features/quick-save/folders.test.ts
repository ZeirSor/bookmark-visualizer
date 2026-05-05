import { describe, expect, it } from "vitest";
import { mockBookmarkTree } from "../../lib/chrome/mockBookmarks";
import {
  filterWritableRecentFolderIds,
  findFirstWritableFolder,
  findQuickSaveDefaultFolder
} from "./folders";

describe("quick-save folder defaults", () => {
  it("uses recent writable folders before Bookmarks Bar", () => {
    expect(findQuickSaveDefaultFolder(mockBookmarkTree, ["20"])?.id).toBe("20");
  });

  it("falls back to Bookmarks Bar when no recent folder is available", () => {
    expect(findQuickSaveDefaultFolder(mockBookmarkTree, ["missing"])?.id).toBe("1");
  });

  it("falls back to the first writable folder if Bookmarks Bar is unavailable", () => {
    const tree = [
      {
        id: "0",
        title: "",
        syncing: false,
        children: [
          {
            id: "9",
            parentId: "0",
            index: 0,
            title: "Managed",
            syncing: false,
            unmodifiable: "managed" as const,
            children: []
          },
          {
            id: "10",
            parentId: "9",
            index: 0,
            title: "Writable",
            syncing: false,
            children: []
          }
        ]
      }
    ];

    expect(findQuickSaveDefaultFolder(tree, [])?.id).toBe("10");
    expect(findFirstWritableFolder(tree)?.id).toBe("10");
  });

  it("filters recent ids to writable folders", () => {
    expect(filterWritableRecentFolderIds(mockBookmarkTree, ["0", "10", "missing"])).toEqual([
      "10"
    ]);
  });
});
