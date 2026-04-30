export type CardSize = "small" | "medium" | "large" | "extra-large";

export interface SettingsState {
  showBookmarksInTree: boolean;
  theme: "light" | "dark";
  cardDensity: "comfortable";
  cardSize: CardSize;
  sidebarWidth: number;
}

export const defaultSettings: SettingsState = {
  showBookmarksInTree: false,
  theme: "light",
  cardDensity: "comfortable",
  cardSize: "medium",
  sidebarWidth: 280
};

export * from "./settingsService";
export * from "./useSettings";
