# Popup 保存 Tab 剩余问题修改 Plan

> 目标：针对最新版代码中仍然存在的问题，给出可执行的收尾修改方案。  
> 适用代码包：`bookmark-visualizer (4).zip`  
> 重点文件：`src/popup/PopupApp.tsx`、`src/popup/components/PopupFooter.tsx`、`src/popup/components/SaveLocationPicker.tsx`、`src/popup/components/save-location/*`、`src/popup/styles.css`、`src/features/recent-folders/*`、`src/features/bookmarks/*`

---

## 1. 当前状态判断

最新版已经完成了保存 Tab 的主体重构：

- 保存页已改为左右两列布局。
- 保存位置区域已进入右侧主表单流。
- 保存路径行和箭头按钮已分离。
- 搜索文件夹已改成原位搜索。
- 新建文件夹已改成行内输入。
- 最近使用已支持展开 / 收起。
- recent folders 存储上限已提高到 8。
- Footer 默认快捷键提示已弱化。

剩余问题主要不是大结构问题，而是**状态一致性、交互细节、数据同步、视觉边界**没有完全收尾。

---

## 2. 修改优先级

建议按下面顺序执行：

```text
P0：必须修
1. Footer 只在保存 Tab 显示
2. 搜索框 Esc 先清空搜索，不直接关闭 Popup
3. “最佳匹配”逻辑修正

P1：建议修
4. 搜索聚焦时关闭新建行
5. 新建文件夹后加入最近使用
6. 预览图裁切策略优化

P2：增强项
7. 级联目录内支持“+ 新建文件夹”
8. Footer 状态结构化
9. 保存路径显示策略优化
```

---

# P0-1：Footer 只在保存 Tab 显示

## 问题说明

当前 `PopupFooter` 仍然在 `PopupApp.tsx` 中全局渲染。这样会导致切换到「管理」或「设置」Tab 时，底部仍然显示保存按钮，例如：

```text
取消    保存到 Apply
```

这会造成明显语义错误：管理页 / 设置页并不是保存当前网页的表单。

## 修改目标

- 只有 `activeTab === "save"` 时显示保存 Footer。
- 管理 / 设置 Tab 暂时不显示 Footer。
- 未来如果管理 / 设置需要底部操作区，应分别设计独立 Footer，不复用保存 Footer。

## 修改文件

```text
src/popup/PopupApp.tsx
```

## 推荐改法

将当前无条件渲染：

```tsx
<PopupFooter
  canSave={Boolean(pageDetails?.canSave && selectedFolderId)}
  formId="popup-save-form"
  isError={pageDetails?.canSave === false}
  saving={saving}
  selectedTitle={selectedTitle}
  status={status}
/>
```

改成条件渲染：

```tsx
{activeTab === "save" ? (
  <PopupFooter
    canSave={Boolean(pageDetails?.canSave && selectedFolderId)}
    formId="popup-save-form"
    isError={pageDetails?.canSave === false}
    saving={saving}
    selectedTitle={selectedTitle}
    status={status}
  />
) : null}
```

## 验收标准

- [ ] 保存 Tab 底部显示快捷键、取消、保存按钮。
- [ ] 管理 Tab 不显示「保存到 xxx」按钮。
- [ ] 设置 Tab 不显示「保存到 xxx」按钮。
- [ ] 切换 Tab 不影响保存页已填写内容。

---

# P0-2：搜索框 Esc 优先清空搜索

## 问题说明

当前 `PopupApp.tsx` 有全局 Escape 关闭逻辑：

```tsx
if (event.key === "Escape") {
  window.close();
}
```

这会导致用户在搜索框输入关键词后按 Esc，可能直接关闭 Popup。更自然的交互应该是：

```text
搜索框有内容 → Esc 清空搜索
搜索框无内容 → Esc 关闭 Popup
```

## 修改目标

- 搜索框内有 query 时，Esc 只清空 query。
- 搜索框内没有 query 时，允许 Esc 继续关闭 Popup。
- 事件要 `stopPropagation()`，避免冒泡到全局关闭逻辑。

## 修改文件

```text
src/popup/components/save-location/FolderSearchRow.tsx
src/popup/components/SaveLocationPicker.tsx
```

## 推荐改法

