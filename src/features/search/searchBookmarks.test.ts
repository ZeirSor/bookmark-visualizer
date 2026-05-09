import { describe, expect, it } from "vitest";
import { mockBookmarkTree } from "../../lib/chrome/mockBookmarks";
import { searchBookmarks } from "./searchBookmarks";

describe("searchBookmarks", () => {
  it("finds bookmarks by title", () => {
    const results = searchBookmarks(mockBookmarkTree, "vite");

    expect(results.map((result) => result.bookmark.title)).toContain("Vite Guide");
  });

  it("finds bookmarks by URL", () => {
    const results = searchBookmarks(mockBookmarkTree, "microsoft.com");

    expect(results).toHaveLength(1);
    expect(results[0].bookmark.title).toBe("Microsoft Edge Extensions");
  });

  it("returns folder paths for search results", () => {
    const [result] = searchBookmarks(mockBookmarkTree, "material");

    expect(result.folderPath).toBe("Root / Bookmarks Bar / Design References");
  });

  it("finds bookmarks by metadata note when metadata is provided", () => {
    const results = searchBookmarks(mockBookmarkTree, "release checklist", {
      metadata: {
        bookmarkMetadata: {
          "121": {
            note: "release checklist for saved assistant sessions"
          }
        }
      }
    });

    expect(results).toHaveLength(1);
    expect(results[0].bookmark.title).toBe("ChatGPT");
  });

  it("limits results to the scoped folder subtree", () => {
    const results = searchBookmarks(mockBookmarkTree, "vite", { scopeRootId: "10" });

    expect(results.map((result) => result.bookmark.id)).toEqual(["106"]);
  });

  it("returns no results for empty queries", () => {
    expect(searchBookmarks(mockBookmarkTree, " ")).toEqual([]);
  });
});
