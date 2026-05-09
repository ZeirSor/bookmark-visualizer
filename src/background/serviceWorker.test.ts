import { beforeEach, describe, expect, it, vi } from "vitest";

describe("service worker registration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("registers popup message routing and new tab redirect only", async () => {
    const registerMessageRouter = vi.fn();
    const registerPageShortcutHandlers = vi.fn();
    const registerNewTabRedirect = vi.fn();

    vi.doMock("./messageRouter", () => ({ registerMessageRouter }));
    vi.doMock("./pageShortcutHandlers", () => ({ registerPageShortcutHandlers }));
    vi.doMock("../features/newtab", () => ({ registerNewTabRedirect }));

    const { registerServiceWorker } = await import("./serviceWorker");
    registerServiceWorker();

    expect(registerMessageRouter).toHaveBeenCalledOnce();
    expect(registerPageShortcutHandlers).toHaveBeenCalledOnce();
    expect(registerNewTabRedirect).toHaveBeenCalledOnce();
  });
});
