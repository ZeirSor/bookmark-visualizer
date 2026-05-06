# 书签右键菜单图标设计文档

适用范围：`bookmark-visualizer (2).zip` 当前代码中的书签卡片右键菜单、移动子菜单、最近文件夹与文件夹级联菜单。

目标不是简单给按钮塞图标，而是建立一套可以长期复用的菜单图标体系：图标语义统一、尺寸统一、颜色继承 UI Token，并且不要把图标散落在业务组件里。

---

## 1. 设计参考与风格原则

本项目当前 UI 是轻量、圆角、低饱和度的浏览器扩展界面。图标应采用 **线性图标 Linear Icon** 风格，而不是彩色面性图标。参考方向如下：

| 参考系统 | 可借鉴点 | 本项目采用方式 |
|---|---|---|
| Material Symbols / Material Icons | 小尺寸下保持清晰，强调简单、现代、友好的视觉语言 | 统一 `24 × 24 viewBox`，减少细碎路径 |
| Lucide Icons | 线性 SVG、`2px stroke`、圆角端点，适合 Web 工具类产品 | 图标采用 `fill="none"` + `stroke="currentColor"` |
| Apple SF Symbols | 图标应与文字自然对齐，并支持不同粗细与尺寸 | 图标槽位固定，按钮内文字与图标基线对齐 |
| Windows / Fluent Iconography | 基础图标 + 修饰符能表达复合动作 | “新建前/后书签”“移动到文件夹”等使用基础图标叠加方向或加号 |

由此推导，本项目图标规范如下：

```txt
SVG 画布：24 × 24
默认视觉尺寸：18 × 18
线宽：2
端点：round
拐角：round
颜色：currentColor，由按钮状态控制
填充：none，删除等危险操作也不使用实心图标
```

不要使用 emoji、图片 PNG、Icon Font，也不要在每个业务组件里临时写一段 SVG。图标应该集中维护。

---

## 2. 图标清单与语义

下面这些 SVG 是本次建议加入的第一批菜单图标。它们都使用 `currentColor`，因此 hover、active、danger 状态只需要通过 CSS 改颜色。

<table>
<thead>
<tr>
<th>图标</th>
<th>组件名</th>
<th>使用位置</th>
<th>语义</th>
</tr>
</thead>
<tbody>
<tr>
<td>
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
</td>
<td><code>EditIcon</code></td>
<td>书签右键菜单 → 编辑</td>
<td>编辑标题、URL、备注</td>
</tr>
<tr>
<td>
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z"/><path d="M12 8v5"/><path d="M9.5 10.5h5"/><path d="M4 2h16"/></svg>
</td>
<td><code>BookmarkBeforeIcon</code></td>
<td>书签右键菜单 → 在前面新建书签</td>
<td>在当前书签之前插入，顶部横线表示 before</td>
</tr>
<tr>
<td>
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z"/><path d="M12 8v5"/><path d="M9.5 10.5h5"/><path d="M4 22h16"/></svg>
</td>
<td><code>BookmarkAfterIcon</code></td>
<td>书签右键菜单 → 在后面新建书签</td>
<td>在当前书签之后插入，底部横线表示 after</td>
</tr>
<tr>
<td>
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5"/><path d="m13 14 3 3 3-3"/><path d="M16 11v6"/></svg>
</td>
<td><code>MoveToFolderIcon</code></td>
<td>书签右键菜单 → 移动</td>
<td>移动到某个文件夹</td>
</tr>
<tr>
<td>
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 14h10l1-14"/><path d="M9 7V4h6v3"/></svg>
</td>
<td><code>TrashIcon</code></td>
<td>书签右键菜单 → 删除</td>
<td>危险操作，跟随 `var(--danger)`</td>
</tr>
<tr>
<td>
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/><path d="M7 11h8"/></svg>
</td>
<td><code>SearchFolderIcon</code></td>
<td>移动子菜单 → 搜索文件夹...</td>
<td>进入搜索移动目标文件夹弹窗</td>
</tr>
<tr>
<td>
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/><path d="M5 5 3.5 6.5"/><path d="M19 5l1.5 1.5"/></svg>
</td>
<td><code>RecentIcon</code></td>
<td>移动子菜单 → 最近使用</td>
<td>最近文件夹记录</td>
</tr>
<tr>
<td>
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5"/></svg>
</td>
<td><code>FolderLineIcon</code></td>
<td>移动子菜单 → 所有文件夹、级联文件夹行</td>
<td>普通文件夹</td>
</tr>
<tr>
<td>
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5"/><path d="M12 13v5"/><path d="M9.5 15.5h5"/></svg>
</td>
<td><code>FolderPlusIcon</code></td>
<td>级联菜单底部 → 新建文件夹...</td>
<td>在当前父文件夹下创建文件夹</td>
</tr>
</tbody>
</table>

