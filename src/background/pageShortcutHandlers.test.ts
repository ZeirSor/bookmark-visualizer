import { describe, expect, it, vi } from "vitest";
import {
  PAGE_SHORTCUT_CONTENT_FILE,
  PAGE_SHORTCUT_CONTENT_SCRIPT_ID,
  PAGE_SHORTCUT_ORIGINS
} from "../features/page-shortcut";
import {
  handlePageShortcutMessage,
  syncPageShortcutContentScript,
  type PageShortcutRegistrationDependencies
} from "./pageShortcutHandlers";

function createDependencies({
  granted = true,
  registered = []
}: {
  granted?: boolean;
  registered?: chrome.scripting.RegisteredContentScript[];
} = {}): PageShortcutRegistrationDependencies {
  return {
    containsOrigins: vi.fn(async () => granted),
    getRegisteredContentScripts: vi.fn(async () => registered),
    registerContentScripts: vi.fn(async () => undefined),
    unregisterContentScripts: vi.fn(async () => undefined)
  };
}

describe("page shortcut content script registration", () => {
  it("registers the Ctrl+S bridge only after optional host access exists", async () => {
    const dependencies = createDependencies();

    await syncPageShortcutContentScript(true, dependencies);

    expect(dependencies.containsOrigins).toHaveBeenCalledWith(PAGE_SHORTCUT_ORIGINS);
    expect(dependencies.registerContentScripts).toHaveBeenCalledWith([
      {
        id: PAGE_SHORTCUT_CONTENT_SCRIPT_ID,
        matches: PAGE_SHORTCUT_ORIGINS,
        js: [PAGE_SHORTCUT_CONTENT_FILE],
        runAt: "document_start",
        allFrames: false
      }
    ]);
    expect(dependencies.unregisterContentScripts).not.toHaveBeenCalled();
  });

  it("does not register when optional host access is missing", async () => {
    const dependencies = createDependencies({ granted: false });

    await syncPageShortcutContentScript(true, dependencies);

    expect(dependencies.registerContentScripts).not.toHaveBeenCalled();
    expect(dependencies.unregisterContentScripts).not.toHaveBeenCalled();
  });

  it("unregisters an existing bridge when disabled", async () => {
    const dependencies = createDependencies({
      registered: [{ id: PAGE_SHORTCUT_CONTENT_SCRIPT_ID }]
    });

    await syncPageShortcutContentScript(false, dependencies);

    expect(dependencies.unregisterContentScripts).toHaveBeenCalledWith({
      ids: [PAGE_SHORTCUT_CONTENT_SCRIPT_ID]
    });
  });
});

describe("page shortcut message handling", () => {
  it("opens the action popup for the sender window", async () => {
    const openPopup = vi.fn(async () => undefined);
    vi.stubGlobal("chrome", {
      action: { openPopup }
    });

    await expect(
      handlePageShortcutMessage(
        { type: "bookmark-visualizer.openPopupFromPageShortcut" },
        { tab: { windowId: 7 } } as chrome.runtime.MessageSender
      )
    ).resolves.toEqual({ ok: true });

    expect(openPopup).toHaveBeenCalledWith({ windowId: 7 });
    vi.unstubAllGlobals();
  });
});
