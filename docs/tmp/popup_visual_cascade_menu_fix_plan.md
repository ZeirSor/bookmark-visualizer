# Popup 保存界面视觉与级联菜单问题修改方案

> 目标：针对当前保存 Popup 中“布局比例不舒服、弹窗机械、级联菜单默认展开、子菜单被限制 / 交叠”等问题，给出可执行的代码修改方案。  
> 适用范围：`bookmark-visualizer (4).zip` 之后的代码。  
> 重点文件：  
> - `src/popup/tabs/SaveTab.tsx`  
> - `src/popup/components/SaveLocationPicker.tsx`  
> - `src/popup/components/save-location/*`  
> - `src/components/FolderCascadeMenu.tsx`  
> - `src/features/context-menu/index.ts`  
> - `src/popup/styles.css`

---

## 1. 当前问题总览

当前版本的基础功能已经能跑通，但界面仍然有一种“机械感”，主要原因不是单个颜色或某一个边框，而是几个因素叠加：

1. 信息顺序虽然基本正确，但保存页的视觉重心还不够稳定。
2. Popup 尺寸、左右比例、字体权重、控件间距没有形成统一密度。
3. 保存位置弹层仍然像一个普通下拉框，而不是现代化的浮动菜单。
4. 级联菜单打开时默认展开当前路径，用户还没悬浮就出现子菜单，造成突兀。
5. 子菜单当前受限于保存位置区域 / 悬浮框的结构，层级多时容易交叠，视觉不自然。
6. 弹层没有建立一个统一的 floating layer，因此无法像管理界面的移动菜单那样自然“跃出”当前容器。

这轮修改的核心不是继续微调几个 px，而是要把保存位置菜单从“局部下拉框”升级成“全局浮层系统”。

---

## 2. 关于标题、URL、保存位置、备注的顺序

### 结论

建议继续保持：

```text
标题
URL
保存位置
备注
```

不要把备注放到保存位置上面。

### 原因

保存 Popup 的主任务是：

```text
确认当前网页 → 选择保存位置 → 保存
```

备注是辅助信息，不是每次保存都必须填写。保存位置决定书签最终进入哪里，它的操作优先级高于备注。

因此最合理的信息顺序是：

```text
标题 / URL：确认保存对象
保存位置：确认保存目标
备注：可选补充上下文
保存按钮：执行动作
```

### 当前需要调整的不是顺序，而是视觉权重

现在的问题不是“保存位置放错了”，而是保存位置面板看起来太像普通表单块，备注又被做成一个完整 textarea，导致整体像一个长表单。

建议：

- 保存位置保留在备注上方。
- 备注区域继续保留，但降低视觉权重。
- 如果后续发现备注使用频率不高，可以改成折叠式：

```text
+ 添加备注
```

点击后再展开 textarea。

### 推荐改法

#### 当前保留结构

```tsx
标题
URL
<SaveLocationPicker />
备注
```

#### 备注轻量化

```css
.note-field.compact textarea {
  min-height: 64px;
  max-height: 84px;
  font-size: 14px;
  background: var(--surface-muted);
}
```

#### 可选：备注折叠

如果要进一步简化默认界面，可以新增：

```tsx
const [noteOpen, setNoteOpen] = useState(Boolean(note.trim()));
```

默认只显示：

```tsx
<button type="button" className="note-toggle">
  + 添加备注
</button>
```

点击后展开 textarea。

---

## 3. Popup 长宽比与整体比例

### 当前问题

当前代码中：

```css
html,
body,
#root {
  width: 700px;
  height: 600px;
}

.popup-shell {
  width: 700px;
  height: 600px;
}
```

700×600 对当前两列布局来说略窄，尤其是右侧保存位置面板既要放路径、搜索、新建、最近使用，又要支持级联菜单。结果会出现：

- 右侧内容拥挤。
- 弹层空间不足。
- 子菜单容易往左翻或交叠。
- 左侧预览和右侧表单比例不够舒展。

