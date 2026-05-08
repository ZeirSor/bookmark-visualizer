import {
  addPinnedShortcut,
  buildSearchUrl,
  hideGeneratedShortcut,
  loadRecentActivities,
  loadUsageStats,
  openUrl,
  recordNewTabActivity,
  removePinnedShortcut,
  saveNewTabState,
  type NewTabActivityItem,
  type NewTabFeaturedBookmarkViewModel,
  type NewTabShortcutViewModel,
  type NewTabState,
  type NewTabSuggestion,
  type NewTabUsageItem,
  type SearchCategory
} from "../../features/newtab";
import { saveSettings, type SettingsState } from "../../features/settings";

export function useNewTabActions({
  settings,
  state,
  selectedCategory,
  setSettings,
  setState,
  setActivities,
  setUsageStats,
  setActiveFolderId,
  setShortcutDialogOpen,
  setToast
}: {
  settings: SettingsState;
  state: NewTabState;
  selectedCategory: SearchCategory;
  setSettings(settings: SettingsState): void;
  setState(state: NewTabState): void;
  setActivities(activities: NewTabActivityItem[]): void;
  setUsageStats(stats: NewTabUsageItem[]): void;
  setActiveFolderId(folderId: string): void;
  setShortcutDialogOpen(open: boolean): void;
  setToast(message: string): void;
}) {
  async function updateSettings(patch: Partial<SettingsState>) {
    const next = await saveSettings({ ...settings, ...patch });
    setSettings(next);
  }

  async function persistState(nextState: NewTabState) {
    const normalized = await saveNewTabState(nextState);
    setState(normalized);
  }

  async function refreshActivities() {
    const [nextActivities, nextUsageStats] = await Promise.all([
      loadRecentActivities(),
      loadUsageStats()
    ]);
    setActivities(nextActivities);
    setUsageStats(nextUsageStats);
  }

  async function handleOpenSuggestion(suggestion: NewTabSuggestion, openInNewTab?: boolean) {
    if (suggestion.type === "folder" && suggestion.folderId) {
      setActiveFolderId(suggestion.folderId);
      return;
    }

    const url =
      suggestion.url ??
      (suggestion.type === "web-search"
        ? buildSearchUrl(settings.newTabDefaultSearchEngineId, selectedCategory, suggestion.title)
        : undefined);

    if (!url) {
      return;
    }

    await recordNewTabActivity({
      type: "visited",
      title: suggestion.title,
      url,
      bookmarkId: suggestion.bookmarkId,
      folderId: suggestion.folderId
    });
    await refreshActivities();
    await openUrl(url, { newTab: openInNewTab });
  }

  async function handleOpenShortcut(shortcut: NewTabShortcutViewModel, openInNewTab?: boolean) {
    await recordNewTabActivity({
      type: "visited",
      title: shortcut.title,
      url: shortcut.url,
      bookmarkId: shortcut.bookmarkId
    });
    await refreshActivities();
    await openUrl(shortcut.url, { newTab: openInNewTab });
  }

  async function handleOpenFeatured(
    bookmark: NewTabFeaturedBookmarkViewModel,
    openInNewTab?: boolean
  ) {
    await recordNewTabActivity({
      type: "visited",
      title: bookmark.title,
      url: bookmark.url,
      bookmarkId: bookmark.id
    });
    await refreshActivities();
    await openUrl(bookmark.url, { newTab: openInNewTab });
  }

  async function handleOpenActivity(activity: NewTabActivityItem, openInNewTab?: boolean) {
    if (!activity.url) {
      return;
    }

    await openUrl(activity.url, { newTab: openInNewTab });
  }

  async function handleAddShortcut(input: { title: string; url: string }) {
    const next = addPinnedShortcut(state, {
      title: input.title,
      url: input.url,
      source: "custom"
    });

    if (next === state) {
      setToast("请输入可打开的 URL。");
      return;
    }

    await persistState(next);
    setShortcutDialogOpen(false);
    setToast("已添加到快捷访问。");
  }

  async function handleHideShortcut(shortcut: NewTabShortcutViewModel) {
    const next =
      shortcut.source === "generated"
        ? hideGeneratedShortcut(state, shortcut.url)
        : removePinnedShortcut(state, shortcut.id);

    await persistState(next);
  }

  return {
    updateSettings,
    handleOpenSuggestion,
    handleOpenShortcut,
    handleOpenFeatured,
    handleOpenActivity,
    handleAddShortcut,
    handleHideShortcut
  };
}
