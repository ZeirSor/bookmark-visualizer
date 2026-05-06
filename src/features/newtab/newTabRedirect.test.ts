import { describe, expect, it, vi } from "vitest";
import { isBrowserNewTab, maybeRedirectNewTab, type NewTabRedirectDependencies } from "./newTabRedirect";

describe("newTabRedirect", () => {
  it("detects Chrome and Edge new tab URLs", () => {
    expect(isBrowserNewTab({ url: "chrome://newtab/" })).toBe(true);
    expect(isBrowserNewTab({ pendingUrl: "edge://newtab/" })).toBe(true);
    expect(isBrowserNewTab({ url: "https://example.com/" })).toBe(false);
  });

  it("does not redirect when the runtime setting is disabled", async () => {
    const updateTab = vi.fn();

    await expect(
      maybeRedirectNewTab({ id: 1, url: "chrome://newtab/" }, createDeps(false, updateTab))
    ).resolves.toBe(false);
    expect(updateTab).not.toHaveBeenCalled();
  });

  it("redirects browser new tab when enabled", async () => {
    const updateTab = vi.fn();

    await expect(
      maybeRedirectNewTab({ id: 2, url: "chrome://newtab/" }, createDeps(true, updateTab))
    ).resolves.toBe(true);
    expect(updateTab).toHaveBeenCalledWith(2, {
      url: "chrome-extension://id/newtab.html"
    });
  });

  it("does not redirect ordinary URLs or extension newtab", async () => {
    const updateTab = vi.fn();
    const deps = createDeps(true, updateTab);

    await expect(maybeRedirectNewTab({ id: 3, url: "https://example.com/" }, deps)).resolves.toBe(
      false
    );
    await expect(
      maybeRedirectNewTab({ id: 4, url: "chrome-extension://id/newtab.html" }, deps)
    ).resolves.toBe(false);
    expect(updateTab).not.toHaveBeenCalled();
  });
});

function createDeps(
  enabled: boolean,
  updateTab: NewTabRedirectDependencies["updateTab"]
): NewTabRedirectDependencies {
  return {
    loadSettings: async () => ({ newTabOverrideEnabled: enabled }),
    getExtensionUrl: (path) => `chrome-extension://id/${path}`,
    updateTab,
    releaseTabId: (_tabId, release) => release()
  };
}