### 技术约束

Chrome action popup 本身有尺寸上限，不应按浏览器窗口无限自适应。更合理的做法是固定尺寸，并在 800×600 上限内做布局设计。

### 建议尺寸

建议改为：

```css
html,
body,
#root {
  width: 780px;
  height: 600px;
}

.popup-shell {
  width: 780px;
  height: 600px;
}
```

如果希望更稳，可以用最大上限：

```css
html,
body,
#root {
  width: 800px;
  height: 600px;
}

.popup-shell {
  width: 800px;
  height: 600px;
}
```

### 推荐选择

建议优先试：

```text
780 × 600
```

原因：

- 比 700px 更适合两列布局。
- 仍然留有一点安全余量。
- 右侧菜单有更多横向空间。
- 不会像 800px 那样贴近上限。

---

## 4. 字体、间距、比例的统一方案

### 当前问题

当前页面“机械感”的一部分来自字体和间距：

- 很多文字用了 `font-weight: 800`，显得硬。
- Tab、label、路径、chip 的粗细接近，层级不明显。
- 输入框、面板、chip 都有边框，视觉上块太多。
- 1px 边框较多，但缺少柔和阴影和层次。
- 行高和控件高度没有形成一个统一密度系统。

### 建议建立密度 token

在 `src/popup/styles.css` 的 `:root` 中增加：

```css
:root {
  --popup-w: 780px;
  --popup-h: 600px;

  --radius-shell: 18px;
  --radius-panel: 14px;
  --radius-control: 10px;
  --radius-menu: 14px;

  --space-page-x: 24px;
  --space-page-y: 16px;
  --space-section: 12px;

  --control-h: 40px;
  --row-h: 34px;
  --tab-h: 42px;

  --font-label: 12.5px;
  --font-body: 14px;
  --font-strong: 15px;
  --font-title: 20px;

  --weight-body: 500;
  --weight-medium: 600;
  --weight-strong: 700;

  --shadow-popover:
    0 18px 44px rgb(15 23 42 / 0.14),
    0 2px 8px rgb(15 23 42 / 0.08);

  --shadow-shell:
    0 22px 60px rgb(15 23 42 / 0.16);
}
```

### 字体权重建议

将大量 `800` 改成 `650 / 700`：

```css
label > span,
.location-heading {
  font-size: var(--font-label);
  font-weight: 700;
}

.popup-tabs button {
  font-size: 14px;
  font-weight: 700;
}

.path-display {
  font-size: 15px;
  font-weight: 650;
}

.primary-action {
  font-size: 15px;
  font-weight: 750;
}
```

### 控件高度建议

```css
input,
select {
  height: var(--control-h);
  font-size: var(--font-body);
}

.location-path-row {
  min-height: 46px;
}

.recent-chips button:not(.recent-expand-button) {
  min-height: 38px;
}
```

### 视觉目标

调整后应该呈现：

```text
标题区：清楚但不压迫
Tab：轻，不像导航大按钮
输入框：克制
保存位置：明确但不笨重
Footer：稳定，不抢主内容
```

---

## 5. 保存位置弹窗为什么显得不够圆滑

### 当前原因

当前保存位置菜单主要问题在这几处：

```css
.location-cascade-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 260px;
  max-height: 330px;
  overflow: auto;
}
```

它本质上还是一个“绝对定位在保存位置内部的下拉框”。这种实现有几个缺点：

1. 它被绑定在 `.location-picker-shell` 里面。
2. 它的根菜单像普通 select dropdown，不像全局浮层。
3. 子菜单虽然用了 `position: fixed`，但 `portalContainer` 传的是 `locationMenuRef.current`，仍然没有真正建立独立浮层层级。
4. 根菜单 `overflow: auto`，子菜单层级多时更容易出现局促感。
5. 阴影、圆角、动画都偏硬，缺少现代浮层的轻微位移和透明度过渡。

