import { beforeEach, describe, expect, it } from "vitest";
import { storageAdapter } from "../../lib/chrome";
import type { FolderOption } from "../bookmarks";
import {
  filterRecentFolderIds,
  loadRecentFolderState,
  normalizeRecentFolderIds,
  resolveRecentFolderOptions,
  saveRecentFolder
} from "./recentFolders";

describe("recent folders", () => {
  beforeEach(() => {
    storageAdapter.clearMemory();
  });

  it("loads default recent folder state", async () => {
    await expect(loadRecentFolderState()).resolves.toEqual({
      version: 1,
      folderIds: []
    });
  });

  it("dedupes, prioritizes, trims blanks, and caps recent folders", async () => {
    expect(normalizeRecentFolderIds([" 1 ", "", "2", "1", "3", "4", "5", "6", "7", "8", "9"])).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8"
    ]);
  });

  it("saves the latest folder first", async () => {
    await saveRecentFolder("1");
    await saveRecentFolder("2");
    await saveRecentFolder("3");
    await saveRecentFolder("4");
    await saveRecentFolder("5");
    await saveRecentFolder("6");
    await saveRecentFolder("7");
    await saveRecentFolder("8");
    const state = await saveRecentFolder("2");

    expect(state.folderIds).toEqual(["2", "8", "7", "6", "5", "4", "3", "1"]);
  });

  it("filters unavailable recent folders", () => {
    expect(filterRecentFolderIds(["1", "2", "3"], (folderId) => folderId !== "2")).toEqual([
      "1",
      "3"
    ]);
    expect(filterRecentFolderIds(["1", "2", "3", "4"], (folderId) => folderId !== "1", 2)).toEqual([
      "2",
      "3"
    ]);
  });

  it("resolves options in recent order", () => {
    const options = [
      { id: "1", title: "One", path: "Root / One", node: { id: "1", title: "One" } },
      { id: "2", title: "Two", path: "Root / Two", node: { id: "2", title: "Two" } },
      { id: "3", title: "Three", path: "Root / Three", node: { id: "3", title: "Three" } }
    ] as FolderOption[];

    expect(resolveRecentFolderOptions(options, ["3", "missing", "1"]).map((option) => option.id)).toEqual([
      "3",
      "1"
    ]);
    expect(resolveRecentFolderOptions(options, ["missing", "3", "2"], 2).map((option) => option.id)).toEqual([
      "3",
      "2"
    ]);
  });

  it("migrates from legacy quick-save recent folders", async () => {
    await storageAdapter.set({
      bookmarkVisualizerQuickSaveUiState: {
        uiStateVersion: 1,
        recentFolderIds: ["10", "20", "10"]
      }
    });

    await expect(loadRecentFolderState()).resolves.toEqual({
      version: 1,
      folderIds: ["10", "20"]
    });
  });
});
