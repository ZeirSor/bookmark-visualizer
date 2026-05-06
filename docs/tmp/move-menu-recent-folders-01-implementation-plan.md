# 移动菜单「最近使用文件夹」代码修改方案

## 阶段一：抽取共享最近文件夹模块

### 1. 新增目录

新增：

```txt
src/features/recent-folders/
  index.ts
  recentFolders.ts
  recentFolders.test.ts
```

### 2. 新增 `src/features/recent-folders/recentFolders.ts`

核心职责：保存、读取、规范化最近文件夹 ID。

建议结构：

```ts
import { storageAdapter } from "../../lib/chrome";
import type { FolderOption } from "../bookmarks";

const RECENT_FOLDERS_KEY = "bookmarkVisualizerRecentFolders";
const LEGACY_QUICK_SAVE_UI_STATE_KEY = "bookmarkVisualizerQuickSaveUiState";
const MAX_RECENT_FOLDERS = 5;

interface LegacyQuickSaveUiState {
  uiStateVersion?: number;
  recentFolderIds?: string[];
}

export interface RecentFolderState {
  version: 1;
  folderIds: string[];
}

export const defaultRecentFolderState: RecentFolderState = {
  version: 1,
  folderIds: []
};
```

建议实现这些函数：

```ts
export async function loadRecentFolderState(): Promise<RecentFolderState>;
export async function saveRecentFolder(folderId: string): Promise<RecentFolderState>;
export function normalizeRecentFolderIds(folderIds: string[], limit = MAX_RECENT_FOLDERS): string[];
export function filterRecentFolderIds(
  folderIds: string[],
  canUseFolder: (folderId: string) => boolean,
  limit = MAX_RECENT_FOLDERS
): string[];
export function resolveRecentFolderOptions(
  folderOptions: FolderOption[],
  folderIds: string[],
  limit = MAX_RECENT_FOLDERS
): FolderOption[];
```

`saveRecentFolder()` 逻辑：

```ts
const state = await loadRecentFolderState();
const folderIds = normalizeRecentFolderIds([folderId, ...state.folderIds]);
const nextState = { version: 1, folderIds } satisfies RecentFolderState;
await storageAdapter.set({ [RECENT_FOLDERS_KEY]: nextState });
return nextState;
```

`loadRecentFolderState()` 逻辑：

```ts
const result = await storageAdapter.get<{
  [RECENT_FOLDERS_KEY]: RecentFolderState;
  [LEGACY_QUICK_SAVE_UI_STATE_KEY]?: LegacyQuickSaveUiState;
}>({
  [RECENT_FOLDERS_KEY]: defaultRecentFolderState,
  [LEGACY_QUICK_SAVE_UI_STATE_KEY]: undefined
});
```

然后：

- 如果新 Key 有有效 `folderIds`，直接返回新状态。
- 否则读取旧 Key 的 `recentFolderIds`。
- 迁移得到的结果写入 `RECENT_FOLDERS_KEY`。

### 3. 新增 `src/features/recent-folders/index.ts`

```ts
export * from "./recentFolders";
```

### 4. 改造 `src/features/quick-save/uiState.ts`

当前文件：

- `src/features/quick-save/uiState.ts:1-69`

不要继续在这里维护第二套去重逻辑。改成兼容层：

```ts
import {
  filterRecentFolderIds,
  loadRecentFolderState,
  saveRecentFolder
} from "../recent-folders";

export interface QuickSaveUiState {
  uiStateVersion: 1;
  recentFolderIds: string[];
}

export const defaultQuickSaveUiState: QuickSaveUiState = {
  uiStateVersion: 1,
  recentFolderIds: []
};

export async function loadQuickSaveUiState(): Promise<QuickSaveUiState> {
  const state = await loadRecentFolderState();
  return {
    uiStateVersion: 1,
    recentFolderIds: state.folderIds
  };
}

export async function saveQuickSaveRecentFolder(folderId: string): Promise<QuickSaveUiState> {
  const state = await saveRecentFolder(folderId);
  return {
    uiStateVersion: 1,
    recentFolderIds: state.folderIds
  };
}

export { filterRecentFolderIds };
```