---

## 3. 代码结构设计

### 3.1 新增共享图标文件

新增文件：

```txt
src/components/icons/MenuActionIcons.tsx
```

不要复用 `src/popup/components/PopupIcons.tsx`。原因是 `PopupIcons.tsx` 属于 popup 局部实现，如果 app 主界面从 popup 文件夹倒挂导入，会让组件边界变乱。长期看应该把通用图标放进 `src/components/icons/`。

建议内容：

```tsx
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function MenuIconSvg({ children, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className ?? "menu-action-icon"}
      {...props}
    >
      {children}
    </svg>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <MenuIconSvg {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </MenuIconSvg>
  );
}

export function BookmarkBeforeIcon(props: IconProps) {
  return (
    <MenuIconSvg {...props}>
      <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
      <path d="M12 8v5" />
      <path d="M9.5 10.5h5" />
      <path d="M4 2h16" />
    </MenuIconSvg>
  );
}

export function BookmarkAfterIcon(props: IconProps) {
  return (
    <MenuIconSvg {...props}>
      <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
      <path d="M12 8v5" />
      <path d="M9.5 10.5h5" />
      <path d="M4 22h16" />
    </MenuIconSvg>
  );
}

export function MoveToFolderIcon(props: IconProps) {
  return (
    <MenuIconSvg {...props}>
      <path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5" />
      <path d="m13 14 3 3 3-3" />
      <path d="M16 11v6" />
    </MenuIconSvg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <MenuIconSvg {...props}>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </MenuIconSvg>
  );
}

export function SearchFolderIcon(props: IconProps) {
  return (
    <MenuIconSvg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
      <path d="M7 11h8" />
    </MenuIconSvg>
  );
}

export function RecentIcon(props: IconProps) {
  return (
    <MenuIconSvg {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
      <path d="M5 5 3.5 6.5" />
      <path d="M19 5l1.5 1.5" />
    </MenuIconSvg>
  );
}

export function FolderLineIcon(props: IconProps) {
  return (
    <MenuIconSvg {...props}>
      <path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5" />
    </MenuIconSvg>
  );
}

export function FolderPlusIcon(props: IconProps) {
  return (
    <MenuIconSvg {...props}>
      <path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5" />
      <path d="M12 13v5" />
      <path d="M9.5 15.5h5" />
    </MenuIconSvg>
  );
}
```

### 3.2 可选：新增菜单内容包装组件

如果程序员希望减少 `WorkspaceComponents.tsx` 里的重复 JSX，可以新增：

```txt
src/components/menu/MenuActionContent.tsx
```

```tsx
import type { ReactNode } from "react";

export function MenuActionContent({
  icon,
  children,
  trailing
}: {
  icon: ReactNode;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <>
      <span className="menu-action-icon-slot" aria-hidden="true">
        {icon}
      </span>
      <span className="menu-action-label">{children}</span>
      {trailing ? <span className="menu-action-trailing">{trailing}</span> : null}
    </>
  );
}
```

如果不新增这个组件，也可以直接在按钮里写三段 `span`。但不建议每个按钮都手写不同 class，否则后续调整菜单布局会很麻烦。

