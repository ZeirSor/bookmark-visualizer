import { describe, expect, it } from "vitest";
import { mockBookmarkTree } from "../../lib/chrome/mockBookmarks";
import { normalizeBookmarkTree, toBrowserRecordId } from "./normalize";
import { bookmarkRecordsToTableRows } from "./tableRow";

describe("normalizeBookmarkTree", () => {
  it("normalizes nested Chrome bookmarks into stable records with folder paths", () => {
    const normalized = normalizeBookmarkTree(mockBookmarkTree, {
      now: "2026-05-06T00:00:00.000Z"
    });

    const chromeDocs = normalized.bookmarks.find(
      (bookmark) => bookmark.browserBookmarkId === "100"
    );
    const productFolder = normalized.folders.find((folder) => folder.browserBookmarkId === "10");

    expect(chromeDocs).toMatchObject({
      id: "browser:100",
      type: "bookmark",
      title: "Chrome Extensions Docs",
      url: "https://developer.chrome.com/docs/extensions",
      folderId: "browser:10",
      folderPath: "Root / Bookmarks Bar / Product Research",
      source: "browser",
      syncStatus: "local-only"
    });
    expect(chromeDocs?.dateAdded).toBe(new Date(1760000100000).toISOString());
    expect(productFolder).toMatchObject({
      id: "browser:10",
      parentId: "browser:1",
      path: "Root / Bookmarks Bar / Product Research"
    });
    expect(normalized.folderPathByBrowserId.get("10")).toBe(
      "Root / Bookmarks Bar / Product Research"
    );
  });

  it("merges metadata while preserving empty note clears and preview URLs", () => {
    const normalized = normalizeBookmarkTree(mockBookmarkTree, {
      metadataByBrowserId: {
        "100": {
          note: "",
          previewImageUrl: "https://example.com/cover.png",
          summary: "Official Chrome extension documentation.",
          updatedAt: 1760000999000
        }
      },
      now: "2026-05-06T00:00:00.000Z"
    });

    const chromeDocs = normalized.bookmarks.find(
      (bookmark) => bookmark.browserBookmarkId === "100"
    );

    expect(chromeDocs?.note).toBe("");
    expect(chromeDocs?.previewImageUrl).toBe("https://example.com/cover.png");
    expect(chromeDocs?.description).toBe("Official Chrome extension documentation.");
    expect(chromeDocs?.updatedAt).toBe(new Date(1760000999000).toISOString());
  });

  it("keeps duplicate URLs as distinct browser records", () => {
    const normalized = normalizeBookmarkTree(mockBookmarkTree);
    const viteRecords = normalized.bookmarks.filter((bookmark) => bookmark.url === "https://vite.dev/guide/");

    expect(viteRecords).toHaveLength(2);
    expect(new Set(viteRecords.map((bookmark) => bookmark.id)).size).toBe(2);
  });

  it("derives bookmark table rows from records and tag names", () => {
    const row = bookmarkRecordsToTableRows(
      [
        {
          id: toBrowserRecordId("100"),
          browserBookmarkId: "100",
          type: "bookmark",
          title: "Chrome Extensions Docs",
          url: "https://developer.chrome.com/docs/extensions",
          folderPath: "Root / Bookmarks Bar / Product Research",
          note: "Read later",
          previewImageUrl: "https://example.com/cover.png",
          tagIds: ["tag:docs", "tag:mv3"],
          createdAt: "2026-05-06T00:00:00.000Z",
          updatedAt: "2026-05-06T00:00:00.000Z",
          source: "browser"
        }
      ],
      {
        "tag:docs": {
          id: "tag:docs",
          name: "Docs",
          createdAt: "2026-05-06T00:00:00.000Z",
          updatedAt: "2026-05-06T00:00:00.000Z"
        }
      }
    )[0];

    expect(row).toEqual({
      id: "browser:100",
      title: "Chrome Extensions Docs",
      url: "https://developer.chrome.com/docs/extensions",
      folderPath: "Root / Bookmarks Bar / Product Research",
      note: "Read later",
      tags: ["Docs", "tag:mv3"],
      previewImageUrl: "https://example.com/cover.png",
      description: undefined,
      createdAt: "2026-05-06T00:00:00.000Z",
      updatedAt: "2026-05-06T00:00:00.000Z",
      lastOperatedAt: undefined
    });
  });
});
