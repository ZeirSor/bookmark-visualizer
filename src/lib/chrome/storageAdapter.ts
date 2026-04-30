import { hasChromeApi } from "./runtime";

type StorageValue = unknown;
type StorageItems = Record<string, StorageValue>;

const memoryStorage = new Map<string, StorageValue>();

export const storageAdapter = {
  async get<T extends StorageItems>(keys?: string | string[] | StorageItems): Promise<T> {
    if (hasChromeApi("storage") && chrome.storage.local) {
      const result = await chrome.storage.local.get(
        keys as string | string[] | StorageItems | null | undefined
      );
      return result as T;
    }

    if (!keys) {
      return Object.fromEntries(memoryStorage.entries()) as T;
    }

    if (typeof keys === "object" && !Array.isArray(keys)) {
      const result = Object.fromEntries(
        Object.entries(keys).map(([key, defaultValue]) => [
          key,
          memoryStorage.has(key) ? memoryStorage.get(key) : defaultValue
        ])
      );

      return result as T;
    }

    const keyList = Array.isArray(keys) ? keys : [keys];
    const result = Object.fromEntries(keyList.map((key) => [key, memoryStorage.get(key)]));

    return result as T;
  },

  async set(items: StorageItems): Promise<void> {
    if (hasChromeApi("storage") && chrome.storage.local) {
      await chrome.storage.local.set(items);
      return;
    }

    Object.entries(items).forEach(([key, value]) => memoryStorage.set(key, value));
  },

  async remove(keys: string | string[]): Promise<void> {
    if (hasChromeApi("storage") && chrome.storage.local) {
      await chrome.storage.local.remove(keys);
      return;
    }

    const keyList = Array.isArray(keys) ? keys : [keys];
    keyList.forEach((key) => memoryStorage.delete(key));
  },

  clearMemory(): void {
    memoryStorage.clear();
  }
};
