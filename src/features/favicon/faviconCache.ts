import type { CachedFaviconRecord } from "./types";

export const FAVICON_CACHE_DB_NAME = "bookmarkVisualizerFaviconCache";
export const FAVICON_CACHE_STORE_NAME = "favicons";
export const FAVICON_CACHE_VERSION = 1;
export const FAVICON_SUCCESS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const FAVICON_FAILURE_TTL_MS = 60 * 60 * 1000;
export const FAVICON_MAX_RECORDS = 500;

export interface FaviconCacheDriver {
  get(cacheKey: string): Promise<CachedFaviconRecord | undefined>;
  put(record: CachedFaviconRecord): Promise<void>;
  delete(cacheKey: string): Promise<void>;
  clear(): Promise<void>;
  getAll(): Promise<CachedFaviconRecord[]>;
}

let defaultDriver: FaviconCacheDriver | undefined;

export async function getCachedFavicon(cacheKey: string, now = Date.now()): Promise<CachedFaviconRecord | undefined> {
  const record = await getDefaultDriver().get(cacheKey);

  if (!record) {
    return undefined;
  }

  const touched = { ...record, lastAccessedAt: now };
  await getDefaultDriver().put(touched);

  return touched;
}

export async function putCachedFavicon(record: CachedFaviconRecord): Promise<void> {
  await getDefaultDriver().put(record);
  await pruneFaviconCache();
}

export async function invalidateFavicon(cacheKey: string): Promise<void> {
  await getDefaultDriver().delete(cacheKey);
}

export async function clearFaviconCache(): Promise<void> {
  await getDefaultDriver().clear();
}

export async function pruneFaviconCache(maxRecords = FAVICON_MAX_RECORDS): Promise<void> {
  const records = await getDefaultDriver().getAll();

  if (records.length <= maxRecords) {
    return;
  }

  const deleteCount = records.length - maxRecords;
  const staleFirst = [...records].sort((left, right) => {
    if (left.status !== right.status) {
      return left.status === "failed" ? -1 : 1;
    }

    return left.lastAccessedAt - right.lastAccessedAt;
  });

  await Promise.all(staleFirst.slice(0, deleteCount).map((record) => getDefaultDriver().delete(record.cacheKey)));
}

export function createSuccessFaviconRecord(input: {
  cacheKey: string;
  siteKey: string;
  pageUrl: string;
  size: CachedFaviconRecord["size"];
  dataUrl: string;
  mimeType?: string;
  now?: number;
}): CachedFaviconRecord {
  const now = input.now ?? Date.now();

  return {
    cacheVersion: 1,
    cacheKey: input.cacheKey,
    siteKey: input.siteKey,
    pageUrl: input.pageUrl,
    size: input.size,
    status: "success",
    dataUrl: input.dataUrl,
    mimeType: input.mimeType,
    source: "chrome-favicon",
    createdAt: now,
    updatedAt: now,
    expiresAt: now + FAVICON_SUCCESS_TTL_MS,
    lastAccessedAt: now
  };
}

export function createFailedFaviconRecord(input: {
  cacheKey: string;
  siteKey: string;
  pageUrl: string;
  size: CachedFaviconRecord["size"];
  previousFailureCount?: number;
  now?: number;
}): CachedFaviconRecord {
  const now = input.now ?? Date.now();

  return {
    cacheVersion: 1,
    cacheKey: input.cacheKey,
    siteKey: input.siteKey,
    pageUrl: input.pageUrl,
    size: input.size,
    status: "failed",
    createdAt: now,
    updatedAt: now,
    expiresAt: now + FAVICON_FAILURE_TTL_MS,
    lastAccessedAt: now,
    failedAt: now,
    failureCount: (input.previousFailureCount ?? 0) + 1
  };
}

export function setFaviconCacheDriverForTests(driver: FaviconCacheDriver | undefined): void {
  defaultDriver = driver;
}

export function createMemoryFaviconCacheDriver(initialRecords: CachedFaviconRecord[] = []): FaviconCacheDriver {
  const records = new Map(initialRecords.map((record) => [record.cacheKey, record]));

  return {
    async get(cacheKey) {
      return records.get(cacheKey);
    },
    async put(record) {
      records.set(record.cacheKey, record);
    },
    async delete(cacheKey) {
      records.delete(cacheKey);
    },
    async clear() {
      records.clear();
    },
    async getAll() {
      return Array.from(records.values());
    }
  };
}

function getDefaultDriver(): FaviconCacheDriver {
  defaultDriver ??= new IndexedDbFaviconCacheDriver();
  return defaultDriver;
}

class IndexedDbFaviconCacheDriver implements FaviconCacheDriver {
  async get(cacheKey: string): Promise<CachedFaviconRecord | undefined> {
    const database = await openFaviconDatabase();
    return requestToPromise<CachedFaviconRecord | undefined>(
      database.transaction(FAVICON_CACHE_STORE_NAME, "readonly").objectStore(FAVICON_CACHE_STORE_NAME).get(cacheKey)
    );
  }

  async put(record: CachedFaviconRecord): Promise<void> {
    const database = await openFaviconDatabase();
    await requestToPromise(
      database.transaction(FAVICON_CACHE_STORE_NAME, "readwrite").objectStore(FAVICON_CACHE_STORE_NAME).put(record)
    );
  }

  async delete(cacheKey: string): Promise<void> {
    const database = await openFaviconDatabase();
    await requestToPromise(
      database.transaction(FAVICON_CACHE_STORE_NAME, "readwrite").objectStore(FAVICON_CACHE_STORE_NAME).delete(cacheKey)
    );
  }

  async clear(): Promise<void> {
    const database = await openFaviconDatabase();
    await requestToPromise(
      database.transaction(FAVICON_CACHE_STORE_NAME, "readwrite").objectStore(FAVICON_CACHE_STORE_NAME).clear()
    );
  }

  async getAll(): Promise<CachedFaviconRecord[]> {
    const database = await openFaviconDatabase();
    return requestToPromise<CachedFaviconRecord[]>(
      database.transaction(FAVICON_CACHE_STORE_NAME, "readonly").objectStore(FAVICON_CACHE_STORE_NAME).getAll()
    );
  }
}

function openFaviconDatabase(): Promise<IDBDatabase> {
  if (!globalThis.indexedDB) {
    return Promise.reject(new Error("IndexedDB is not available for favicon cache"));
  }

  return new Promise((resolve, reject) => {
    const request = globalThis.indexedDB.open(FAVICON_CACHE_DB_NAME, FAVICON_CACHE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(FAVICON_CACHE_STORE_NAME)) {
        const store = database.createObjectStore(FAVICON_CACHE_STORE_NAME, { keyPath: "cacheKey" });
        store.createIndex("siteKey", "siteKey", { unique: false });
        store.createIndex("lastAccessedAt", "lastAccessedAt", { unique: false });
        store.createIndex("expiresAt", "expiresAt", { unique: false });
      }
    };
    request.onerror = () => reject(request.error ?? new Error("Unable to open favicon cache"));
    request.onsuccess = () => resolve(request.result);
  });
}

function requestToPromise<T = unknown>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error ?? new Error("IndexedDB favicon cache request failed"));
    request.onsuccess = () => resolve(request.result);
  });
}
