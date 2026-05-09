import {
  createFailedFaviconRecord,
  createSuccessFaviconRecord,
  getCachedFavicon,
  putCachedFavicon
} from "./faviconCache";
import type { FaviconResolveOptions, FaviconResolveResult, FaviconSize } from "./types";
import { getFaviconCacheKey, getFaviconSiteKey, normalizeFaviconPageUrl } from "./url";

const inflightResolves = new Map<string, Promise<FaviconResolveResult>>();

export async function resolveFavicon(
  pageUrl: string,
  options: FaviconResolveOptions = {}
): Promise<FaviconResolveResult> {
  const size = options.size ?? 32;
  const now = options.now ?? Date.now();
  const normalizedPageUrl = normalizeFaviconPageUrl(pageUrl);
  const siteKey = getFaviconSiteKey(pageUrl);
  const cacheKey = getFaviconCacheKey(pageUrl, size);

  if (!normalizedPageUrl || !siteKey || !cacheKey) {
    return { status: "failed", source: "letter-fallback" };
  }

  if (!options.forceRefresh) {
    const cached = await getCachedFavicon(cacheKey, now).catch(() => undefined);

    if (cached?.status === "success" && cached.dataUrl) {
      if (cached.expiresAt > now) {
        return {
          status: "hit",
          source: "cache",
          url: cached.dataUrl,
          cacheKey,
          siteKey
        };
      }

      void refreshFavicon(normalizedPageUrl, siteKey, cacheKey, size, now).catch(() => undefined);
      return {
        status: "stale",
        source: "stale-cache",
        url: cached.dataUrl,
        shouldRefresh: true,
        cacheKey,
        siteKey
      };
    }

    if (cached?.status === "failed" && cached.expiresAt > now) {
      return {
        status: "failed",
        source: "letter-fallback",
        cacheKey,
        siteKey
      };
    }
  }

  return refreshFavicon(normalizedPageUrl, siteKey, cacheKey, size, now);
}

export async function prefetchFavicon(pageUrl: string, options: FaviconResolveOptions = {}): Promise<void> {
  await resolveFavicon(pageUrl, options);
}

export function buildChromeFaviconUrl(pageUrl: string, size: FaviconSize = 32): string | undefined {
  const normalizedPageUrl = normalizeFaviconPageUrl(pageUrl);
  const runtime = typeof chrome === "undefined" ? undefined : chrome.runtime;

  if (!normalizedPageUrl || !runtime?.getURL) {
    return undefined;
  }

  const url = new URL(runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", normalizedPageUrl);
  url.searchParams.set("size", String(size));

  return url.href;
}

async function refreshFavicon(
  pageUrl: string,
  siteKey: string,
  cacheKey: string,
  size: FaviconSize,
  now: number
): Promise<FaviconResolveResult> {
  const existing = inflightResolves.get(cacheKey);

  if (existing) {
    return existing;
  }

  const resolvePromise = fetchAndCacheFavicon(pageUrl, siteKey, cacheKey, size, now).finally(() => {
    inflightResolves.delete(cacheKey);
  });

  inflightResolves.set(cacheKey, resolvePromise);
  return resolvePromise;
}

async function fetchAndCacheFavicon(
  pageUrl: string,
  siteKey: string,
  cacheKey: string,
  size: FaviconSize,
  now: number
): Promise<FaviconResolveResult> {
  const chromeFaviconUrl = buildChromeFaviconUrl(pageUrl, size);

  if (!chromeFaviconUrl) {
    await putCachedFavicon(createFailedFaviconRecord({ cacheKey, siteKey, pageUrl, size, now })).catch(
      () => undefined
    );
    return { status: "failed", source: "letter-fallback", cacheKey, siteKey };
  }

  try {
    const response = await fetch(chromeFaviconUrl);

    if (!response.ok) {
      throw new Error(`Favicon request failed with ${response.status}`);
    }

    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);
    const record = createSuccessFaviconRecord({
      cacheKey,
      siteKey,
      pageUrl,
      size,
      dataUrl,
      mimeType: blob.type || undefined,
      now
    });

    await putCachedFavicon(record).catch(() => undefined);

    return {
      status: "miss",
      source: "chrome-favicon",
      url: dataUrl,
      cacheKey,
      siteKey
    };
  } catch {
    const previous = await getCachedFavicon(cacheKey, now).catch(() => undefined);

    if (previous?.status === "success" && previous.dataUrl) {
      return {
        status: "stale",
        source: "stale-cache",
        url: previous.dataUrl,
        cacheKey,
        siteKey
      };
    }

    await putCachedFavicon(
      createFailedFaviconRecord({
        cacheKey,
        siteKey,
        pageUrl,
        size,
        previousFailureCount: previous?.failureCount,
        now
      })
    ).catch(() => undefined);

    return { status: "failed", source: "letter-fallback", cacheKey, siteKey };
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const mimeType = blob.type || "image/png";
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return `data:${mimeType};base64,${btoa(binary)}`;
}
