# UI 元素索引

## 全局按钮规范

| 类型 | 使用位置 | 规则 |
|---|---|---|
| 主按钮 | 保存、确认创建 | 只用于最终提交动作 |
| 次按钮 | 取消、关闭、轻操作 | 白底 / 灰边 / hover 浅主色 |
| icon-only | 打开管理页、清除、更多、主题、箭头 | 必须有 `aria-label` 和 `title` |
| disabled 占位 | 排序、筛选、导入导出、云空间、星标 | 必须弱化，并带 `title="即将支持"` 或类似说明 |
| danger | 删除 | 使用 danger 色，删除前确认 |

## 管理页元素索引

| 元素 | 文件 | selector |
|---|---|---|
| 显示树内书签 | `src/app/App.tsx` | `.tree-toggle input` |
| 展开 / 收起全部 | `src/app/App.tsx` | `.tree-toolbar button` |
| 侧栏 resize | `src/app/App.tsx` | `.resize-handle` |
| 面包屑 | `BreadcrumbNav.tsx` | `.breadcrumb-separator` |
| 搜索框 | `SearchBar.tsx` | `.search-bar` |
| 清除搜索 | `SearchBar.tsx` | `.search-clear-button` |
| 卡片尺寸 | `WorkspaceComponents.tsx` | `.card-size-control` |
| 操作日志 | `TopToolbar.tsx` | `.log-button` |
| 快捷键 | `TopToolbar.tsx` | `.shortcut-button` |
| 主题 | `TopToolbar.tsx` | `.theme-button` |
| 新建书签 | `FolderHeader.tsx` | `.section-action-button` |
| 文件夹更多 | `FolderHeader.tsx` | `.folder-icon-button` |
| 命令栏排序 | `BookmarkCommandBar.tsx` | `.command-button` |
| 批量操作 | `BookmarkCommandBar.tsx` | `.command-button.is-active` |
| 批量删除 | `SelectionActionBar.tsx` | `.selection-actions .is-danger` |
| 子文件夹卡片 | `FolderStrip.tsx` | `.folder-strip-item` |
| 书签卡片 | `BookmarkCard.tsx` | `.bookmark-card` |
| 书签打开 | `BookmarkCard.tsx` | `.open-link-button` |
| 更多菜单 | `BookmarkCard.tsx` | `.more-card-button` |
| 行内编辑标题 | `BookmarkCard.tsx` | `.inline-edit-title` |
| 行内编辑 URL | `BookmarkCard.tsx` | `.inline-edit-url` |
| 行内编辑备注 | `BookmarkCard.tsx` | `.inline-edit-note` |
| 星标占位 | `BookmarkCard.tsx` | `.bookmark-star-button` |
| 右侧新建文件夹 | `RightRail.tsx` | `.quick-action-list button` |
| 云空间占位 | `RightRail.tsx` | `.storage-action` |

## Popup 元素索引

| 元素 | 文件 | selector |
|---|---|---|
| 打开管理页 | `PopupApp.tsx` | `.icon-button` |
| Tab 保存 / 管理 / 设置 | `TabButton.tsx` | `.popup-tabs button` |
| 页面预览 | `PagePreviewCard.tsx` | `.page-preview` |
| 标题 input | `SaveTab.tsx` | `.field-stack input` |
| URL readonly | `SaveTab.tsx` | `.url-input` |
| 备注 textarea | `SaveTab.tsx` | `.note-field textarea` |
| 保存位置路径 | `LocationPathRow.tsx` | `.location-path-row` |
| 保存位置箭头 | `LocationPathRow.tsx` | `.location-arrow-button` |
| 文件夹搜索 | `FolderSearchRow.tsx` | `.folder-search input` |
| 文件夹搜索清除 | `FolderSearchRow.tsx` | `.folder-search-clear` |
| 新建文件夹开关 | `FolderSearchRow.tsx` | `.location-create-button` |
| 新建文件夹输入 | `InlineCreateFolderRow.tsx` | `.create-folder-row input` |
| 新建确认 | `InlineCreateFolderRow.tsx` | `.create-action` |
| 最近位置 | `RecentFolderChips.tsx` | `.recent-chips button` |
| 保存按钮 | `PopupFooter.tsx` | `.primary-action` |
| 取消按钮 | `PopupFooter.tsx` | `.secondary-action` |
| Settings switch | `SettingsTab.tsx` | `.switch-row input` |
| Settings select | `SettingsTab.tsx` | `.select-row select` |
| 默认位置更改 | `SettingsTab.tsx` | `.secondary-action.small` |

## New Tab 元素索引

| 元素 | 文件 | selector |
|---|---|---|
| Header | `NewTabApp.tsx` | `.nt-header` |
| 打开管理页 icon | `NewTabApp.tsx` | `.nt-icon-button` |
| 主导航搜索 | `NewTabApp.tsx` | `.nt-main-nav button.is-active` |
| 搜索 hero | `SearchPanel.tsx` | `.nt-search-hero` |
| 搜索 input | `SearchPanel.tsx` | `.nt-search-box input` |
| 搜索引擎 select | `SearchPanel.tsx` | `.nt-engine-select select` |
| 分类 chip | `SearchPanel.tsx` | `.nt-category-chips button` |
| 搜索提交 | `SearchPanel.tsx` | `.nt-search-submit` |
| 搜索建议 | `SearchPanel.tsx` | `.nt-suggestion-panel` |
| 快速访问 tile | `NewTabSections.tsx` | `.nt-shortcut-tile` |
| 添加网站 | `NewTabSections.tsx` | `.nt-add-shortcut` |
| 隐藏 shortcut | `NewTabSections.tsx` | `.nt-tile-dismiss` |
| 文件夹 chip | `NewTabSections.tsx` | `.nt-folder-chip` |
| 精选书签 | `NewTabSections.tsx` | `.nt-featured-row button` |
| 最近活动 | `NewTabSections.tsx` | `.nt-activity-list button` |
| 快捷操作 | `NewTabSections.tsx` | `.nt-action-list button` |
| 自定义抽屉 | `CustomizeLayoutPanel.tsx` | `.nt-customize-drawer` |
| 添加 shortcut 对话框 | `ShortcutDialog.tsx` | `.nt-shortcut-dialog` |

## Quick Save 元素索引

| 元素 | 文件 | selector |
|---|---|---|
| Overlay | `QuickSaveDialog.tsx` | `.quick-save-layer` |
| Dialog | `QuickSaveDialog.tsx` | `.quick-save-dialog` |
| Close | `QuickSaveDialog.tsx` | `.secondary-button` |
| Preview | `QuickSaveDialog.tsx` | `.preview-image` |
| 标题 input | `QuickSaveDialog.tsx` | `.detail-fields input` |
| URL readonly | `QuickSaveDialog.tsx` | `.detail-fields input[readOnly]` |
| 备注 textarea | `QuickSaveDialog.tsx` | `.detail-fields textarea` |
| 保存位置搜索 | `QuickSaveDialog.tsx` | `.search-box input` |
| 搜索结果 | `QuickSaveDialog.tsx` | `.folder-result` |
| 最近文件夹 | `QuickSaveDialog.tsx` | `.recent-folders button` |
| 浏览路径 | `QuickSaveDialog.tsx` | `.folder-breadcrumb` |
| 浏览列表 | `QuickSaveDialog.tsx` | `.browse-list` |
| 新建文件夹 | `QuickSaveDialog.tsx` | `.create-folder-link` / `.create-folder-form` |
| 状态 | `QuickSaveDialog.tsx` | `.status` |
| 保存按钮 | `QuickSaveDialog.tsx` | `.primary-button` |
