import { beforeEach, describe, expect, it } from "vitest";
import { findNodeById } from "../../features/bookmarks";
import { bookmarksAdapter } from "./bookmarksAdapter";
import { resetMockBookmarkTree } from "./mockBookmarks";

describe("bookmarksAdapter mock behavior", () => {
  beforeEach(() => {
    resetMockBookmarkTree();
  });

  it("moves a bookmark into a target folder", async () => {
    await bookmarksAdapter.move("100", { parentId: "11" });
    const tree = await bookmarksAdapter.getTree();
    const sourceFolder = findNodeById(tree, "10");
    const targetFolder = findNodeById(tree, "11");

    expect(sourceFolder?.children?.map((child) => child.id)).not.toContain("100");
    expect(sourceFolder?.children).toHaveLength(9);
    expect(targetFolder?.children?.map((child) => child.id)).toContain("100");
    expect(targetFolder?.children).toHaveLength(11);
  });

  it("updates a bookmark title", async () => {
    await bookmarksAdapter.update("100", { title: "Updated docs" });
    const tree = await bookmarksAdapter.getTree();

    expect(findNodeById(tree, "100")?.title).toBe("Updated docs");
  });

  it("creates and removes a bookmark in mock mode", async () => {
    const created = await bookmarksAdapter.create({
      parentId: "10",
      index: 1,
      title: "Temporary bookmark",
      url: "https://example.com/"
    });

    let tree = await bookmarksAdapter.getTree();
    let targetFolder = findNodeById(tree, "10");

    expect(created.parentId).toBe("10");
    expect(targetFolder?.children?.[1]?.id).toBe(created.id);
    expect(targetFolder?.children).toHaveLength(11);

    await bookmarksAdapter.remove(created.id);
    tree = await bookmarksAdapter.getTree();
    targetFolder = findNodeById(tree, "10");

    expect(findNodeById(tree, created.id)).toBeUndefined();
    expect(targetFolder?.children).toHaveLength(10);
  });

  it("creates a folder when url is omitted", async () => {
    const created = await bookmarksAdapter.create({
      parentId: "10",
      title: "Temporary folder"
    });

    const tree = await bookmarksAdapter.getTree();
    const targetFolder = findNodeById(tree, "10");

    expect(created.url).toBeUndefined();
    expect(created.children).toEqual([]);
    expect(targetFolder?.children?.at(-1)?.id).toBe(created.id);
  });

  it("moves a folder and reindexes source and target parents", async () => {
    await bookmarksAdapter.move("10", { parentId: "2", index: 1 });
    const tree = await bookmarksAdapter.getTree();
    const oldParent = findNodeById(tree, "1");
    const newParent = findNodeById(tree, "2");

    expect(oldParent?.children?.map((child) => child.id)).not.toContain("10");
    expect(oldParent?.children?.map((child) => child.index)).toEqual(
      oldParent?.children?.map((_, index) => index)
    );
    expect(newParent?.children?.[1]?.id).toBe("10");
    expect(newParent?.children?.map((child) => child.index)).toEqual(
      newParent?.children?.map((_, index) => index)
    );
  });
});
