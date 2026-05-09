import { beforeEach, describe, expect, it } from "vitest";
import { storageAdapter } from "../../lib/chrome";
import { loadMetadataState, saveBookmarkMetadata, saveBookmarkNote } from "./metadataService";

describe("metadataService", () => {
  beforeEach(() => {
    storageAdapter.clearMemory();
  });

  it("loads default metadata", async () => {
    await expect(loadMetadataState()).resolves.toEqual({
      metadataVersion: 1,
      bookmarkMetadata: {}
    });
  });

  it("saves bookmark notes by bookmark id", async () => {
    const state = await saveBookmarkNote("100", "Useful docs");

    expect(state.bookmarkMetadata["100"]?.note).toBe("Useful docs");
    await expect(loadMetadataState()).resolves.toMatchObject({
      bookmarkMetadata: {
        "100": {
          note: "Useful docs"
        }
      }
    });
  });

  it("saves quick-save metadata without losing notes", async () => {
    await saveBookmarkNote("100", "Useful docs");
    const state = await saveBookmarkMetadata("100", {
      previewImageUrl: "https://example.com/cover.png"
    });

    expect(state.bookmarkMetadata["100"]).toMatchObject({
      note: "Useful docs",
      previewImageUrl: "https://example.com/cover.png"
    });
  });

  it("stores page kind and source URL", async () => {
    const state = await saveBookmarkMetadata("100", {
      pageKind: "browser-internal",
      sourceUrl: "chrome://extensions/"
    });

    expect(state.bookmarkMetadata["100"]).toMatchObject({
      pageKind: "browser-internal",
      sourceUrl: "chrome://extensions/"
    });
  });

  it("updates notes when a note field is provided", async () => {
    await saveBookmarkNote("100", "Useful docs");
    const state = await saveBookmarkMetadata("100", {
      note: "  Updated note  "
    });

    expect(state.bookmarkMetadata["100"]?.note).toBe("Updated note");
  });

  it("clears notes when an empty note is provided", async () => {
    await saveBookmarkNote("100", "Useful docs");
    const state = await saveBookmarkMetadata("100", {
      note: ""
    });

    expect(state.bookmarkMetadata["100"]?.note).toBe("");
  });

  it("clears notes when a whitespace note is provided", async () => {
    await saveBookmarkNote("100", "Useful docs");
    const state = await saveBookmarkMetadata("100", {
      note: "   "
    });

    expect(state.bookmarkMetadata["100"]?.note).toBe("");
  });
});
