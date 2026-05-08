import { useEffect, useState } from "react";
import { bookmarksAdapter } from "../../lib/chrome";
import type { BookmarkNode } from "../../features/bookmarks";
import {
  defaultNewTabState,
  loadNewTabState,
  loadRecentActivities,
  loadUsageStats,
  type NewTabActivityItem,
  type NewTabState,
  type NewTabUsageItem
} from "../../features/newtab";
import {
  defaultSettings,
  loadSettings,
  type SettingsState
} from "../../features/settings";

export function useNewTabBootstrap() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [tree, setTree] = useState<BookmarkNode[]>([]);
  const [state, setState] = useState<NewTabState>(defaultNewTabState);
  const [activities, setActivities] = useState<NewTabActivityItem[]>([]);
  const [usageStats, setUsageStats] = useState<NewTabUsageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [nextSettings, nextTree, nextState, nextActivities, nextUsageStats] =
          await Promise.all([
            loadSettings(),
            bookmarksAdapter.getTree(),
            loadNewTabState(),
            loadRecentActivities(),
            loadUsageStats()
          ]);

        if (!cancelled) {
          setSettings(nextSettings);
          setTree(nextTree);
          setState(nextState);
          setActivities(nextActivities);
          setUsageStats(nextUsageStats);
          setError(undefined);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "新标签页数据读取失败。");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    settings,
    setSettings,
    tree,
    state,
    setState,
    activities,
    setActivities,
    usageStats,
    setUsageStats,
    loading,
    error
  };
}