### 1）给 `FolderSearchRow` 增加清空回调

建议 props 增加：

```tsx
onClearQuery(): void;
```

### 2）搜索 input 增加 `onKeyDown`

```tsx
<input
  value={query}
  placeholder="搜索文件夹..."
  onChange={(event) => onQueryChange(event.target.value)}
  onFocus={onFocusSearch}
  onKeyDown={(event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (query.trim()) {
      event.preventDefault();
      event.stopPropagation();
      onClearQuery();
    }
  }}
/>
```

### 3）父组件传入

在 `SaveLocationPicker.tsx` 中：

```tsx
<FolderSearchRow
  query={query}
  onQueryChange={(value) => {
    setCreateOpen(false);
    setQuery(value);
  }}
  onClearQuery={() => setQuery("")}
  onFocusSearch={() => {
    closeLocationMenu();
    setCreateOpen(false);
  }}
  ...
/>
```

## 验收标准

- [ ] 搜索框输入 `paper` 后按 Esc，只清空 `paper`。
- [ ] 搜索结果消失，Popup 不关闭。
- [ ] 搜索框为空时按 Esc，Popup 可以关闭。
- [ ] 其他输入框的 Esc 行为不受影响。

---

# P0-3：“最佳匹配”逻辑修正

## 问题说明

当前搜索结果里第一条会显示 `最佳匹配`，但底层并没有真实排序。现在的逻辑类似：

```tsx
{index === 0 ? <span className="result-badge">最佳匹配</span> : null}
```

这会产生语义问题：第一条只是遍历顺序里的第一条，不一定真的是最佳匹配。

## 修改目标

二选一：

```text
方案 A：先删除“最佳匹配”标签，避免误导。
方案 B：增加搜索排序逻辑，再保留“最佳匹配”标签。
```

推荐采用方案 B，因为它能提升搜索体验。

## 修改文件

建议新增或修改：

```text
src/features/bookmarks/bookmarkTree.ts
src/features/bookmarks/index.ts
src/popup/PopupApp.tsx
src/popup/components/save-location/FolderSearchResults.tsx
```

具体文件可根据当前 `filterFolderOptions` 所在位置调整。

## 推荐实现

### 1）新增排序函数

```ts
export function rankFolderOption(option: FolderOption, query: string): number {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const title = option.title.toLocaleLowerCase();
  const path = option.path.toLocaleLowerCase();

  if (!normalizedQuery) {
    return 999;
  }

  if (title === normalizedQuery) {
    return 0;
  }

  if (title.startsWith(normalizedQuery)) {
    return 1;
  }

  if (title.includes(normalizedQuery)) {
    return 2;
  }

  if (path.includes(normalizedQuery)) {
    return 3;
  }

  return 999;
}
```

### 2）搜索结果排序

在 `PopupApp.tsx` 的 `searchResults` 里：

```tsx
const searchResults = useMemo(() => {
  const normalized = query.trim();

  if (!normalized) {
    return [];
  }

  return filterFolderOptions(folderOptions, normalized)
    .sort((left, right) => {
      const rankDiff =
        rankFolderOption(left, normalized) - rankFolderOption(right, normalized);

      if (rankDiff !== 0) {
        return rankDiff;
      }

      return left.path.localeCompare(right.path, "zh-CN");
    })
    .slice(0, 4);
}, [folderOptions, query]);
```

### 3）只有 rank 足够高才显示最佳匹配

```tsx
const shouldShowBestMatch =
  index === 0 && rankFolderOption(option, query) <= 2;
```

如果 `FolderSearchResults` 当前拿不到 query，需要把 `query` 传进去。

## 验收标准

- [ ] 搜索 `paper` 时，标题更接近的结果排在前面。
- [ ] `最佳匹配` 不再只是无脑给第一条。
- [ ] 搜索结果为空时显示空状态。
- [ ] 同名文件夹用路径辅助判断。

---

# P1-4：搜索聚焦时关闭新建行

## 问题说明

现在输入搜索内容时会关闭新建行，点击新建按钮时也会清空搜索，这是对的。但仍有一个小缺口：

```text
用户打开新建行 → 点击搜索框但不输入 → 新建行仍然存在
```

