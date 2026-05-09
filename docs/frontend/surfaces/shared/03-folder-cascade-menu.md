# FolderCascadeMenu 共享级联菜单

## 使用位置

| 使用场景 | 调用文件 | 用途 |
|---|---|---|
| 管理页右键移动 | `src/app/workspace/WorkspaceComponents.tsx` + `FolderMoveSubmenuContent.tsx` | 将书签移动到目标文件夹 |
| 保存窗口 / Popup fallback 保存位置 | `src/popup/components/save-location/LocationCascadeOverlay.tsx` | 选择保存文件夹 |
| Popup 设置默认保存位置 | `src/popup/tabs/settings/DefaultFolderMenu.tsx` | 修改 `popupDefaultFolderId` |
| Quick Save 浏览文件夹 | `src/features/quick-save/QuickSaveDialog.tsx` | 浏览 / 选择保存位置 |

## 主要文件

| 文件 | 责任 |
|---|---|
| `src/components/FolderCascadeMenu.tsx` | public wrapper、active path / anchor / portal 编排 |
| `src/components/folder-cascade/FolderCascadeList.tsx` | 当前层级列表容器 |
| `src/components/folder-cascade/FolderCascadeRow.tsx` | 单行 hover / focus / select 行为 |
| `src/components/folder-cascade/FloatingCascadeLayer.tsx` | floating 子级菜单和创建入口 |
| `src/components/folder-cascade/cascadePlacement.ts` | folder flatten、尺寸估算、anchor 和 layer style helper |
| `src/components/folder-cascade/cascadeBehavior.ts` | submenu 延迟关闭与 blur 外部关闭 |
| `src/components/FolderMoveSubmenuContent.tsx` | 管理页移动菜单内容：搜索、最近、所有文件夹 |
| `src/features/context-menu/popupCascadePlacement.ts` | Popup cascade root 定位 |
| `src/features/bookmarks/bookmarkTree.ts` | 文件夹 flatten、路径、高亮、可选判断 |
| `src/features/drag-drop/index.ts` | 管理页移动目标限制 |

## FolderCascadeMenu props 语义

| prop | 说明 |
|---|---|
| `nodes` | 当前级联菜单要展示的 BookmarkNode[] |
| `selectedFolderId` | 当前已选择目标，用于 selected 态 |
| `currentFolderId` | 当前上下文文件夹，用于 current parent 态 |
| `highlightedFolderIds` | 路径高亮 id 列表 |
| `initialActivePathIds` | 初始展开路径 |
| `autoExpandInitialPath` | 是否 mount 后自动展开 initial path |
| `disabledLabel` | 不可选目标文案，例如“不可保存” |
| `density` | 紧凑 / 默认密度 |
| `menuWidth` | 单列宽度 |
| `canSelect(folder)` | 是否可选中 |
| `onSelect(folder)` | 选择目标 |
| `onOpenFolder(folder)` | 打开下一层 / 浏览进入 |
| `onCreateFolder(parentFolder)` | 新建文件夹入口 |
| `renderCreateAction(parentFolder)` | 自定义创建 UI |
| `portalContainer` | 子级 floating cascade 挂载容器 |

## 关键 selector

| selector | 说明 |
|---|---|
| `.context-submenu` | 菜单 panel |
| `.context-submenu.is-floating-cascade` | floating 子级菜单 |
| `.nested-submenu` | 内层子菜单容器 |
| `.move-menu-list` | 菜单列表 |
| `.move-folder-row` | 文件夹行 |
| `.move-folder-row.has-children` | 有子文件夹，显示 chevron |
| `.move-folder-row.is-selected` | 当前选中目标 |
| `.move-folder-row.is-current-parent` | 当前父级 |
| `.move-folder-row.is-path-highlighted` | 当前路径高亮 |
| `.move-folder-button` | 行按钮 |
| `.move-folder-row-trailing` | 右侧 label / chevron |
| `.menu-chevron` | 级联箭头 |
| `.move-menu-note` | disabled label |

## 交互规则

1. Hover 文件夹行时，如果有 children，打开下一列。
2. 有 `initialActivePathIds` 且 `autoExpandInitialPath` 时，初始展开当前路径。
3. `canSelect(folder) === false` 时，行可展示但不能作为目标。
4. 子级菜单使用 floating layer，避免被父容器裁剪。
5. 右侧空间不足时，定位逻辑应允许向左展开。
6. 滚轮优先滚动菜单自身。

## 修改风险

| 改动 | 风险 |
|---|---|
| 改 className | 需要同步 `app/styles.css`、`popup/styles.css`、`contentStyle.ts` |
| 改 hover 延迟 | 可能导致保存窗口位置菜单闪烁或管理页右键菜单难用 |
| 改 portalContainer 默认值 | 可能被 Popup shell / Shadow DOM 裁剪 |
| 改 canSelect 逻辑 | 可能允许保存到不可写根节点 |
| 改菜单宽度 | Popup placement 和 nested placement 都要回归 |

## 四入口回归清单

### 管理页右键移动

- 右键书签 → 移动到 → 最近位置 / 搜索 / 所有文件夹均可用。
- 长文件夹名不挤歪文件夹图标。
- hover 多级菜单不会被主页面裁剪。
- 不可移动到自身非法目标。

### 保存窗口 / Popup fallback 保存位置

- 箭头打开级联菜单。
- 当前路径自动展开并高亮。
- 选择目标后路径行更新。
- 新建文件夹入口能打开原位创建行。

### Settings 默认保存位置

- 点击 / focus “更改”打开菜单。
- 选择后 settings 保存并关闭菜单。
- hover 离开延迟关闭不闪。

### Quick Save

- 浏览文件夹中 cascade 可打开子级。
- Shadow DOM 内样式完整。
- 子级 floating layer 不跑出可视范围。
