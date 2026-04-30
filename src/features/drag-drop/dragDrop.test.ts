import { describe, expect, it } from "vitest";
import { findNodeById } from "../bookmarks";
import { canDropBookmarkOnFolder, canMoveBookmarkToFolder, createDraggedBookmarkSnapshot } from "./index";
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
});