这会造成两个编辑入口同时出现在面板里。

## 修改目标

搜索框一旦聚焦，就关闭行内新建状态。

## 修改文件

```text
src/popup/components/SaveLocationPicker.tsx
```

## 推荐改法

将搜索框 focus 处理从：

```tsx
onFocusSearch={closeLocationMenu}
```

改成：

```tsx
onFocusSearch={() => {
  closeLocationMenu();
  setCreateOpen(false);
}}
```

## 验收标准

- [ ] 新建行打开后，点击搜索框，新建行关闭。
- [ ] 输入搜索内容时，不会同时显示新建行。
- [ ] 点击新建按钮时，搜索框内容清空，搜索结果关闭。

---

# P1-5：新建文件夹成功后加入最近使用

## 问题说明

当前新建文件夹成功后会自动选中新文件夹，但它不会立即进入最近使用列表。

用户心理上，新建文件夹之后通常就是准备保存到这个文件夹，因此它应该成为最近使用位置。

## 修改目标

新建文件夹成功后：

1. 自动选中新文件夹。
2. 新文件夹进入 recent folders 第一位。
3. 最近使用 chips 立即刷新。
4. 该 recent 状态需要持久化，而不只是前端临时状态。

## 修改文件

推荐从后台服务层处理：

```text
src/background/quickSaveHandlers.ts
src/features/quick-save/uiState.ts
src/features/recent-folders/recentFolders.ts
src/popup/PopupApp.tsx
```

具体取决于当前 `createQuickSaveFolder` 的实现位置。

## 推荐方案

### 方案 A：后台创建成功后写入 recent

在处理 `createQuickSaveFolder` 的逻辑里，创建文件夹成功后调用：

```ts
await saveQuickSaveRecentFolder(folder.id);
```

然后重新读取 / 返回最新 state。

伪代码：

```ts
const folder = await chrome.bookmarks.create({
  parentId,
  title
});

const recentState = await saveQuickSaveRecentFolder(folder.id);
const tree = await getBookmarkTree();

return {
  folder,
  state: {
    tree,
    recentFolderIds: recentState.recentFolderIds,
    defaultFolderId: ...
  }
};
```

### 方案 B：前端临时更新 + 后台仍持久化

如果短期不改后台，可以在 `PopupApp.tsx` 创建成功后前端先更新：

```tsx
setRecentFolderIds((current) =>
  [response.folder.id, ...current.filter((id) => id !== response.folder.id)].slice(0, 8)
);
```

但这只是前端状态，建议最终还是后台持久化。

## 推荐选择

优先选方案 A。  
原因：recent folders 是跨入口共享状态，应该由数据服务层统一维护，避免 popup、content dialog、settings 各自维护不同状态。

## 验收标准

- [ ] 新建文件夹成功后，保存位置切换到新文件夹。
- [ ] 新文件夹出现在最近使用第一位。
- [ ] 关闭并重新打开 Popup 后，新文件夹仍在最近使用里。
- [ ] recent folders 不重复，最多保留 8 个。

---

# P1-6：预览图裁切策略优化

## 问题说明

当前样式仍可能使用：

```css
.page-preview img {
  object-fit: cover;
}
```

`cover` 适合封面图，但不适合 logo、页面截图、小图标或宽高比例极端的图片。之前出现过 ChatGPT 图被裁切的问题，这个风险仍然存在。

## 修改目标

- 减少预览图被错误裁切。
- OG 大图仍然保持漂亮的封面效果。
- favicon / 小图 / logo 不要被拉伸或裁切得奇怪。

## 修改文件

```text
src/popup/components/PagePreviewCard.tsx
src/popup/styles.css
src/features/popup/popupViewModels.ts
```

## 简单方案

直接改成：

```css
.page-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: var(--surface-muted);
}
```

优点：不会裁切。  
缺点：封面图可能留白多。

## 更推荐方案：按图片类型加 class

在 `PagePreviewCard.tsx` 中判断图片类型：

```tsx
const imageFitClass = shouldContainPreviewImage(details?.previewImageUrl, details?.faviconUrl)
  ? "uses-contain-image"
  : "uses-cover-image";
```

然后：

```tsx
<div className={`page-preview ${canUseImage ? "has-image" : "is-fallback"} ${imageFitClass}`}>
  ...
</div>
```

