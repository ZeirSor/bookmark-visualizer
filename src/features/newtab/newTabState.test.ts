import { beforeEach, describe, expect, it } from "vitest";
import { storageAdapter } from "../../lib/chrome";
import {
  addPinnedShortcut,
  defaultNewTabState,
  loadNewTabState,
  normalizeNewTabState,
  saveNewTabState
} from "./newTabState";

describe("newTabState", () => {
  beforeEach(() => {
    storageAdapter.clearMemory();
  });

  it("loads default state when storage is empty", async () => {
    await expect(loadNewTabState()).resolves.toEqual(defaultNewTabState);
  });

  it("normalizes version, arrays, and invalid shortcut URLs", () => {
    const state = normalizeNewTabState({
      version: 99 as never,
      pinnedShortcuts: [
        {
          id: "bad",
          title: "Bad",
          url: "not a url",
          source: "custom",
          createdAt: 1,
          updatedAt: 1
        },
        {
          id: "ok",
          title: "Example",
          url: "example.com",
          source: "custom",
          createdAt: 1,
          updatedAt: 1
        }
      ],
      selectedFolderIds: Array.from({ length: 30 }, (_, index) => String(index))
    });

    expect(state.version).toBe(1);
    expect(state.pinnedShortcuts).toHaveLength(1);
    expect(state.pinnedShortcuts[0].url).toBe("https://example.com/");
    expect(state.selectedFolderIds).toHaveLength(20);
  });

  it("saves normalized state", async () => {
    const state = addPinnedShortcut(defaultNewTabState, {
      title: "Example",
      url: "https://example.com",
      source: "custom"
    });

    await saveNewTabState(state);
    await expect(loadNewTabState()).resolves.toMatchObject({
      pinnedShortcuts: [
        expect.objectContaining({
          title: "Example",
          url: "https://example.com/"
        })
      ]
    });
  });
});
