# 右键菜单“移动”功能实现说明

## 目标与范围

右侧书签卡片的右键菜单提供“移动”入口，用于把当前书签移动到浏览器原生书签树中的另一个文件夹。该功能由右键菜单、文件夹级联选择器、上下文菜单定位工具、书签移动服务和样式契约共同组成。

本文说明当前 React 工作台内的右键“移动”功能，同时也是快捷保存“保存位置”级联菜单的主要代码参考。快捷保存运行在 content script 和 Shadow DOM 中，但其多级级联展开、定位和关闭缓冲应复用同一套共享组件与辅助函数，避免两套分叉实现。

## 用户交互流程

1. 用户在右侧书签卡片上打开右键菜单。
2. `BookmarkContextMenu` 展示菜单项：编辑、前后新建书签、移动、删除。
3. 鼠标悬浮或键盘聚焦“移动”菜单项时，根级移动子菜单打开。
4. 根级移动子菜单顶部显示“搜索文件夹...”入口，用于打开搜索式文件夹选择器。
5. 根级移动子菜单下方渲染 `FolderCascadeMenu`，展示书签树中的可用文件夹。
6. 鼠标悬浮有子文件夹或可新建入口的文件夹行时，级联组件打开下一层浮动菜单。
7. 点击一个可移动文件夹时，当前书签移动到该文件夹。
8. 在某个父文件夹的子菜单中点击“新建文件夹...”时，打开新建文件夹对话框；创建成功后会把当前书签移动到新文件夹。

重要语义：

- 悬浮文件夹表示展开下一层。
- 点击可移动文件夹表示移动到该文件夹。
- 当前所在文件夹是无意义移动目标，因此不可选择，但如果它有子文件夹，仍然必须可展开。

## 模块与代码位置

| 模块 | 路径 | 职责 |
| --- | --- | --- |
| 右键菜单入口 | `src/app/App.tsx` | 定义 `BookmarkContextMenu`、`MoveFolderMenu`、根级移动菜单定位和关闭缓冲。 |
| 级联菜单组件 | `src/components/FolderCascadeMenu.tsx` | 渲染文件夹级联列表，维护打开路径，创建 fixed 浮动子菜单。 |
| 菜单定位与状态辅助 | `src/features/context-menu/index.ts` | 提供右键菜单定位、级联菜单定位、级联路径和按钮 class 辅助函数。 |
| 样式 | `src/app/styles.css` | 定义右键菜单、根级移动子菜单、浮动级联层、文件夹行按钮和滚动行为。 |
| 移动合法性 | `src/features/drag-drop/index.ts` | 通过 `canMoveBookmarkToFolder()` 判断目标文件夹是否合法。 |
| 书签树工具 | `src/features/bookmarks/bookmarkTree.ts` | 提供 `isFolder()`、`getDisplayTitle()` 等树节点工具。 |
| Chrome adapter | `src/lib/chrome/bookmarksAdapter.ts` | 封装真实 `chrome.bookmarks.move()` 与 dev mock 移动逻辑。 |
| 单元测试 | `src/features/context-menu/contextMenu.test.ts` | 覆盖定位、级联路径、禁用可展开行和样式 class 契约。 |

## 入口：`BookmarkContextMenu`

右键菜单由 `BookmarkContextMenu` 负责渲染。它接收当前右键状态、完整书签树，以及编辑、移动、新建、删除等回调。

关键输入：

- `state.bookmark`：当前右键操作的书签。
- `tree`：完整书签树，用于生成移动目标。
- `onMove(bookmark, folder)`：用户点击目标文件夹后的移动回调。
- `onCreateFolder(bookmark, parentFolder)`：用户在某个父文件夹下新建目标文件夹的回调。
- `onSearchMove(bookmark)`：打开搜索式文件夹选择器。
- `onClose()`：关闭右键菜单。

核心结构简化如下：