新增函数：

```ts
export function shouldContainPreviewImage(previewImageUrl?: string, faviconUrl?: string): boolean {
  if (!previewImageUrl) {
    return false;
  }

  if (faviconUrl && previewImageUrl === faviconUrl) {
    return true;
  }

  const normalized = previewImageUrl.toLocaleLowerCase();

  return /favicon|apple-touch-icon|\/icons?\//.test(normalized);
}
```

CSS：

```css
.page-preview.uses-cover-image img {
  object-fit: cover;
}

.page-preview.uses-contain-image img {
  object-fit: contain;
  padding: 16px;
  background: var(--surface-muted);
}
```

## 验收标准

- [ ] ChatGPT / logo 类图片不被裁切到只剩一部分。
- [ ] arXiv / 文章类预览仍然保持清晰。
- [ ] 没有图片时 fallback 卡片正常显示。
- [ ] 图片加载失败时 fallback 正常显示。

---

# P2-7：级联目录内支持“+ 新建文件夹”

## 问题说明

目标预览图中，级联目录每一列底部都有：

```text
+ 新建文件夹
```

当前 popup 的级联目录没有传 `onCreateFolder`，所以这个能力还没有实现。

## 修改目标

在级联目录某一层点击 `+ 新建文件夹` 后，可以在该层对应父文件夹下新建子文件夹。

## 是否必须做

这个是增强项，不建议和 P0 / P1 混在一起。  
原因是它会引入新的状态：

```text
当前在哪个父文件夹下新建？
新建行显示在菜单里还是主面板里？
创建后菜单是否关闭？
创建后是否立即选中新文件夹？
```

如果当前阶段只需要保存流程闭环，可以先不做。

## 推荐交互

点击级联菜单里的 `+ 新建文件夹` 后：

1. 关闭级联菜单。
2. 主面板出现行内新建行。
3. 行内提示变成：`新建在 {目标父文件夹}`。
4. 确认后在该目标父文件夹下创建。
5. 创建成功后自动选中新文件夹。

这样可以避免在浮层菜单里再嵌套输入框，复杂度更低。

## 需要新增状态

```tsx
const [createParentFolderId, setCreateParentFolderId] = useState<string | undefined>();
```

当前行内创建逻辑从：

```ts
parentId: selectedFolderId
```

改成：

```ts
parentId: createParentFolderId ?? selectedFolderId
```

创建结束后清空：

```ts
setCreateParentFolderId(undefined);
```

## 验收标准

- [ ] 级联菜单每列可显示 `+ 新建文件夹`。
- [ ] 点击后主面板行内新建出现。
- [ ] 新建目标父级正确。
- [ ] 创建成功后选中新文件夹。
- [ ] 关闭菜单或取消新建时状态清理干净。

---

# P2-8：Footer 状态结构化

## 问题说明

当前 Footer 可能用类似下面的方式判断成功状态：

```ts
const isSuccess = trimmedStatus.startsWith("已");
```

这是靠文案判断状态，长期不稳。

## 修改目标

把状态从字符串升级为结构化对象。

## 推荐类型

```ts
type PopupStatusTone = "idle" | "info" | "success" | "error";

interface PopupStatus {
  message: string;
  tone: PopupStatusTone;
}
```

或者简单一点：

```tsx
const [status, setStatus] = useState("");
const [statusTone, setStatusTone] = useState<PopupStatusTone>("idle");
```

## 修改示例

保存成功：

```tsx
setStatus(`已保存到 ${selectedTitle || "当前文件夹"}。`);
setStatusTone("success");
```

保存失败：

```tsx
setStatus(cause instanceof Error ? cause.message : "保存失败。");
setStatusTone("error");
```

默认：

```tsx
setStatus("");
setStatusTone("idle");
```

Footer：

```tsx
<PopupFooter
  status={status}
  statusTone={statusTone}
  ...
/>
```

## 验收标准

- [ ] 成功态不再依赖文案前缀。
- [ ] 错误态显示错误样式。
- [ ] 默认态显示快捷键。
- [ ] 新建成功、保存成功、保存失败的状态区分明确。

---

# P2-9：保存路径显示策略优化

