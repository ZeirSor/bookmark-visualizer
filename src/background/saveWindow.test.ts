import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultSettings } from "../features/settings";
import { storageAdapter } from "../lib/chrome";

describe("save window background entry", () => {
  beforeEach(() => {
    vi.resetModules();
    storageAdapter.clearMemory();
    vi.useRealTimers();
  });

  it("creates a centered independent save window for the source tab", async () => {
    const chromeMock = createChromeMock();
    vi.stubGlobal("chrome", chromeMock);
    const { openSaveWindowForTab } = await import("./saveWindow");

    await openSaveWindowForTab({
      id: 12,
      windowId: 3,
      url: "https://example.com/article",
      title: "Example article",
      favIconUrl: "https://example.com/favicon.ico"
    } as chrome.tabs.Tab);

    expect(chromeMock.windows.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "popup",
        width: 960,
        height: 680,
        left: 360,
        top: 210,
        focused: true,
        url: expect.stringContaining("chrome-extension://bookmark-visualizer/save.html?")
      })
    );
    const url = String(chromeMock.createCalls[0]?.url);
    expect(url).toContain("sourceTabId=12");
    expect(url).toContain("sourceWindowId=3");
    expect(url).toContain("sourceUrl=https%3A%2F%2Fexample.com%2Farticle");
    expect(url).toContain("sourceTitle=Example+article");
  });

  it("focuses and refreshes the tracked save window instead of creating another one", async () => {
    const chromeMock = createChromeMock();
    vi.stubGlobal("chrome", chromeMock);
    const { openSaveWindowForTab } = await import("./saveWindow");

    await openSaveWindowForTab({ id: 12, windowId: 3, url: "https://first.example/" } as chrome.tabs.Tab);
    await openSaveWindowForTab({ id: 13, windowId: 4, url: "https://second.example/" } as chrome.tabs.Tab);

    expect(chromeMock.windows.create).toHaveBeenCalledTimes(1);
    expect(chromeMock.windows.update).toHaveBeenCalledWith(20, { focused: true });
    expect(chromeMock.tabs.update).toHaveBeenCalledWith(
      30,
      expect.objectContaining({
        active: true,
        url: expect.stringContaining("sourceTabId=13")
      })
    );
  });

  it("recovers from a stale tracked tab by reusing a discovered save window tab", async () => {
    const chromeMock = createChromeMock();
    vi.stubGlobal("chrome", chromeMock);
    const { openSaveWindowForTab } = await import("./saveWindow");

    await openSaveWindowForTab({ id: 12, windowId: 3, url: "https://first.example/" } as chrome.tabs.Tab);
    chromeMock.tabs.get.mockRejectedValueOnce(new Error("No tab"));
    chromeMock.tabs.query.mockResolvedValueOnce([
      {
        id: 88,
        windowId: 77,
        url: "chrome-extension://bookmark-visualizer/save.html?sourceTabId=1"
      } as chrome.tabs.Tab
    ]);

    await openSaveWindowForTab({ id: 14, windowId: 4, url: "https://third.example/" } as chrome.tabs.Tab);

    expect(chromeMock.windows.create).toHaveBeenCalledTimes(1);
    expect(chromeMock.windows.update).toHaveBeenLastCalledWith(77, { focused: true });
    expect(chromeMock.tabs.update).toHaveBeenLastCalledWith(
      88,
      expect.objectContaining({
        active: true,
        url: expect.stringContaining("sourceTabId=14")
      })
    );
  });

  it("registers toolbar action and save-window cleanup listeners once", async () => {
    const chromeMock = createChromeMock();
    vi.stubGlobal("chrome", chromeMock);
    const { registerSaveWindowAction } = await import("./saveWindow");

    registerSaveWindowAction();
    registerSaveWindowAction();

    expect(chromeMock.action.onClicked.addListener).toHaveBeenCalledTimes(1);
    expect(chromeMock.windows.onRemoved.addListener).toHaveBeenCalledTimes(1);
    expect(chromeMock.windows.onFocusChanged.addListener).toHaveBeenCalledTimes(1);
  });

  it("cleans up the tracked save window after the window is removed", async () => {
    const chromeMock = createChromeMock();
    vi.stubGlobal("chrome", chromeMock);
    const { openSaveWindowForTab, registerSaveWindowAction } = await import("./saveWindow");

    registerSaveWindowAction();
    await openSaveWindowForTab({ id: 12, windowId: 3, url: "https://first.example/" } as chrome.tabs.Tab);
    chromeMock.windowRemovedListeners[0]?.(20);
    await openSaveWindowForTab({ id: 13, windowId: 4, url: "https://second.example/" } as chrome.tabs.Tab);

    expect(chromeMock.windows.create).toHaveBeenCalledTimes(2);
  });

  it("closes the save window on focus loss only when the setting is enabled", async () => {
    vi.useFakeTimers();
    const chromeMock = createChromeMock();
    vi.stubGlobal("chrome", chromeMock);
    const { saveSettings } = await import("../features/settings");
    const { openSaveWindowForTab, registerSaveWindowAction } = await import("./saveWindow");

    registerSaveWindowAction();
    await openSaveWindowForTab({ id: 12, windowId: 3, url: "https://first.example/" } as chrome.tabs.Tab);

    chromeMock.focusChangedListeners[0]?.(99);
    await vi.runOnlyPendingTimersAsync();
    expect(chromeMock.windows.remove).not.toHaveBeenCalled();

    await saveSettings({
      ...defaultSettings,
      autoCloseSaveWindowOnBlur: true
    });

    chromeMock.focusChangedListeners[0]?.(99);
    await vi.advanceTimersByTimeAsync(449);
    expect(chromeMock.windows.remove).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(chromeMock.windows.remove).toHaveBeenCalledWith(20);
  });
});