```tsx
function BookmarkContextMenu({ state, tree, onMove, onCreateFolder, onSearchMove, onClose }) {
  const snapshot = createDraggedBookmarkSnapshot(state.bookmark);

  return (
    <div className="context-menu-layer" onClick={onClose}>
      <div className="context-menu-panel" role="menu">
        <button>编辑</button>
        <button>在前面新建书签</button>
        <button>在后面新建书签</button>

        <div className="context-menu-item has-submenu">
          <span>移动</span>
          <div className="context-submenu move-submenu">
            <button className="move-folder-search">搜索文件夹...</button>
            <MoveFolderMenu
              nodes={tree}
              snapshot={snapshot}
              onMove={(folder) => onMove(state.bookmark, folder)}
              onCreateFolder={(parentFolder) => onCreateFolder(state.bookmark, parentFolder)}
            />
          </div>
        </div>

        <button className="is-danger">删除</button>
      </div>
    </div>
  );
}
```

实际代码还包含关闭缓冲、根级移动子菜单定位和浮动级联层保活逻辑。

## 根级移动子菜单

根级“移动”菜单仍然是右键菜单内部的 `context-submenu move-submenu`。它不是 portal 浮层，因为它直接挂在“移动”这一行下面，依赖父级右键菜单定位即可。

根级移动菜单的打开由 `BookmarkContextMenu` 内的 `moveMenuOpen` 控制：

- `positionMoveSubmenu()`：悬浮或聚焦“移动”时调用，打开根级菜单并重新计算位置。
- `keepMoveCascadeOpen()`：鼠标进入级联菜单或其浮动子层时调用，取消关闭计时器。
- `scheduleMoveCascadeClose()`：鼠标离开级联路径时调用，延迟关闭根级菜单和右键菜单。
- `CONTEXT_MENU_CLOSE_DELAY_MS = 320`：关闭缓冲时间，允许鼠标跨过父子菜单之间的间隙。

根级移动菜单的定位使用 `positionNestedSubmenu()`：

```ts
function positionNestedSubmenu(trigger: HTMLElement | null, submenu: HTMLElement | null) {
  const placement = getCascadeMenuPlacement(
    trigger.getBoundingClientRect(),
    { width: window.innerWidth, height: window.innerHeight },
    { width, height }
  );

  trigger.classList.add(`opens-${placement.submenuDirection}`);
  trigger.classList.add(`opens-${placement.submenuBlockDirection}`);
  submenu.style.maxHeight = `${placement.maxHeight}px`;
  submenu.style.overflowY = placement.needsScroll ? "auto" : "visible";
  submenu.style.overflowX = "hidden";
}
```

这里会根据窗口空间选择向左或向右、向上或向下展开，并在高度不足时给当前层启用垂直滚动。

## `MoveFolderMenu`

`MoveFolderMenu` 是 `BookmarkContextMenu` 和 `FolderCascadeMenu` 之间的薄适配层。它不自己渲染文件夹列表，只负责把书签移动语义传入级联组件。

它传入的关键参数：

- `nodes={tree}`：完整书签树。
- `currentFolderId={snapshot.parentId}`：当前书签所在文件夹，用于标记“当前位置”。
- `disabledLabel="不可移动"`：不可选目标的提示文本。
- `canSelect={(folder) => canMoveBookmarkToFolder(snapshot, folder)}`：判断目标文件夹是否可作为移动目标。
- `onSelect={onMove}`：点击可选文件夹时触发真实移动流程。
- `onCreateFolder={onCreateFolder}`：在目标父文件夹下新建文件夹。
- `onCascadeEnter` / `onCascadeLeave`：通知根级右键菜单保持打开或开始关闭。

## Cascader 组件结构

级联组件位于 `src/components/FolderCascadeMenu.tsx`，对外暴露 `FolderCascadeMenu`。

### Props

```ts
interface FolderCascadeMenuProps {
  nodes: BookmarkNode[];
  selectedFolderId?: string;
  currentFolderId?: string;
  disabledLabel?: string;
  onSelect(folder: BookmarkNode): void;
  canSelect(folder: BookmarkNode): boolean;
  onCreateFolder?(parentFolder: BookmarkNode): void;
  onCascadeEnter?(): void;
  onCascadeLeave?(): void;
}
```

