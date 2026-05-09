import { beforeEach, describe, expect, it } from "vitest";
import {
  createFailedFaviconRecord,
  createMemoryFaviconCacheDriver,
  createSuccessFaviconRecord,
  getCachedFavicon,
  pruneFaviconCache,
  putCachedFavicon,
  setFaviconCacheDriverForTests,
  FAVICON_FAILURE_TTL_MS,
  FAVICON_SUCCESS_TTL_MS
} from "./faviconCache";

describe("favicon cache", () => {
  beforeEach(() => {
    setFaviconCacheDriverForTests(createMemoryFaviconCacheDriver());
  });

  it("creates success records with a seven-day TTL", () => {
    const record = createSuccessFaviconRecord({
      cacheKey: "https://example.com|32",
      siteKey: "https://example.com",
      pageUrl: "https://example.com/",
      size: 32,
      dataUrl: "data:image/png;base64,aWNvbg==",
      now: 1000
    });

    expect(record.status).toBe("success");
    expect(record.expiresAt).toBe(1000 + FAVICON_SUCCESS_TTL_MS);
    expect(record.source).toBe("chrome-favicon");
  });

  it("creates failed records with a one-hour retry TTL", () => {
    const record = createFailedFaviconRecord({
      cacheKey: "https://example.com|32",
      siteKey: "https://example.com",
      pageUrl: "https://example.com/",
      size: 32,
      previousFailureCount: 2,
      now: 1000
    });

    expect(record.status).toBe("failed");
    expect(record.expiresAt).toBe(1000 + FAVICON_FAILURE_TTL_MS);
    expect(record.failureCount).toBe(3);
  });

  it("touches records when they are read", async () => {
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

    await expect(getCachedFavicon("https://example.com|32", 3000)).resolves.toMatchObject({
      lastAccessedAt: 3000
    });
  });

  it("prunes failed and least recently accessed records first", async () => {
    const driver = createMemoryFaviconCacheDriver([
      createSuccessFaviconRecord({
        cacheKey: "https://keep-new.example|32",
        siteKey: "https://keep-new.example",
        pageUrl: "https://keep-new.example/",
        size: 32,
        dataUrl: "data:image/png;base64,aQ==",
        now: 3000
      }),
      createSuccessFaviconRecord({
        cacheKey: "https://drop-old.example|32",
        siteKey: "https://drop-old.example",
        pageUrl: "https://drop-old.example/",
        size: 32,
        dataUrl: "data:image/png;base64,Yg==",
        now: 1000
      }),
      createFailedFaviconRecord({
        cacheKey: "https://drop-failed.example|32",
        siteKey: "https://drop-failed.example",
        pageUrl: "https://drop-failed.example/",
        size: 32,
        now: 2000
      })
    ]);
    setFaviconCacheDriverForTests(driver);

    await pruneFaviconCache(1);

    await expect(driver.getAll()).resolves.toEqual([
      expect.objectContaining({ cacheKey: "https://keep-new.example|32" })
    ]);
  });
});
