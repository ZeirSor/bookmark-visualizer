import { storageAdapter } from "../../lib/chrome";
import { isProbablyUrl, normalizeInputUrl } from "./searchEngines";
import type { NewTabShortcut, NewTabState } from "./types";

const NEW_TAB_STATE_KEY = "bookmarkVisualizerNewTabState";
const MAX_PINNED_SHORTCUTS = 48;
const MAX_HIDDEN_URLS = 300;
const MAX_SELECTED_FOLDERS = 20;
const MAX_FEATURED_BOOKMARKS = 50;
const MAX_COLLAPSED_SECTIONS = 20;

export const defaultNewTabState: NewTabState = {
  version: 1,
  pinnedShortcuts: [],
  hiddenShortcutUrls: [],
  selectedFolderIds: [],
  featuredBookmarkIds: [],
  collapsedSections: []
};

export async function loadNewTabState(): Promise<NewTabState> {
  const result = await storageAdapter.get<{ [NEW_TAB_STATE_KEY]: Partial<NewTabState> }>({
    [NEW_TAB_STATE_KEY]: defaultNewTabState
  });

  return normalizeNewTabState(result[NEW_TAB_STATE_KEY]);
}

export async function saveNewTabState(state: NewTabState): Promise<NewTabState> {
  const normalized = normalizeNewTabState(state);
  await storageAdapter.set({ [NEW_TAB_STATE_KEY]: normalized });
  return normalized;
}

export function normalizeNewTabState(input?: Partial<NewTabState>): NewTabState {
  return {
    version: 1,
    pinnedShortcuts: normalizePinnedShortcuts(input?.pinnedShortcuts),
    hiddenShortcutUrls: normalizeStringList(input?.hiddenShortcutUrls, MAX_HIDDEN_URLS),
    selectedFolderIds: normalizeStringList(input?.selectedFolderIds, MAX_SELECTED_FOLDERS),
    featuredBookmarkIds: normalizeStringList(input?.featuredBookmarkIds, MAX_FEATURED_BOOKMARKS),
    collapsedSections: normalizeStringList(input?.collapsedSections, MAX_COLLAPSED_SECTIONS)
  };
}

export function addPinnedShortcut(
  state: NewTabState,
  shortcut: Omit<NewTabShortcut, "id" | "createdAt" | "updatedAt">
): NewTabState {
  const now = Date.now();
  const normalizedUrl = normalizeShortcutUrl(shortcut.url);

  if (!normalizedUrl) {
    return state;
  }

  const nextShortcut: NewTabShortcut = {
    ...shortcut,
    id: shortcut.bookmarkId ? `bookmark:${shortcut.bookmarkId}` : `custom:${normalizedUrl}`,
    title: shortcut.title.trim() || getHostnameLabel(normalizedUrl),
    url: normalizedUrl,
    createdAt: now,
    updatedAt: now
  };

  const pinnedShortcuts = [
    nextShortcut,
    ...state.pinnedShortcuts.filter((item) => item.url !== normalizedUrl)
  ].slice(0, MAX_PINNED_SHORTCUTS);

  return normalizeNewTabState({
    ...state,
    pinnedShortcuts,
    hiddenShortcutUrls: state.hiddenShortcutUrls.filter((url) => url !== normalizedUrl)
  });
}

export function removePinnedShortcut(state: NewTabState, shortcutId: string): NewTabState {
  return normalizeNewTabState({
    ...state,
    pinnedShortcuts: state.pinnedShortcuts.filter((shortcut) => shortcut.id !== shortcutId)
  });
}

export function hideGeneratedShortcut(state: NewTabState, url: string): NewTabState {
  const normalizedUrl = normalizeShortcutUrl(url);

  if (!normalizedUrl || state.hiddenShortcutUrls.includes(normalizedUrl)) {
    return state;
  }

  return normalizeNewTabState({
    ...state,
    hiddenShortcutUrls: [normalizedUrl, ...state.hiddenShortcutUrls]
  });
}

function normalizePinnedShortcuts(shortcuts?: NewTabShortcut[]): NewTabShortcut[] {
  if (!Array.isArray(shortcuts)) {
    return [];
  }

  const seenUrls = new Set<string>();

  return shortcuts
    .map((shortcut) => normalizePinnedShortcut(shortcut))
    .filter((shortcut): shortcut is NewTabShortcut => {
      if (!shortcut || seenUrls.has(shortcut.url)) {
        return false;
      }

      seenUrls.add(shortcut.url);
      return true;
    })
    .slice(0, MAX_PINNED_SHORTCUTS);
}

function normalizePinnedShortcut(shortcut?: Partial<NewTabShortcut>): NewTabShortcut | undefined {
  const url = normalizeShortcutUrl(shortcut?.url);

  if (!url) {
    return undefined;
  }

  const now = Date.now();
  const source =
    shortcut?.source === "bookmark" || shortcut?.source === "generated"
      ? shortcut.source
      : "custom";

  return {
    id: normalizeString(shortcut?.id) || `${source}:${url}`,
    title: normalizeString(shortcut?.title) || getHostnameLabel(url),
    url,
    source,
    bookmarkId: normalizeString(shortcut?.bookmarkId),
    iconUrl: normalizeString(shortcut?.iconUrl),
    createdAt: normalizeNumber(shortcut?.createdAt) ?? now,
    updatedAt: normalizeNumber(shortcut?.updatedAt) ?? now
  };
}

function normalizeStringList(values: string[] | undefined, limit: number): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  const normalized = values.filter((value): value is string => Boolean(normalizeString(value)));
  return [...new Set(normalized.map((value) => value.trim()))].slice(0, limit);
}

function normalizeString(value?: string): string | undefined {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || undefined;
}

function normalizeNumber(value?: number): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeShortcutUrl(url?: string): string | undefined {
  if (!url || !isProbablyUrl(url)) {
    return undefined;
  }

  try {
    const parsed = new URL(normalizeInputUrl(url));
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

function getHostnameLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "网站";
  }
}