参数含义：

- `nodes`：当前可用的书签树节点。组件内部会过滤出文件夹。
- `selectedFolderId`：用于其它选择场景的选中态，移动菜单通常不需要。
- `currentFolderId`：当前书签所在文件夹，显示“当前位置”并禁用无意义移动。
- `disabledLabel`：不可移动状态文案。
- `onSelect`：点击可选文件夹时调用。
- `canSelect`：由外部业务决定文件夹能否选择，组件只负责展示和触发。
- `onCreateFolder`：存在时，每个子菜单底部显示“新建文件夹...”。
- `onCascadeEnter` / `onCascadeLeave`：与外层右键菜单协调关闭缓冲。

### 内部组件

`FolderCascadeMenu` 内部拆成几个局部组件和工具函数：

| 名称 | 类型 | 职责 |
| --- | --- | --- |
| `FolderCascadeMenu` | exported component | 管理顶层数据、打开路径、浮层列表、窗口尺寸和 portal 渲染。 |
| `FolderCascadeList` | internal component | 渲染当前层的文件夹行列表，并处理进入、离开、滚轮阻止冒泡。 |
| `FolderCascadeRow` | internal component | 渲染单个文件夹按钮，处理悬浮/聚焦展开与点击选择。 |
| `FloatingCascadeLayer` | internal component | 渲染一个 fixed 子菜单浮层，测量自身尺寸并汇报给父组件。 |
| `getMenuFolders()` | helper | 过滤文件夹，并跳过浏览器根节点。 |
| `buildFolderMap()` | helper | 建立 `folderId -> folder` 映射，用于根据 `activePath` 找节点。 |
| `estimateLayerSize()` | helper | 在真实 DOM 尺寸可用前估算子菜单尺寸。 |
| `getFloatingLayerStyle()` | helper | 把定位结果转换为 React inline style。 |

## Cascader 状态模型

`FolderCascadeMenu` 使用受控的 `activePath` 表示当前打开路径。

示例：

```ts
activePath = ["1", "10", "108"];
```

含义是：

1. 第一层打开文件夹 `1` 的子菜单。
2. 第二层打开文件夹 `10` 的子菜单。
3. 第三层打开文件夹 `108` 的子菜单。

进入某个文件夹行时，组件会调用：

```ts
setActivePath(getCascadePathOnRowEnter(parentPath, folder.id, hasSubmenu));
```

`getCascadePathOnRowEnter()` 的规则：

- 如果该行有子菜单，返回 `parentPath + folderId`。
- 如果该行没有子菜单，只保留 `parentPath`，从而清掉更深层分支。
- 当用户从文件夹 1 快速移动到文件夹 2 时，新的 `parentPath` 会替换旧路径，旧分支立即消失，不等待 320ms。

这个模型解决了旧实现中每一行各自维护 hover、focus 和 timer，导致多个旧子菜单残留的问题。

## 浮动子菜单渲染

旧版子菜单是内联递归 DOM：

```text
parent menu
  row
    submenu
      row
        submenu
```

当某一层菜单需要垂直滚动时，浏览器会让子级 absolute 菜单受到父级 overflow 约束，容易产生裁剪、横向滚动条和“必须往右拖才能看到”的现象。

当前实现改为：

```text
context menu layer
  root move submenu

document.body
  floating submenu level 1
  floating submenu level 2
  floating submenu level 3
```

`FolderCascadeMenu` 使用 `createPortal(..., document.body)` 渲染 `FloatingCascadeLayer`。每一层子菜单都是 fixed 浮层，不再是滚动父菜单的后代，因此不会被父层 overflow 裁剪。

浮层列表由 `activePath` 派生：

