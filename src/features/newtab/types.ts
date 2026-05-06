import type { BookmarkNode } from "../bookmarks";

export type SearchCategory = "web" | "image" | "news" | "video" | "maps";
export type NewTabLayoutMode = "standard" | "sidebar" | "tabs";

export interface NewTabShortcut {
  id: string;
  title: string;
  url: string;
  source: "bookmark" | "custom" | "generated";
  bookmarkId?: string;
  iconUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NewTabState {
  version: 1;
  pinnedShortcuts: NewTabShortcut[];
  hiddenShortcutUrls: string[];
  selectedFolderIds: string[];
  featuredBookmarkIds: string[];
  collapsedSections: string[];
}

export type NewTabActivityType = "visited" | "saved" | "pinned" | "created" | "imported";

export interface NewTabActivityItem {
  id: string;
  type: NewTabActivityType;
  title: string;
  url?: string;
  bookmarkId?: string;
  folderId?: string;
  createdAt: number;
}

export interface NewTabUsageItem {
  url: string;
  title: string;
  bookmarkId?: string;
  openCount: number;
  lastOpenedAt: number;
}

export type NewTabSuggestionType = "bookmark" | "folder" | "web-search" | "url";

export interface NewTabSuggestion {
  id: string;
  type: NewTabSuggestionType;
  title: string;
  subtitle?: string;
  url?: string;
  bookmarkId?: string;
  folderId?: string;
  folderPath?: string;
  tag?: string;
  icon?: string;
  category?: SearchCategory;
  score: number;
}

export interface ShortcutIconViewModel {
  kind: "brand" | "letter" | "image";
  value: string;
  background?: string;
}

export interface NewTabShortcutViewModel {
  id: string;
  title: string;
  url: string;
  source: NewTabShortcut["source"];
  bookmarkId?: string;
  icon: ShortcutIconViewModel;
  removable: boolean;
}

export interface NewTabFolderCardViewModel {
  id: string;
  title: string;
  description: string;
  path: string;
  bookmarkCount: number;
  color: "purple" | "blue" | "green" | "orange" | "gray";
  sampleBookmarks: Array<{
    id: string;
    title: string;
    url: string;
  }>;
}

export interface NewTabFeaturedBookmarkViewModel {
  id: string;
  title: string;
  url: string;
  folderPath: string;
  node: BookmarkNode;
}

export interface NewTabViewModel {
  shortcuts: NewTabShortcutViewModel[];
  folders: NewTabFolderCardViewModel[];
  featuredBookmarks: NewTabFeaturedBookmarkViewModel[];
  recentActivities: NewTabActivityItem[];
}
