import { useEffect, useMemo, useState } from "react";
import { bookmarksAdapter } from "../lib/chrome";
import type { BookmarkNode } from "../features/bookmarks";
import {
  addPinnedShortcut,
  buildSearchUrl,
  buildWorkspaceFolderPath,
  defaultNewTabState,
  deriveNewTabViewModel,
  hideGeneratedShortcut,
  loadNewTabState,
  loadRecentActivities,
  loadUsageStats,
  openUrl,
  openWorkspace,
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
} from "../features/newtab";
import {
  defaultSettings,
  loadSettings,
  saveSettings,
  type SettingsState
} from "../features/settings";
import { CustomizeLayoutPanel } from "./components/CustomizeLayoutPanel";
import {
  ExternalLinkIcon,
  FolderIcon,
  GridIcon,
  SearchIcon,
  SettingsIcon
} from "../components/icons/AppIcons";
import {
  BookmarkGroupStrip,
  FeaturedBookmarkRow,
  FolderPreviewPanel,
  PinnedShortcutGrid,
  QuickActionsPanel,
  RecentActivityPanel,
  StorageUsageMiniCard
} from "./components/NewTabSections";
import { SearchPanel } from "./components/SearchPanel";
import { ShortcutDialog } from "./components/ShortcutDialog";

export function NewTabApp() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [tree, setTree] = useState<BookmarkNode[]>([]);
  const [state, setState] = useState<NewTabState>(defaultNewTabState);
  const [activities, setActivities] = useState<NewTabActivityItem[]>([]);
  const [usageStats, setUsageStats] = useState<NewTabUsageItem[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [shortcutDialogOpen, setShortcutDialogOpen] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState<"shortcuts" | "folders" | "recent">(
    "shortcuts"
  );
  const [toast, setToast] = useState<string>();
  const viewModel = useMemo(
    () => deriveNewTabViewModel({ tree, state, settings, activities, usageStats, activeFolderId }),
    [activeFolderId, activities, settings, state, tree, usageStats]
  );
  const selectedCategory = settings.newTabDefaultSearchCategory as SearchCategory;
  const activeFolder = viewModel.folders.find(
    (folder) => folder.id === (activeFolderId ?? viewModel.folders[0]?.id)
  );

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

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(undefined), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <main className={`nt-page is-${settings.newTabLayoutMode}-mode`}>
      <div className="nt-shell">
        <header className="nt-header">
          <div className="nt-header-top">
            <div className="nt-brand-compact">
              <img className="nt-brand-mark" src="icons/icon-48.png" alt="" />
              <span className="nt-brand-copy">
                <strong>Bookmark Visualizer</strong>
                <span className="nt-page-pill">新标签页</span>
              </span>
            </div>
            <button
              type="button"
              className="nt-icon-button"
              title="打开管理页"
              aria-label="打开管理页"
              onClick={() => void openWorkspace()}
            >
              <ExternalLinkIcon />
            </button>
          </div>
          <nav className="nt-main-nav" aria-label="新标签页操作">
            <button type="button" className="is-active" onClick={focusSearch}>
              <SearchIcon /> 搜索
            </button>
            <button type="button" onClick={() => void openWorkspace()}>
              <FolderIcon /> 管理
            </button>
            <button type="button" onClick={() => setCustomizeOpen(true)}>
              <SettingsIcon /> 设置
            </button>
          </nav>
        </header>

        <div className="nt-scroll-root">
        {settings.newTabLayoutMode === "sidebar" ? (
          <NewTabSidebar
            activeFolderId={activeFolder?.id}
            folders={viewModel.folders}
            onManage={() => void openWorkspace()}
            onSelectFolder={setActiveFolderId}
          />
        ) : null}

        <div className="nt-container">
          {error ? <p className="nt-error">{error}</p> : null}
          {loading ? <p className="nt-loading">正在读取书签...</p> : null}

          <div className="nt-main-grid">
            <section className="nt-center-column" aria-label="新标签页内容">
              <SearchPanel
                category={selectedCategory}
                engineId={settings.newTabDefaultSearchEngineId}
                shortcuts={viewModel.shortcuts}
                tree={tree}
                onCategoryChange={(category) =>
                  void updateSettings({ newTabDefaultSearchCategory: category })
                }
                onEngineChange={(engineId) =>
                  void updateSettings({ newTabDefaultSearchEngineId: engineId })
                }
                onOpenSuggestion={handleOpenSuggestion}
              />

              {settings.newTabLayoutMode === "tabs" ? (
                <NewTabModeTabs active={activeContentTab} onChange={setActiveContentTab} />
              ) : null}

              {settings.newTabLayoutMode !== "tabs" || activeContentTab === "shortcuts" ? (
                <PinnedShortcutGrid
                  shortcuts={viewModel.shortcuts}
                  shortcutsPerRow={settings.newTabShortcutsPerRow}
                  onAdd={() => setShortcutDialogOpen(true)}
                  onHide={handleHideShortcut}
                  onOpen={handleOpenShortcut}
                />
              ) : null}

              {settings.newTabLayoutMode === "sidebar" ||
              (settings.newTabLayoutMode === "tabs" && activeContentTab === "folders") ? (
                <FolderPreviewPanel
                  folder={activeFolder}
                  bookmarks={viewModel.featuredBookmarks}
                  onOpen={handleOpenFeatured}
                  onOpenFolder={(folderId) => void openWorkspace(buildWorkspaceFolderPath(folderId))}
                />
              ) : null}

              {settings.newTabLayoutMode !== "tabs" || activeContentTab !== "recent" ? (
                <BookmarkGroupStrip
                  activeFolderId={activeFolderId ?? viewModel.folders[0]?.id}
                  folders={viewModel.folders}
                  onOpenFolder={(folderId) => void openWorkspace(buildWorkspaceFolderPath(folderId))}
                  onSelectFolder={setActiveFolderId}
                />
              ) : null}

              <FeaturedBookmarkRow bookmarks={viewModel.featuredBookmarks} onOpen={handleOpenFeatured} />
            </section>
            <aside className="nt-right-rail" aria-label="辅助信息">
              {settings.newTabShowRecentActivity ? (
                <RecentActivityPanel activities={viewModel.recentActivities} onOpen={handleOpenActivity} />
              ) : null}
              <QuickActionsPanel
                onCustomize={() => setCustomizeOpen(true)}
                onImport={() => void openWorkspace("index.html?import=html")}
                onManage={() => void openWorkspace()}
                onNewBookmark={() => void openWorkspace("index.html?new=bookmark")}
              />
              {settings.newTabShowStorageUsage ? <StorageUsageMiniCard /> : null}
            </aside>
          </div>
        </div>
      </div>
      </div>

      {customizeOpen ? (
        <CustomizeLayoutPanel
          settings={settings}
          onChange={(patch) => void updateSettings(patch)}
          onClose={() => setCustomizeOpen(false)}
        />
      ) : null}

      {shortcutDialogOpen ? (
        <ShortcutDialog
          onClose={() => setShortcutDialogOpen(false)}
          onSave={(input) => void handleAddShortcut(input)}
        />
      ) : null}

      {toast ? <div className="nt-toast">{toast}</div> : null}
    </main>
  );

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

  function focusSearch() {
    document.querySelector<HTMLInputElement>(".nt-search-box input")?.focus();
  }
}

