# 管理页组件说明与代码关联

## `App`

- 文件：`src/app/App.tsx`
- 角色：管理页总控组件。
- 持有：搜索、拖拽、高亮、右键菜单、弹窗、操作日志、最近文件夹、展开文件夹、toast、settings、metadata、selection。
- 依赖：`useBookmarks()`、`useMetadata()`、`useSettings()`、`useSelectionState()`。
- 写操作：`bookmarksAdapter.create/update/move/remove`、`updateNote()`、`saveRecentFolder()`、`updateSettings()`。

关键职责：

```text
读取书签树 → 推导当前文件夹 / 搜索结果 / 子文件夹 / 统计
处理用户动作 → 调用 adapter / feature → reload 或 updateTree
反馈结果 → toast + operationLog + highlight
渲染页面 → sidebar + manager-main + right-rail + overlays
```

## `FolderTree`

- 文件：`src/components/FolderTree.tsx`
- 作用：左侧树渲染、文件夹选择、展开折叠、树内书签显示、拖拽接收、文件夹重命名。
- 传入状态：`nodes`、`selectedFolderId`、`expandedFolderIds`、`showBookmarksInTree`、`renamingFolderId`、drag snapshots。
- 回调：`onSelectFolder`、`onToggleFolder`、`onSelectBookmark`、`onDropBookmark`、`onDropFolder`、`onFolderContextMenu`。
- 样式：`.folder-tree`、`.tree-row`、`.folder-row`、`.bookmark-row`、`.tree-caret`、`.folder-rename-editor`。

维护重点：

- 树内书签开启后，书签 row 也能拖拽。
- 文件夹 row 的拖拽区分中部 drop-in 与上下边缘 reorder。
- 自动滚动和滚轮滚动不能被外层布局截断。

## `TopToolbar`

- 文件：`src/app/workspace/components/TopToolbar.tsx`
- 子组件：`BreadcrumbNav`、`SearchBar`、`CardSizeControl`。
- 作用：管理页顶部导航与全局控制。
- 所有事件通过 props 回到 `App.tsx`，不直接访问存储。

## `FolderHeader`

- 文件：`src/app/workspace/components/FolderHeader.tsx`
- 作用：展示当前文件夹 / 搜索结果概览。
- 真实操作：新建书签、打开文件夹更多菜单。
- 占位：收藏文件夹。

## `BookmarkCommandBar`

- 文件：`src/app/workspace/components/BookmarkCommandBar.tsx`
- 作用：承接未来排序、筛选、结构化管理功能。
- 当前真实操作：进入批量操作模式。
- 当前 disabled：排序、筛选、有备注、未读、收藏、打开方式设置。

维护建议：

新增真实排序 / 筛选时，不要把状态塞进组件内部；应在 `App.tsx` 或 `workspaceSelectors.ts` 增加统一筛选状态与 selector。

## `FolderStrip`

- 文件：`src/app/workspace/components/FolderStrip.tsx`
- 作用：展示当前文件夹的直接子文件夹。
- 数据：`getDirectFolders(selectedFolder)`。
- 统计：`getFolderStats(folder)`。
- 折叠规则：默认最多 6 个，点击“查看全部”后展示全部。

## `WorkspaceContent`

- 文件：`src/app/workspace/WorkspaceContent.tsx`
- 作用：中央书签网格容器。
- 渲染分支：loading skeleton / error / empty state / new bookmark draft / bookmark cards。
- 重要 props：`selectionMode`、`selectedBookmarkIds`、`activeBookmarkDropIntent`、`displayedBookmarks`。

卡片数据来源：

```text
普通模式：selectedBookmarks.map(bookmark → { bookmark })
搜索模式：searchResults.map(result → { bookmark, folderPath })
```

因此搜索模式不能执行“同文件夹重排”。

## `BookmarkCard`

- 文件：`src/components/BookmarkCard.tsx`
- 作用：书签实体的主要 UI 表达。
- 内部状态：`editingTitle`、`editingUrl`、`editingNote`、`titleValue`、`urlValue`、`noteValue`。
- 保存机制：行内编辑器 blur 自动保存；Esc 取消；Enter 保存。
- 外部回调：`onSaveTitle`、`onSaveUrl`、`onSaveNote`。

运行效果：

- 普通模式点击卡片打开 URL。
- 批量模式点击卡片切换选中。
- 点击打开 icon 只打开链接，不触发行内编辑。
- 点击更多 icon 调用同一 `onContextMenu`，定位由 `getContextMenuPlacement()` 决定。

## `SelectionActionBar`

- 文件：`src/app/workspace/components/SelectionActionBar.tsx`
- 作用：批量选择后的操作条。
- 当前真实操作：删除。
- 删除链路：点击删除 → `handleDeleteSelectedBookmarks()` → confirm → 逐个 `bookmarksAdapter.remove()` → `reload()` → `selection.clear()` → `operationLog`。
- 当前限制：批量删除不可撤回。

## `RightRail`

- 文件：`src/app/workspace/components/RightRail.tsx`
- 作用：辅助操作和状态面板。
- 最近活动：从 `operationLog` 读取，非持久化。
- 快捷操作：只有新建文件夹是真实可用，其它均 disabled。
- 存储信息：只展示 `metadata.bookmarkMetadata` 中有备注的数量。

## `WorkspaceComponents`

- 文件：`src/app/workspace/WorkspaceComponents.tsx`
- 包含：
  - `CardSizeControl`
  - `EmptyState`
  - `OperationLogDrawer`
  - `BookmarkContextMenu`
  - `FolderContextMenu`
  - `FolderPickerDialog`
  - `NewBookmarkDraftCard`
  - `NewFolderDialog`
  - `ShortcutSettingsDialog`
  - `Toast`

维护重点：这是一个历史聚合文件，体量较大。后续若拆分，建议按 `dialogs/`、`menus/`、`feedback/` 三类拆，不要边改业务边大规模搬迁。
