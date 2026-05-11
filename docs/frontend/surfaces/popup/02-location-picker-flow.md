# Toolbar Popup 保存位置组件链路

## 组件拆分

```text
<SaveLocationPicker>
  <LocationPathRow />          // 当前路径 + arrow button
  <InlineFolderPicker />       // arrow 打开的内联树形选择器
    <FolderSearchInput />      // 搜索
    <FolderTree />             // 树形选择 + 键盘导航
    <InlineCreateFolderRow />  // 新建文件夹
    <RecentFolderChips />      // 最近使用位置
```

## 主要代码文件

| 文件 | 责任 |
|---|---|
| `src/popup/components/SaveLocationPicker.tsx` | 组合保存位置所有状态与互斥逻辑 |
| `src/popup/components/save-location/LocationPathRow.tsx` | 路径展示和箭头按钮 |
| `src/components/folder-picker/InlineFolderPicker.tsx` | 内联 picker、搜索、最近位置、新建入口和键盘导航 |
| `src/components/folder-picker/FolderTree.tsx` | 可见树节点构建和树渲染 |
| `src/components/folder-picker/FolderTreeItem.tsx` | 单个文件夹行、展开按钮、当前项标记 |
| `src/components/folder-picker/FolderSearchInput.tsx` | 搜索输入和清空按钮 |
| `src/popup/components/save-location/InlineCreateFolderRow.tsx` | 新建文件夹输入和 loading |
| `src/popup/components/save-location/RecentFolderChips.tsx` | 最近位置 chip 和展开 |
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
- 箭头按钮 `aria-haspopup`、`aria-expanded` 跟随 `locationMenuOpen`。
- `disabled = loading || !selectedFolderId`。

## InlineFolderPicker

运行链路：

```text
点击 location-arrow-button
  → SaveLocationPicker.openLocationMenu()
  → 关闭 createOpen / 清空 createParentFolderId
  → locationMenuOpen = true
  → InlineFolderPicker 渲染在 location panel 内
  → buildVisibleFolderEntries(tree, expandedIds)
  → FolderTree / search result list
```

关键设计：

- 不使用横向 floating cascade，避免被 toolbar popup 边界裁剪。
- 在 Save Tab 中展开时，`.location-picker-shell > .inline-folder-picker .inline-folder-picker-body` 使用更小的内部滚动高度，避免顶出 footer。
- 初次打开时展开当前选中路径。
- Arrow Up / Down 在可选项之间移动；Arrow Right 展开当前文件夹；Arrow Left 折叠或移动到父级；Enter 选择；Escape 清空搜索或关闭 picker。
- 只允许选择 `canCreateBookmarkInFolder(folder)` 的目标。
- 搜索输入使用 `.folder-search-input`，容器保持 `position: relative`、`width: 100%`、`min-width: 0`，左右 padding 为图标和清空按钮预留空间，避免 placeholder 与图标重叠。
- 旧 overlay re-export 已删除；当前 popup 直接使用 `src/components/folder-picker/InlineFolderPicker.tsx`，避免维护两套实现。

互斥规则：

```text
打开 picker → 关闭新建
输入搜索 → 关闭新建
打开新建 → 清空搜索
选择搜索结果 → 清空搜索，关闭新建，关闭 picker
```

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
  → createFolder() from usePopupSaveActions()
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

- 点击路径文字不会打开 picker；点击箭头才打开。
- Picker 内联显示，不被 Popup 边界裁剪。
- 720×600 popup 中 picker 内部滚动可访问深层文件夹。
- 不可保存文件夹显示 disabled label，不可被选择。
- 搜索输入后结果在 picker 内出现。
- 搜索 Esc 清空 query，再按 Escape 关闭 picker。
- Arrow / Enter 键可在树和搜索结果中选择文件夹。
- 新建文件夹时按钮显示 spinner，输入和取消按钮 disabled。
- 最近位置展开后图标和文字间距稳定，不出现错位。
