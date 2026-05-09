import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SAVE_OVERLAY_OPEN_EXTENSION_PAGE,
  SAVE_OVERLAY_OPEN_SHORTCUT_SETTINGS
} from "../features/save-overlay";

describe("save experience handlers", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("injects the save overlay for web pages", async () => {
    const chromeMock = createChromeMock();
    vi.stubGlobal("chrome", chromeMock);
    const { openSaveExperience } = await import("./saveExperienceHandlers");

    await openSaveExperience({
      id: 12,
      windowId: 3,
      url: "https://example.com/article",
      title: "Example"
    } as chrome.tabs.Tab);

    expect(chromeMock.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 12 },
      files: ["save-overlay-content.js"]
    });
    expect(chromeMock.tabs.create).not.toHaveBeenCalled();
  });

  it.each([
    "chrome://extensions/",
    "edge://settings/",
    "chrome-extension://abc/options.html",
    "file:///C:/Users/example/page.html"
  ])("opens the fallback save page for restricted URL %s", async (sourceUrl) => {
    const chromeMock = createChromeMock();
    vi.stubGlobal("chrome", chromeMock);
    const { openSaveExperience } = await import("./saveExperienceHandlers");

    await openSaveExperience({
      id: 14,
      windowId: 4,
      url: sourceUrl,
      title: "Restricted"
    } as chrome.tabs.Tab);

    expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled();
    expect(chromeMock.tabs.create).toHaveBeenCalledWith(
      expect.objectContaining({
        active: true,
        url: expect.stringContaining("chrome-extension://bookmark-visualizer/save.html?")
      })
    );
    expect(String(chromeMock.tabs.create.mock.calls[0]?.[0]?.url)).toContain(
      encodeURIComponent(sourceUrl)
    );
  });

  it("opens the fallback save page when injection fails", async () => {
    const chromeMock = createChromeMock();
    chromeMock.scripting.executeScript.mockRejectedValueOnce(new Error("Cannot access tab"));
    vi.stubGlobal("chrome", chromeMock);
    const { openSaveExperience } = await import("./saveExperienceHandlers");

    await openSaveExperience({
      id: 12,
      windowId: 3,
      url: "https://example.com/article"
    } as chrome.tabs.Tab);

    expect(chromeMock.tabs.create).toHaveBeenCalledWith(
      expect.objectContaining({
        active: true,
        url: expect.stringContaining("sourceUrl=https%3A%2F%2Fexample.com%2Farticle")
      })
    );
  });

  it("registers toolbar action once", async () => {
    const chromeMock = createChromeMock();
    vi.stubGlobal("chrome", chromeMock);
    const { registerSaveExperienceHandlers } = await import("./saveExperienceHandlers");

    registerSaveExperienceHandlers();
    registerSaveExperienceHandlers();

    expect(chromeMock.action.onClicked.addListener).toHaveBeenCalledTimes(1);
  });

  it("opens extension pages requested by the overlay", async () => {
    const chromeMock = createChromeMock();
    vi.stubGlobal("chrome", chromeMock);
    const { handleSaveExperienceMessage } = await import("./saveExperienceHandlers");

    await expect(
      handleSaveExperienceMessage({
        type: SAVE_OVERLAY_OPEN_EXTENSION_PAGE,
        path: "index.html"
      })
    ).resolves.toEqual({ ok: true });
    await expect(
      handleSaveExperienceMessage({ type: SAVE_OVERLAY_OPEN_SHORTCUT_SETTINGS })
    ).resolves.toEqual({ ok: true });

    expect(chromeMock.tabs.create).toHaveBeenNthCalledWith(1, {
      active: true,
      url: "chrome-extension://bookmark-visualizer/index.html"
    });
    expect(chromeMock.tabs.create).toHaveBeenNthCalledWith(2, {
      active: true,
      url: "chrome://extensions/shortcuts"
    });
  });
});

function createChromeMock() {
  return {
    action: {
      onClicked: {
        addListener: vi.fn()
      }
    },
    runtime: {
      getURL: vi.fn((path: string) => `chrome-extension://bookmark-visualizer/${path}`)
    },
    scripting: {
      executeScript: vi.fn(async () => undefined)
    },
    tabs: {
      create: vi.fn(async (_data: chrome.tabs.CreateProperties): Promise<chrome.tabs.Tab> => ({} as chrome.tabs.Tab)),
      query: vi.fn(async (): Promise<chrome.tabs.Tab[]> => [
        {
          id: 99,
          windowId: 5,
          url: "https://active.example/"
        } as chrome.tabs.Tab
      ])
    }
  };
}