---

## 4. 具体接入位置

### 4.1 书签卡片右键菜单

修改文件：

```txt
src/app/workspace/WorkspaceComponents.tsx
```

当前位置：`BookmarkContextMenu` 组件中，以下按钮目前都是纯文字：

```tsx
<button type="button" role="menuitem" onClick={() => onEdit(state.bookmark)}>
  编辑
</button>
```

需要改成图标 + 文本结构。建议在文件顶部加入：

```tsx
import {
  BookmarkAfterIcon,
  BookmarkBeforeIcon,
  EditIcon,
  MoveToFolderIcon,
  SearchFolderIcon,
  TrashIcon
} from "../../components/icons/MenuActionIcons";
import { MenuActionContent } from "../../components/menu/MenuActionContent";
```

然后把菜单项改为：

```tsx
<button type="button" role="menuitem" onClick={() => onEdit(state.bookmark)}>
  <MenuActionContent icon={<EditIcon />}>编辑</MenuActionContent>
</button>

<button type="button" role="menuitem" onClick={() => onCreateBookmark(state.bookmark, "before")}>
  <MenuActionContent icon={<BookmarkBeforeIcon />}>在前面新建书签</MenuActionContent>
</button>

<button type="button" role="menuitem" onClick={() => onCreateBookmark(state.bookmark, "after")}>
  <MenuActionContent icon={<BookmarkAfterIcon />}>在后面新建书签</MenuActionContent>
</button>
```

移动项当前是：

```tsx
<span>移动</span>
<span className="menu-chevron" aria-hidden="true" />
```

建议改为：

```tsx
<MenuActionContent
  icon={<MoveToFolderIcon />}
  trailing={<span className="menu-chevron" aria-hidden="true" />}
>
  移动
</MenuActionContent>
```

删除项改为：

```tsx
<button
  className="is-danger"
  type="button"
  role="menuitem"
  onClick={() => onDelete(state.bookmark)}
>
  <MenuActionContent icon={<TrashIcon />}>删除</MenuActionContent>
</button>
```

### 4.2 移动子菜单顶部搜索入口

同一文件：

```txt
src/app/workspace/WorkspaceComponents.tsx
```

当前搜索按钮：

```tsx
<button
  className="move-folder-search"
  type="button"
  role="menuitem"
  onClick={() => onSearchMove(state.bookmark)}
>
  搜索文件夹...
</button>
```

改为：

```tsx
<button
  className="move-folder-search"
  type="button"
  role="menuitem"
  onClick={() => onSearchMove(state.bookmark)}
>
  <MenuActionContent icon={<SearchFolderIcon />}>搜索文件夹...</MenuActionContent>
</button>
```

搜索按钮继续作为“打开搜索移动弹窗”的动作，不要把它改成真正输入框。真正输入框仍保留在 `FolderPickerDialog`。

### 4.3 最近文件夹区域

如果已经按上一份方案加入 `RecentFolders`，建议将最近文件夹行的图标统一为 `RecentIcon`，不要使用普通文件夹图标。这样用户能一眼区分“最近使用”与“所有文件夹”。

建议位置：

```txt
src/app/workspace/WorkspaceComponents.tsx
```

如果后续把移动菜单拆成独立组件，则放入：

```txt
src/components/move-menu/MoveMenuPanel.tsx
```

推荐结构：

```tsx
<div className="move-menu-section" aria-label="最近使用">
  <div className="move-menu-section-title">最近使用</div>
  {recentFolders.map((folder) => (
    <button
      key={folder.id}
      className="move-folder-button is-recent"
      type="button"
      role="menuitem"
      onClick={() => onMove(state.bookmark, folder)}
    >
      <MenuActionContent icon={<RecentIcon />}>{getDisplayTitle(folder)}</MenuActionContent>
    </button>
  ))}
</div>
```

### 4.4 所有文件夹与级联文件夹行

修改文件：

```txt
src/components/FolderCascadeMenu.tsx
```

