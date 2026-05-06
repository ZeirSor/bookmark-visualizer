# 移动位置菜单：长文件夹名导致展开图标错位修复方案

## 1. 问题说明

当前问题出现在书签卡片右键菜单 →「移动」→ 右侧移动位置面板 →「所有文件夹」列表中。

当某个文件夹名称较长，且该行同时存在「当前位置 / 不可移动」状态标记与子级展开箭头时，文件夹行的右侧展开图标会发生错位：常见表现是箭头被挤到下一行、与文件夹图标不在同一垂直中心线，或者整行高度异常变化。

这个问题不是单纯的图标尺寸问题，而是菜单行布局结构不稳定导致的。换句话说，现在的 CSS 依赖「子元素数量刚好匹配 grid 列数」，一旦某一行多出状态标签，就会破坏布局。

---

## 2. 代码原因定位

### 2.1 主要相关文件

```txt
src/components/FolderCascadeMenu.tsx
src/components/FolderMoveSubmenuContent.tsx
src/app/styles.css
src/popup/styles.css
src/features/quick-save/contentStyle.ts
src/features/context-menu/index.ts
```

其中：

- `FolderMoveSubmenuContent.tsx` 负责右侧「移动」面板结构。
- `FolderCascadeMenu.tsx` 负责「所有文件夹」级联目录列表。
- `src/app/styles.css` 负责主工作区 / New Tab 管理界面的样式。
- `src/popup/styles.css` 负责 Popup 保存入口中的同一套级联目录样式。
- `src/features/quick-save/contentStyle.ts` 是 Quick Save Shadow DOM 中内联注入的同类样式。
- `src/features/context-menu/index.ts` 负责纯逻辑：菜单定位、展开方向、行行为判断。这里不应该改动。

### 2.2 触发错位的核心代码

`src/components/FolderCascadeMenu.tsx` 中，文件夹行目前大致是这样渲染的：

```tsx
<button className={getCascadeButtonClassName()}>
  <span className="menu-action-icon-slot" aria-hidden="true">
    <FolderLineIcon />
  </span>
  <span className="menu-action-label">{title}</span>
  {isCurrentFolder ? <span className="move-menu-note">当前位置</span> : null}
  {!behavior.canSelect && disabledLabel && !isCurrentFolder ? (
    <span className="move-menu-note">{disabledLabel}</span>
  ) : null}
  {behavior.hasSubmenu ? <span className="menu-chevron" aria-hidden="true" /> : null}
</button>
```

对应样式是：

```css
.move-folder-button {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
}
```

也就是说，按钮只定义了 3 列：

```txt
第 1 列：文件夹图标
第 2 列：文件夹名称
第 3 列：右侧内容
```

但实际 DOM 在某些状态下会出现 4 个子元素：

```txt
文件夹图标 + 文件夹名称 + 当前位置/不可移动 + 展开箭头
```

CSS Grid 会把第 4 个元素放进隐式网格行。由此推导，当文件夹名称较长、第二列被压缩时，右侧状态文字和展开箭头更容易出现换行、下沉或错位。

### 2.3 为什么不能只靠加宽或隐藏解决

不建议采用这些方案：

```css
/* 不推荐 */
.move-folder-button { width: 320px; }
.move-menu-note { display: none; }
.menu-chevron { position: absolute; right: 10px; }
```

原因：

1. 加宽只是在当前截图尺寸下缓解问题，窗口变窄、Popup、Quick Save 场景仍会复发。
2. 隐藏状态标签会损失交互语义，例如用户无法判断「当前位置」。
3. 绝对定位会绕过 Grid 布局，后续加入 badge、快捷操作、RTL 或响应式时会继续堆补丁。

长期可维护的解法应该是：稳定 DOM 结构，让每一行永远只有「图标 / 标题 / 右侧操作区」三段，而不是让状态标签和箭头分别参与 grid 自动排布。

---

## 3. 修改方案

### 3.1 设计原则

将文件夹行统一成三段式结构：

```txt
[icon] [label] [trailing]
```

其中 `trailing` 是一个右侧容器，内部再放：

```txt
当前位置 / 不可移动 + 展开箭头
```

这样，无论右侧有 0、1、2 个元素，对外都只占 Grid 的第 3 列，避免 Grid 自动生成第二行。

---

## 4. 具体代码修改

## 4.1 修改 `src/components/FolderCascadeMenu.tsx`

在 `FolderCascadeRow` 中增加统一的右侧状态计算。

### 修改前

```tsx
const title = getDisplayTitle(folder);
```

### 修改后

```tsx
const title = getDisplayTitle(folder);
const rowNote = isCurrentFolder
  ? "当前位置"
  : !behavior.canSelect && disabledLabel
    ? disabledLabel
    : undefined;
const hasTrailing = Boolean(rowNote) || behavior.hasSubmenu;
```

然后替换按钮内部结构。

### 修改前

