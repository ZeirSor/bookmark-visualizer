import { beforeEach, describe, expect, it, vi } from "vitest";

describe("service worker registration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("registers save window action, commands, message router, and new tab redirect", async () => {
    const registerSaveWindowAction = vi.fn();
    const registerCommandHandlers = vi.fn();
    const registerMessageRouter = vi.fn();
    const registerNewTabRedirect = vi.fn();

    vi.doMock("./saveWindow", () => ({ registerSaveWindowAction }));
    vi.doMock("./commandHandlers", () => ({ registerCommandHandlers }));
    vi.doMock("./messageRouter", () => ({ registerMessageRouter }));
    vi.doMock("../features/newtab", () => ({ registerNewTabRedirect }));

    const { registerServiceWorker } = await import("./serviceWorker");
    registerServiceWorker();

    expect(registerSaveWindowAction).toHaveBeenCalledOnce();
    expect(registerCommandHandlers).toHaveBeenCalledOnce();
    expect(registerMessageRouter).toHaveBeenCalledOnce();
    expect(registerNewTabRedirect).toHaveBeenCalledOnce();
  });
});
