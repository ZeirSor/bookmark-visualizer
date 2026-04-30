import { describe, expect, it } from "vitest";
import {
  canRenameFolder,
  collectFolderIds,
  findNodeById,
  insertNodeInBookmarkTree,
  moveNodeInBookmarkTree,
  removeNodeFromBookmarkTree
} from "./bookmarkTree";
import { mockBookmarkTree } from "../../lib/chrome/mockBookmarks";
import type { BookmarkNode } from "./types";

describe("bookmark tree helpers", () => {
  it("collects every folder id across nested levels", () => {
    const tree: BookmarkNode[] = [
      {
        id: "0",
        title: "",
        syncing: false,
        children: [
          {
            id: "1",
            parentId: "0",
            index: 0,
            title: "Bookmarks Bar",
            syncing: false,
            children: [
              {
                id: "10",
                parentId: "1",
                index: 0,
                title: "Design",
                syncing: false,
                children: [
                  {
                    id: "100",
                    parentId: "10",
                    index: 0,
                    title: "Nested",
                    syncing: false,
                    children: []
                  }
                ]
              },
              {
                id: "11",
                parentId: "1",
                index: 1,
                title: "Bookmark",
                syncing: false,
                url: "https://example.com"
              }
            ]
          }
        ]
      }
    ];

    expect(collectFolderIds(tree)).toEqual(["0", "1", "10", "100"]);
  });

  it("allows renaming regular folders but blocks root and browser top-level folders", () => {
    expect(canRenameFolder(findNodeById(mockBookmarkTree, "10"))).toBe(true);
    expect(canRenameFolder(findNodeById(mockBookmarkTree, "0"))).toBe(false);
    expect(canRenameFolder(findNodeById(mockBookmarkTree, "1"))).toBe(false);
    expect(
      canRenameFolder({
        ...findNodeById(mockBookmarkTree, "10")!,
        unmodifiable: "managed"
      })
    ).toBe(false);
  });

  it("moves the second bookmark before the first without reloading the tree", () => {
    const nextTree = moveNodeInBookmarkTree(mockBookmarkTree, "101", {
      parentId: "10",
      index: 0
    });

    expect(getChildIds(nextTree, "10").slice(0, 3)).toEqual(["101", "100", "102"]);
    expect(findNodeById(nextTree, "101")?.index).toBe(0);
    expect(findNodeById(nextTree, "100")?.index).toBe(1);
  });

  it("moves the first bookmark after the last without landing before the tail", () => {
    const nextTree = moveNodeInBookmarkTree(mockBookmarkTree, "100", {
      parentId: "10",
      index: 10
    });

    expect(getChildIds(nextTree, "10").at(-1)).toBe("100");
    expect(findNodeById(nextTree, "100")?.index).toBe(9);
  });

  it("keeps middle before and after bookmark moves in raw Chrome index semantics", () => {
    const beforeTree = moveNodeInBookmarkTree(mockBookmarkTree, "104", {
      parentId: "10",
      index: 2
    });
    const afterTree = moveNodeInBookmarkTree(mockBookmarkTree, "101", {
      parentId: "10",
      index: 4
    });

    expect(getChildIds(beforeTree, "10").slice(1, 4)).toEqual(["101", "104", "102"]);
    expect(getChildIds(afterTree, "10").slice(1, 5)).toEqual(["102", "103", "101", "104"]);
  });

  it("inserts a new bookmark locally at the first, middle, and final positions", () => {
    const first = insertNodeInBookmarkTree(mockBookmarkTree, createBookmark("new-first"), "10", 0);
    const middle = insertNodeInBookmarkTree(mockBookmarkTree, createBookmark("new-middle"), "10", 3);
    const last = insertNodeInBookmarkTree(mockBookmarkTree, createBookmark("new-last"), "10", 10);

    expect(getChildIds(first, "10")[0]).toBe("new-first");
    expect(getChildIds(middle, "10")[3]).toBe("new-middle");
    expect(getChildIds(last, "10").at(-1)).toBe("new-last");
  });

  it("removes a node locally after undoing a newly created bookmark", () => {
    const inserted = insertNodeInBookmarkTree(mockBookmarkTree, createBookmark("new-remove"), "10", 0);
    const removed = removeNodeFromBookmarkTree(inserted, "new-remove");

    expect(findNodeById(removed, "new-remove")).toBeUndefined();
    expect(getChildIds(removed, "10")[0]).toBe("100");
  });
});

function getChildIds(tree: BookmarkNode[], folderId: string): string[] {
  const folder = findNodeById(tree, folderId);
  return folder?.children?.map((child) => child.id) ?? [];
}

function createBookmark(id: string): BookmarkNode {
  return {
    id,
    parentId: "10",
    index: 0,
    title: id,
    syncing: false,
    url: `https://${id}.example.com`
  };
}
