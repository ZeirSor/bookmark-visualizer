# 移动菜单「最近使用文件夹」改造分析

## 1. 目标效果

右键某个书签 → 悬停「移动」后，右侧子菜单不再只显示「搜索文件夹...」和完整文件夹树，而是形成更清晰的三段结构：

1. 顶部：`搜索文件夹...`，继续打开现有的搜索移动弹窗。
2. 中部：`最近使用`，展示 3–5 个最近保存或移动过的文件夹。
3. 底部：`所有文件夹`，继续使用当前的级联文件夹树。

这对应新的 UI 预览图：菜单宽度更大、层级更明确，最近文件夹使用轻量图标和紧凑行高，完整文件夹树放在分隔线下方。

## 2. 当前代码现状

### 2.1 右键移动菜单入口已经存在

当前右键菜单在：

- `src/app/workspace/WorkspaceComponents.tsx:138-292`

其中：

- `BookmarkContextMenu` 负责渲染书签右键菜单。
- `src/app/workspace/WorkspaceComponents.tsx:246-279` 是「移动」子菜单。
- `src/app/workspace/WorkspaceComponents.tsx:263-270` 是现有的 `搜索文件夹...` 按钮。
- `src/app/workspace/WorkspaceComponents.tsx:271-278` 调用本文件内部的 `MoveFolderMenu`。
- `src/app/workspace/WorkspaceComponents.tsx:350-377` 的 `MoveFolderMenu` 只是对 `FolderCascadeMenu` 的一层薄包装。

由此推导：新增「最近使用」不应该直接塞进 `FolderCascadeMenu`，因为当前 `FolderCascadeMenu` 的职责是“渲染级联文件夹树”，不是“组织移动菜单的完整信息架构”。

### 2.2 级联菜单组件可继续复用

当前完整文件夹树来自：

- `src/components/FolderCascadeMenu.tsx`

它已经处理了：

- 多级文件夹展开。
- 当前文件夹禁用。
- 悬停延迟关闭。
- 子菜单定位与视口边界修正。
- portal 渲染浮层。

这个组件应该保持为底层树形选择器，不建议在里面硬编码 `最近使用`、`搜索文件夹...`、`所有文件夹` 这些业务段落。否则 Popup 保存、Quick Save、设置页等复用场景都会被污染。

### 2.3 最近文件夹数据已经有，但命名偏窄

现有最近文件夹状态在：

- `src/features/quick-save/uiState.ts`

当前存储结构：

```ts
const QUICK_SAVE_UI_STATE_KEY = "bookmarkVisualizerQuickSaveUiState";

export interface QuickSaveUiState {
  uiStateVersion: 1;
  recentFolderIds: string[];
}
```

它已经具备：

- 去重。
- 截断到 5 个。
- 持久化到 `chrome.storage.local`。

但问题是：这个模块名字叫 `quick-save`，语义上只属于快捷保存。现在「右键移动」也要使用最近文件夹，如果继续从 `quick-save` 里直接 import，会出现长期维护上的命名污染：移动菜单依赖快捷保存模块，未来继续扩展会越来越难解释。

### 2.4 Popup 保存页已经消费最近文件夹

相关位置：

- `src/popup/PopupApp.tsx:43-45` 保存 `recentFolderIds` 与 `selectedFolderId`。
- `src/popup/PopupApp.tsx:78-85` 把 `recentFolderIds` 转成 `recentFolders`。
- `src/popup/PopupApp.tsx:181-190` 保存成功后把当前文件夹放到最近列表前面。
- `src/popup/tabs/SaveTab.tsx:229-251` 渲染 `最近使用` chips。
- `src/features/quick-save/QuickSaveDialog.tsx:333-348` Quick Save 浮框也有最近使用区。

因此，这次不应该重新做一套“移动菜单专属最近文件夹”，而应该把“最近文件夹”抽成跨入口共享能力。

## 3. 推荐架构

### 3.1 新增共享模块：`features/recent-folders`

建议新增：

```txt
src/features/recent-folders/
  index.ts
  recentFolders.ts
  recentFolders.test.ts
```

这个模块只关心一件事：维护最近使用的文件夹 ID 列表，并把 ID 解析成可展示的 `FolderOption`。

推荐导出：

