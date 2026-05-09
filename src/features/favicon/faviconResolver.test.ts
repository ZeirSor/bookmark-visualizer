import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryFaviconCacheDriver,
  createSuccessFaviconRecord,
  getCachedFavicon,
  putCachedFavicon,
  setFaviconCacheDriverForTests
} from "./faviconCache";
import { buildChromeFaviconUrl, resolveFavicon } from "./faviconResolver";

describe("favicon resolver", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setFaviconCacheDriverForTests(createMemoryFaviconCacheDriver());
    vi.stubGlobal("chrome", {
      runtime: {
        getURL: (path: string) => `chrome-extension://extension-id${path}`
      }
    });
  });

  it("builds Chrome _favicon URLs with encoded page URL and size", () => {
    const url = buildChromeFaviconUrl("https://example.com/path?q=1#hash", 64);

    expect(url).toContain("chrome-extension://extension-id/_favicon/");
    expect(url).toContain("pageUrl=https%3A%2F%2Fexample.com%2Fpath%3Fq%3D1");
    expect(url).toContain("size=64");
  });

  it("returns fresh cache hits without fetching", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await putCachedFavicon(
      createSuccessFaviconRecord({
        cacheKey: "https://example.com|32",
        siteKey: "https://example.com",
        pageUrl: "https://example.com/",
        size: 32,
        dataUrl: "data:image/png;base64,aWNvbg==",
        now: 1000
      })
    );

    await expect(resolveFavicon("https://www.example.com/page", { now: 2000 })).resolves.toMatchObject({
      status: "hit",
      source: "cache",
      url: "data:image/png;base64,aWNvbg=="
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns stale cache immediately and schedules refresh", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(new Blob(["new-icon"], { type: "image/png" }), { status: 200 }))
    );
    await putCachedFavicon(
      createSuccessFaviconRecord({
        cacheKey: "https://example.com|32",
        siteKey: "https://example.com",
        pageUrl: "https://example.com/",
        size: 32,
        dataUrl: "data:image/png;base64,b2xk",
        now: 1000
      })
    );

    await expect(resolveFavicon("https://example.com/page", { now: 1000 + 8 * 24 * 60 * 60 * 1000 })).resolves.toMatchObject({
      status: "stale",
      source: "stale-cache",
      url: "data:image/png;base64,b2xk",
      shouldRefresh: true
    });
  });

  it("fetches, converts, and stores Chrome favicon misses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(new Blob(["icon"], { type: "image/png" }), { status: 200 }))
    );

    await expect(resolveFavicon("https://miss.example/page", { now: 1000 })).resolves.toMatchObject({
      status: "miss",
      source: "chrome-favicon",
      url: "data:image/png;base64,aWNvbg=="
    });
    await expect(getCachedFavicon("https://miss.example|32", 2000)).resolves.toMatchObject({
      status: "success",
      dataUrl: "data:image/png;base64,aWNvbg=="
    });
  });

  it("records short-lived failures and falls back locally", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("network down");
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(resolveFavicon("https://example.com/page", { now: 1000 })).resolves.toMatchObject({
      status: "failed",
      source: "letter-fallback"
    });
    await expect(resolveFavicon("https://example.com/page", { now: 2000 })).resolves.toMatchObject({
      status: "failed",
      source: "letter-fallback"
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
