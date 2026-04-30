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
      sidebarWidth: 280
    });
  });

  it("persists theme, tree visibility, card size, and sidebar width", async () => {
    await saveSettings({
      showBookmarksInTree: true,
      theme: "dark",
      cardDensity: "comfortable",
      cardSize: "extra-large",
      sidebarWidth: 340
    });

    await expect(loadSettings()).resolves.toEqual({
      showBookmarksInTree: true,
      theme: "dark",
      cardDensity: "comfortable",
      cardSize: "extra-large",
      sidebarWidth: 340
    });
  });
});
