# 管理页 Workspace PageDoc

## 页面定位

管理页是 Bookmark Visualizer 的高密度工作台，用于浏览、搜索、整理、编辑浏览器原生书签。当前它不是 New Tab，也不是 Popup 的放大版，而是完整管理界面。

## 入口与代码链路

```text
index.html
  → src/main.tsx
    → import src/styles/tokens.css
    → import src/app/styles.css
    → render <App />
  → src/app/App.tsx
    → 左侧 FolderTree
    → 顶部 TopToolbar
    → 中央 FolderHeader / SearchFilterSummary / BookmarkCommandBar / FolderStrip / WorkspaceContent
    → 右侧 RightRail
    → 全局浮层 OperationLogDrawer / ContextMenu / Dialog / Toast
```

## 核心源码

| 责任 | 文件 |
|---|---|
| 页面总控、状态、事件、Chrome bookmarks 写入 | `src/app/App.tsx` |
| 中央书签卡片区 | `src/app/workspace/WorkspaceContent.tsx` |
| 管理页弹层、右键菜单、对话框、Toast | `src/app/workspace/WorkspaceComponents.tsx` |
| 顶部工具条 | `src/app/workspace/components/TopToolbar.tsx` |
| 当前文件夹头部 | `src/app/workspace/components/FolderHeader.tsx` |
| 命令栏 / 排序筛选占位 / 批量入口 | `src/app/workspace/components/BookmarkCommandBar.tsx` |
| 子文件夹条 | `src/app/workspace/components/FolderStrip.tsx` |
| 搜索摘要 | `src/app/workspace/components/SearchFilterSummary.tsx` |
| 批量选择条 | `src/app/workspace/components/SelectionActionBar.tsx` |
| 右侧辅助栏 | `src/app/workspace/components/RightRail.tsx` |
| 书签卡片 | `src/components/BookmarkCard.tsx` |
| 左侧文件夹树 | `src/components/FolderTree.tsx` |
| 文件夹级联菜单 | `src/components/FolderCascadeMenu.tsx` |
| 文件夹移动子菜单 | `src/components/FolderMoveSubmenuContent.tsx` |
| 书签树处理 | `src/features/bookmarks/bookmarkTree.ts`、`src/features/bookmarks/useBookmarks.ts` |
| 搜索 | `src/features/search/searchBookmarks.ts` |
| 拖拽 | `src/features/drag-drop/index.ts` |
| 最近文件夹 | `src/features/recent-folders/recentFolders.ts` |
| metadata / 备注 | `src/features/metadata/metadataService.ts` |
| settings | `src/features/settings/settingsService.ts` |
| Chrome adapter | `src/lib/chrome/bookmarksAdapter.ts`、`src/lib/chrome/storageAdapter.ts` |
| 样式 | `src/app/styles.css`、`src/styles/tokens.css` |

## 组件树

```text
<App>
  <aside.sidebar>
    brand
    tree-toggle
    tree-toolbar
    sidebar-status
    <FolderTree />
  <resize-handle />
  <section.workspace>
    <TopToolbar />
    <div.manager-layout>
      <main.manager-main>
        <SelectionActionBar />               // selectionMode 时出现
        <FolderHeader />
        <SearchFilterSummary />              // query 非空时出现
        <BookmarkCommandBar />
        <FolderStrip />                      // 非搜索状态且有子文件夹时出现
        <WorkspaceContent>
          <NewBookmarkDraftCard />
          <BookmarkCard />[]
          <EmptyState /> / LoadingState
      <RightRail />
  <OperationLogDrawer />
  <BookmarkContextMenu />
  <FolderContextMenu />
  <NewFolderDialog />
  <FolderPickerDialog />
  <ShortcutSettingsDialog />
  <Toast />
```

## 关键运行状态

| 状态 | 文件 | 用途 |
|---|---|---|
| `query` | `App.tsx` | 顶部搜索输入；决定搜索模式和 `SearchFilterSummary` |
| `sortMode` | `App.tsx` | 管理页排序状态：默认顺序、标题 A-Z、最新添加、最早添加 |
| `workspaceFilters.hasNote` | `App.tsx` | 是否只显示有备注的书签 |
| `searchScope` | `App.tsx` | 搜索范围：全部书签或当前文件夹子树 |
| `tree` / `folders` / `selectedFolder` | `useBookmarks()` | Chrome bookmarks 树和当前文件夹 |
| `settings.cardSize` | `useSettings()` | `data-card-size` 控制卡片尺寸 |
| `settings.sidebarWidth` | `useSettings()` | CSS var `--sidebar-width` 控制左侧宽度 |
| `settings.showBookmarksInTree` | `useSettings()` | 左侧树是否显示书签条目 |
| `settings.theme` | `useSettings()` | 写入 `document.documentElement.dataset.theme` |
| `selection.selectionMode` | `useSelectionState()` | 是否进入批量选择模式 |
| `selection.selectedIds` | `useSelectionState()` | 批量删除候选集合 |
| `operationLog` | `App.tsx` | 右侧最近活动、操作日志抽屉、撤回功能 |
| `contextMenu` / `folderContextMenu` | `App.tsx` | 右键菜单位置和目标 |
| `newFolderDialog` / `folderPickerDialog` | `App.tsx` | 新建文件夹与移动目标对话框 |
| `highlightedBookmarkId` / `highlightPulseId` | `App.tsx` | Tree / New Tab deep link 跳转后的高亮反馈 |

## 当前已实现功能

- 左侧书签树浏览、展开、收起、选择。
- 可选展示树内书签。
- 侧边栏宽度拖拽调整，宽度持久化到 settings。
- 顶部面包屑、标题 / URL / 备注搜索、搜索范围切换、卡片尺寸、操作日志、快捷键设置、主题切换。
- 当前文件夹统计、子文件夹条、新建书签。
- 书签卡片打开、右键菜单、拖拽移动、同文件夹重排。
- 行内编辑标题、URL、备注。
- 右键移动到文件夹、移动过程中创建文件夹。
- 新建文件夹、文件夹重命名、文件夹拖拽移动。
- 批量选择和批量删除。
- 操作日志与部分操作撤回。

## 当前占位 / 未完成能力

| UI | 状态 |
|---|---|
| 命令栏排序 | 已实现：默认顺序、标题 A-Z、最新添加、最早添加 |
| 命令栏筛选 | 更多筛选下拉仍 disabled，占位 |
| 有备注 chip | 已实现，可筛选当前列表中有备注的书签 |
| 未读 / 收藏 chip | disabled，占位 |
| 书签卡片星标 | disabled，占位 |
| 批量移动 | disabled，占位 |
| 添加标签 | disabled，占位 |
| 稍后阅读 | disabled，占位 |
| 右侧栏导入 / 导出 / 查重 / 回收站 | disabled，占位 |
| 云空间升级 | disabled，占位 |
| 批量删除撤回 | 未实现，文案中已提示不可撤回 |

## 维护重点

- 所有真实书签写操作都应通过 `bookmarksAdapter`，不要在组件内直接散落 `chrome.bookmarks`。
- 搜索态下禁止书签重排，因为 `displayedBookmarks` 来自全局搜索结果，不是当前文件夹真实顺序。
- 批量模式下点击卡片应该切换选择，不能打开网页。
- 修改 `BookmarkCard` 样式时必须同时检查正常态、hover、selected、highlight、inline edit、drag drop。
- 修改 `FolderCascadeMenu` 时必须同步回归管理页右键移动、legacy 保存入口和 Quick Save 浏览文件夹；当前 Popup 保存位置和 Settings 默认保存位置使用共享内联 picker。
