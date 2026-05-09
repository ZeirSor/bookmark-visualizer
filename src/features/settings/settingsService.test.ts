import { beforeEach, describe, expect, it } from "vitest";
import { storageAdapter } from "../../lib/chrome";
import { loadSettings, saveSettings } from "./settingsService";

describe("settingsService", () => {
  beforeEach(() => {
    storageAdapter.clearMemory();
  });

  it("loads default settings", async () => {
    await expect(loadSettings()).resolves.toEqual({
      showBookmarksInTree: false,
      theme: "light",
      cardDensity: "comfortable",
      cardSize: "medium",
      sidebarWidth: 280,
      popupAutoCloseAfterSave: true,
      autoCloseSaveWindowOnBlur: false,
      popupShowSuccessToast: true,
      popupRememberLastFolder: true,
      popupShowThumbnail: true,
      popupDefaultOpenTab: "save",
      popupThemeMode: "system",
      popupDefaultFolderId: undefined,
      newTabOverrideEnabled: false,
      newTabDefaultSearchEngineId: "google",
      newTabDefaultSearchCategory: "web",
      newTabLayoutMode: "standard",
      newTabShowRecentActivity: true,
      newTabShowStorageUsage: true,
      newTabShortcutsPerRow: 8
    });
  });

  it("persists workspace and popup settings", async () => {
    await saveSettings({
      showBookmarksInTree: true,
      theme: "dark",
      cardDensity: "comfortable",
      cardSize: "extra-large",
      sidebarWidth: 340,
      popupAutoCloseAfterSave: false,
      autoCloseSaveWindowOnBlur: true,
      popupShowSuccessToast: false,
      popupRememberLastFolder: false,
      popupShowThumbnail: false,
      popupDefaultOpenTab: "settings",
      popupThemeMode: "dark",
      popupDefaultFolderId: "  10  ",
      newTabOverrideEnabled: true,
      newTabDefaultSearchEngineId: "bing",
      newTabDefaultSearchCategory: "image",
      newTabLayoutMode: "tabs",
      newTabShowRecentActivity: false,
      newTabShowStorageUsage: false,
      newTabShortcutsPerRow: 5
    });

    await expect(loadSettings()).resolves.toEqual({
      showBookmarksInTree: true,
      theme: "dark",
      cardDensity: "comfortable",
      cardSize: "extra-large",
      sidebarWidth: 340,
      popupAutoCloseAfterSave: false,
      autoCloseSaveWindowOnBlur: true,
      popupShowSuccessToast: false,
      popupRememberLastFolder: false,
      popupShowThumbnail: false,
      popupDefaultOpenTab: "settings",
      popupThemeMode: "dark",
      popupDefaultFolderId: "10",
      newTabOverrideEnabled: true,
      newTabDefaultSearchEngineId: "bing",
      newTabDefaultSearchCategory: "image",
      newTabLayoutMode: "tabs",
      newTabShowRecentActivity: false,
      newTabShowStorageUsage: false,
      newTabShortcutsPerRow: 5
    });
  });

  it("normalizes invalid new tab settings", async () => {
    await saveSettings({
      showBookmarksInTree: false,
      theme: "light",
      cardDensity: "comfortable",
      cardSize: "medium",
      sidebarWidth: 280,
      popupAutoCloseAfterSave: true,
      autoCloseSaveWindowOnBlur: false,
      popupShowSuccessToast: true,
      popupRememberLastFolder: true,
      popupShowThumbnail: true,
      popupDefaultOpenTab: "save",
      popupThemeMode: "system",
      popupDefaultFolderId: undefined,
      newTabOverrideEnabled: false,
      newTabDefaultSearchEngineId: "unknown",
      newTabDefaultSearchCategory: "books" as never,
      newTabLayoutMode: "grid" as never,
      newTabShowRecentActivity: true,
      newTabShowStorageUsage: true,
      newTabShortcutsPerRow: 99
    });

    await expect(loadSettings()).resolves.toMatchObject({
      autoCloseSaveWindowOnBlur: false,
      newTabOverrideEnabled: false,
      newTabDefaultSearchEngineId: "google",
      newTabDefaultSearchCategory: "web",
      newTabLayoutMode: "standard",
      newTabShortcutsPerRow: 10
    });
  });
});
