import { storageAdapter } from "../../lib/chrome";
import { defaultSettings, type SettingsState } from "./index";

const SETTINGS_KEY = "bookmarkVisualizerSettings";
const NEW_TAB_SEARCH_ENGINE_IDS = new Set(["google", "bing", "duckduckgo"]);

export async function loadSettings(): Promise<SettingsState> {
  const result = await storageAdapter.get<{ [SETTINGS_KEY]: SettingsState }>({
    [SETTINGS_KEY]: defaultSettings
  });

  return normalizeSettings(result[SETTINGS_KEY]);
}

export async function saveSettings(settings: SettingsState): Promise<SettingsState> {
  const normalized = normalizeSettings(settings);
  await storageAdapter.set({ [SETTINGS_KEY]: normalized });
  return normalized;
}

export function normalizeSettings(settings?: Partial<SettingsState>): SettingsState {
  return {
    showBookmarksInTree: settings?.showBookmarksInTree ?? defaultSettings.showBookmarksInTree,
    theme: settings?.theme === "dark" ? "dark" : "light",
    cardDensity: "comfortable",
    cardSize: normalizeCardSize(settings?.cardSize),
    sidebarWidth: normalizeSidebarWidth(settings?.sidebarWidth),
    popupAutoCloseAfterSave:
      settings?.popupAutoCloseAfterSave ?? defaultSettings.popupAutoCloseAfterSave,
    autoCloseSaveWindowOnBlur:
      settings?.autoCloseSaveWindowOnBlur ?? defaultSettings.autoCloseSaveWindowOnBlur,
    popupShowSuccessToast:
      settings?.popupShowSuccessToast ?? defaultSettings.popupShowSuccessToast,
    popupRememberLastFolder:
      settings?.popupRememberLastFolder ?? defaultSettings.popupRememberLastFolder,
    popupShowThumbnail: settings?.popupShowThumbnail ?? defaultSettings.popupShowThumbnail,
    popupDefaultOpenTab: normalizePopupDefaultOpenTab(settings?.popupDefaultOpenTab),
    popupThemeMode: normalizePopupThemeMode(settings?.popupThemeMode),
    popupDefaultFolderId: normalizeOptionalId(settings?.popupDefaultFolderId),
    newTabOverrideEnabled:
      settings?.newTabOverrideEnabled ?? defaultSettings.newTabOverrideEnabled,
    newTabDefaultSearchEngineId: normalizeNewTabSearchEngineId(
      settings?.newTabDefaultSearchEngineId
    ),
    newTabDefaultSearchCategory: normalizeNewTabSearchCategory(
      settings?.newTabDefaultSearchCategory
    ),
    newTabLayoutMode: normalizeNewTabLayoutMode(settings?.newTabLayoutMode),
    newTabShowRecentActivity:
      settings?.newTabShowRecentActivity ?? defaultSettings.newTabShowRecentActivity,
    newTabShowStorageUsage:
      settings?.newTabShowStorageUsage ?? defaultSettings.newTabShowStorageUsage,
    newTabShortcutsPerRow: normalizeNewTabShortcutsPerRow(settings?.newTabShortcutsPerRow)
  };
}

function normalizeCardSize(cardSize?: SettingsState["cardSize"]): SettingsState["cardSize"] {
  if (
    cardSize === "small" ||
    cardSize === "medium" ||
    cardSize === "large" ||
    cardSize === "extra-large"
  ) {
    return cardSize;
  }

  return defaultSettings.cardSize;
}

function normalizeSidebarWidth(width?: number): number {
  if (typeof width !== "number" || Number.isNaN(width)) {
    return defaultSettings.sidebarWidth;
  }

  return Math.min(640, Math.max(220, Math.round(width)));
}

function normalizePopupDefaultOpenTab(
  tab?: SettingsState["popupDefaultOpenTab"]
): SettingsState["popupDefaultOpenTab"] {
  if (tab === "save" || tab === "manage" || tab === "settings") {
    return tab;
  }

  return defaultSettings.popupDefaultOpenTab;
}

function normalizePopupThemeMode(
  mode?: SettingsState["popupThemeMode"]
): SettingsState["popupThemeMode"] {
  if (mode === "system" || mode === "light" || mode === "dark") {
    return mode;
  }

  return defaultSettings.popupThemeMode;
}

function normalizeOptionalId(id?: string): string | undefined {
  const normalized = id?.trim();
  return normalized || undefined;
}

function normalizeNewTabSearchEngineId(id?: string): string {
  const normalized = id?.trim().toLocaleLowerCase();
  return normalized && NEW_TAB_SEARCH_ENGINE_IDS.has(normalized)
    ? normalized
    : defaultSettings.newTabDefaultSearchEngineId;
}

function normalizeNewTabSearchCategory(
  category?: SettingsState["newTabDefaultSearchCategory"]
): SettingsState["newTabDefaultSearchCategory"] {
  if (
    category === "web" ||
    category === "image" ||
    category === "news" ||
    category === "video" ||
    category === "maps"
  ) {
    return category;
  }

  return defaultSettings.newTabDefaultSearchCategory;
}

function normalizeNewTabLayoutMode(
  mode?: SettingsState["newTabLayoutMode"]
): SettingsState["newTabLayoutMode"] {
  if (mode === "standard" || mode === "sidebar" || mode === "tabs") {
    return mode;
  }

  return defaultSettings.newTabLayoutMode;
}

function normalizeNewTabShortcutsPerRow(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return defaultSettings.newTabShortcutsPerRow;
  }

  return Math.min(10, Math.max(4, Math.round(value)));
}
