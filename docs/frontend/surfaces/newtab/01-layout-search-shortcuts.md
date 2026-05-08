# New Tab UI 细节：搜索、快捷方式与分组

## Header

| UI 元素 | selector | 代码文件 | 行为 |
|---|---|---|---|
| 根 header | `.nt-header` | `NewTabApp.tsx` | sticky 顶部 |
| 品牌区域 | `.nt-brand-compact` | `NewTabApp.tsx` | icon + Bookmark Visualizer + 新标签页 pill |
| logo | `.nt-brand-mark` | `NewTabApp.tsx` | `icons/icon-48.png` |
| 品牌文字 | `.nt-brand-copy strong` | `NewTabApp.tsx` | 主品牌使用英文，避免抢搜索语义 |
| 页面 pill | `.nt-page-pill` | `NewTabApp.tsx` | “新标签页” |
| 打开管理页 icon | `.nt-icon-button` | `NewTabApp.tsx` | 点击 `openWorkspace()` |
| 主导航 | `.nt-main-nav` | `NewTabApp.tsx` | 搜索 / 管理 / 设置 |
| 搜索 nav | `.nt-main-nav button.is-active` | `NewTabApp.tsx` | focus `.nt-search-box input` |
| 管理 nav | `.nt-main-nav button` | `NewTabApp.tsx` | openWorkspace |
| 设置 nav | `.nt-main-nav button` | `NewTabApp.tsx` | 打开 CustomizeLayoutPanel |

## SearchPanel

文件：`src/newtab/components/SearchPanel.tsx`

### UI 元素

| UI 元素 | selector | 行为 |
|---|---|---|
| 搜索 hero | `.nt-search-hero` | 主视觉区域 |
| 搜索框 | `.nt-search-box input` | 输入 query，Enter 打开首个建议或网络搜索 |
| 搜索 leading icon | `.nt-search-leading-icon` | 左侧图标 |
| 引擎选择 | `.nt-engine-select select` | 写入 `settings.newTabDefaultSearchEngineId` |
| 分类 chips | `.nt-category-chips button` / `.is-active` | 写入 `settings.newTabDefaultSearchCategory` |
| 提交按钮 | `.nt-search-submit` | 执行当前 query |
| 建议面板 | `.nt-suggestion-panel` | query 非空时出现 |
| 建议 section | `.nt-suggestion-section` | 按类型分组展示 |
| 搜索输入行 | `.nt-search-row` | 搜索框、引擎选择和提交按钮所在布局行；不是建议项 |
| 建议项 | `.nt-suggestion-item` / `.nt-suggestion-item.is-active` | 点击打开 bookmark / url / web-search；folder 类型切换 activeFolder |
| 建议 tag | `.nt-suggestion-tag` | 本地书签 / 文件夹 / 网络搜索 / 固定 |
| footer | `.nt-search-overlay-footer` | 操作提示 |

### 数据链路

```text
SearchPanel query state
  → createMixedSearchSuggestions({ tree, query, engineId, category, shortcuts })
  → suggestions
  → 用户点击/Enter
  → useNewTabActions.handleOpenSuggestion(suggestion)
```

### 建议类型

| 类型 | 来源 | 行为 |
|---|---|---|
| `url` | `isProbablyUrl(query)` | 直接打开 normalized URL |
| `bookmark` | `searchBookmarks(tree, query)` | 打开本地书签 URL，记录 visited activity |
| `folder` | `flattenFolders(tree)` | 设置 activeFolderId，不跳页 |
| `web-search` | `buildSearchUrl(engineId, category, query)` | 打开搜索引擎结果页 |

## PinnedShortcutGrid

文件：`src/newtab/components/NewTabSections.tsx`

| UI 元素 | selector | 行为 |
|---|---|---|
| section | `.nt-panel.nt-shortcut-panel` | 快速访问卡片区 |
| heading | `.nt-section-heading.compact` | 标题带 `PinIcon` |
| 编辑按钮 | `.nt-ghost-button` | 打开 `ShortcutDialog` |
| grid | `.nt-shortcut-grid` | CSS var `--nt-shortcut-cols` 控制列数 |
| tile | `.nt-shortcut-tile` | 快捷方式卡片 |
| 主按钮 | `.nt-shortcut-main` | 点击打开 URL；Ctrl/Cmd 点击新标签 |
| icon wrap | `.nt-shortcut-icon-wrap` | 图标容器 |
| dismiss | `.nt-tile-dismiss` | 隐藏 / 移除 shortcut |
| 添加网站 tile | `.nt-add-shortcut` | 打开添加对话框 |

快捷方式来源：

```text
state.pinnedShortcuts
  + usageStats 前 12
  + 最新书签前 12
  + DEFAULT_SHORTCUTS
  - hiddenShortcutUrls
  → deriveShortcutViewModels()
```

## BookmarkGroupStrip

| UI 元素 | selector | 行为 |
|---|---|---|
| section | `.nt-panel.nt-folder-panel` | 书签分组 |
| strip | `.nt-folder-strip` | 横向卡片流 |
| chip | `.nt-folder-chip.is-purple/blue/green/orange/gray` | 点击选择，双击打开管理页对应文件夹 |
| icon | `.nt-folder-icon` | 文件夹图标 |
| title/meta | `.nt-folder-main` | 标题 + 描述 |
| count | `.nt-folder-count` | 书签数 |

分组来源：`deriveNewTabViewModel()` → `deriveFolderCards()`。

## FolderPreviewPanel

显示条件：`layoutMode === sidebar`，或 `layoutMode === tabs && activeContentTab === "folders"`。

| UI | selector | 说明 |
|---|---|---|
| panel | `.nt-folder-preview-panel` | 当前 active folder 预览 |
| 查看全部 | `.nt-ghost-button` | 打开 `index.html?folderId=...` |
| preview grid | `.nt-preview-grid` | 最多 4 个书签预览 |
| preview card | `.nt-preview-card` | 点击打开书签 |

## FeaturedBookmarkRow

- selector：`.nt-panel.nt-featured-panel`、`.nt-featured-row`、`.nt-row-favicon`。
- 数据：active folder 的直接书签，最多 8 个。
- 点击记录 activity 并打开 URL。

## Right Rail

| 组件 | selector | 行为 |
|---|---|---|
| RecentActivityPanel | `.nt-side-panel`、`.nt-activity-list` | 打开最近活动 URL |
| QuickActionsPanel | `.nt-action-list` | 管理页 / 新建书签 / 导入 HTML / 自定义布局 |
| StorageUsageMiniCard | `.nt-storage-card`、`.nt-storage-track` | 本地存储说明，不展示假配额 |

## Dialog / Drawer

| 组件 | selector | 说明 |
|---|---|---|
| CustomizeLayoutPanel | `.nt-customize-drawer`、`.nt-drawer-backdrop` | 修改 New Tab 显示选项和布局偏好 |
| ShortcutDialog | `.nt-shortcut-dialog`、`.nt-dialog-actions` | 添加自定义 shortcut |
| toast | `.nt-toast` | 2600ms 自动消失 |