这样现有 Quick Save 代码不用一次性大改，同时新功能可以直接 import `features/recent-folders`。

### 5. 新增测试 `src/features/recent-folders/recentFolders.test.ts`

参考现有：

- `src/features/quick-save/uiState.test.ts`

测试点：

1. 默认读取为空数组。
2. 保存最近文件夹时去重，并把最新的放到第一位。
3. 最多保留 5 个。
4. 过滤不存在或不可用的文件夹。
5. 可从旧 `bookmarkVisualizerQuickSaveUiState` 迁移。

原 `src/features/quick-save/uiState.test.ts` 可以保留，但应改为验证兼容层仍返回 `recentFolderIds`。

---

## 阶段二：新增移动子菜单组合组件

### 1. 新增文件

新增：

```txt
src/components/FolderMoveSubmenuContent.tsx
```

### 2. 组件 Props

建议：

```ts
import { FolderCascadeMenu } from "./FolderCascadeMenu";
import type { BookmarkNode, FolderOption } from "../features/bookmarks";
import { canMoveBookmarkToFolder, type DraggedBookmarkSnapshot } from "../features/drag-drop";

interface FolderMoveSubmenuContentProps {
  nodes: BookmarkNode[];
  recentFolders: FolderOption[];
  snapshot: DraggedBookmarkSnapshot;
  onSearch(): void;
  onMove(folder: BookmarkNode): void;
  onCreateFolder(parentFolder: BookmarkNode): void;
  onCascadeEnter(): void;
  onCascadeLeave(): void;
}
```

### 3. 渲染结构

建议 JSX 信息架构：

```tsx
<div className="move-submenu-content">
  <button className="move-folder-search" type="button" role="menuitem" onClick={onSearch}>
    <span className="move-search-glyph" aria-hidden="true" />
    <span>搜索文件夹...</span>
  </button>

  {usableRecentFolders.length > 0 ? (
    <section className="move-menu-section" aria-label="最近使用文件夹">
      <div className="move-menu-section-title">最近使用</div>
      <div className="move-menu-list">
        {usableRecentFolders.map((option) => (
          <button
            key={option.id}
            className="move-folder-button move-folder-recent"
            type="button"
            role="menuitem"
            onClick={() => onMove(option.node)}
          >
            <span className="recent-folder-glyph" aria-hidden="true" />
            <span className="move-folder-label">
              <span>{option.title}</span>
              <small>{option.path}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  ) : null}

  <div className="move-menu-divider" />

  <section className="move-menu-section" aria-label="所有文件夹">
    <div className="move-menu-section-title">所有文件夹</div>
    <FolderCascadeMenu
      nodes={nodes}
      currentFolderId={snapshot.parentId}
      disabledLabel="不可移动"
      onSelect={onMove}
      canSelect={(folder) => canMoveBookmarkToFolder(snapshot, folder)}
      onCreateFolder={onCreateFolder}
      onCascadeEnter={onCascadeEnter}
      onCascadeLeave={onCascadeLeave}
    />
  </section>
</div>
```

`usableRecentFolders` 应这样计算：

```ts
const usableRecentFolders = recentFolders
  .filter((option) => canMoveBookmarkToFolder(snapshot, option.node))
  .slice(0, 3);
```

说明：

- 当前书签所在父文件夹会被过滤，因为 `canMoveBookmarkToFolder()` 返回 false。
- 被删除、不可写、根节点等无效文件夹不会出现。
- 最近列表只展示 3 个，存储仍保留 5 个，给 Popup 和后续功能使用。

---

## 阶段三：接入 `WorkspaceComponents.tsx`

### 1. 修改 import

当前：

- `src/app/workspace/WorkspaceComponents.tsx:1-23`

删除：

```ts
import { FolderCascadeMenu } from "../../components/FolderCascadeMenu";
```

新增：

```ts
import { FolderMoveSubmenuContent } from "../../components/FolderMoveSubmenuContent";
import type { FolderOption } from "../../features/bookmarks";
```

注意：`FolderPickerDialog` 仍使用 `canMoveBookmarkToFolder()`，所以不要删除 drag-drop 相关 import。

### 2. 扩展 `BookmarkContextMenu` props

当前 props 位置：

