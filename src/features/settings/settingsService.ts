import { storageAdapter } from "../../lib/chrome";
import { defaultSettings, type SettingsState } from "./index";

const SETTINGS_KEY = "bookmarkVisualizerSettings";

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
    sidebarWidth: normalizeSidebarWidth(settings?.sidebarWidth)
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
