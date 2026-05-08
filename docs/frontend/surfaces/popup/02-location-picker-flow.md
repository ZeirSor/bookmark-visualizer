# Popup 保存位置组件链路

## 组件拆分

```text
<SaveLocationPicker>
  <LocationPathRow />          // 当前路径 + arrow button
  <LocationCascadeOverlay />   // arrow 打开的全局级联菜单
  <FolderSearchRow />          // 原位搜索 + 新建按钮
  <FolderSearchResults />      // 搜索结果
  <InlineCreateFolderRow />    // 原位新建文件夹
  <RecentFolderChips />        // 最近使用位置
```

## 主要代码文件

| 文件 | 责任 |
|---|---|
| `src/popup/components/SaveLocationPicker.tsx` | 组合保存位置所有状态与互斥逻辑 |
| `src/popup/components/save-location/LocationPathRow.tsx` | 路径展示和箭头按钮 |
| `src/popup/components/save-location/LocationCascadeOverlay.tsx` | portal 级联菜单定位和关闭 |
| `src/popup/components/save-location/FolderSearchRow.tsx` | 原位搜索框和新建开关 |
| `src/popup/components/save-location/FolderSearchResults.tsx` | 搜索结果列表 |
| `src/popup/components/save-location/InlineCreateFolderRow.tsx` | 新建文件夹输入和 loading |
| `src/popup/components/save-location/RecentFolderChips.tsx` | 最近位置 chip 和展开 |
| `src/components/FolderCascadeMenu.tsx` | 共享级联菜单 |
| `src/features/context-menu/popupCascadePlacement.ts` | Popup 级联根菜单定位 |
| `src/features/bookmarks/bookmarkTree.ts` | 路径、高亮、文件夹过滤 |

## LocationPathRow

| UI 元素 | selector | 说明 |
|---|---|---|
| 根行 | `.location-path-row` | 展示当前保存位置，loading / disabled 时追加 `.is-disabled` |
| 文件夹图标 | `.location-folder-icon` | 左侧固定宽度图标 |
| 路径文本 | `.path-display` | 只读展示，不作为点击目标 |
| 当前 badge | `.current-badge` | loading 完成后显示“当前位置” |
| 箭头按钮 | `.location-arrow-button` / `.is-open` | 唯一触发级联菜单的目标 |

交互规则：

- 路径文本不触发菜单。
- 箭头按钮 `aria-haspopup="menu"`、`aria-expanded` 跟随 `locationMenuOpen`。
- `disabled = loading || !selectedFolderId`。

## LocationCascadeOverlay

运行链路：

```text
点击 location-arrow-button
  → SaveLocationPicker.openLocationMenu()
  → 清空 query / createOpen / createParentFolderId
  → locationMenuOpen = true
  → LocationCascadeOverlay 渲染
  → getPopupCascadeRootPlacement(anchorRect, viewport, options)
  → createPortal(..., document.body)
  → FolderCascadeMenu(nodes=tree, autoExpandInitialPath=true)
```

关键设计：

- 使用 `document.body` portal，避免被 Popup shell 裁剪。
- `POPUP_CASCADE_MENU_WIDTH = 224`，`POPUP_CASCADE_MENU_HEIGHT = 330`。
- 点击外部、Escape、pointer leave 延迟关闭。
- `initialActivePathIds = buildFolderCascadeInitialPathIds(tree, selectedFolderId)`，自动展开当前路径。
- `highlightedFolderIds = buildFolderPathHighlightIds(tree, selectedFolderId)`，当前路径高亮。
- 只允许选择 `canCreateBookmarkInFolder(folder)` 的目标。

## FolderSearchRow

| UI 元素 | selector | 行为 |
|---|---|---|
| 根行 | `.folder-search-row` | 搜索框 + 新建按钮横排 |
| 搜索框 | `.folder-search input` | focus 时关闭 cascade 和 create |
| 搜索图标 | `.folder-search svg` | 装饰 |
| 清除按钮 | `.folder-search-clear` | query 非空时显示，点击清空 |
| 新建按钮 | `.location-create-button` / `.is-active` | 开关 `createOpen`，同时清空 query 和关闭 cascade |

互斥规则：

```text
打开 cascade → 清空搜索，关闭新建
输入搜索 → 关闭 cascade，关闭新建
打开新建 → 清空搜索，关闭 cascade
选择搜索结果 → 清空搜索，关闭新建，关闭 cascade
```

## FolderSearchResults

- selector：`.folder-results`、`.folder-result-main`、`.result-badge`。
- 数据：`PopupApp.searchResults`，由 `filterFolderOptions()` + `rankFolderOption()` 排序后 `.slice(0, 4)`。
- “最佳匹配”条件：第一项且 rank <= 2。
- 选中项追加 `.is-selected`。

## InlineCreateFolderRow

| UI 元素 | selector | 行为 |
|---|---|---|
| 根行 | `.create-folder-row` | 原位显示在保存位置组件内 |
| 文件夹图标 | `.create-folder-icon` | 左侧语义图标 |
| 输入框 | `.create-folder-row input` | mount 后自动 focus；Enter 创建；Esc 取消 |
| 取消按钮 | `.cancel-action` | disabled when creating |
| 确认按钮 | `.create-action` | `!folderName.trim() || creating` 时 disabled |
| spinner | `.button-spinner` | creating 时替代 check icon |

创建链路：

```text
用户输入文件夹名
  → createFolder() in PopupApp
  → createQuickSaveFolder({ parentId, title })
  → background quick save handler / bookmarksAdapter.create
  → 更新 tree / recentFolderIds
  → selectedFolderId = 新文件夹 id
  → 关闭 createOpen，清空 folderName
```

## RecentFolderChips

| UI 元素 | selector | 行为 |
|---|---|---|
| 根 | `.recent-row` | 保存位置底部 |
| 标题行 | `.recent-heading-row` | “最近使用” + “管理位置” |
| 管理位置 | `.text-action` | 打开完整管理页 |
| chips | `.recent-chips` / `.is-expanded` | 默认最多 3 个，展开最多 7 个 |
| 展开按钮 | `.recent-expand-button` | 有超过 3 个时显示 |

## 回归清单

- 点击路径文字不会打开级联菜单；点击箭头才打开。
- 打开级联菜单后，搜索框和新建行关闭。
- 级联菜单不被 Popup 边界裁剪。
- Hover 到二级 / 三级文件夹不会丢失菜单。
- 不可保存文件夹显示 disabled label，不可被选择。
- 搜索输入后级联菜单关闭，结果在原位出现。
- 搜索 Esc 清空 query，不关闭整个 Popup。
- 新建文件夹时按钮显示 spinner，输入和取消按钮 disabled。
- 最近位置展开后图标和文字间距稳定，不出现错位。