## 问题说明

当前保存路径可能仍使用 compact path：

```ts
const displayPath = selectedCompactPath || formatPopupFolderPath(selectedPath);
```

这样深层路径会显示成：

```text
Bookmarks bar / ... / Papers
```

这在空间有限时可以接受，但保存位置区域本身是一个关键确认信息，最好优先显示完整路径，再由 CSS 截断。

## 修改目标

- 默认尽量显示完整路径。
- 空间不足时用 CSS 省略。
- 鼠标悬停时通过 `title` 显示完整路径。

## 推荐改法

在 `SaveLocationPicker.tsx` 中改为：

```ts
const displayPath = formatPopupFolderPath(selectedPath);
```

保留：

```tsx
title={formatPopupFolderPath(selectedPath, "") || undefined}
```

CSS 继续控制：

```css
.path-display {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

## 验收标准

- [ ] 短路径完整显示。
- [ ] 长路径不会撑破布局。
- [ ] 鼠标悬停能看到完整路径。
- [ ] 底部按钮仍只显示最后一级文件夹名，例如 `保存到 Papers`。

---

## 3. 建议开发顺序

### 第一步：先修 P0

```text
1. Footer 条件渲染
2. 搜索框 Esc 清空
3. 搜索结果排序或删除“最佳匹配”
```

这三项最影响基础体验。

### 第二步：再修 P1

```text
4. 搜索聚焦关闭新建行
5. 新建文件夹加入 recent
6. 预览图裁切优化
```

这三项提升完整度和稳定性。

### 第三步：最后做 P2

```text
7. 级联目录内新建
8. Footer 状态结构化
9. 保存路径显示策略
```

这些属于增强和长期维护优化，可以单独提交。

---

## 4. 推荐提交拆分

建议不要一个 commit 混改所有内容。可以拆成：

```text
fix(popup): render save footer only on save tab
fix(popup): make search escape clear folder query first
fix(popup): rank folder search results before best match badge
fix(popup): close inline create when folder search is focused
feat(popup): add newly created folder to recent locations
fix(popup): avoid cropping small preview images
refactor(popup): use structured footer status tone
```

如果做级联菜单内新建：

```text
feat(popup): support creating folder from cascade menu
```

---

## 5. 回归测试清单

### 保存 Tab

- [ ] 打开 Popup 默认进入保存 Tab。
- [ ] 标题 / URL 正常展示。
- [ ] 保存位置路径正常展示。
- [ ] 点击箭头打开级联菜单。
- [ ] 点击菜单外部关闭菜单。
- [ ] 搜索文件夹正常显示结果。
- [ ] 搜索框 Esc 先清空搜索。
- [ ] 新建文件夹行内出现。
- [ ] 新建文件夹 Enter 确认。
- [ ] 新建文件夹 Esc 取消。
- [ ] 最近使用默认显示 3 个。
- [ ] 最近使用展开显示更多。
- [ ] 保存按钮文案跟随当前文件夹变化。
- [ ] 保存成功后状态提示正确。

### 管理 / 设置 Tab

- [ ] 切到管理 Tab 后，不显示保存 Footer。
- [ ] 切到设置 Tab 后，不显示保存 Footer。
- [ ] 再切回保存 Tab，已输入标题 / 备注不丢失。

### 边界情况

- [ ] 当前页面不可保存时，保存按钮禁用。
- [ ] 没有 recent folders 时显示空状态。
- [ ] 搜索无结果时显示“没有匹配的文件夹”。
- [ ] 新建文件夹名为空时阻止创建。
- [ ] 深层路径不会撑破保存位置行。
- [ ] 图片加载失败时 fallback 正常显示。

---

## 6. 最终验收标准

这轮收尾完成后，保存 Tab 应达到下面状态：

```text
结构上：
左侧预览 + 右侧保存表单稳定成立。

交互上：
路径选择、搜索、新建、最近使用互不打架。

数据上：
新建、保存、最近使用能同步更新。

视觉上：
默认态轻，操作态清晰，浮层态稳定。

代码上：
Footer、搜索、recent、状态提示不再依赖临时写法。
```

最终目标不是把所有增强项一次做完，而是先把已经重构出来的保存页变得**稳定、清晰、可交付**。
