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
});