```ts
const layers = activePath.flatMap((folderId, index) => {
  const folder = folderMap.get(folderId);
  const anchor = anchors[folderId];
  const size = menuSizes[folderId] ?? estimateLayerSize(folder, Boolean(onCreateFolder));
  const placement = getCascadeMenuPlacement(anchor, viewport, size);

  return [{ folder, path: activePath.slice(0, index + 1), placement }];
});
```

每层浮层会：

- 使用对应行的 `getBoundingClientRect()` 作为锚点。
- 使用自身测量尺寸或估算尺寸作为菜单大小。
- 使用 `getCascadeMenuPlacement()` 计算固定坐标。
- 按 `zIndex={31 + index}` 递增层级。
- 在高度不足时启用 `overflowY: auto`。
- 始终保持 `overflowX: hidden`，避免横向滚动条。

## 菜单定位工具

定位逻辑集中在 `src/features/context-menu/index.ts`。

### `getContextMenuPlacement()`

用于右键菜单本体定位。它接收鼠标点击点、视口尺寸、菜单尺寸和子菜单尺寸，输出：

```ts
interface ContextMenuPlacement extends ContextMenuPoint {
  submenuDirection: "left" | "right";
  submenuBlockDirection: "up" | "down";
}
```

作用：

- 把右键菜单限制在 viewport 内。
- 预判子菜单应向左还是向右。
- 预判子菜单应向上还是向下。

### `getCascadeMenuPlacement()`

用于根级移动子菜单和所有浮动子菜单定位。它接收触发行矩形、视口尺寸和菜单尺寸，输出：

```ts
interface CascadeMenuPlacement extends ContextMenuPoint {
  maxHeight: number;
  needsScroll: boolean;
  submenuDirection: "left" | "right";
  submenuBlockDirection: "up" | "down";
}
```

作用：

- 子菜单尽量贴着触发行展开。
- 右侧空间不足且左侧更合适时向左打开。
- 下方空间不足且上方更合适时向上打开。
- 两个方向都无法完整显示时，计算 `maxHeight` 并启用内部垂直滚动。
- 固定 `x` / `y` 坐标会被限制在 viewport 内，避免需要横向滚动。

### `getCascadeRowBehavior()`

用于把业务可选状态转换成行渲染状态：

```ts
interface CascadeRowBehavior {
  hasSubmenu: boolean;
  buttonDisabled: boolean;
  canSelect: boolean;
}
```

关键规则：

- `hasSubmenu = nestedFolderCount > 0 || canCreateFolder`。
- 如果文件夹不可选择但有子菜单，按钮不能 disabled，否则无法聚焦和展开。
- `canSelect` 只控制点击是否触发移动。

### `getCascadeButtonClassName()`

用于确保 portal 浮层中的文件夹按钮不依赖父级 `.context-menu-panel button` 样式。

```ts
export const CASCADE_ROW_BUTTON_CLASS = "move-folder-button";

export function getCascadeButtonClassName(extraClassName?: string): string {
  return [CASCADE_ROW_BUTTON_CLASS, extraClassName].filter(Boolean).join(" ");
}
```

这个辅助函数是样式回归保护点：无论按钮渲染在右键菜单内部还是 `document.body` 下，都必须显式带有 `move-folder-button`。

## 样式结构

样式位于 `src/app/styles.css`，相关 class 可分为五组。

### 右键菜单层

- `.context-menu-layer`：全屏 fixed 层，承载右键菜单。
- `.context-menu-panel`：右键菜单面板，固定宽度、白色背景、边框、阴影。
- `.context-menu-panel button`：右键菜单根层按钮样式。
- `.context-menu-item`：带子菜单的菜单行，例如“移动”。
- `.has-submenu.is-open > .context-submenu`：受控打开根级移动子菜单。

### 根级移动子菜单

- `.context-submenu`：通用子菜单基础样式。
- `.move-submenu`：右键“移动”根级子菜单，补充 `overflow-x: hidden`。
- `.move-folder-search`：顶部“搜索文件夹...”入口，使用 accent 色强调。

### 浮动级联层

