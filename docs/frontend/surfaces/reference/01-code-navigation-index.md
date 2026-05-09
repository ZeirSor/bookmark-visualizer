# 代码导航索引

## Entry / build

| 文件 | 说明 |
|---|---|
| `index.html` | 完整管理页 HTML entry |
| `popup.html` | Toolbar popup HTML entry；由 `action.default_popup` 指向 |
| `save.html` | Legacy save-window HTML entry；当前不由 toolbar 主路径打开 |
| `newtab.html` | New Tab Portal HTML entry；通过 runtime redirect 条件打开 |
| `public/manifest.json` | MV3 manifest、popup、service worker、commands、permissions |
| `vite.config.ts` | 多入口构建 + Quick Save content script esbuild bundle |
| `src/main.tsx` | 管理页 React mount |
| `src/save-window/main.tsx` | Save window React mount |
| `src/popup/main.tsx` | Popup React mount |
| `src/newtab/main.tsx` | New Tab React mount |
| `src/service-worker.ts` | service worker build entry，调用 `registerServiceWorker()` |

## Manager

| 文件 | 说明 |
|---|---|
| `src/app/App.tsx` | 管理页主控：数据加载、settings、metadata、拖拽、菜单、弹窗、操作日志 |
| `src/app/styles.css` | 管理页样式 |
| `src/app/workspace/WorkspaceContent.tsx` | 中央书签卡片内容、空状态、搜索结果 |
| `src/app/workspace/WorkspaceComponents.tsx` | dialogs / menus / toast / drawer / draft card 等局部组件 |
| `src/app/workspace/components/TopToolbar.tsx` | 顶部工具条 |
| `src/app/workspace/components/FolderHeader.tsx` | 当前文件夹头部 |
| `src/app/workspace/components/BookmarkCommandBar.tsx` | 命令栏 |
| `src/app/workspace/components/FolderStrip.tsx` | 子文件夹条 |
| `src/app/workspace/components/SearchFilterSummary.tsx` | 搜索摘要 |
| `src/app/workspace/components/SelectionActionBar.tsx` | 批量选择条 |
| `src/app/workspace/components/RightRail.tsx` | 右侧辅助栏 |
| `src/app/workspace/hooks/useSelectionState.ts` | 批量选择状态 |
| `src/app/workspace/hooks/useRecentFolders.ts` | 最近文件夹读取与记忆 |
| `src/app/workspace/hooks/useExpandedFolders.ts` | 文件夹树展开状态 |
| `src/app/workspace/hooks/useOperationLog.ts` | 操作日志和撤销状态 |
| `src/app/workspace/hooks/useWorkspaceDeepLink.ts` | URL folder/bookmark deep link |
| `src/app/workspace/hooks/useWorkspaceDragDrop.ts` | 管理页拖拽瞬时状态 |
| `src/app/workspace/selectors/workspaceSelectors.ts` | 子文件夹、统计、选中书签和更新时间 selector |
| `src/app/workspace/helpers.ts` | 管理页 helper |
| `src/app/workspace/types.ts` | 管理页类型 |

## Popup

