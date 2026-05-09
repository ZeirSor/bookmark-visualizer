import { describe, expect, it } from "vitest";
import { getFaviconCacheKey, getFaviconSiteKey, normalizeFaviconPageUrl } from "./url";

describe("favicon url helpers", () => {
  it("normalizes http and https page URLs without fragments", () => {
    expect(normalizeFaviconPageUrl("https://example.com/path#section")).toBe("https://example.com/path");
    expect(normalizeFaviconPageUrl("http://example.com/path")).toBe("http://example.com/path");
  });

  it("rejects unsupported and invalid URLs", () => {
    expect(normalizeFaviconPageUrl("chrome://extensions")).toBeUndefined();
    expect(normalizeFaviconPageUrl("not a url")).toBeUndefined();
    expect(getFaviconCacheKey("file:///tmp/bookmarks.html")).toBeUndefined();
  });

  it("groups www and non-www URLs by site key", () => {
    expect(getFaviconSiteKey("https://www.github.com/a")).toBe("https://github.com");
    expect(getFaviconSiteKey("https://github.com/b")).toBe("https://github.com");
  });

  it("includes favicon size in the cache key", () => {
    expect(getFaviconCacheKey("https://www.github.com/a", 32)).toBe("https://github.com|32");
    expect(getFaviconCacheKey("https://www.github.com/a", 64)).toBe("https://github.com|64");
  });
});
