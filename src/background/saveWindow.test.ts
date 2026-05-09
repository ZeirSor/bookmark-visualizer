import { beforeEach, describe, expect, it, vi } from "vitest";

describe("save window background entry", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates an independent save window for the source tab", async () => {
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
  });
});

function createChromeMock() {
  const createCalls: chrome.windows.CreateData[] = [];
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
      update: vi.fn(async () => undefined),
      onRemoved: {
        addListener: vi.fn()
      }
    }
  };
}
