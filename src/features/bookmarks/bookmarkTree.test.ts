import { describe, expect, it } from "vitest";
import {
  buildFolderCascadeInitialPathIds,
  buildFolderBreadcrumbItems,
  buildFolderPathHighlightIds,
  buildRetainedFolderBreadcrumbItems,
  canCreateBookmarkInFolder,
  canRenameFolder,
  collectFolderIds,
  filterFolderOptions,
  findNodeById,
  flattenFolders,
  getFolderEndIndex,
  getRetainedBreadcrumbTailIds,
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

  it("allows creating bookmarks in writable folders including browser top-level folders", () => {
    expect(canCreateBookmarkInFolder(findNodeById(mockBookmarkTree, "1"))).toBe(true);
    expect(canCreateBookmarkInFolder(findNodeById(mockBookmarkTree, "10"))).toBe(true);
    expect(canCreateBookmarkInFolder(findNodeById(mockBookmarkTree, "0"))).toBe(false);
    expect(
      canCreateBookmarkInFolder({
        ...findNodeById(mockBookmarkTree, "10")!,
        unmodifiable: "managed"
      })
    ).toBe(false);
  });

  it("uses the full folder child count for end insertion indexes", () => {
    expect(getFolderEndIndex(findNodeById(mockBookmarkTree, "1"))).toBe(12);
    expect(getFolderEndIndex(findNodeById(mockBookmarkTree, "10"))).toBe(10);
    expect(
      getFolderEndIndex({
        id: "empty",
        parentId: "1",
        index: 0,
        title: "Empty",
        syncing: false,
        children: []
      })
    ).toBe(0);
  });

  it("filters folder picker options by title or full path", () => {
    const options = flattenFolders(mockBookmarkTree);

    expect(filterFolderOptions(options, "design").map((option) => option.id)).toContain("11");
    expect(filterFolderOptions(options, "bookmarks bar / product").map((option) => option.id)).toContain(
      "10"
    );
    expect(filterFolderOptions(options, "missing")).toEqual([]);
  });

  it("builds stable breadcrumb items for nested folders", () => {
    expect(buildFolderBreadcrumbItems(mockBookmarkTree, "10").map((item) => item.title)).toEqual([
      "Root",
      "Bookmarks Bar",
      "Product Research"
    ]);
    expect(buildFolderBreadcrumbItems(mockBookmarkTree, "10").map((item) => item.id)).toEqual([
      "0",
      "1",
      "10"
    ]);
  });

  it("keeps a retained breadcrumb tail after selecting an ancestor", () => {
    const previousPath = buildFolderBreadcrumbItems(mockBookmarkTree, "10");
    const tailIds = getRetainedBreadcrumbTailIds(previousPath, "1");
    const retainedItems = buildRetainedFolderBreadcrumbItems(mockBookmarkTree, "1", tailIds);

    expect(tailIds).toEqual(["10"]);
    expect(retainedItems.map((item) => item.title)).toEqual([
      "Root",
      "Bookmarks Bar",
      "Product Research"
    ]);
    expect(retainedItems.map((item) => Boolean(item.isRetained))).toEqual([false, false, true]);
  });

  it("lets a retained breadcrumb descendant become active again", () => {
    const retainedItems = buildRetainedFolderBreadcrumbItems(mockBookmarkTree, "1", ["10"]);
    const tailIds = getRetainedBreadcrumbTailIds(retainedItems, "10");
    const activeItems = buildRetainedFolderBreadcrumbItems(mockBookmarkTree, "10", tailIds);

    expect(tailIds).toEqual([]);
    expect(activeItems.map((item) => item.id)).toEqual(["0", "1", "10"]);
    expect(activeItems.some((item) => item.isRetained)).toBe(false);
  });

  it("drops retained breadcrumb tails for unrelated folder selections", () => {
    const retainedItems = buildRetainedFolderBreadcrumbItems(mockBookmarkTree, "20", ["10"]);

    expect(retainedItems.map((item) => item.id)).toEqual(["0", "2", "20"]);
    expect(retainedItems.some((item) => item.isRetained)).toBe(false);
  });

  it("builds cascade initial paths from ancestors without expanding the final folder", () => {
    expect(buildFolderCascadeInitialPathIds(mockBookmarkTree, "10")).toEqual(["1"]);
    expect(buildFolderCascadeInitialPathIds(mockBookmarkTree, "1")).toEqual([]);
  });

  it("falls back safely for missing or root cascade selections", () => {
    expect(buildFolderCascadeInitialPathIds(mockBookmarkTree, "missing")).toEqual([]);
    expect(buildFolderCascadeInitialPathIds(mockBookmarkTree, "0")).toEqual([]);
    expect(buildFolderPathHighlightIds(mockBookmarkTree, "missing")).toEqual([]);
  });

  it("builds selected folder highlight paths without the browser root", () => {
    expect(buildFolderPathHighlightIds(mockBookmarkTree, "10")).toEqual(["1", "10"]);
    expect(buildFolderPathHighlightIds(mockBookmarkTree, "20")).toEqual(["2", "20"]);
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