function createChromeMock() {
  const createCalls: chrome.windows.CreateData[] = [];
  const windowRemovedListeners: Array<(windowId: number) => void> = [];
  const focusChangedListeners: Array<(windowId: number) => void> = [];
  const saveWindowTab = {
    id: 30,
    windowId: 20,
    url: "chrome-extension://bookmark-visualizer/save.html?sourceTabId=12"
  } as chrome.tabs.Tab;

  return {
    createCalls,
    action: {
      onClicked: {
        addListener: vi.fn()
      }
    },
    runtime: {
      getURL: vi.fn((path: string) => `chrome-extension://bookmark-visualizer/${path}`)
    },
    tabs: {
      get: vi.fn(async (): Promise<chrome.tabs.Tab> => saveWindowTab),
      query: vi.fn(async (): Promise<chrome.tabs.Tab[]> => []),
      update: vi.fn(async (): Promise<chrome.tabs.Tab> => saveWindowTab)
    },
    windows: {
      create: vi.fn(async (data: chrome.windows.CreateData): Promise<chrome.windows.Window> => {
        createCalls.push(data);
        return {
          id: 20,
          focused: true,
          alwaysOnTop: false,
          incognito: false,
          tabs: [saveWindowTab]
        } as chrome.windows.Window;
      }),
      getLastFocused: vi.fn(async (): Promise<chrome.windows.Window> => ({
        id: 3,
        focused: true,
        alwaysOnTop: false,
        incognito: false,
        left: 120,
        top: 80,
        width: 1440,
        height: 940
      }) as chrome.windows.Window),
      remove: vi.fn(async () => undefined),
      update: vi.fn(async () => undefined),
      onRemoved: {
        addListener: vi.fn((listener) => windowRemovedListeners.push(listener))
      },
      onFocusChanged: {
        addListener: vi.fn((listener) => focusChangedListeners.push(listener))
      }
    },
    windowRemovedListeners,
    focusChangedListeners
  };
}
