import { beforeEach, describe, expect, it } from "vitest";
import { storageAdapter } from "../../lib/chrome";
import { loadMetadataState, saveBookmarkNote } from "./metadataService";

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
});