当前 `FolderCascadeRow` 中使用 CSS 生成的文件夹图标：

```tsx
<span className="folder-glyph" aria-hidden="true" />
```

这段代码在菜单里建议替换成 SVG：

```tsx
<FolderLineIcon />
```

同时在文件顶部加入：

```tsx
import { FolderLineIcon, FolderPlusIcon } from "./icons/MenuActionIcons";
```

当前级联菜单底部“新建文件夹...”是纯文字：

```tsx
<button
  className={getCascadeButtonClassName("move-folder-create")}
  type="button"
  role="menuitem"
  onClick={() => onCreateFolder(layer.folder)}
>
  新建文件夹...
</button>
```

建议改为：

```tsx
<button
  className={getCascadeButtonClassName("move-folder-create")}
  type="button"
  role="menuitem"
  onClick={() => onCreateFolder(layer.folder)}
>
  <MenuActionContent icon={<FolderPlusIcon />}>新建文件夹...</MenuActionContent>
</button>
```

这里需要从 `../components/menu/MenuActionContent` 引入会出现路径不自然，因为当前文件已经在 `src/components/` 下。推荐路径是：

```tsx
import { MenuActionContent } from "./menu/MenuActionContent";
```

或者将 `MenuActionContent.tsx` 放到：

```txt
src/components/MenuActionContent.tsx
```

那导入路径就是：

```tsx
import { MenuActionContent } from "./MenuActionContent";
```

为了减少目录层级，本项目目前更适合第二种。

---

## 5. CSS 修改说明

修改文件：

```txt
src/app/styles.css
```

### 5.1 右键菜单行布局

当前 `.context-menu-panel button, .context-menu-item` 使用 flex，并且 `justify-content: space-between`。加入图标后，建议改成三列 grid：左侧图标、中间文本、右侧 chevron。

替换这一段：

```css
.context-menu-panel button,
.context-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  ...
}
```

建议改为：

```css
.context-menu-panel button,
.context-menu-item {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 34px;
  padding: 0 10px;
  color: var(--text);
  font-size: 0.8rem;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
```

新增：

```css
.menu-action-icon-slot {
  display: inline-grid;
  width: 20px;
  height: 20px;
  place-items: center;
  color: var(--muted);
}

.menu-action-icon {
  width: 18px;
  height: 18px;
  display: block;
  stroke-width: 2;
}

.menu-action-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-action-trailing {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  color: var(--muted);
}

.context-menu-panel button:hover .menu-action-icon-slot,
.context-menu-panel button:focus-visible .menu-action-icon-slot,
.context-menu-item:hover .menu-action-icon-slot,
.context-menu-item:focus-visible .menu-action-icon-slot,
.context-menu-item.is-open .menu-action-icon-slot {
  color: var(--accent);
}

.context-menu-panel .is-danger .menu-action-icon-slot,
.context-menu-panel .is-danger:hover .menu-action-icon-slot,
.context-menu-panel .is-danger:focus-visible .menu-action-icon-slot {
  color: var(--danger);
}
```

### 5.2 移动文件夹行布局

当前 `.move-folder-button` 也是 flex。为了与右键菜单统一，建议改成 grid：

```css
.move-folder-button {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 32px;
  padding: 0 9px;
  color: var(--text);
  font: inherit;
  font-size: 0.8rem;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 7px;
  cursor: pointer;
}
```

如果 `FolderCascadeMenu.tsx` 的文件夹行替换成 SVG，就可以逐步减少菜单内 `.folder-glyph` 的使用。但不要直接删除全局 `.folder-glyph`，因为 `FolderTree.tsx`、`FolderPickerDialog` 仍在使用。

### 5.3 Popup 样式同步

如果 `FolderCascadeMenu.tsx` 由 popup 的保存页或设置页复用，则还要在以下文件补同样的基础图标样式：

```txt
src/popup/styles.css
```

至少加入：

