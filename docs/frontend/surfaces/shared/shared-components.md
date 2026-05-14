---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# 共享组件与 UI primitive

## 共享组件列表

| 组件 | 文件 | 使用页面 | 说明 |
|---|---|---|---|
| `Button` / `IconButton` | `src/design-system/primitives/Button/*` | Popup、New Tab，后续迁移管理页 | P0 shared primitive，统一 action / icon-only action 的 variant、size、loading、selected、danger、focus 规则 |
| `Input` / `Textarea` / native `Select` | `src/design-system/primitives/FormControls/*` | Popup Save Tab、New Tab ShortcutDialog / CustomizeLayoutPanel，后续迁移管理页和搜索类字段 | P0 shared primitive，统一普通输入、备注 textarea、native select 的尺寸、readonly、invalid、focus 和 token 使用；`Switch` 仍为 contract-only |
| `BookmarkCard` | `src/components/BookmarkCard.tsx` | 管理页 | 书签卡片、行内编辑、选择态 |
| `FolderTree` | `src/components/FolderTree.tsx` | 管理页 | 左侧文件夹树和拖拽 |
| `FolderCascadeMenu` | `src/components/FolderCascadeMenu.tsx` | 管理页、Popup、Quick Save、Settings | 多级文件夹选择 / 移动菜单 |
| `FolderMoveSubmenuContent` | `src/components/FolderMoveSubmenuContent.tsx` | 管理页右键菜单 | 移动菜单内搜索、最近位置、级联入口 |
| `BreadcrumbNav` | `src/components/BreadcrumbNav.tsx` | 管理页 | 顶部路径导航 |
| `SearchBar` | `src/components/SearchBar.tsx` | 管理页 | 通用搜索框 |
| `MenuActionContent` | `src/components/MenuActionContent.tsx` | 菜单 | 图标 + label + trailing 布局 |
| `AppIcons` | `src/components/icons/AppIcons.tsx` | 多页面 | 基础图标和 New Tab 图标 |
| `ManagerIcons` | `src/components/icons/ManagerIcons.tsx` | 管理页 / New Tab | 管理功能图标 |
| `MenuActionIcons` | `src/components/icons/MenuActionIcons.tsx` | 菜单 | 编辑、移动、删除、文件夹等菜单图标 |

## 设计 token

文件：`src/styles/tokens.css`

四层结构：

```text
raw --bv-*        基础颜色、圆角、阴影、动效、层级、字体
semantic --bv-*   text / surface / line / accent / danger / focus 等语义
component --bv-*  button / input / card / panel / dialog / drawer / menu / toast / chip 等契约
surface alias     --app-* / --popup-* / --nt-* 页面适配
```

新增 UI 颜色时：

1. 先判断是不是已有语义：accent、success、danger、muted、line、surface。
2. 如果是跨页面需要，加入 `--bv-*`。
3. 如果属于 shared primitive / pattern 视觉契约，优先加入或复用 component token。
4. 如果只是页面密度或布局适配，加入对应 `--app-*` / `--popup-*` / `--nt-*`。
5. 组件 CSS 只引用 token，不直接写随机 hex、raw shadow、z-index、motion 或 focus ring。

详细规则见 [Token ownership](../reference/token-ownership.md)、[CSS hardcode policy](../reference/css-hardcode-policy.md) 和 [Token exceptions](../reference/token-exceptions.md)。

## 图标维护规则

- 纯图标按钮必须有 `aria-label` 和 `title`。
- 图标 SVG 尺寸由页面 CSS 控制，不在每个组件内硬写过多样式。
- 菜单图标优先使用 `MenuActionIcons`，页面区块图标使用 `AppIcons` / `ManagerIcons`。
- 新图标先确认是否跨页面共用；共用放 `AppIcons`，仅管理页用放 `ManagerIcons`。

## 通用交互规范

| 交互 | 规则 |
|---|---|
| hover | 轻微背景 / 边框变化，不大幅位移 |
| focus | 必须可见，优先使用 accent ring |
| disabled | 降低对比、禁用 cursor、不能保留强 hover |
| loading | 需要文本或 spinner / skeleton，不能只禁用按钮 |
| empty | 说明当前状态和下一步 |
| error | 保留用户输入，不强行重置页面 |
| Escape | 优先关闭局部浮层；无局部浮层时才执行页面级行为 |

## 可复用但暂不抽象的部分

| 相似能力 | 当前位置 | 不抽象原因 |
|---|---|---|
| Popup 保存位置 | `src/popup/components/SaveLocationPicker.tsx`、`src/components/folder-picker/InlineFolderPicker.tsx` | Popup 内联树、搜索、最近位置和新建文件夹 |
| New Tab side panel vs Manager RightRail | `NewTabSections.tsx`、`RightRail.tsx` | 页面定位不同：New Tab 轻入口，Manager 工作台 |
| 搜索框 | `SearchBar.tsx`、`SearchPanel.tsx`、Popup folder search | 搜索语义不同：全局书签 / 混合 web / 文件夹 |

原则：先共享 feature 逻辑和 token，不急着强行合并 UI 组件。

## 共享组件内部边界

| 组件 | 内部模块 | 维护重点 |
|---|---|---|
| `Button` / `IconButton` | `src/design-system/primitives/Button/*` | public export 来自 `src/design-system`；页面 class 只保留布局兼容，不新增页面级视觉 recipe |
| `Input` / `Textarea` / native `Select` | `src/design-system/primitives/FormControls/*` | public export 来自 `src/design-system`；保留 native input/select/textarea 行为，Popup `CustomSelect`、搜索 combobox、folder search/create row 和 `Switch` 不在本轮迁移范围 |
| `FolderTree` | `src/components/folder-tree/*` | public wrapper 保留在 `FolderTree.tsx`；递归节点、书签行、重命名输入、拖拽 drop helper、auto-scroll hook 分开维护 |
| `FolderCascadeMenu` | `src/components/folder-cascade/*` | public wrapper 保留在 `FolderCascadeMenu.tsx`；list / row / floating layer / placement / blur-close 行为分开维护 |
