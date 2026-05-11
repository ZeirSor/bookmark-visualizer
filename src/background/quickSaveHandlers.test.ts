import { beforeEach, describe, expect, it } from "vitest";
import { loadMetadataState } from "../features/metadata";
import { QUICK_SAVE_CREATE_BOOKMARK } from "../features/quick-save";
import { storageAdapter } from "../lib/chrome";
import { bookmarksAdapter } from "../lib/chrome/bookmarksAdapter";
import { resetMockBookmarkTree } from "../lib/chrome/mockBookmarks";
import { handleQuickSaveMessage } from "./quickSaveHandlers";

describe("quick save handlers", () => {
  beforeEach(() => {
    storageAdapter.clearMemory();
    resetMockBookmarkTree();
  });

  it("saves chrome internal pages as bookmarks with non-injectable page metadata", async () => {
    const response = await handleQuickSaveMessage({
      type: QUICK_SAVE_CREATE_BOOKMARK,
      payload: {
        parentId: "1",
        title: "Extensions",
        url: "chrome://extensions/",
        note: "",
        pageKind: "browser-internal",
        sourceUrl: "chrome://extensions/"
      }
    });

    expect(response).toMatchObject({ ok: true });
    if (!response.ok || !("bookmarkId" in response)) {
      throw new Error("Expected bookmark creation to succeed.");
    }

    const tree = await bookmarksAdapter.getTree();
    const created = tree[0]?.children?.[0]?.children?.find((node) => node.id === response.bookmarkId);
    expect(created).toMatchObject({
      title: "Extensions",
      url: "chrome://extensions/"
    });

    await expect(loadMetadataState()).resolves.toMatchObject({
      bookmarkMetadata: {
        [response.bookmarkId]: {
          pageKind: "browser-internal",
          sourceUrl: "chrome://extensions/"
        }
      }
    });
  });
});
