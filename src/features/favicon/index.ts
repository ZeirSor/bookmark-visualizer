export {
  clearFaviconCache,
  createFailedFaviconRecord,
  createMemoryFaviconCacheDriver,
  createSuccessFaviconRecord,
  getCachedFavicon,
  invalidateFavicon,
  pruneFaviconCache,
  putCachedFavicon,
  setFaviconCacheDriverForTests
} from "./faviconCache";
export { buildChromeFaviconUrl, prefetchFavicon, resolveFavicon } from "./faviconResolver";
export type {
  CachedFaviconRecord,
  FaviconResolveOptions,
  FaviconResolveResult,
  FaviconResolveStatus,
  FaviconSize,
  FaviconSource
} from "./types";
export { useSiteFavicon, type UseSiteFaviconOptions, type UseSiteFaviconResult } from "./useSiteFavicon";
export { getFaviconCacheKey, getFaviconSiteKey, normalizeFaviconPageUrl } from "./url";
