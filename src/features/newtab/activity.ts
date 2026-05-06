import { storageAdapter } from "../../lib/chrome";
import type { NewTabActivityItem, NewTabActivityType, NewTabUsageItem } from "./types";

const NEW_TAB_ACTIVITY_KEY = "bookmarkVisualizerNewTabActivity";
const NEW_TAB_USAGE_KEY = "bookmarkVisualizerNewTabUsageStats";
const MAX_ACTIVITY_ITEMS = 100;
const MAX_USAGE_ITEMS = 300;
const DUPLICATE_ACTIVITY_WINDOW_MS = 30_000;

export async function loadRecentActivities(): Promise<NewTabActivityItem[]> {
  const result = await storageAdapter.get<{ [NEW_TAB_ACTIVITY_KEY]: NewTabActivityItem[] }>({
    [NEW_TAB_ACTIVITY_KEY]: []
  });

  return normalizeActivities(result[NEW_TAB_ACTIVITY_KEY]);
}

export async function loadUsageStats(): Promise<NewTabUsageItem[]> {
  const result = await storageAdapter.get<{ [NEW_TAB_USAGE_KEY]: NewTabUsageItem[] }>({
    [NEW_TAB_USAGE_KEY]: []
  });

  return normalizeUsageStats(result[NEW_TAB_USAGE_KEY]);
}

export async function recordNewTabActivity(input: {
  type: NewTabActivityType;
  title: string;
  url?: string;
  bookmarkId?: string;
  folderId?: string;
}): Promise<NewTabActivityItem[]> {
  const current = await loadRecentActivities();
  const now = Date.now();
  const nextItem: NewTabActivityItem = {
    id: `${input.type}:${input.bookmarkId ?? input.url ?? input.folderId ?? now}:${now}`,
    type: input.type,
    title: input.title.trim() || "未命名",
    url: input.url,
    bookmarkId: input.bookmarkId,
    folderId: input.folderId,
    createdAt: now
  };

  const filtered = current.filter(
    (item) =>
      !(
        item.type === nextItem.type &&
        item.url &&
        item.url === nextItem.url &&
        now - item.createdAt < DUPLICATE_ACTIVITY_WINDOW_MS
      )
  );
  const next = normalizeActivities([nextItem, ...filtered]);

  await storageAdapter.set({ [NEW_TAB_ACTIVITY_KEY]: next });

  if (input.url) {
    await recordUsage(input.url, input.title, input.bookmarkId);
  }

  return next;
}

export async function recordUsage(
  url: string,
  title: string,
  bookmarkId?: string
): Promise<NewTabUsageItem[]> {
  const current = await loadUsageStats();
  const now = Date.now();
  const existing = current.find((item) => item.url === url);
  const nextItem: NewTabUsageItem = {
    url,
    title: title.trim() || existing?.title || url,
    bookmarkId: bookmarkId ?? existing?.bookmarkId,
    openCount: (existing?.openCount ?? 0) + 1,
    lastOpenedAt: now
  };
  const next = normalizeUsageStats([nextItem, ...current.filter((item) => item.url !== url)]);

  await storageAdapter.set({ [NEW_TAB_USAGE_KEY]: next });
  return next;
}

function normalizeActivities(items: NewTabActivityItem[] | undefined): NewTabActivityItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && typeof item.title === "string" && typeof item.createdAt === "number")
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, MAX_ACTIVITY_ITEMS);
}

function normalizeUsageStats(items: NewTabUsageItem[] | undefined): NewTabUsageItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && typeof item.url === "string" && typeof item.openCount === "number")
    .sort((left, right) => right.lastOpenedAt - left.lastOpenedAt)
    .slice(0, MAX_USAGE_ITEMS);
}