function NewTabModeTabs({
  active,
  onChange
}: {
  active: "shortcuts" | "folders" | "recent";
  onChange(tab: "shortcuts" | "folders" | "recent"): void;
}) {
  const tabs: Array<{ id: typeof active; label: string }> = [
    { id: "shortcuts", label: "常用网站" },
    { id: "folders", label: "书签文件夹" },
    { id: "recent", label: "最近收藏" }
  ];

  return (
    <div className="nt-content-tabs" role="tablist" aria-label="内容分区">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={active === tab.id ? "is-active" : undefined}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function NewTabSidebar({
  activeFolderId,
  folders,
  onManage,
  onSelectFolder
}: {
  activeFolderId?: string;
  folders: Array<{ id: string; title: string; bookmarkCount: number }>;
  onManage(): void;
  onSelectFolder(folderId: string): void;
}) {
  return (
    <aside className="nt-hover-sidebar" aria-label="书签侧栏">
      <button type="button" className="nt-sidebar-entry" onClick={onManage}>
        <GridIcon />
        <span>全部书签</span>
      </button>
      <div className="nt-sidebar-section">
        <p>书签文件夹</p>
        {folders.map((folder) => (
          <button
            key={folder.id}
            type="button"
            className={folder.id === activeFolderId ? "is-active" : undefined}
            onClick={() => onSelectFolder(folder.id)}
          >
            <FolderIcon />
            <span>{folder.title}</span>
            <small>{folder.bookmarkCount}</small>
          </button>
        ))}
      </div>
    </aside>
  );
}
