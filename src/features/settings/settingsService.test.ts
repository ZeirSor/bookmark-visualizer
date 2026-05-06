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
      popupShowSuccessToast: true,
      popupRememberLastFolder: true,
      popupShowThumbnail: true,
      popupDefaultOpenTab: "save",
      popupThemeMode: "system",
      popupDefaultFolderId: undefined
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
      popupShowSuccessToast: false,
      popupRememberLastFolder: false,
      popupShowThumbnail: false,
      popupDefaultOpenTab: "settings",
      popupThemeMode: "dark",
      popupDefaultFolderId: "  10  "
    });

    await expect(loadSettings()).resolves.toEqual({
      showBookmarksInTree: true,
      theme: "dark",
      cardDensity: "comfortable",
      cardSize: "extra-large",
      sidebarWidth: 340,
      popupAutoCloseAfterSave: false,
      popupShowSuccessToast: false,
      popupRememberLastFolder: false,
      popupShowThumbnail: false,
      popupDefaultOpenTab: "settings",
      popupThemeMode: "dark",
      popupDefaultFolderId: "10"
    });
  });
});