```ts
export interface RecentFolderState {
  version: 1;
  folderIds: string[];
}

export async function loadRecentFolderState(): Promise<RecentFolderState>;
export async function saveRecentFolder(folderId: string): Promise<RecentFolderState>;
export function normalizeRecentFolderIds(folderIds: string[], limit?: number): string[];
export function filterRecentFolderIds(
  folderIds: string[],
  canUseFolder: (folderId: string) => boolean,
  limit?: number
): string[];
export function resolveRecentFolderOptions(
  folderOptions: FolderOption[],
  folderIds: string[],
  limit?: number
): FolderOption[];
```

长期好处：Popup 保存、Quick Save、右键移动都可以依赖同一个语义正确的模块。

### 3.2 兼容旧存储 Key

现有用户数据在：

```txt
bookmarkVisualizerQuickSaveUiState
```

新模块建议使用：

```txt
bookmarkVisualizerRecentFolders
```

为了不丢失用户已经积累的最近文件夹，`loadRecentFolderState()` 第一次读取不到新 Key 时，应从旧 Key 迁移：

```ts
const RECENT_FOLDERS_KEY = "bookmarkVisualizerRecentFolders";
const LEGACY_QUICK_SAVE_UI_STATE_KEY = "bookmarkVisualizerQuickSaveUiState";
```

迁移策略：

1. 先读新 Key。
2. 如果新 Key 不存在或没有有效 `folderIds`，读取旧 Key 的 `recentFolderIds`。
3. 规范化后写入新 Key。
4. 不必立即删除旧 Key，避免回滚版本时数据断层。

### 3.3 新增移动菜单组合组件

建议新增：

```txt
src/components/FolderMoveSubmenuContent.tsx
```

它负责右键移动子菜单内部结构：

```txt
搜索文件夹...

最近使用
  AI 工具
  设计灵感
  稍后阅读

所有文件夹
  FolderCascadeMenu
```

这个组件组合 `FolderCascadeMenu`，但不修改 `FolderCascadeMenu` 本体。

组件职责边界：

- `FolderMoveSubmenuContent`：业务信息架构 + 最近文件夹展示。
- `FolderCascadeMenu`：纯级联树选择。
- `App.tsx`：加载、保存最近文件夹状态。
- `WorkspaceComponents.tsx`：只负责右键菜单布局与事件传递。

## 4. 数据流设计

推荐数据流：

```txt
chrome.storage.local
  ↓ loadRecentFolderState()
App.tsx recentFolderIds state
  ↓ map folderIds → FolderOption[]
BookmarkContextMenu
  ↓
FolderMoveSubmenuContent
  ↓ click recent folder / click cascade folder
moveBookmarkWithUndo()
  ↓ move success
saveRecentFolder(folder.id)
```

关键点：

- 存储层只保存 `folderId`，不要保存完整 folder node，避免书签树重命名、删除、移动后产生陈旧数据。
- 每次展示前用当前书签树解析 folderId，解析不到的自动过滤。
- 对当前书签所在父文件夹，不展示为可点击的最近目标；因为 `canMoveBookmarkToFolder()` 已经会判断当前父文件夹不可移动。
- 保存最近文件夹失败不应影响书签移动成功；它只是 UI 辅助状态。

## 5. 不建议的实现方式

不要这样做：

1. 不要把 `最近使用` 写死在 `FolderCascadeMenu.tsx`。这会污染 Popup、Quick Save、设置页等所有级联树使用场景。
2. 不要在 `WorkspaceComponents.tsx` 继续堆本地小组件。这个文件已经承担右键菜单、弹窗、Toast、操作日志等职责，应逐步减负。
3. 不要在 `App.tsx` 里手写最近文件夹去重逻辑。去重、截断、迁移应由 `features/recent-folders` 负责。
4. 不要只在 Popup 保存时更新最近文件夹。右键移动、搜索移动、新建并移动成功后也应该进入最近列表。

## 6. 推荐分阶段

本次改造建议分 3 个阶段：

1. 先抽共享最近文件夹模块，保证数据层干净。
2. 再做右键移动子菜单 UI，不影响现有移动能力。
3. 最后补齐交互、测试与样式验收。

这个顺序可以避免“先堆 UI，后面再返工数据结构”的问题。
