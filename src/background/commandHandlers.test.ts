import { beforeEach, describe, expect, it, vi } from "vitest";

describe("command handlers", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("routes open-quick-save to the independent save window", async () => {
    const openSaveWindowForTab = vi.fn();
    const listeners: Array<(command: string, tab?: chrome.tabs.Tab) => void> = [];

    vi.doMock("./saveWindow", () => ({ openSaveWindowForTab }));
    vi.stubGlobal("chrome", {
      commands: {
        onCommand: {
          addListener: vi.fn((listener) => listeners.push(listener))
        }
      }
    });

    const { registerCommandHandlers } = await import("./commandHandlers");
    registerCommandHandlers();
    listeners[0]?.("open-quick-save", { id: 12, url: "https://example.com/" } as chrome.tabs.Tab);

    expect(openSaveWindowForTab).toHaveBeenCalledWith(
      expect.objectContaining({ id: 12, url: "https://example.com/" })
    );
  });
});