- `.nested-submenu`：级联子菜单基础类。
- `.context-submenu.is-floating-cascade`：fixed 浮层状态。
- `.context-submenu.is-floating-cascade.opens-left` / `opens-right` / `opens-up` / `opens-down`：清理 absolute 时代遗留方向属性，保证 fixed 坐标生效。

### 文件夹行

- `.move-menu-list`：当前层文件夹列表，grid 排列。
- `.move-folder-row`：单个文件夹行容器。
- `.move-folder-row.has-children`：有子菜单或可新建入口的行。
- `.move-folder-row.is-current-parent`：当前书签所在文件夹。
- `.move-folder-row.is-selected`：选择场景中的选中项。

### 文件夹按钮

- `.move-folder-button`：文件夹行按钮的独立样式契约。
- `.move-folder-button:hover` / `:focus-visible`：hover 和键盘焦点。
- `.move-folder-button[aria-disabled="true"]`：不可选择目标。
- `.move-folder-row.has-children .move-folder-button[aria-disabled="true"]`：不可选择但可展开的行，保留 pointer cursor。
- `.move-folder-create`：子菜单底部“新建文件夹...”入口。
- `.move-menu-note`：显示“当前位置”或“不可移动”的辅助标签。
- `.folder-glyph`、`.menu-chevron`：文件夹图标和子菜单箭头。

样式设计要点：

- 浮层按钮不能依赖 `.context-menu-panel button`，因为 portal 子菜单不在 `.context-menu-panel` 内。
- 浮动子菜单的横向滚动始终隐藏。
- 垂直滚动只由定位结果 `needsScroll` 控制。

## 移动执行链路

点击可移动文件夹后的调用链如下：

```text
FolderCascadeRow button onClick
  -> FolderCascadeMenu props.onSelect(folder)
  -> MoveFolderMenu onMove(folder)
  -> BookmarkContextMenu onMove(state.bookmark, folder)
  -> App.handleContextMoveBookmark(bookmark, folder)
  -> moveBookmarkWithUndo(createDraggedBookmarkSnapshot(bookmark), folder)
  -> bookmarksAdapter.move(bookmarkId, { parentId: folder.id })
  -> chrome.bookmarks.move(...)
```

`handleContextMoveBookmark()` 会先关闭右键菜单：

```ts
async function handleContextMoveBookmark(bookmark: BookmarkNode, folder: BookmarkNode) {
  setContextMenu(undefined);
  await moveBookmarkWithUndo(createDraggedBookmarkSnapshot(bookmark), folder);
}
```

`moveBookmarkWithUndo()` 负责：

- 再次校验目标是否合法。
- 调用 `bookmarksAdapter.move()` 执行真实移动。
- 更新本地树状态。
- 记录操作日志。
- 显示 toast。
- 注册撤销操作。

移动失败时会捕获错误并显示可理解的失败提示。

## 新建目标文件夹并移动

如果用户在某个级联层点击“新建文件夹...”，调用链如下：

```text
FloatingCascadeLayer create button
  -> onCreateFolder(layer.folder)
  -> BookmarkContextMenu onCreateFolder(state.bookmark, parentFolder)
  -> App.openNewFolderDialog(parentFolder, bookmark)
  -> NewFolderDialog submit
  -> bookmarksAdapter.create({ parentId, title })
  -> moveBookmarkWithUndo(bookmark, createdFolder)
```

该流程的语义是：新建文件夹属于真实 `chrome.bookmarks.create()` 操作；若本次新建由“移动”入口触发，创建成功后再把当前书签移动到新文件夹。

撤销策略：

- 移动撤销会恢复书签原位置。
- 新建的文件夹不会因为撤销移动而自动删除。

## 配置项与常量

右键“移动”功能没有单独的用户配置项，也不新增 Manifest 权限或 storage schema。它依赖以下工程级常量和配置。