```css
.menu-action-icon-slot {
  display: inline-grid;
  width: 20px;
  height: 20px;
  place-items: center;
  color: var(--muted);
}

.menu-action-icon {
  width: 18px;
  height: 18px;
  display: block;
}

.menu-action-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-action-trailing {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  color: var(--muted);
}
```

如果 popup 中 `.move-folder-button` 还是 flex，加入图标后可能会出现文字和 chevron 不对齐。建议同步改成 grid。

---

## 6. 不建议做的事情

1. 不建议在 `WorkspaceComponents.tsx` 里直接写大段 `<svg>`。业务组件会迅速变长，后期难以统一替换。
2. 不建议从 `src/popup/components/PopupIcons.tsx` 反向导入图标。popup 是具体功能入口，不应该成为全局共享层。
3. 不建议新增 `lucide-react` 依赖来只解决 5—8 个图标。当前项目依赖很轻，少量图标用本地 TSX 组件即可。后续如果全项目需要 40+ 图标，再考虑统一引入图标库。
4. 不建议删除 `.folder-glyph`。它仍被 `FolderTree.tsx`、`FolderPickerDialog` 等位置使用。本次只把菜单里的图标体系先规范起来。
5. 不建议让危险操作使用填充红色图标。删除按钮保持线性图标 + 红色文本即可，避免视觉过重。

---

## 7. 验收标准

完成后至少检查这些状态：

| 场景 | 验收标准 |
|---|---|
| 书签右键菜单默认态 | 每行左侧图标、文字、右侧 chevron 对齐；文字不被挤压 |
| hover / focus | 图标颜色与行高亮同步，不能出现只高亮文字、不高亮图标 |
| 移动菜单打开态 | “移动”图标保持 accent 色，chevron 在最右侧 |
| 搜索文件夹入口 | 左侧搜索图标可见，但按钮仍触发原来的 `onSearchMove` |
| 最近使用文件夹 | 使用 `RecentIcon`，与普通文件夹区分明确 |
| 所有文件夹 | 使用 `FolderLineIcon`，有子文件夹时右侧 chevron 对齐 |
| 删除 | 文字和图标都为 danger 色 |
| 键盘可访问性 | Tab / Shift+Tab 可聚焦，SVG 不进入可访问性树 |
| 小窗口边界 | 子菜单换边时图标不影响 `getCascadeMenuPlacement` 计算 |

---

## 8. 建议实施顺序

### 第一步：只加共享图标，不动功能

新增：

```txt
src/components/icons/MenuActionIcons.tsx
src/components/MenuActionContent.tsx
```

然后运行：

```bash
npm run typecheck
```

### 第二步：改书签右键菜单

修改：

```txt
src/app/workspace/WorkspaceComponents.tsx
src/app/styles.css
```

只改 JSX 和 CSS，不改 `onEdit`、`onCreateBookmark`、`onMove`、`onDelete` 等逻辑。

### 第三步：改移动子菜单与文件夹级联菜单

修改：

```txt
src/components/FolderCascadeMenu.tsx
src/app/styles.css
src/popup/styles.css
```

重点检查 popup 是否也引用了 `FolderCascadeMenu`。如果引用了，popup 的菜单行样式必须同步。

### 第四步：后续统一

后续可以逐步把 `src/popup/components/PopupIcons.tsx`、`BookmarkCard.tsx` 里的局部图标迁移到 `src/components/icons/`。但这不是本次必做项，避免一次修改过大。

---

## 9. 参考来源

- Material Design 3 Icons：强调现代、清晰、小尺寸可读的系统图标设计。
- Google Fonts Material Icons Guide：Material system icons 以简单、现代、友好的方式表达通用 UI 概念。
- Lucide Icons：开源 SVG 线性图标库，默认支持 24px、2px stroke 等配置。
- Apple SF Symbols / Human Interface Guidelines：图标应与系统字体、文本和不同尺寸自然对齐。
- Microsoft Windows Iconography：复合语义可以用基础图标与修饰符组合表达，例如文件夹 + 加号、文件夹 + 方向。