| 文件 | 说明 |
|---|---|
| `src/save-window/SaveWindowApp.tsx` | Legacy 保存页入口，解析 source tab query 并复用 PopupApp |
| `src/popup/PopupApp.tsx` | Toolbar Popup 主控：tab、settings、initial state、保存状态 |
| `src/popup/hooks/usePopupBootstrap.ts` | 初始加载、settings、source tab 当前页、书签树和 footer 状态 |
| `src/popup/hooks/usePopupSaveState.ts` | 保存表单瞬时状态 |
| `src/popup/hooks/usePopupSaveActions.ts` | 保存、新建文件夹、settings 写入 |
| `src/popup/styles.css` | Popup 样式 |
| `src/popup/tabs/SaveTab.tsx` | 保存 Tab |
| `src/popup/tabs/ManageTab.tsx` | 管理 Tab |
| `src/popup/tabs/SettingsTab.tsx` | 设置 Tab |
| `src/popup/tabs/settings/SettingsRows.tsx` | Settings switch/select 行 |
| `src/popup/tabs/settings/DefaultFolderMenu.tsx` | 默认保存位置内联 picker |
| `src/popup/components/PagePreviewCard.tsx` | 页面预览卡 |
| `src/popup/components/PopupFooter.tsx` | 保存 footer |
| `src/popup/components/SaveLocationPicker.tsx` | 保存位置组合控件 |
| `src/popup/components/TabButton.tsx` | Popup Tab button |
| `src/popup/components/PopupIcons.tsx` | Popup 图标 |
| `src/components/folder-picker/InlineFolderPicker.tsx` | 共享内联保存位置 picker |
| `src/components/folder-picker/FolderSearchInput.tsx` | 共享文件夹搜索输入 |
| `src/components/folder-picker/FolderTree.tsx` | 共享文件夹树 |
| `src/popup/components/save-location/InlineCreateFolderRow.tsx` | 原位新建文件夹 |
| `src/popup/components/save-location/LocationCascadeOverlay.tsx` | Legacy 保存位置级联菜单 overlay |
| `src/popup/components/save-location/LocationPathRow.tsx` | 当前保存位置路径行 |
| `src/popup/components/save-location/RecentFolderChips.tsx` | 最近位置 chips |
| `src/features/popup/popupClient.ts` | Popup 与 tabs / scripting / runtime message 的交互 helper |
| `src/features/popup/saveSource.ts` | 当前 tab / legacy source tab query 解析 |
| `src/features/popup/tabDetails.ts` | 当前页详情 normalize、page kind 和 URL 可保存 / 可注入判断 |
| `src/features/popup/popupViewModels.ts` | Popup view model 推导 |

## New Tab

| 文件 | 说明 |
|---|---|
| `src/newtab/NewTabApp.tsx` | New Tab 主控 |
| `src/newtab/hooks/useNewTabBootstrap.ts` | New Tab settings/tree/state/activity bootstrap |
| `src/newtab/hooks/useNewTabActions.ts` | New Tab 打开、记录、shortcut、settings actions |
| `src/newtab/styles.css` | New Tab 样式 |
| `src/newtab/components/SearchPanel.tsx` | 搜索 hero 和建议；`.nt-search-row` 是搜索输入行，`.nt-suggestion-item` 是建议项 |
| `src/newtab/components/NewTabSections.tsx` | 快捷方式、分组、精选、右侧面板 |
| `src/newtab/components/NewTabModeTabs.tsx` | tabs 布局内容分区 |
| `src/newtab/components/NewTabSidebar.tsx` | sidebar 布局左侧文件夹栏 |
| `src/newtab/components/CustomizeLayoutPanel.tsx` | 自定义布局抽屉 |
| `src/newtab/components/ShortcutDialog.tsx` | 添加快捷方式对话框 |
| `src/features/newtab/newTabRedirect.ts` | New Tab runtime redirect |
| `src/features/newtab/newTabState.ts` | New Tab 持久化状态 |
| `src/features/newtab/activity.ts` | 最近活动与使用统计 |
| `src/features/newtab/searchEngines.ts` | 搜索引擎与分类 |
| `src/features/newtab/mixedSearch.ts` | 本地书签 + 网络搜索混合建议 |
| `src/features/newtab/newTabViewModel.ts` | New Tab view model 推导 |
| `src/features/newtab/navigation.ts` | New Tab 打开 URL / 工作台 helper |
| `src/features/newtab/shortcuts.ts` | 快捷方式推导 |

## Quick Save