```tsx
<button
  className={getCascadeButtonClassName()}
  type="button"
  aria-disabled={!behavior.canSelect}
  disabled={behavior.buttonDisabled}
  onClick={() => {
    if (behavior.canSelect) {
      onSelect(folder);
    }
  }}
  onDoubleClick={() => {
    if (behavior.hasSubmenu) {
      onOpenFolder?.(folder);
    }
  }}
>
  <span className="menu-action-icon-slot" aria-hidden="true">
    <FolderLineIcon />
  </span>
  <span className="menu-action-label">{title}</span>
  {isCurrentFolder ? <span className="move-menu-note">当前位置</span> : null}
  {!behavior.canSelect && disabledLabel && !isCurrentFolder ? (
    <span className="move-menu-note">{disabledLabel}</span>
  ) : null}
  {behavior.hasSubmenu ? <span className="menu-chevron" aria-hidden="true" /> : null}
</button>
```

### 修改后

```tsx
<button
  className={getCascadeButtonClassName()}
  type="button"
  aria-disabled={!behavior.canSelect}
  disabled={behavior.buttonDisabled}
  title={title}
  onClick={() => {
    if (behavior.canSelect) {
      onSelect(folder);
    }
  }}
  onDoubleClick={() => {
    if (behavior.hasSubmenu) {
      onOpenFolder?.(folder);
    }
  }}
>
  <span className="menu-action-icon-slot" aria-hidden="true">
    <FolderLineIcon />
  </span>
  <span className="menu-action-label">{title}</span>
  {hasTrailing ? (
    <span className="move-folder-row-trailing">
      {rowNote ? <span className="move-menu-note">{rowNote}</span> : null}
      {behavior.hasSubmenu ? <span className="menu-chevron" aria-hidden="true" /> : null}
    </span>
  ) : null}
</button>
```

### 说明

这里不要修改 `src/features/context-menu/index.ts` 里的 `getCascadeRowBehavior`。它的职责是判断「是否可选、是否有子菜单、按钮是否禁用」，属于交互逻辑层；本次问题属于 UI 结构层，应该在 `FolderCascadeMenu.tsx` 和样式层解决。

---

## 4.2 修改 `src/app/styles.css`

找到 `.move-folder-button`，保留三列布局，但让第三列明确表示右侧容器。

### 建议修改

```css
.move-folder-button {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) max-content;
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

.move-folder-button > .menu-action-icon-slot {
  justify-self: center;
}

.move-folder-button > .menu-action-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.move-folder-row-trailing {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  justify-self: end;
  gap: 6px;
  min-width: max-content;
  color: var(--muted);
}

.move-folder-row-trailing .menu-chevron {
  margin-left: 0;
  flex: 0 0 7px;
}

.move-menu-note {
  margin-left: 0;
  color: var(--muted);
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
}
```

同时把旧的这段：

```css
.move-folder-button .menu-chevron,
.menu-action-trailing .menu-chevron {
  justify-self: end;
}

.move-menu-note {
  margin-left: auto;
  color: var(--muted);
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
}

.move-menu-note + .menu-chevron {
  margin-left: 2px;
}
```

调整为：

```css
.menu-action-trailing .menu-chevron {
  justify-self: end;
}

.move-folder-row-trailing .menu-chevron {
  margin-left: 0;
}
```

如果其他普通菜单仍然使用 `.menu-action-trailing .menu-chevron`，保留它；不要全局删除。核心是让 `move-folder-button` 内部的 chevron 由 `.move-folder-row-trailing` 管理。

---

## 4.3 修改 `src/popup/styles.css`

Popup 里也复用了 `FolderCascadeMenu`，因此必须同步修改，否则保存入口里的目录选择器会出现同类问题。

### 建议修改

```css
.move-folder-button {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) max-content;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 38px;
  padding: 0 10px;
  color: var(--body);
  font-size: 14px;
  text-align: left;
  border: 0;
  border-radius: 8px;
  background: transparent;
}

.move-folder-button > .menu-action-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.move-folder-row-trailing {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  justify-self: end;
  gap: 6px;
  min-width: max-content;
  color: var(--muted);
}

.move-folder-row-trailing .menu-chevron {
  margin-left: 0;
  flex: 0 0 7px;
}

.move-menu-note {
  margin-left: 0;
  color: var(--accent);
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}
```

建议把这类脆弱选择器替换掉：

```css
.move-folder-button > span:nth-child(2),
.move-folder-button > .menu-action-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

改成：

```css
.move-folder-button > .menu-action-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

`span:nth-child(2)` 对 DOM 顺序强依赖，后续只要多包一层容器就容易产生误伤。长期看，应使用语义类名而不是子元素序号选择器。

---

## 4.4 修改 `src/features/quick-save/contentStyle.ts`

Quick Save 是 Shadow DOM 注入样式，不会自动继承 `app/styles.css` 或 `popup/styles.css`。这里也要同步。

### 需要替换的旧选择器

当前有类似样式：

