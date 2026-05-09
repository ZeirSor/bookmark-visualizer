export type FaviconSize = 16 | 32 | 64;

export type StoredFaviconSource = "chrome-favicon" | "tab-fav-icon";

export type FaviconSource =
  | "cache"
  | "stale-cache"
  | StoredFaviconSource
  | "letter-fallback";

export type FaviconResolveStatus = "hit" | "stale" | "miss" | "failed";

export interface CachedFaviconRecord {
  cacheVersion: 1;
  cacheKey: string;
  siteKey: string;
  pageUrl: string;
  size: FaviconSize;
  status: "success" | "failed";
  dataUrl?: string;
  mimeType?: string;
  source?: StoredFaviconSource;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  lastAccessedAt: number;
  failureCount?: number;
  failedAt?: number;
}

export interface FaviconResolveOptions {
  size?: FaviconSize;
  now?: number;
  forceRefresh?: boolean;
}

export interface FaviconResolveResult {
  status: FaviconResolveStatus;
  source: FaviconSource;
  url?: string;
  shouldRefresh?: boolean;
  cacheKey?: string;
  siteKey?: string;
}
