export type CardSize = "small" | "medium" | "large" | "extra-large";
export type PopupDefaultOpenTab = "save" | "manage" | "settings";
export type PopupThemeMode = "system" | "light" | "dark";

export interface SettingsState {
  showBookmarksInTree: boolean;
  theme: "light" | "dark";
  cardDensity: "comfortable";
  cardSize: CardSize;
  sidebarWidth: number;
  popupAutoCloseAfterSave: boolean;
  popupShowSuccessToast: boolean;
  popupRememberLastFolder: boolean;
  popupShowThumbnail: boolean;
  popupDefaultOpenTab: PopupDefaultOpenTab;
  popupThemeMode: PopupThemeMode;
  popupDefaultFolderId?: string;
}

export const defaultSettings: SettingsState = {
  showBookmarksInTree: false,
  theme: "light",
  cardDensity: "comfortable",
  cardSize: "medium",
  sidebarWidth: 280,
  popupAutoCloseAfterSave: true,
  popupShowSuccessToast: true,
  popupRememberLastFolder: true,
  popupShowThumbnail: true,
  popupDefaultOpenTab: "save",
  popupThemeMode: "system",
  popupDefaultFolderId: undefined
};

export * from "./settingsService";
export * from "./useSettings";