### 设计目标

弹层应该像：

```text
一个从触发按钮长出来的临时 surface，
不属于表单布局，
可以覆盖表单内容，
可以在 popup 内自由定位，
可以根据空间选择向左 / 向右 / 向上 / 向下展开。
```

---

## 6. 级联菜单默认展开问题

### 当前表现

点击保存位置箭头后，菜单一打开就自动展示当前路径的子级。例如用户还没悬浮，`Bookmarks bar` 或当前路径相关节点就已经展开了。

### 造成原因

`SaveLocationPicker.tsx` 当前传入了：

```tsx
initialActivePathIds={cascadeInitialPathIds}
highlightedFolderIds={highlightedFolderIds}
```

而 `FolderCascadeMenu.tsx` 中有：

```tsx
useEffect(() => {
  if (!initialActivePathIds) {
    return;
  }

  setActivePath(initialActivePathIds.filter((folderId) => folderMap.has(folderId)));
}, [folderMap, initialActivePathIds]);
```

这会导致：菜单一打开就把当前路径写入 `activePath`，于是当前路径自动展开。

### 正确交互

应该区分两个概念：

```text
highlighted path：当前保存路径，高亮即可。
active path：用户正在悬浮 / 键盘导航的路径，才展开。
```

也就是说：

- 打开菜单时，可以高亮当前路径。
- 不应该自动展开当前路径。
- 用户悬浮到 `Bookmarks bar` 后，才展开下一层。
- 用户继续悬浮到 `AI Platform` 后，才展开 Papers 层。

### 推荐修改

#### 方案 A：Popup 保存菜单不传 `initialActivePathIds`

在 `SaveLocationPicker.tsx` 中改：

```tsx
<FolderCascadeMenu
  nodes={tree}
  selectedFolderId={selectedFolderId}
  currentFolderId={selectedFolderId}
  highlightedFolderIds={highlightedFolderIds}
  ...
/>
```

删除：

```tsx
initialActivePathIds={cascadeInitialPathIds}
```

这样打开菜单时不会自动展开。

#### 方案 B：给 `FolderCascadeMenu` 增加开关

更通用的做法：

```tsx
interface FolderCascadeMenuProps {
  autoExpandInitialPath?: boolean;
}
```

修改：

```tsx
useEffect(() => {
  if (!autoExpandInitialPath || !initialActivePathIds) {
    return;
  }

  setActivePath(initialActivePathIds.filter((folderId) => folderMap.has(folderId)));
}, [autoExpandInitialPath, folderMap, initialActivePathIds]);
```

保存 Popup 中传：

```tsx
autoExpandInitialPath={false}
```

如果管理页移动菜单需要保持自动展开，可以传：

```tsx
autoExpandInitialPath
```

### 推荐选择

优先使用方案 B。  
原因：不破坏 `FolderCascadeMenu` 的通用能力，也能明确区分不同使用场景。

---

## 7. 子菜单被悬浮框限制 / 交叠问题

### 当前表现

第二、第三张图里，子菜单层级展开后出现：

- 菜单挤在保存位置框附近。
- 子菜单和父菜单互相交叠。
- 子菜单没有自然向右铺开。
- 层级越多越乱。
- 根菜单和子菜单看起来不是同一个系统。

### 造成原因

主要是 4 个：

#### 原因 1：根菜单在保存位置局部容器里

```css
.location-cascade-menu {
  position: absolute;
  right: 0;
}
```

它仍然属于保存位置面板内部。

#### 原因 2：根菜单右对齐导致没有右侧展开跑道

当前根菜单靠右对齐。子菜单如果从根菜单右侧展开，很容易撞到 popup 右边缘，只能翻转或重叠。

#### 原因 3：列宽太大

当前相关宽度接近：

```ts
FLOATING_CASCADE_WIDTH = 260
```

