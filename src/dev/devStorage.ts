// localStorage-backed storage adapter for Vite dev HTTP pages.
// Each key is namespaced so it doesn't collide with other localStorage entries.

const PREFIX = "bv-dev-ext:";

function prefixed(key: string): string {
  return PREFIX + key;
}

function parse(raw: string | null): unknown {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

type StorageItems = Record<string, unknown>;

export const devLocalStorage = {
  get<T extends StorageItems>(keys?: string | string[] | StorageItems): T {
    if (!keys) {
      const result: StorageItems = {};
      for (let i = 0; i < localStorage.length; i++) {
        const full = localStorage.key(i);
        if (full?.startsWith(PREFIX)) {
          const key = full.slice(PREFIX.length);
          result[key] = parse(localStorage.getItem(full));
        }
      }
      return result as T;
    }

    if (typeof keys === "object" && !Array.isArray(keys)) {
      const result: StorageItems = {};
      for (const [key, defaultValue] of Object.entries(keys)) {
        const raw = localStorage.getItem(prefixed(key));
        result[key] = raw !== null ? parse(raw) : defaultValue;
      }
      return result as T;
    }

    const keyList = Array.isArray(keys) ? keys : [keys];
    const result: StorageItems = {};
    for (const key of keyList) {
      result[key] = parse(localStorage.getItem(prefixed(key)));
    }
    return result as T;
  },

  set(items: StorageItems): void {
    for (const [key, value] of Object.entries(items)) {
      localStorage.setItem(prefixed(key), JSON.stringify(value));
    }
  },

  remove(keys: string | string[]): void {
    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const key of keyList) {
      localStorage.removeItem(prefixed(key));
    }
  },

  clear(): void {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const full = localStorage.key(i);
      if (full?.startsWith(PREFIX)) toRemove.push(full);
    }
    toRemove.forEach((key) => localStorage.removeItem(key));
  }
};
