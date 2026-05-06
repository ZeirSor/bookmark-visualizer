# 阶段二：实现图 3 的保存位置选择器与多列级联菜单

## 阶段目标

把保存位置从“普通路径行 + 搜索”升级为图 3 的核心交互：点击保存位置后打开多列文件夹选择器，用户可以逐级选择保存目标。

## 1. 当前代码问题

`src/popup/main.tsx` 的 `SaveTab` 当前没有使用 `FolderCascadeMenu`。路径行按钮现在执行：

```tsx
onClick={() => void openWorkspace()}
```

这与图 3 目标不一致。图 3 中路径行应该打开位置选择器，完整管理页入口应只保留在：

- Header 右上角外链按钮
- 最近使用标题右侧的“管理位置”链接

## 2. 新增组件

建议新增：

```text
src/popup/components/SaveLocationPicker.tsx
```

该组件负责：

- 路径按钮
- 搜索框
- 最近使用
- 新建文件夹
- picker open / close
- 级联菜单渲染
- 当前目标高亮

## 3. SaveLocationPicker 组件结构

```tsx
function SaveLocationPicker(props: SaveLocationPickerProps) {
  return (
    <section className="location-panel" aria-label="保存位置">
      <button className="location-path-row" onClick={openPicker}>
        <FolderIcon />
        <span className="selected-path">{displayPath}</span>
        <span className="current-badge">当前位置</span>
        <ChevronRightIcon />
      </button>

      <div className="folder-search-row">...</div>
      <RecentFolders />

      {pickerOpen ? (
        <LocationPickerPopover
          anchorRef={pathButtonRef}
          tree={tree}
          selectedFolderId={selectedFolderId}
          onSelect={selectAndClose}
        />
      ) : null}
    </section>
  );
}
```

## 4. 渲染策略选择

### 方案 A：仍作为 toolbar popup

这是最现实方案。注意：浏览器 action popup 无法把 DOM 画到 popup 窗口外，所以图 3 那种外溢到右侧的大菜单不能完全照搬。

实现方式：

- `LocationPickerPopover` 使用 `position: absolute` 或 `fixed`，但坐标必须限制在 popup body 内。
- 如果右侧空间不足，向左、向上或覆盖在保存位置区域上方展开。
- 最多展示 2–3 列；空间不足时列容器横向滚动，但不能出现浏览器默认粗滚动条。

建议 CSS：

```css
.location-panel {
  position: relative;
}

.location-picker-popover {
  position: fixed;
  z-index: 40;
  display: flex;
  gap: 8px;
  max-width: calc(100vw - 24px);
  max-height: 330px;
  padding: 8px;
  border: 1px solid #dbe3f0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 16px 40px rgb(15 23 42 / 0.14);
  overflow: auto hidden;
}
```

### 方案 B：使用 content script overlay 或独立窗口

如果必须像图 3 一样让菜单明显跨出主卡片右侧，建议把保存界面改为：

- `quick-save-content.js` 注入当前网页，作为页面浮层；或
- `chrome.windows.create({ type: "popup" })` 打开一个独立 extension window。

这种方式能更接近图 3 的视觉稿，但产品入口会从“浏览器工具栏 popup”变成“页面内浮层 / 独立窗口”。

## 5. 复用 FolderCascadeMenu

当前已有组件：

```text
src/components/FolderCascadeMenu.tsx
```

可先复用，但需要做两个增强。

### 5.1 支持“根层级列”外观

图 3 的第一列中 `Bookmarks bar` 可以显示 star icon，其他根文件夹显示 folder icon。当前 `FolderCascadeMenu` 统一用 `.folder-glyph`，可以新增 render hook：

```ts
renderFolderIcon?(folder: BookmarkNode, context: { depth: number; selected: boolean }): ReactNode;
```

如果暂不改组件 API，也可以通过 CSS 先统一 folder icon，star icon 留到阶段三。

### 5.2 支持受控 active path

图 3 打开 picker 时，应自动展开当前保存路径，例如：

```text
Bookmarks bar → AI Platform → Papers
```

当前 `FolderCascadeMenu` 的 `activePath` 是内部 state，hover 后才展开。建议增加可选 props：

```ts
initialActivePath?: string[];
activePath?: string[];
onActivePathChange?(path: string[]): void;
```

阶段二可以先实现 `initialActivePath`，打开时根据 `selectedFolderId` 计算祖先链。

## 6. 祖先链计算

新增工具函数，建议放在 `src/features/bookmarks/bookmarkTree.ts`：

```ts
export function getFolderAncestorIds(nodes: BookmarkNode[], folderId: string): string[] {
  const target = findNodeById(nodes, folderId);
  if (!target) return [];

  const ids: string[] = [];
  let current = target;

  while (current.parentId) {
    ids.unshift(current.id);
    const parent = findNodeById(nodes, current.parentId);
    if (!parent) break;
    current = parent;
  }

  return ids;
}
```

注意：如果 `FolderCascadeMenu` 的第一层已经展开 root children，则 activePath 应排除真正的根节点，只保留可显示的 folder id。

## 7. Popup 内接入方式

在 `PopupApp` 增加：

```ts
const [pickerOpen, setPickerOpen] = useState(false);
```

把 `SaveTab` 的 location 相关 props 收束成组件 props，不再在 `SaveTab` 里直接写一大段 location JSX。

选择文件夹时：

```ts
function selectFolder(folderId: string) {
  setSelectedFolderId(folderId);
  setQuery("");
  setStatus("");
}
```

选择并关闭：

```ts
function selectFolderAndClose(folderId: string) {
  selectFolder(folderId);
  setPickerOpen(false);
}
```

## 8. 点击外部关闭

为 `LocationPickerPopover` 加：

- `pointerdown` outside close
- Escape close
- Tab focus trap 可不强制，但不能导致焦点丢失后菜单无法关闭

示例：

```ts
useEffect(() => {
  function handlePointerDown(event: PointerEvent) {
    if (!popoverRef.current?.contains(event.target as Node) && !anchorRef.current?.contains(event.target as Node)) {
      onClose();
    }
  }

  document.addEventListener("pointerdown", handlePointerDown, true);
  return () => document.removeEventListener("pointerdown", handlePointerDown, true);
}, [onClose]);
```

## 9. 搜索与 picker 的关系

当前搜索功能可以保留。建议规则：

- 输入 query 时，显示搜索结果列表。
- 点击搜索结果后：更新 selectedFolderId，清空 query，关闭 picker。
- 如果 picker 已打开且用户开始搜索，可以暂时覆盖 picker 内容，显示搜索结果。
- 搜索结果必须显示完整路径，避免重名文件夹误选。

## 10. 新建文件夹规则

当前 `createFolder()` 使用 `selectedFolderId` 作为父文件夹。图 3 中每列底部都有“新建文件夹”，更好的规则是：

- 路径卡片旁的加号：在当前选中保存位置下新建。
- picker 某列底部“新建文件夹”：在该列代表的父文件夹下新建。
- 新建成功后：刷新 tree，自动选中新文件夹，关闭输入态，但不强制关闭 picker。

## 11. 阶段二验收

- 点击保存位置路径行不再打开完整管理页，而是打开位置选择器。
- 位置选择器至少支持三层目录展示。
- 选择任意文件夹后，路径行和保存按钮立即同步。
- 当前保存目标显示 `当前位置`。
- 搜索结果选择后可以更新保存位置。
- 新建文件夹后自动选中新文件夹。
- 文件夹列表不出现横向滚动条。
- picker 不被 `.location-panel` 或 `.save-tab` 裁剪。
- Escape 和点击外部可以关闭 picker。