如果要 3 列：

```text
260 × 3 + gap ≈ 792px
```

在 700px popup 里几乎不可能自然展示三列。

#### 原因 4：portal 层级不够独立

`SaveLocationPicker.tsx` 当前：

```tsx
portalContainer={locationMenuRef.current ?? undefined}
```

这会让浮层仍然和局部保存位置 DOM 绑定太紧。

### 技术判断

在 Chrome extension popup 里，菜单**不能真正画到浏览器 popup 窗口外面**。但是可以做到：

```text
从保存位置面板里“跃出”
覆盖 Popup 内部内容
不被 location-panel / popup-content 局部限制
在 popup 视口内进行碰撞检测和翻转
```

也就是说，要追求的是：

```text
escape location panel
```

而不是：

```text
escape Chrome popup window
```

---

## 8. 推荐的浮层架构：增加统一 Floating Layer

### 目标结构

在 popup document 中建立一个专门承载浮层的层：

```text
body
  #root
    popup-shell
  #popup-floating-layer-root
    cascade menu / tooltip / future popovers
```

或者直接：

```tsx
createPortal(menu, document.body)
```

关键是：菜单不要再渲染在 `.location-panel` 或 `.location-picker-shell` 内部。

### 推荐新增组件

新增：

```text
src/popup/components/save-location/LocationCascadeOverlay.tsx
```

职责：

- 读取触发按钮 / path row 的 `getBoundingClientRect()`
- 根据 popup viewport 计算根菜单位置
- 用 `createPortal` 渲染根菜单
- 处理外部点击关闭
- 处理 Esc 关闭
- 给 `FolderCascadeMenu` 传 `portalContainer={document.body}`
- 控制根菜单与子菜单的统一 z-index

### 伪代码

```tsx
export function LocationCascadeOverlay({
  anchorRect,
  tree,
  selectedFolderId,
  highlightedFolderIds,
  onSelect,
  onRequestClose
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const rootPlacement = useMemo(
    () => getPopupCascadeRootPlacement(anchorRect, {
      rootWidth: 224,
      columnWidth: 224,
      preferredColumns: 3
    }),
    [anchorRect]
  );

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && overlayRef.current?.contains(target)) {
        return;
      }
      onRequestClose();
    }

    window.addEventListener("pointerdown", handlePointerDown, true);
    return () => window.removeEventListener("pointerdown", handlePointerDown, true);
  }, [onRequestClose]);

  return createPortal(
    <div
      ref={overlayRef}
      className="location-cascade-overlay"
      style={{
        left: rootPlacement.x,
        top: rootPlacement.y
      }}
    >
      <FolderCascadeMenu
        nodes={tree}
        selectedFolderId={selectedFolderId}
        currentFolderId={selectedFolderId}
        highlightedFolderIds={highlightedFolderIds}
        autoExpandInitialPath={false}
        menuWidth={224}
        density="compact"
        canSelect={canCreateBookmarkInFolder}
        onSelect={onSelect}
        portalContainer={document.body}
      />
    </div>,
    document.body
  );
}
```

---

## 9. 根菜单位置计算：给子菜单预留“跑道”

### 当前问题

根菜单如果紧贴右边，子菜单自然没有向右展开空间。

### 推荐策略

打开根菜单时，不要只考虑根菜单本身能不能放下，还要考虑后续子菜单空间。

假设：

```text
根菜单宽度：224
子菜单宽度：224
最多预留 2 个子菜单
gap：6
```

需要的总宽度约：

```text
224 × 3 + 6 × 2 = 684px
```

如果 popup 宽度是 780px，就能放下。

### 新增函数

文件建议：

```text
src/features/context-menu/popupCascadePlacement.ts
```

示例：

