import { beforeEach, describe, expect, it } from "vitest";
import { storageAdapter } from "../../lib/chrome";
import {
  filterRecentFolderIds,
  loadQuickSaveUiState,
  saveQuickSaveRecentFolder
} from "./uiState";

describe("quick-save UI state", () => {
  beforeEach(() => {
    storageAdapter.clearMemory();
  });

  it("loads default recent folder state", async () => {
    await expect(loadQuickSaveUiState()).resolves.toEqual({
      uiStateVersion: 1,
      recentFolderIds: []
    });
  });

  it("dedupes, prioritizes, and caps recent folders", async () => {
    await saveQuickSaveRecentFolder("1");
    await saveQuickSaveRecentFolder("2");
    await saveQuickSaveRecentFolder("3");
    await saveQuickSaveRecentFolder("4");
    await saveQuickSaveRecentFolder("5");
    await saveQuickSaveRecentFolder("6");
    await saveQuickSaveRecentFolder("7");
    await saveQuickSaveRecentFolder("8");
    const state = await saveQuickSaveRecentFolder("2");

    expect(state.recentFolderIds).toEqual(["2", "8", "7", "6", "5", "4", "3", "1"]);
  });

  it("filters unavailable recent folders", () => {
    expect(filterRecentFolderIds(["1", "2", "3"], (folderId) => folderId !== "2")).toEqual([
      "1",
      "3"
    ]);
  });
});