- `src/app/workspace/WorkspaceComponents.tsx:138-160`

新增：

```ts
recentFolders: FolderOption[];
```

函数签名：

```ts
export function BookmarkContextMenu({
  state,
  tree,
  recentFolders,
  onClose,
  ...
}: {
  state: BookmarkContextMenuState;
  tree: BookmarkNode[];
  recentFolders: FolderOption[];
  ...
})
```

### 3. 替换移动子菜单内容

当前需要替换：

- `src/app/workspace/WorkspaceComponents.tsx:263-278`

删除现有：

```tsx
<button className="move-folder-search" ...>搜索文件夹...</button>
<MoveFolderMenu ... />
```

替换为：

```tsx
<FolderMoveSubmenuContent
  nodes={tree}
  recentFolders={recentFolders}
  snapshot={snapshot}
  onSearch={() => onSearchMove(state.bookmark)}
  onMove={(folder) => onMove(state.bookmark, folder)}
  onCreateFolder={(parentFolder) => onCreateFolder(state.bookmark, parentFolder)}
  onCascadeEnter={keepMoveCascadeOpen}
  onCascadeLeave={scheduleMoveCascadeClose}
/>
```

### 4. 删除本地 `MoveFolderMenu`

删除：

- `src/app/workspace/WorkspaceComponents.tsx:350-377`

原因：这个本地组件现在会被 `src/components/FolderMoveSubmenuContent.tsx` 取代。

---

## 阶段四：接入 `App.tsx` 数据流

### 1. 修改 import

当前：

- `src/app/App.tsx:1-73`

新增：

```ts
import {
  loadRecentFolderState,
  resolveRecentFolderOptions,
  saveRecentFolder
} from "../features/recent-folders";
```

### 2. 新增状态

当前状态区：

- `src/app/App.tsx:75-110`

建议在 `contextMenu` 附近新增：

```ts
const [recentFolderIds, setRecentFolderIds] = useState<string[]>([]);
```

### 3. 首次加载最近文件夹

在现有 `useEffect` 区域新增：

```ts
useEffect(() => {
  let cancelled = false;

  async function loadRecentFolders() {
    try {
      const state = await loadRecentFolderState();
      if (!cancelled) {
        setRecentFolderIds(state.folderIds);
      }
    } catch {
      // 最近文件夹只是辅助 UI，读取失败不阻塞主界面。
    }
  }

  void loadRecentFolders();
  return () => {
    cancelled = true;
  };
}, []);
```

### 4. 把 ID 解析成 `FolderOption[]`

当前 `useBookmarks()` 已返回 `folders`：

- `src/app/App.tsx:98-110`

新增：

```ts
const recentFolderOptions = useMemo(
  () => resolveRecentFolderOptions(folders, recentFolderIds, 5),
  [folders, recentFolderIds]
);
```

### 5. 传给右键菜单

当前：

- `src/app/App.tsx:399-411`

给 `BookmarkContextMenu` 增加：

```tsx
recentFolders={recentFolderOptions}
```

### 6. 移动成功后写入最近文件夹

当前移动逻辑：

- `src/app/App.tsx:989-992` 的 `handleContextMoveBookmark()`
- `src/app/App.tsx:597-633` 附近的 `moveBookmarkWithUndo()`

推荐不要只在 `handleContextMoveBookmark()` 里写最近记录，而是在 `moveBookmarkWithUndo()` 里统一写。这样拖拽移动、搜索移动、右键移动都会进入最近列表。

在 `moveBookmarkWithUndo()` 成功后、`setToast()` 前后加入：

```ts
await rememberRecentFolder(folder.id);
```

新增 helper：

```ts
async function rememberRecentFolder(folderId: string) {
  try {
    const state = await saveRecentFolder(folderId);
    setRecentFolderIds(state.folderIds);
  } catch {
    // 不影响书签移动结果。
  }
}
```

注意：

- `rememberRecentFolder()` 不应该 throw。
- 撤销移动时不必从最近列表移除；最近使用表示“曾经使用过”，不是当前最终位置。
- `reorderBookmarkWithUndo()` 不应该记录最近文件夹，因为它只是同文件夹内排序。

### 7. 新建并移动的路径

当前：