| 名称 | 位置 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `CONTEXT_MENU_CLOSE_DELAY_MS` | `src/app/App.tsx` | `320` | 右键菜单和根级移动菜单关闭缓冲。 |
| `CASCADE_SUBMENU_CLOSE_DELAY_MS` | `src/components/FolderCascadeMenu.tsx` | `320` | 级联子菜单关闭缓冲。 |
| `FLOATING_CASCADE_WIDTH` | `src/components/FolderCascadeMenu.tsx` | `260` | 浮动级联层估算宽度。 |
| `FLOATING_CASCADE_MIN_HEIGHT` | `src/components/FolderCascadeMenu.tsx` | `180` | 浮动级联层估算最小高度。 |
| `FLOATING_CASCADE_ROW_HEIGHT` | `src/components/FolderCascadeMenu.tsx` | `34` | 估算菜单内容高度时使用的单行高度。 |
| `FLOATING_CASCADE_PADDING` | `src/components/FolderCascadeMenu.tsx` | `12` | 估算菜单高度时加入的内边距。 |
| `EDGE_GAP` | `src/features/context-menu/index.ts` | `12` | 菜单与视口边缘的最小间距。 |
| `SUBMENU_GAP` | `src/features/context-menu/index.ts` | `6` | 子菜单与触发行之间的间距。 |
| `MIN_CASCADE_HEIGHT` | `src/features/context-menu/index.ts` | `140` | 级联层允许的最小可滚动高度。 |
| `CASCADE_ROW_BUTTON_CLASS` | `src/features/context-menu/index.ts` | `move-folder-button` | portal 浮层按钮的独立样式 class。 |

权限依赖：

- `chrome.bookmarks` 权限来自 Manifest V3 配置，用于读取和移动浏览器原生书签。
- 右键“移动”本身不需要 host permissions、tabs、scripting 或 storage 权限。

运行环境：

- 普通 Vite dev 环境中没有真实 `chrome.bookmarks` 时，`bookmarksAdapter` 使用 mock 书签树。
- 扩展运行环境中，`bookmarksAdapter.move()` 调用真实 `chrome.bookmarks.move()`。

## 测试覆盖

相关测试位于 `src/features/context-menu/contextMenu.test.ts`。

当前覆盖点：

- 右键菜单在视口内定位。
- 子菜单靠近右边缘时向左打开。
- 子菜单靠近底部时向上打开。
- 空间足够时向右、向下打开。
- 浮动级联层贴着触发行展开。
- 空间不足时启用内部垂直滚动。
- 固定坐标被限制在 viewport 内，避免横向滚动。
- 进入兄弟文件夹时替换旧打开路径。
- 进入子文件夹时保留祖先路径。
- 进入叶子行时清掉更深层分支。
- 当前文件夹不可移动但仍可展开子文件夹。
- 级联按钮拥有独立 `move-folder-button` class，避免 portal 后样式回退。

推荐手动验收：

1. 使用包含大量同级文件夹和至少三层子文件夹的书签树。
2. 右键任意书签卡片并悬浮“移动”。
3. 快速在多个同级文件夹之间移动鼠标，确认旧子菜单立即消失。
4. 连续展开父级、子级、孙级，确认每一层贴着触发行展开。
5. 窗口靠右或靠下时确认菜单自动向左或向上展开。
6. 长列表只出现垂直滚动，不出现横向滚动。
7. 子菜单中的文件夹行保持完整样式，不回退成浏览器默认按钮。
8. 点击可移动文件夹后，书签移动并显示撤销提示。

## 维护约定

- 不要把浮动子菜单改回滚动容器内的递归 inline DOM；这会重新引入裁剪和横向滚动问题。
- 不要让 portal 浮层依赖父级选择器，例如 `.context-menu-panel button`。
- 新增文件夹行按钮样式时，应优先扩展 `.move-folder-button`，而不是写宽泛的 `.context-submenu button`。
- 修改定位规则时，应同步更新 `contextMenu.test.ts` 中的边界测试。
- 修改点击或悬浮语义时，应同步更新 `docs/06-interactions.md` 和本文档。