| 文件 | 说明 |
|---|---|
| `src/features/quick-save/content.tsx` | 内容脚本入口，创建 Shadow DOM host |
| `src/features/quick-save/QuickSaveDialog.tsx` | Quick Save UI |
| `src/features/quick-save/hooks/useQuickSaveInitialState.ts` | 初始状态读取 |
| `src/features/quick-save/hooks/useQuickSaveFolderBrowser.ts` | 文件夹搜索、浏览、最近和创建状态 |
| `src/features/quick-save/hooks/useQuickSaveFormState.ts` | 标题、备注、预览 fallback、保存状态 |
| `src/features/quick-save/components/FolderBreadcrumb.tsx` | 浏览路径面包屑 |
| `src/features/quick-save/components/CreateFolderAction.tsx` | Quick Save 新建文件夹入口 |
| `src/features/quick-save/focusTrap.ts` | Shadow DOM 焦点限制 |
| `src/features/quick-save/contentStyle.ts` | Shadow DOM CSS |
| `src/features/quick-save/pageDetails.ts` | 页面信息提取 |
| `src/features/quick-save/createFolder.ts` | 创建文件夹 helper |
| `src/features/quick-save/folders.ts` | 文件夹 helper |
| `src/features/quick-save/shortcutAccess.ts` | 快捷保存可用性判断 |
| `src/features/quick-save/uiState.ts` | Quick Save recent folder facade，底层使用 shared recent-folders |
| `src/features/quick-save/types.ts` | 消息协议类型 |

## Background

| 文件 | 说明 |
|---|---|
| `src/service-worker.ts` | 构建入口，只导入并执行 `registerServiceWorker()` |
| `src/background/serviceWorker.ts` | 聚合注册：message router、New Tab redirect |
| `src/background/saveWindow.ts` | Legacy 独立保存窗口 helper |
| `src/background/commandHandlers.ts` | Legacy `open-quick-save` command helper；当前不由 service worker 注册 |
| `src/background/messageRouter.ts` | runtime message 总路由 |
| `src/background/quickSaveHandlers.ts` | Popup / Quick Save / legacy 保存请求处理，创建书签 / 文件夹 / metadata / recent folder |
| `src/background/openWorkspace.ts` | 打开完整管理页并携带 fallback 参数 |

## Shared / features

| 文件 | 说明 |
|---|---|
| `src/components/BookmarkCard.tsx` | 管理页书签卡片 |
| `src/components/SiteFavicon.tsx` | 共享网站 favicon primitive，消费 favicon feature cache |
| `src/components/FolderTree.tsx` | 管理页左侧树 |
| `src/components/FolderCascadeMenu.tsx` | 共享级联菜单 |
| `src/components/folder-tree/*` | FolderTree 内部节点、书签行、重命名、drop helper、auto-scroll |
| `src/components/folder-cascade/*` | FolderCascadeMenu 内部 list / row / layer / placement / behavior |
| `src/components/FolderMoveSubmenuContent.tsx` | 移动子菜单内容 |
| `src/components/SearchBar.tsx` | 管理页搜索框 |
| `src/components/icons/*` | 管理页 / Popup / 菜单图标 |
| `src/features/bookmarks/bookmarkTree.ts` | 书签树纯函数 |
| `src/features/bookmarks/useBookmarks.ts` | 管理页书签树 hook |
| `src/features/search/searchBookmarks.ts` | 全局书签搜索 |
| `src/features/drag-drop/index.ts` | 拖拽规则和 snapshot |
| `src/features/context-menu/index.ts` | 右键菜单定位 |
| `src/features/context-menu/popupCascadePlacement.ts` | Popup 级联根定位 |
| `src/features/settings/settingsService.ts` | settings 读写和 normalize |
| `src/features/metadata/metadataService.ts` | 备注 / 元数据存储 |
| `src/features/metadata/useMetadata.ts` | 管理页备注 hook |
| `src/features/favicon/*` | favicon URL 归一化、IndexedDB cache、`_favicon` resolver 和 React hook |
| `src/features/recent-folders/recentFolders.ts` | 最近文件夹共享存储 |
| `src/features/import-export/*` | 导入导出基础能力；当前部分 UI 仍为 disabled 占位 |
| `src/lib/chrome/*` | Chrome API adapter |
