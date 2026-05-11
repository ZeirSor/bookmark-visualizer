import { useEffect, useMemo, useState } from "react";
import {
  buildWorkspaceFolderPath,
  deriveNewTabViewModel,
  openWorkspace,
  type SearchCategory
} from "../features/newtab";
import { CustomizeLayoutPanel } from "./components/CustomizeLayoutPanel";
import {
  ExternalLinkIcon,
  FolderIcon,
  SearchIcon,
  SettingsIcon
} from "../components/icons/AppIcons";
import { Button, IconButton } from "../design-system";
import {
  BookmarkGroupStrip,
  FeaturedBookmarkRow,
  FolderPreviewPanel,
  PinnedShortcutGrid,
  QuickActionsPanel,
  RecentActivityPanel,
  StorageUsageMiniCard
} from "./components/NewTabSections";
import { NewTabModeTabs, type NewTabContentTab } from "./components/NewTabModeTabs";
import { NewTabSidebar } from "./components/NewTabSidebar";
import { SearchPanel } from "./components/SearchPanel";
import { ShortcutDialog } from "./components/ShortcutDialog";
import { useNewTabActions } from "./hooks/useNewTabActions";
import { useNewTabBootstrap } from "./hooks/useNewTabBootstrap";

export function NewTabApp() {
  const bootstrap = useNewTabBootstrap();
  const [activeFolderId, setActiveFolderId] = useState<string>();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [shortcutDialogOpen, setShortcutDialogOpen] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState<NewTabContentTab>("shortcuts");
  const [toast, setToast] = useState<string>();
  const viewModel = useMemo(
    () =>
      deriveNewTabViewModel({
        tree: bootstrap.tree,
        state: bootstrap.state,
        settings: bootstrap.settings,
        activities: bootstrap.activities,
        usageStats: bootstrap.usageStats,
        activeFolderId
      }),
    [activeFolderId, bootstrap.activities, bootstrap.settings, bootstrap.state, bootstrap.tree, bootstrap.usageStats]
  );
  const selectedCategory = bootstrap.settings.newTabDefaultSearchCategory as SearchCategory;
  const activeFolder = viewModel.folders.find(
    (folder) => folder.id === (activeFolderId ?? viewModel.folders[0]?.id)
  );
  const actions = useNewTabActions({
    settings: bootstrap.settings,
    state: bootstrap.state,
    selectedCategory,
    setSettings: bootstrap.setSettings,
    setState: bootstrap.setState,
    setActivities: bootstrap.setActivities,
    setUsageStats: bootstrap.setUsageStats,
    setActiveFolderId,
    setShortcutDialogOpen,
    setToast
  });

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(undefined), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <main className={`nt-page is-${bootstrap.settings.newTabLayoutMode}-mode`}>
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
            <IconButton
              className="nt-icon-button"
              icon={<ExternalLinkIcon />}
              label="打开管理页"
              onClick={() => void openWorkspace()}
            />
          </div>
          <nav className="nt-main-nav" aria-label="新标签页操作">
            <Button
              variant="ghost"
              size="sm"
              className="is-active"
              selected
              leadingIcon={<SearchIcon />}
              onClick={focusSearch}
            >
              搜索
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<FolderIcon />}
              onClick={() => void openWorkspace()}
            >
              管理
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<SettingsIcon />}
              onClick={() => setCustomizeOpen(true)}
            >
              设置
            </Button>
          </nav>
        </header>

        <div className="nt-scroll-root">
        {bootstrap.settings.newTabLayoutMode === "sidebar" ? (
          <NewTabSidebar
            activeFolderId={activeFolder?.id}
            folders={viewModel.folders}
            onManage={() => void openWorkspace()}
            onSelectFolder={setActiveFolderId}
          />
        ) : null}

        <div className="nt-container">
          {bootstrap.error ? <p className="nt-error">{bootstrap.error}</p> : null}
          {bootstrap.loading ? <p className="nt-loading">正在读取书签...</p> : null}

          <div className="nt-main-grid">
            <section className="nt-center-column" aria-label="新标签页内容">
              <SearchPanel
                category={selectedCategory}
                engineId={bootstrap.settings.newTabDefaultSearchEngineId}
                shortcuts={viewModel.shortcuts}
                tree={bootstrap.tree}
                onCategoryChange={(category) =>
                  void actions.updateSettings({ newTabDefaultSearchCategory: category })
                }
                onEngineChange={(engineId) =>
                  void actions.updateSettings({ newTabDefaultSearchEngineId: engineId })
                }
                onOpenSuggestion={actions.handleOpenSuggestion}
              />

              {bootstrap.settings.newTabLayoutMode === "tabs" ? (
                <NewTabModeTabs active={activeContentTab} onChange={setActiveContentTab} />
              ) : null}

              {bootstrap.settings.newTabLayoutMode !== "tabs" || activeContentTab === "shortcuts" ? (
                <PinnedShortcutGrid
                  shortcuts={viewModel.shortcuts}
                  shortcutsPerRow={bootstrap.settings.newTabShortcutsPerRow}
                  onAdd={() => setShortcutDialogOpen(true)}
                  onHide={actions.handleHideShortcut}
                  onOpen={actions.handleOpenShortcut}
                />
              ) : null}

              {bootstrap.settings.newTabLayoutMode === "sidebar" ||
              (bootstrap.settings.newTabLayoutMode === "tabs" && activeContentTab === "folders") ? (
                <FolderPreviewPanel
                  folder={activeFolder}
                  bookmarks={viewModel.featuredBookmarks}
                  onOpen={actions.handleOpenFeatured}
                  onOpenFolder={(folderId) => void openWorkspace(buildWorkspaceFolderPath(folderId))}
                />
              ) : null}

              {bootstrap.settings.newTabLayoutMode !== "tabs" || activeContentTab !== "recent" ? (
                <BookmarkGroupStrip
                  activeFolderId={activeFolderId ?? viewModel.folders[0]?.id}
                  folders={viewModel.folders}
                  onOpenFolder={(folderId) => void openWorkspace(buildWorkspaceFolderPath(folderId))}
                  onSelectFolder={setActiveFolderId}
                />
              ) : null}

              <FeaturedBookmarkRow bookmarks={viewModel.featuredBookmarks} onOpen={actions.handleOpenFeatured} />
            </section>
            <aside className="nt-right-rail" aria-label="辅助信息">
              {bootstrap.settings.newTabShowRecentActivity ? (
                <RecentActivityPanel activities={viewModel.recentActivities} onOpen={actions.handleOpenActivity} />
              ) : null}
              <QuickActionsPanel
                onCustomize={() => setCustomizeOpen(true)}
                onImport={() => void openWorkspace("index.html?import=html")}
                onManage={() => void openWorkspace()}
                onNewBookmark={() => void openWorkspace("index.html?new=bookmark")}
              />
              {bootstrap.settings.newTabShowStorageUsage ? <StorageUsageMiniCard /> : null}
            </aside>
          </div>
        </div>
      </div>
      </div>

      {customizeOpen ? (
        <CustomizeLayoutPanel
          settings={bootstrap.settings}
          onChange={(patch) => void actions.updateSettings(patch)}
          onClose={() => setCustomizeOpen(false)}
        />
      ) : null}

      {shortcutDialogOpen ? (
        <ShortcutDialog
          onClose={() => setShortcutDialogOpen(false)}
          onSave={(input) => void actions.handleAddShortcut(input)}
        />
      ) : null}

      {toast ? <div className="nt-toast">{toast}</div> : null}
    </main>
  );

  function focusSearch() {
    document.querySelector<HTMLInputElement>(".nt-search-box input")?.focus();
  }
}
