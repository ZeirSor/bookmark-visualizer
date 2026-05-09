# 管理页 UI 区块与元素说明

## 总体布局

| 区块 | CSS selector | 代码 | 说明 |
|---|---|---|---|
| 页面根 | `.app-shell` | `src/app/App.tsx` | 三列 grid：sidebar / resize handle / workspace |
| 左侧栏 | `.sidebar` | `App.tsx` | 品牌、树开关、树操作、FolderTree |
| 拖拽调整条 | `.resize-handle` | `App.tsx` | `role="separator"`，横向拖拽调整 sidebar 宽度 |
| 右工作区 | `.workspace` | `App.tsx` | 顶部工具条 + manager 三栏内容 |
| 管理布局 | `.manager-layout` | `App.tsx` | 中央 `manager-main` + 右侧 `RightRail` |
| 中央主区 | `.manager-main` | `App.tsx` | 文件夹头、命令栏、卡片网格 |
| 右侧栏 | `.right-rail` | `RightRail.tsx` | 最近活动、快捷操作、存储信息 |

## 左侧 Sidebar 细节

| UI 元素 | selector | 代码文件 | 交互 / 状态 | 样式要点 |
|---|---|---|---|---|
| 品牌 mark | `.brand-mark` | `App.tsx` + `styles.css` | 装饰性图形，无点击 | 蓝紫渐变 / 圆角 / 轻阴影 |
| 标题“我的书签” | `.brand h1` | `App.tsx` | 静态 | 管理页中文主标题，副标题 Bookmark Visualizer |
| 显示树内书签开关 | `.tree-toggle input` | `App.tsx` | 写入 `settings.showBookmarksInTree` | 轻量 checkbox 行，影响 FolderTree 渲染 |
| 展开全部按钮 | `.tree-toolbar button` | `App.tsx` | `expandAllFolders()` | 小按钮，不能使用主按钮样式 |
| 收起全部按钮 | `.tree-toolbar button` | `App.tsx` | `collapseAllFolders()` | 收起后 `expandedFolderIds = new Set()` |
| 当前状态 | `.sidebar-status` | `App.tsx` | 显示当前文件夹标题或读取状态 | 小字号、弱色，用于定位 |
| 文件夹树 | `.folder-tree` | `FolderTree.tsx` | 选择、展开、拖拽、右键 | 纵向滚动，树行需要单行省略 |

## TopToolbar 元素

| UI 元素 | selector | 代码文件 | 交互链路 | 维护说明 |
|---|---|---|---|---|
| 面包屑 | `.breadcrumb` / `.breadcrumb-separator` | `TopToolbar.tsx` + `BreadcrumbNav.tsx` | 点击 → `handleBreadcrumbSelectFolder()` → `selectFolder()` | 点击上级时保留 tail path，便于回到原路径 |
| 搜索框 | `.search-bar input` | `TopToolbar.tsx` + `SearchBar.tsx` | 输入 → `setQuery()` → `searchBookmarks()` | 搜索标题、URL 和现有备注；搜索范围可切换 |
| 清除搜索按钮 | `.search-clear-button` | `SearchBar.tsx` | 点击 → `onClearSearch()` | 只有 value 非空时显示 |
| 卡片尺寸控制 | `.card-size-control` | `WorkspaceComponents.tsx` | 修改 → `settings.cardSize` | 影响 `.app-shell[data-card-size]` 下的 grid/card 样式 |
| 操作日志按钮 | `.log-button` | `TopToolbar.tsx` | 切换 `operationLogOpen` | 显示日志数量 badge |
| 快捷键按钮 | `.shortcut-button` | `TopToolbar.tsx` | 打开 `ShortcutSettingsDialog` | 目前用于展示快捷键 / 站点权限说明 |
| 主题按钮 | `.theme-button` | `TopToolbar.tsx` | light ↔ dark，写 settings | 图标由 `.moon-mark` / `.sun-mark` 表达 |

## FolderHeader 元素

| UI 元素 | selector | 代码文件 | 交互 / 状态 |
|---|---|---|---|
| 当前标题 | `.folder-title-row h2` | `FolderHeader.tsx` | 非搜索显示文件夹名，搜索时显示“搜索结果” |
| 收藏文件夹图标 | `.folder-icon-button` | `FolderHeader.tsx` | disabled，占位功能 |
| 更多文件夹按钮 | `.folder-icon-button` | `FolderHeader.tsx` | 点击 → `handleFolderContextMenu()` |
| 元信息 | `.folder-header-copy p` | `FolderHeader.tsx` | 展示书签数、子文件夹数、更新时间；搜索时展示匹配数 |
| 新建书签按钮 | `.section-action-button` | `FolderHeader.tsx` | 点击 → `openNewBookmarkDraftAtEnd(selectedFolder)` |

## SearchFilterSummary 元素

| UI 元素 | selector | 代码文件 | 交互 |
|---|---|---|---|
| 结果数量 | `.search-filter-summary strong` | `SearchFilterSummary.tsx` | query 或筛选条件存在时显示 |
| 搜索词 chip | `.filter-chip` | `SearchFilterSummary.tsx` | 内含清除按钮 |
| 有备注 chip | `.filter-chip` | `SearchFilterSummary.tsx` | active 时显示，内含清除按钮 |
| 搜索范围切换 | `.summary-scope-switch` | `SearchFilterSummary.tsx` | 搜索时切换全部书签 / 当前文件夹 |
| 清除筛选按钮 | `.link-button` | `SearchFilterSummary.tsx` | 清空 query、备注筛选，并把搜索范围恢复为全部书签 |
| 刷新按钮 | `.summary-icon-button` | `SearchFilterSummary.tsx` | `reload()` 重新读取 bookmarks tree |