- `src/app/App.tsx:836-840`：新建文件夹后，如果 `state.bookmarkToMove` 存在，会调用 `moveBookmarkWithUndo()`。

只要阶段四第 6 步把记录逻辑放进 `moveBookmarkWithUndo()`，这里无需额外处理，新建出来的目标文件夹会自动进入最近列表。

---

## 阶段五：样式改造

### 1. 修改主应用样式

当前右键菜单样式在：

- `src/app/styles.css:642-874`

建议只在主应用样式里新增移动子菜单段落样式，不要改 `src/popup/styles.css` 和 `src/features/quick-save/contentStyle.ts`，除非后续要在这些入口复用同一个移动子菜单。

### 2. 调整 `.move-submenu`

当前：

- `src/app/styles.css:763-770`

建议：

```css
.move-submenu {
  width: 292px;
  max-width: 320px;
  padding: 10px;
  overflow-x: hidden;
}
```

### 3. 新增信息分区样式

追加在 `.move-folder-search` 后面或 `.move-menu-list` 前面：

```css
.move-submenu-content {
  display: grid;
  gap: 8px;
}

.move-menu-section {
  display: grid;
  gap: 4px;
}

.move-menu-section-title {
  padding: 2px 8px;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.move-menu-divider {
  height: 1px;
  margin: 2px 2px;
  background: var(--line);
}

.move-folder-recent {
  min-height: 36px;
}

.move-folder-label {
  display: grid;
  min-width: 0;
}

.move-folder-label > span,
.move-folder-label > small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.move-folder-label > small {
  color: var(--muted);
  font-size: 0.68rem;
  font-weight: 600;
}

.recent-folder-glyph {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  border: 1.7px solid var(--accent);
  border-radius: 999px;
  position: relative;
}

.recent-folder-glyph::before {
  content: "";
  position: absolute;
  left: 7px;
  top: 3px;
  width: 1.5px;
  height: 5px;
  background: var(--accent);
  border-radius: 999px;
}

.recent-folder-glyph::after {
  content: "";
  position: absolute;
  left: 7px;
  top: 7px;
  width: 5px;
  height: 1.5px;
  background: var(--accent);
  border-radius: 999px;
}
```

### 4. 搜索按钮视觉

当前：

- `src/app/styles.css:847-850`

建议从“纯文字按钮”改成更像输入入口：

```css
.move-folder-search {
  justify-content: flex-start !important;
  gap: 8px;
  min-height: 36px !important;
  color: var(--muted) !important;
  font-weight: 700;
  background: var(--panel-subtle) !important;
  border: 1px solid var(--line-strong) !important;
}

.move-folder-search:hover,
.move-folder-search:focus-visible {
  color: var(--accent) !important;
  border-color: var(--accent-soft) !important;
}
```

如果不新增 SVG 图标，可以用 CSS 画一个搜索 glyph；如果愿意复用图标，建议后续把 `src/popup/components/PopupIcons.tsx` 中的图标抽到 `src/components/icons.tsx`，避免跨 popup 目录 import。

---

## 阶段六：验证

### 1. 类型检查

```bash
node node_modules/typescript/bin/tsc -b --pretty false
```

当前压缩包内该命令可以通过。

### 2. 测试

项目当前 `npm test` 在解压环境里可能会遇到 `vitest` 权限或 Rollup optional dependency 问题。程序员本地建议先执行：

```bash
npm install
npm test -- --run
```

如果仍遇到 Rollup optional dependency 缺失，删除 `node_modules` 后重新安装：

```bash
rm -rf node_modules package-lock.json
npm install
npm test -- --run
```

### 3. 手动验收

1. 右键任意书签，悬停「移动」。
2. 子菜单顶部显示 `搜索文件夹...`。
3. 如果有历史位置，显示 `最近使用`。
4. 点击最近文件夹后，书签移动成功，Toast 和撤销仍可用。
5. 再次打开菜单，刚才的目标文件夹排在最近列表第一位。
6. 当前所在文件夹不会作为可移动目标出现。
7. `所有文件夹` 仍能展开多级子文件夹。
8. 靠近屏幕右侧或底部时，子菜单仍会自动换方向或滚动，不被窗口截断。
