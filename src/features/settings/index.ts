export type CardSize = "small" | "medium" | "large" | "extra-large";
export type PopupDefaultOpenTab = "save" | "manage" | "settings";
export type PopupThemeMode = "system" | "light" | "dark";
export type NewTabLayoutMode = "standard" | "sidebar" | "tabs";
export type NewTabSearchCategory = "web" | "image" | "news" | "video" | "maps";

export interface SettingsState {
  showBookmarksInTree: boolean;
  theme: "light" | "dark";
  cardDensity: "comfortable";
  cardSize: CardSize;
  sidebarWidth: number;
  popupAutoCloseAfterSave: boolean;
  autoCloseSaveWindowOnBlur: boolean;
  popupShowSuccessToast: boolean;
  popupRememberLastFolder: boolean;
  popupShowThumbnail: boolean;
  popupDefaultOpenTab: PopupDefaultOpenTab;
  popupThemeMode: PopupThemeMode;
  popupDefaultFolderId?: string;
  newTabOverrideEnabled: boolean;
  newTabDefaultSearchEngineId: string;
  newTabDefaultSearchCategory: NewTabSearchCategory;
  newTabLayoutMode: NewTabLayoutMode;
  newTabShowRecentActivity: boolean;
  newTabShowStorageUsage: boolean;
  newTabShortcutsPerRow: number;
}

export const defaultSettings: SettingsState = {
  showBookmarksInTree: false,
  theme: "light",
  cardDensity: "comfortable",
  cardSize: "medium",
  sidebarWidth: 280,
  popupAutoCloseAfterSave: true,
  autoCloseSaveWindowOnBlur: false,
  popupShowSuccessToast: true,
  popupRememberLastFolder: true,
  popupShowThumbnail: true,
  popupDefaultOpenTab: "save",
  popupThemeMode: "system",
  popupDefaultFolderId: undefined,
  newTabOverrideEnabled: false,
  newTabDefaultSearchEngineId: "google",
  newTabDefaultSearchCategory: "web",
  newTabLayoutMode: "standard",
  newTabShowRecentActivity: true,
  newTabShowStorageUsage: true,
  newTabShortcutsPerRow: 8
};

export * from "./settingsService";
export * from "./useSettings";