```css
.folder-result strong,
.recent-folders button span,
.move-folder-button span:not(.move-menu-note) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

建议改为：

```css
.folder-result strong,
.recent-folders button span,
.move-folder-button > .menu-action-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

然后同步 `.move-folder-button` 和右侧容器样式：

```css
.move-folder-button {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) max-content;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  padding: 0 12px;
  color: #0f172a;
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 8px;
  font: inherit;
  font-size: 15px;
  font-weight: 760;
  text-align: left;
  cursor: pointer;
}

.move-folder-row-trailing {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  justify-self: end;
  gap: 7px;
  min-width: max-content;
  color: #94a3b8;
}

.move-folder-row-trailing .menu-chevron {
  margin-left: 0;
  flex: 0 0 auto;
}

.move-menu-note {
  margin-left: 0;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}
```

---

## 5. 兼容性与架构说明

### 5.1 不改变组件外部 API

本次修改不需要改 `FolderCascadeMenu` 的 props，也不需要改 `FolderMoveSubmenuContent` 的调用方式。

因此下面这些调用方不需要业务层改造：

```txt
src/app/workspace/WorkspaceComponents.tsx
src/features/quick-save/QuickSaveDialog.tsx
src/popup/components/SaveLocationPicker.tsx
src/popup/tabs/SettingsTab.tsx
```

### 5.2 不改变菜单定位算法

`getCascadeMenuPlacement`、`getCascadePathOnRowEnter`、`getCascadeRowBehavior` 不应为本问题承担修复职责。

原因是：

- 菜单定位算法只关心浮层位置。
- 行行为算法只关心是否可选、是否展开、是否禁用。
- 本问题是单行内部布局错位，属于组件结构和 CSS 布局问题。

这样分层更清楚，也避免后续把 UI 补丁写进纯逻辑函数里。

### 5.3 同步三套样式，避免局部修复

目前项目里同一个 `FolderCascadeMenu` 会运行在三个界面环境中：

```txt
主工作区：src/app/styles.css
Popup：src/popup/styles.css
Quick Save Shadow DOM：src/features/quick-save/contentStyle.ts
```

如果只修主工作区，Popup 或 Quick Save 后续仍会复现。正确做法是同步三个样式入口，保持组件结构与样式契约一致。

### 5.4 避免未来再次出现的问题

以后所有菜单行都建议遵循这个结构：

```txt
icon slot → label slot → trailing slot
```

不要再让状态标签、箭头、badge、快捷键提示分别作为 grid 的独立列直接排布。新增元素都应该进入 `trailing slot`，否则同类问题会在新增功能时再次出现。

---

## 6. 验收标准

### 6.1 基础视觉验收

用以下文件夹名测试：

```txt
Bookmarks bar
Other bookmarks
AI Platform / Papers
这是一个非常非常长的文件夹名称用于测试菜单行省略和展开箭头对齐
```

需要满足：

1. 文件夹图标、文件夹名称、右侧状态标签、展开箭头始终在同一行垂直居中。
2. 长文件夹名使用省略号，不挤压图标和展开箭头。
3. 「当前位置」不会被挤到下一行。
4. 有子文件夹的行，展开箭头始终贴在右侧 trailing 区域。
5. 没有子文件夹的行，不显示空白的右侧箭头占位异常。

### 6.2 交互验收

需要覆盖这些状态：

```txt
普通文件夹
当前所在文件夹
不可移动文件夹
有子文件夹的文件夹
当前所在文件夹 + 有子文件夹
不可移动文件夹 + 有子文件夹
超长名称 + 有子文件夹
超长名称 + 当前所在文件夹 + 有子文件夹
```

每种状态都要确认：

- hover 高亮正常。
- 鼠标移入仍能打开子级菜单。
- 子级菜单定位没有变化。
- 当前路径高亮没有变化。
- 点击可移动文件夹仍能执行移动。
- 不可移动但有子菜单的文件夹仍能展开。

### 6.3 多入口验收

需要在三个入口都确认：

```txt
1. New Tab / 管理界面中的书签卡片右键移动菜单
2. Popup 保存入口的保存位置选择器
3. Ctrl+S / Quick Save 弹窗中的文件夹级联选择器
```

### 6.4 回归命令

建议执行：

```bash
npm test
npm run build
```

如果项目没有专门的视觉回归测试，至少需要人工打开上述三个入口进行截图对比。

---

## 7. 后续优化建议

当前项目中菜单相关样式在 `app/styles.css`、`popup/styles.css`、`quick-save/contentStyle.ts` 中有重复。短期同步修改即可；中期建议抽出一份共享的菜单样式契约，例如：

```txt
src/components/menu/menuLayout.css
src/components/menu/MenuRow.tsx
```

但这不是本次修复的前置条件。当前最稳妥的做法是先修复 `FolderCascadeMenu` 的 DOM 结构，再同步三个样式入口，避免为了一个小 bug 牵动过大的架构迁移。