```ts
interface PopupCascadeRootPlacementOptions {
  rootWidth: number;
  columnWidth: number;
  preferredColumns: number;
  gap: number;
  edgeGap: number;
}

export function getPopupCascadeRootPlacement(
  anchor: DOMRect,
  viewport: { width: number; height: number },
  options: PopupCascadeRootPlacementOptions
) {
  const totalWidth =
    options.rootWidth +
    (options.preferredColumns - 1) * (options.columnWidth + options.gap);

  const preferredX = anchor.right - options.rootWidth;
  const minX = options.edgeGap;
  const maxX = Math.max(options.edgeGap, viewport.width - totalWidth - options.edgeGap);

  const x = Math.min(Math.max(preferredX, minX), Math.max(maxX, minX));
  const y = Math.min(
    anchor.bottom + 8,
    viewport.height - 320 - options.edgeGap
  );

  return { x, y };
}
```

### 说明

这不是普通 dropdown 的定位，而是 cascade menu 的定位。它应该为后续多列展开预留空间。

---

## 10. 菜单列宽和密度调整

### 当前问题

260px 列宽过宽，不适合 popup 内多列级联。行高也略大，视觉像系统列表，不够轻。

### 修改目标

为 Popup 保存菜单使用紧凑 variant，不影响管理界面的右键移动菜单。

### 推荐改法

给 `FolderCascadeMenu` 增加 props：

```tsx
interface FolderCascadeMenuProps {
  density?: "default" | "compact";
  menuWidth?: number;
}
```

保存 Popup 使用：

```tsx
<FolderCascadeMenu
  density="compact"
  menuWidth={224}
  ...
/>
```

右键移动菜单不传，保持原状。

### 样式