## BookmarkCommandBar 元素

| UI 元素 | selector | 代码文件 | 当前状态 |
|---|---|---|---|
| 排序控件 | `.command-select-control` | `BookmarkCommandBar.tsx` | 选择默认顺序、标题 A-Z、最新添加、最早添加 |
| 筛选按钮 | `.command-button` | `BookmarkCommandBar.tsx` | 更多筛选 disabled，占位；label 随当前筛选显示“全部”或“有备注” |
| 有备注 chip | `.command-chip` / `.command-chip.is-active` | `BookmarkCommandBar.tsx` | 点击切换备注筛选 |
| 未读 chip | `.command-chip` | `BookmarkCommandBar.tsx` | disabled，占位 |
| 收藏 chip | `.command-chip` | `BookmarkCommandBar.tsx` | disabled，占位 |
| 打开方式图标按钮 | `.command-icon-button` | `BookmarkCommandBar.tsx` | disabled，占位 |
| 批量操作按钮 | `.command-button.is-active` | `BookmarkCommandBar.tsx` | 点击 → `selection.enter()`；选中态追加 `is-active` |

## FolderStrip 元素

| UI 元素 | selector | 代码文件 | 交互 / 状态 |
|---|---|---|---|
| 标题“子文件夹” | `.folder-strip-heading h3` | `FolderStrip.tsx` | 有直接子文件夹时出现 |
| 查看全部 | `.folder-strip-heading button` | `FolderStrip.tsx` | 超过 6 个时出现，点击后展开全部 |
| 子文件夹卡片 | `.folder-strip-item` | `FolderStrip.tsx` | 点击 → `onSelectFolder(folder.id)` |
| 文件夹图标 | `.folder-strip-icon` | `FolderStrip.tsx` | 固定图标容器，避免长名称挤压 |
| 右箭头 | `.folder-strip-arrow` | `FolderStrip.tsx` | 装饰性提示进入 |

## BookmarkCard 元素

| UI 元素 | selector | 代码文件 | 交互 / 状态 |
|---|---|---|---|
| 卡片根 | `.bookmark-card` | `BookmarkCard.tsx` | click 打开或切换选择；右键打开菜单；可拖拽 |
| 高亮态 | `.is-highlighted` / `.is-highlight-pulse` | `BookmarkCard.tsx` + `styles.css` | deep link 或树内点击后反馈 |
| 批量选择态 | `.is-selectable` / `.is-selected` | `BookmarkCard.tsx` | 选择模式下点击卡片切换选中 |
| 选择 checkbox | `.bookmark-selection-check` | `BookmarkCard.tsx` | 只在 `selectable` 时显示 |
| favicon | `.favicon.site-favicon` | `BookmarkCard.tsx` + `SiteFavicon.tsx` | 使用统一 favicon cache；失败时显示本地字母 fallback，不再直接拼接 Google s2 URL |
| 打开按钮 | `.open-link-button` | `BookmarkCard.tsx` | 停止冒泡，单独打开书签 |
| 更多按钮 | `.more-card-button` | `BookmarkCard.tsx` | 打开书签右键菜单 |
| 标题按钮 | `.inline-edit-title` | `BookmarkCard.tsx` | 普通模式点击进入标题行内编辑 |
| URL 按钮 | `.inline-edit-url` | `BookmarkCard.tsx` | 普通模式点击进入 URL 行内编辑 |
| 备注按钮 | `.inline-edit-note` / `.is-empty` | `BookmarkCard.tsx` | 点击进入备注编辑；空备注显示“添加备注” |
| 行内编辑器 | `.inline-editor input/textarea` | `BookmarkCard.tsx` | blur 自动保存，Esc 取消，Enter 保存 |
| 路径 | `.bookmark-path` | `BookmarkCard.tsx` | 搜索结果中展示所在文件夹路径 |
| 日期 | `.bookmark-card-footer` | `BookmarkCard.tsx` | `dateAdded` 格式化为“添加于：MM/DD” |
| 有备注 chip | `.tag-chip` | `BookmarkCard.tsx` | note 非空时显示 |
| 星标按钮 | `.bookmark-star-button` | `BookmarkCard.tsx` | disabled，占位 |

## RightRail 元素

| 区块 | selector | 代码文件 | 说明 |
|---|---|---|---|
| 最近活动卡 | `.recent-activity-card` | `RightRail.tsx` | 读取 `operationLog` 前 5 条 |
| 查看全部按钮 | `.right-rail-card-heading button` | `RightRail.tsx` | 打开 `OperationLogDrawer` |
| 活动列表 | `.activity-list` | `RightRail.tsx` | 仅本轮会话，不跨会话持久化 |
| 快捷操作卡 | `.quick-actions-card` | `RightRail.tsx` | 新建文件夹真实可用，其它 disabled |
| 新建文件夹 | `.quick-action-list button` | `RightRail.tsx` | 点击 → `openNewFolderDialog(selectedFolder)` |
| 导入 / 导出 / 查重 / 回收站 | `.quick-action-list button[disabled]` | `RightRail.tsx` | 占位 |
| 存储信息 | `.storage-card` | `RightRail.tsx` | 当前只展示本地 metadata 备注数量 |
| 升级空间 | `.storage-action` | `RightRail.tsx` | disabled，占位，不展示假容量 |
