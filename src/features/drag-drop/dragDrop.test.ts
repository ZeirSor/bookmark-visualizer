import { describe, expect, it } from "vitest";
import { findNodeById } from "../bookmarks";
import {
  canDragFolder,
  canDropBookmarkOnFolder,
  canDropFolderOnIntent,
  canMoveBookmarkToFolder,
  canReorderBookmarkOnIntent,
  createDraggedBookmarkSnapshot,
  createDraggedFolderSnapshot,
  getBookmarkCardDropPosition,
  getBookmarkReorderDestination,
  getFolderMoveDestination
} from "./index";
import { mockBookmarkTree } from "../../lib/chrome/mockBookmarks";
import type { BookmarkNode } from "../bookmarks";

describe("drag-drop rules", () => {
  it("allows dropping a bookmark on another editable folder", () => {
    const bookmark = findNodeById(mockBookmarkTree, "100");
    const folder = findNodeById(mockBookmarkTree, "11");

    expect(canDropBookmarkOnFolder(createDraggedBookmarkSnapshot(bookmark!), folder)).toBe(true);
  });

  it("blocks dropping onto the current parent folder", () => {
    const bookmark = findNodeById(mockBookmarkTree, "100");
    const folder = findNodeById(mockBookmarkTree, "10");

    expect(canDropBookmarkOnFolder(createDraggedBookmarkSnapshot(bookmark!), folder)).toBe(false);
  });

  it("blocks root and unmodifiable folders", () => {
    const bookmark = findNodeById(mockBookmarkTree, "100");
    const root = findNodeById(mockBookmarkTree, "0");
    const lockedFolder = { ...findNodeById(mockBookmarkTree, "11")!, unmodifiable: "managed" as const };

    expect(canDropBookmarkOnFolder(createDraggedBookmarkSnapshot(bookmark!), root)).toBe(false);
    expect(canDropBookmarkOnFolder(createDraggedBookmarkSnapshot(bookmark!), lockedFolder)).toBe(false);
  });

  it("allows moving into a child of the current parent folder", () => {
    const bookmark: BookmarkNode = {
      id: "bookmark-a",
      parentId: "parent-a",
      index: 0,
      title: "Nested target test",
      syncing: false,
      url: "https://example.com"
    };
    const childFolder: BookmarkNode = {
      id: "child-a",
      parentId: "parent-a",
      index: 1,
      title: "Child folder",
      syncing: false,
      children: []
    };

    expect(canMoveBookmarkToFolder(createDraggedBookmarkSnapshot(bookmark), childFolder)).toBe(true);
  });

  it("allows dragging regular folders but blocks root and top-level special folders", () => {
    expect(canDragFolder(findNodeById(mockBookmarkTree, "10"))).toBe(true);
    expect(canDragFolder(findNodeById(mockBookmarkTree, "0"))).toBe(false);
    expect(canDragFolder(findNodeById(mockBookmarkTree, "1"))).toBe(false);
  });

  it("allows dropping a folder inside another editable folder", () => {
    const source = createDraggedFolderSnapshot(findNodeById(mockBookmarkTree, "10")!);
    const target = findNodeById(mockBookmarkTree, "11")!;

    expect(
      canDropFolderOnIntent(source, { targetFolder: target, position: "inside" }, mockBookmarkTree)
    ).toBe(true);
    expect(getFolderMoveDestination(source, { targetFolder: target, position: "inside" })).toEqual({
      parentId: "11"
    });
  });

  it("blocks moving a folder into itself or its descendant", () => {
    const tree: BookmarkNode[] = [
      {
        id: "root",
        title: "",
        syncing: false,
        children: [
          {
            id: "parent",
            parentId: "root",
            index: 0,
            title: "Parent",
            syncing: false,
            children: [
              {
                id: "child",
                parentId: "parent",
                index: 0,
                title: "Child",
                syncing: false,
                children: []
              }
            ]
          }
        ]
      }
    ];
    const source = createDraggedFolderSnapshot(tree[0].children![0]);
    const child = tree[0].children![0].children![0];

    expect(
      canDropFolderOnIntent(source, { targetFolder: tree[0].children![0], position: "inside" }, tree)
    ).toBe(false);
    expect(canDropFolderOnIntent(source, { targetFolder: child, position: "inside" }, tree)).toBe(
      false
    );
  });

  it("blocks sibling drops next to browser top-level folders", () => {
    const source = createDraggedFolderSnapshot(findNodeById(mockBookmarkTree, "10")!);
    const topLevelFolder = findNodeById(mockBookmarkTree, "2")!;

    expect(
      canDropFolderOnIntent(
        source,
        { targetFolder: topLevelFolder, position: "before" },
        mockBookmarkTree
      )
    ).toBe(false);
  });

  it("adjusts same-parent move indexes after the source folder is removed", () => {
    const source = createDraggedFolderSnapshot(findNodeById(mockBookmarkTree, "10")!);
    const target = findNodeById(mockBookmarkTree, "11")!;

    expect(getFolderMoveDestination(source, { targetFolder: target, position: "after" })).toEqual({
      parentId: "1",
      index: 1
    });
    expect(
      canDropFolderOnIntent(source, { targetFolder: target, position: "before" }, mockBookmarkTree)
    ).toBe(false);
  });

  it("allows reordering bookmarks within the same parent folder", () => {
    const source = createDraggedBookmarkSnapshot(findNodeById(mockBookmarkTree, "100")!);
    const target = findNodeById(mockBookmarkTree, "102")!;

    expect(canReorderBookmarkOnIntent(source, { targetBookmark: target, position: "after" })).toBe(
      true
    );
    expect(getBookmarkReorderDestination(source, { targetBookmark: target, position: "after" })).toEqual({
      parentId: "10",
      index: 3
    });
  });

  it("blocks bookmark reordering across folders and no-op adjacent positions", () => {
    const source = createDraggedBookmarkSnapshot(findNodeById(mockBookmarkTree, "100")!);
    const nextSibling = findNodeById(mockBookmarkTree, "101")!;
    const otherFolderBookmark = findNodeById(mockBookmarkTree, "110")!;

    expect(
      canReorderBookmarkOnIntent(source, { targetBookmark: otherFolderBookmark, position: "before" })
    ).toBe(false);
    expect(
      canReorderBookmarkOnIntent(source, { targetBookmark: nextSibling, position: "before" })
    ).toBe(false);
  });

  it("uses the nearest card edge to decide bookmark drop position", () => {
    const wideCard = { top: 100, right: 480, bottom: 278, left: 100 };

    expect(getBookmarkCardDropPosition({ x: 300, y: 108 }, wideCard)).toBe("before");
    expect(getBookmarkCardDropPosition({ x: 140, y: 270 }, wideCard)).toBe("after");
    expect(getBookmarkCardDropPosition({ x: 108, y: 190 }, wideCard)).toBe("before");
    expect(getBookmarkCardDropPosition({ x: 472, y: 190 }, wideCard)).toBe("after");
  });

  it("allows moving the second bookmark before the first when hovering near the first card top edge", () => {
    const source = createDraggedBookmarkSnapshot(findNodeById(mockBookmarkTree, "101")!);
    const target = findNodeById(mockBookmarkTree, "100")!;
    const position = getBookmarkCardDropPosition(
      { x: 300, y: 108 },
      { top: 100, right: 480, bottom: 278, left: 100 }
    );

    expect(position).toBe("before");
    expect(canReorderBookmarkOnIntent(source, { targetBookmark: target, position })).toBe(true);
    expect(getBookmarkReorderDestination(source, { targetBookmark: target, position })).toEqual({
      parentId: "10",
      index: 0
    });
  });

  it("uses raw target indexes so moving the first bookmark after the last reaches the end", () => {
    const source = createDraggedBookmarkSnapshot(findNodeById(mockBookmarkTree, "100")!);
    const target = findNodeById(mockBookmarkTree, "109")!;

    expect(getBookmarkReorderDestination(source, { targetBookmark: target, position: "after" })).toEqual({
      parentId: "10",
      index: 10
    });
  });
});