```css
.location-cascade-overlay {
  position: fixed;
  z-index: 1000;
  width: 224px;
  padding: 6px;
  border: 1px solid rgb(226 232 240 / 0.9);
  border-radius: 14px;
  background: rgb(255 255 255 / 0.98);
  box-shadow:
    0 18px 44px rgb(15 23 42 / 0.14),
    0 2px 8px rgb(15 23 42 / 0.08);
  backdrop-filter: blur(10px);
  transform-origin: top right;
  animation: popup-menu-in 140ms cubic-bezier(0.16, 1, 0.3, 1);
}

.location-cascade-overlay .move-folder-button,
.context-submenu.is-floating-cascade.popup-compact .move-folder-button {
  min-height: 34px;
  padding: 0 9px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
}

.location-cascade-overlay .move-menu-note {
  font-size: 11px;
  font-weight: 700;
}

@keyframes popup-menu-in {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### 子菜单样式

```css
.context-submenu.is-floating-cascade.popup-compact {
  min-width: 224px;
  max-width: 224px;
  padding: 6px;
  border-radius: 14px;
  box-shadow:
    0 18px 44px rgb(15 23 42 / 0.14),
    0 2px 8px rgb(15 23 42 / 0.08);
  animation: submenu-in 120ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes submenu-in {
  from {
    opacity: 0;
    transform: translateX(-2px) scale(0.99);
  }

  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
```

---

## 11. 子菜单展开方向：优先向右，但必须碰撞检测

### 当前要求

用户感受上，右边有空间时就应该向右展开。只有右侧不够时，才向左翻转。

### 现有函数

`src/features/context-menu/index.ts` 中已有：

```ts
getCascadeMenuPlacement(anchor, viewport, menuSize)
```

它会根据 `rightSpace` 和 `leftSpace` 判断方向。

### 当前不自然的原因

因为根菜单位置没有为子菜单预留空间，导致实际计算时右侧空间经常不够，于是子菜单翻转 / 交叠。

### 推荐修改

不是只改 `getCascadeMenuPlacement`，而是先把根菜单放到合适位置。

然后给 `getCascadeMenuPlacement` 支持更小列宽：

```ts
const FLOATING_CASCADE_WIDTH = menuWidth ?? 224;
```

需要把 `menuWidth` 从 props 传入 `estimateLayerSize()` 和 `FloatingCascadeLayer`。

### 期望效果

```text
根菜单：靠近触发按钮，但稍微向左偏移，给右侧子菜单留空间
第二列：向右展开
第三列：继续向右展开
如果仍然不够：再向左翻转
```

---

## 12. 解决子菜单交叠的关键点

### 必须避免的做法

不要让子菜单仍然被根菜单的 `overflow: auto` 控制。

不要把所有层级都放在 `.location-cascade-menu` 里面滚动。

不要在根菜单右对齐的情况下强行让子菜单向右展开。

### 正确做法

```text
根菜单：一个 fixed floating surface
子菜单：独立 fixed floating surface
所有菜单层：共同挂在 document.body / floating layer
定位：基于 viewport + anchor rect
碰撞：基于 popup viewport
关闭：靠 hover intent + pointerdown outside + Esc
```

### 必改点

在保存 Popup 中，把：

```tsx
portalContainer={locationMenuRef.current ?? undefined}
```

改为：

```tsx
portalContainer={document.body}
```

但这还不够。还要把根菜单也从 `.location-picker-shell` 中拿出来，否则根菜单和子菜单仍然不是一个完整的 overlay 系统。

---

## 13. 弹层关闭与 hover intent

### 当前情况

已有：

```ts
LOCATION_MENU_CLOSE_DELAY_MS = 220
CASCADE_SUBMENU_CLOSE_DELAY_MS = 320
```

方向是对的，但要确保根菜单和所有子菜单共用同一个 hover intent。

### 推荐行为

```text
鼠标从根菜单移动到子菜单：
  不关闭

鼠标从子菜单移动到孙菜单：
  不关闭

鼠标离开整个菜单系统：
  延迟 220–320ms 后关闭

点击外部：
  立即关闭

按 Esc：
  立即关闭
```

### 实现建议

`LocationCascadeOverlay` 内维护一个统一的 wrapper ref：

```tsx
const overlayRefs = [rootRef, ...submenuRefs]
```

如果使用 `document.body` portal，外部点击判断要同时包含：

- trigger row / arrow button
- root overlay
- floating submenu layers

更简单的方式：给所有 popup cascade 层加统一属性：

```tsx
data-popup-cascade-layer="true"
```

外部点击判断：

```ts
const element = target instanceof Element ? target : null;

if (
  triggerRef.current?.contains(target as Node) ||
  element?.closest("[data-popup-cascade-layer='true']")
) {
  return;
}

onRequestClose();
```

---

## 14. 三个 Tab 的机械感问题

### 当前问题

Tab 样式没有大问题，但感觉机械，主要原因是：

1. 三个 tab 平均分成三大块，像后台系统导航。
2. 图标和文字权重偏大。
3. active underline 太长或太硬。
4. Tab 区域和 Header 区域分割线太明显。
5. hover 反馈过“表格化”。

### 推荐调整

#### 方案 A：保留三等分，但弱化机械感

```css
.popup-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid rgb(226 232 240 / 0.72);
  border-bottom: 1px solid rgb(226 232 240 / 0.72);
  background: rgb(248 250 252 / 0.35);
}

.popup-tabs button {
  min-height: 42px;
  gap: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 650;
  background: transparent;
}

.popup-tabs button svg {
  width: 18px;
  height: 18px;
}

.popup-tabs button::after {
  right: 28%;
  left: 28%;
  height: 2px;
  border-radius: 999px;
}

.popup-tabs button:hover,
.popup-tabs button:focus-visible {
  background: rgb(79 70 229 / 0.045);
}
```

#### 方案 B：改成居中 segmented tabs

如果想更现代，可以改成：

```text
Header
[ 保存 ][ 管理 ][ 设置 ]    作为居中的 pill tabs
```

但这会改动更多布局。当前阶段建议先用方案 A。

---

## 15. Header 与窗口比例优化

### 当前建议

```css
.popup-header {
  grid-template-columns: 40px minmax(0, 1fr) 36px;
  gap: 12px;
  padding: 14px 24px 10px;
}

.app-logo {
  width: 40px;
  height: 40px;
  border-radius: 11px;
}

.brand-block h1 {
  font-size: 19px;
  font-weight: 750;
}

.brand-block p {
  margin-top: 3px;
  font-size: 13.5px;
  font-weight: 500;
}
```

### 原则

Header 只提供品牌和入口，不要抢保存页主体的权重。

---

## 16. 左侧预览卡片问题

### 当前问题

如果当前网页只有一张 OG 图，例如 ChatGPT 的蓝色预览图，左侧就会显示一张裁切图，看起来像孤立图片，而不是内容预览。

### 建议

对 `has-image` 状态不要只显示图片，可以做成轻量信息卡：

```text
图片缩略图
domain
title
url / hint
```

或者至少改成：

```css
.page-preview.has-image {
  min-height: 210px;
  align-content: start;
}

.page-preview.has-image img {
  height: 132px;
  object-fit: cover;
}

.page-preview-image-meta {
  padding: 12px;
}
```

这样左侧不会像一块突兀的图片。

如果短期不做结构调整，至少把图片裁切策略改成：

```css
.page-preview img {
  object-fit: contain;
  background: var(--surface-muted);
}
```

---

## 17. 具体实施阶段

---

# Phase 1：先修保存位置级联菜单行为

## 任务

1. `FolderCascadeMenu` 增加 `autoExpandInitialPath`。
2. 保存 Popup 中设置 `autoExpandInitialPath={false}`。
3. 打开保存位置菜单时，只高亮当前路径，不自动展开。
4. 用户悬浮后才展开下一层。

## 涉及文件

```text
src/components/FolderCascadeMenu.tsx
src/popup/components/SaveLocationPicker.tsx
```

## 验收

- [ ] 点击保存位置箭头后，只显示根级：`Bookmarks bar` / `Other bookmarks`。
- [ ] `Bookmarks bar` 可以高亮，但不自动展开。
- [ ] 鼠标悬浮 `Bookmarks bar` 后才展开下一层。
- [ ] 当前文件夹仍能显示 `当前位置`。

---

# Phase 2：重构保存位置菜单为全局浮层

## 任务

1. 新增 `LocationCascadeOverlay.tsx`。
2. 根菜单使用 `createPortal` 渲染到 `document.body`。
3. 子菜单也使用 `portalContainer={document.body}`。
4. 外部点击关闭逻辑改成识别 trigger + floating layer。
5. 根菜单位置使用 `getPopupCascadeRootPlacement()` 计算。

## 涉及文件

```text
src/popup/components/save-location/LocationCascadeOverlay.tsx
src/popup/components/SaveLocationPicker.tsx
src/features/context-menu/popupCascadePlacement.ts
src/popup/styles.css
```

## 验收

- [ ] 根菜单不再被保存位置面板限制。
- [ ] 子菜单可以覆盖保存页内容。
- [ ] 子菜单不再和根菜单明显交叠。
- [ ] 多层级菜单视觉上像一个整体系统。
- [ ] 点击外部关闭。
- [ ] Esc 关闭。

---

# Phase 3：菜单密度与圆滑感优化

## 任务

1. 保存 Popup 中的 cascade 菜单列宽改成 216–224px。
2. 行高改为 32–34px。
3. 圆角改为 14px。
4. 阴影改为双层柔和阴影。
5. 动画使用 opacity + translate + scale。
6. hover 背景降低饱和度。

## 涉及文件

```text
src/components/FolderCascadeMenu.tsx
src/popup/styles.css
```

## 验收

- [ ] 菜单排布更密集。
- [ ] 展开动画不僵硬。
- [ ] hover 有轻微反馈，但不厚重。
- [ ] 菜单不像系统默认列表，而像现代产品浮层。

---

# Phase 4：Popup 整体比例和字体系统调整

## 任务

1. 将 popup 尺寸调整到 `780 × 600`。
2. Header / Tab / Footer 高度进一步统一。
3. 字体权重从大量 800 降到 650/700。
4. input、textarea、chip、menu row 使用统一高度。
5. 减少过重分割线和纯白块堆叠。

## 涉及文件

```text
src/popup/styles.css
```

## 验收

- [ ] 页面没有明显右侧滚动条。
- [ ] 右侧保存表单不拥挤。
- [ ] Tab 不再像后台系统按钮。
- [ ] 字体层级更自然。
- [ ] 整体视觉更轻。

---

# Phase 5：预览卡片与备注区域轻量化

## 任务

1. 保存位置继续放在备注上方。
2. 备注降低高度和视觉权重。
3. `has-image` 预览图避免突兀裁切。
4. 可选：备注改成折叠式。

## 涉及文件

```text
src/popup/tabs/SaveTab.tsx
src/popup/components/PagePreviewCard.tsx
src/popup/styles.css
```

## 验收

- [ ] 保存位置仍然是主操作模块。
- [ ] 备注不抢视觉。
- [ ] ChatGPT 这类图片预览不再显得突兀。
- [ ] 页面纵向高度更稳定。

---

## 18. 推荐代码修改清单

### 必改

```text
1. FolderCascadeMenu 增加 autoExpandInitialPath
2. SaveLocationPicker 不再自动展开当前路径
3. 新增 LocationCascadeOverlay
4. popup cascade 菜单 portal 到 document.body
5. 根菜单定位为 fixed，不再 absolute 绑定 location panel
6. popup 宽度从 700 调整到 780
7. 菜单列宽从 260 调整为 216–224
8. 菜单样式做 compact variant
```

### 建议改

```text
1. 字体 weight 降低
2. Tab hover / active 弱化
3. Footer 高度和按钮尺寸微调
4. 备注区轻量化
5. 图片预览 contain / meta card
```

### 暂不建议

```text
1. 不建议把备注放到保存位置上方
2. 不建议让菜单真的试图超出 Chrome popup 窗口边界
3. 不建议继续在 location-panel 内部修补子菜单层级
4. 不建议全局修改 FolderCascadeMenu 的尺寸，避免影响管理界面的移动菜单
```

---

## 19. 最终验收标准

### 默认保存界面

- [ ] 顺序为：标题 → URL → 保存位置 → 备注。
- [ ] 保存位置在备注上方。
- [ ] 页面宽高比例更舒展。
- [ ] 字体没有明显忽大忽小。
- [ ] Header / Tab / Content / Footer 视觉权重协调。

### 保存位置菜单

- [ ] 点击箭头后不自动展开 Bookmarks bar。
- [ ] 悬浮后才展开子级。
- [ ] 子菜单可以脱离保存位置面板，覆盖 Popup 内容。
- [ ] 子菜单优先向右展开。
- [ ] 空间不足时才翻转。
- [ ] 不再出现明显交叠。
- [ ] 动画丝滑，关闭不闪烁。

### 现代感

- [ ] 弹层圆角更柔和。
- [ ] 阴影更自然。
- [ ] hover 状态轻。
- [ ] 行高更紧凑。
- [ ] 视觉不像机械表单 / 系统菜单。

---

## 20. 最终方向总结

这次要解决的不是一个局部样式 bug，而是保存位置菜单的层级系统问题。

应该从：

```text
保存位置区域里的一个 absolute dropdown
```

升级为：

```text
整个 popup 文档里的 floating cascade layer
```

这样才能同时解决：

- 默认自动展开太突兀
- 子菜单受限
- 多层级交叠
- 弹窗机械感
- 菜单不够现代
- popup 比例不协调

完成后，这个保存 Popup 会更接近一个现代浏览器扩展工具，而不是一个临时拼出来的表单界面。
