# New Tab Portal PageDoc

## 页面定位

New Tab Portal 是搜索优先的新标签页入口，用于网络搜索、快速访问常用网站、轻量浏览书签分组。它不是完整管理页，不承担大规模编辑和拖拽整理。

## 入口链路

```text
newtab.html
  → src/newtab/main.tsx
    → import src/styles/tokens.css
    → import src/newtab/styles.css
    → render <NewTabApp />
```

Runtime redirect 链路：

```text
src/service-worker.ts
  → registerServiceWorker()
  → registerNewTabRedirect()
  → chrome.tabs.onCreated / onUpdated
  → maybeRedirectNewTab(tab)
  → loadSettings()
  → settings.newTabOverrideEnabled === true
  → chrome.tabs.update(tabId, { url: chrome.runtime.getURL("newtab.html") })
```

## 主要文件

| 责任 | 文件 |
|---|---|
| New Tab 页面总控 | `src/newtab/NewTabApp.tsx` |
| 搜索 hero / 建议浮层 | `src/newtab/components/SearchPanel.tsx` |
| 快速访问、分组、精选、最近活动、快捷操作 | `src/newtab/components/NewTabSections.tsx` |
| 自定义布局抽屉 | `src/newtab/components/CustomizeLayoutPanel.tsx` |
| 添加快捷方式对话框 | `src/newtab/components/ShortcutDialog.tsx` |
| New Tab 状态存储 | `src/features/newtab/newTabState.ts` |
| 搜索引擎与 URL 构造 | `src/features/newtab/searchEngines.ts` |
| 混合搜索建议 | `src/features/newtab/mixedSearch.ts` |
| 快捷方式推导 | `src/features/newtab/shortcuts.ts` |
| ViewModel 推导 | `src/features/newtab/newTabViewModel.ts` |
| 活动和使用统计 | `src/features/newtab/activity.ts` |
| 导航 helper | `src/features/newtab/navigation.ts` |
| runtime redirect | `src/features/newtab/newTabRedirect.ts` |
| 设置存储 | `src/features/settings/*` |
| 样式 | `src/newtab/styles.css`、`src/styles/tokens.css` |

## 页面组件树

```text
<NewTabApp>
  <header.nt-header>
    brand compact
    open manager icon button
    nav: 搜索 / 管理 / 设置
  <div.nt-scroll-root>
    optional <NewTabSidebar />            // layoutMode === sidebar
    <div.nt-container>
      error / loading
      <div.nt-main-grid>
        <section.nt-center-column>
          <SearchPanel />
          optional <NewTabModeTabs />     // layoutMode === tabs
          <PinnedShortcutGrid />
          optional <FolderPreviewPanel />
          <BookmarkGroupStrip />
          <FeaturedBookmarkRow />
        <aside.nt-right-rail>
          <RecentActivityPanel />
          <QuickActionsPanel />
          <StorageUsageMiniCard />
  optional <CustomizeLayoutPanel />
  optional <ShortcutDialog />
  optional <div.nt-toast>
```

## 核心状态

| 状态 | 来源 | 用途 |
|---|---|---|
| `settings` | `loadSettings()` | 搜索引擎、搜索类型、布局模式、显示模块 |
| `tree` | `bookmarksAdapter.getTree()` | 本地书签搜索、分组、精选书签 |
| `state` | `loadNewTabState()` | pinned shortcuts、hidden URLs、selected folders、featured bookmarks |
| `activities` | `loadRecentActivities()` | 最近活动右侧栏 |
| `usageStats` | `loadUsageStats()` | 生成常用 shortcut |
| `activeFolderId` | NewTabApp local state | 当前分组和精选书签 |
| `customizeOpen` | NewTabApp local state | 自定义布局抽屉 |
| `shortcutDialogOpen` | NewTabApp local state | 添加网站对话框 |
| `activeContentTab` | NewTabApp local state | tabs 布局模式下的内容分区 |
| `toast` | NewTabApp local state | 添加 shortcut 等短反馈 |

## 当前已实现能力

- 可开关新标签页绑定。
- 搜索引擎：Google / Bing / DuckDuckGo。
- 搜索类型：Web / 图片 / 新闻 / 视频 / 地图。
- 输入 URL 直接打开。
- 混合建议：本地书签、文件夹、网络搜索、URL。
- 快速访问：固定快捷方式 + 根据使用统计 / 最近书签 / 默认站点生成。
- 添加自定义网站、隐藏快捷方式。
- 书签分组 strip、分组预览、精选书签。
- 最近活动和使用统计记录。
- 快捷操作：打开管理页、新建书签、导入 HTML、自定义布局。
- 三种布局模式：standard / sidebar / tabs。

## 设计边界

- New Tab 首屏焦点必须是搜索，不是“我的书签”。
- 不要加入天气、壁纸、todo、云账户等横向功能。
- 不要在 New Tab 做复杂编辑；编辑跳转到管理页。
- 不要默认接管新标签页；用户必须在 Popup 设置中开启。
