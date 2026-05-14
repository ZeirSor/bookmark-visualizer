---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# 管理页 CSS 与设计 token 维护说明

## 样式入口

```text
src/main.tsx
  → import "./styles/tokens.css"
  → import "./app/styles.css"
```

## Token 分层

| 层 | 文件 | 示例 | 说明 |
|---|---|---|---|
| 全局基础 token | `src/styles/tokens.css` | `--bv-color-accent-base`、`--bv-radius-lg`、`--bv-shadow-sm` | 跨页面稳定值 |
| 共享 component token | `src/styles/tokens.css` | `--bv-button-*`、`--bv-input-*`、`--bv-card-*`、`--bv-dialog-*` | 新共享 primitive / pattern 的视觉契约 |
| app alias | `src/styles/tokens.css` | `--app-bg`、`--app-panel`、`--app-dark-bg` | 管理页使用的页面级 alias |
| 管理页兼容变量 | `src/app/styles.css` | `--surface-card`、`--text-primary`、`--control-height-md` | 现有 CSS 使用的语义变量 |
| 组件 selector | `src/app/styles.css` | `.bookmark-card`、`.folder-tree`、`.right-rail` | 具体 UI 样式 |

## 页面级关键变量

| 变量 | 用途 |
|---|---|
| `--surface-page` | 页面背景 |
| `--surface-sidebar` | 左侧栏背景 |
| `--surface-card` | 卡片 / panel 背景 |
| `--surface-card-hover` | hover 背景 |
| `--surface-selected` | 选中态浅色背景 |
| `--border-default` | 默认边框 |
| `--border-accent` | 强调边框 |
| `--text-primary` | 主文本 |
| `--text-muted` | 辅助文本 |
| `--color-accent` | 主强调色 |
| `--radius-md/lg/xl` | 组件圆角 |
| `--shadow-card` | 卡片阴影 |
| `--motion-fast/normal/slow` | 动效时长 |
| `--z-dropdown/popover/drawer/toast` | 层级 |

## Token Governance

管理页仍保留较多历史兼容变量，它们是后续迁移输入，不是新增视觉体系的模板。

- 新增或重写按钮、输入框、卡片、panel、dialog、drawer、menu、toast、chip 样式时，优先消费 `--bv-*` semantic / component tokens。
- 不新增页面级 hex、raw `rgb()` / `rgba()` 视觉色、圆角、阴影、z-index、transition duration 或 focus ring；必要例外记录到 [Token exceptions](../reference/token-exceptions.md)。
- Manager dark-mode alias 当前是临时保留项，记录为 `TE-001`；在 Phase 4 大范围替换管理页 primitive 前，应把可共享的暗色语义提升到全局 token。
- 页面 selector 可以继续承担布局、网格、滚动、响应式和数据状态组合，但不要创建新的 base control recipe。

## 主要 selector 维护表

| selector | 对应组件 | 维护说明 |
|---|---|---|
| `.app-shell` | `App.tsx` | 三列布局，不能让 workspace 被 sidebar 挤出 viewport |
| `.sidebar` | `App.tsx` | 高度固定 100vh，内部树滚动 |
| `.resize-handle` | `App.tsx` | 鼠标 col-resize，hover 后高亮 |
| `.workspace` | `App.tsx` | 右侧主容器，内部 manager-layout |
| `.toolbar` | `TopToolbar.tsx` | 面包屑、搜索、控制区横向排列 |
| `.search-bar` | `SearchBar.tsx` | focus ring 必须清晰；清除按钮只在有值时显示 |
| `.manager-layout` | `App.tsx` | 中央 + 右侧栏 grid |
| `.folder-header` | `FolderHeader.tsx` | 头部概览，和命令栏间距要稳定 |
| `.bookmark-command-bar` | `BookmarkCommandBar.tsx` | disabled 与 active 态要有明显差异 |
| `.folder-strip` | `FolderStrip.tsx` | 子文件夹横向 / wrap 区域 |
| `.selection-action-bar` | `SelectionActionBar.tsx` | 批量模式下置于主区顶部 |
| `.card-grid` | `WorkspaceContent.tsx` | 受 `data-card-size` 影响 |
| `.bookmark-card` | `BookmarkCard.tsx` | 卡片根，状态多，是回归重点 |
| `.inline-editor` | `BookmarkCard.tsx` | 行内编辑状态，textarea 与 input 都要检查 |
| `.context-menu-panel` | `WorkspaceComponents.tsx` | 右键菜单主面板 |
| `.move-submenu` / `.context-submenu` | `WorkspaceComponents.tsx` / `FolderCascadeMenu.tsx` | 级联菜单定位与滚动 |
| `.right-rail` | `RightRail.tsx` | 右侧栏宽度、响应式隐藏或下移 |
| `.operation-log-drawer` | `WorkspaceComponents.tsx` | 抽屉层级高于页面但低于 toast |
| `.toast` | `WorkspaceComponents.tsx` | 操作反馈和撤销入口 |

## 状态 class

| class | 出现位置 | 语义 |
|---|---|---|
| `.is-selected` | `BookmarkCard`、`FolderTree`、menus | 当前选中项 |
| `.is-selectable` | `BookmarkCard` | 批量选择模式 |
| `.is-highlighted` | `BookmarkCard` | deep link / 树点击定位 |
| `.is-highlight-pulse` | `BookmarkCard` | 短暂动画反馈 |
| `.is-active` | 命令栏、tab、menu | 当前激活 |
| `.is-danger` | 删除按钮 | 危险操作 |
| `.is-empty` | 备注按钮 | 空备注弱提示 |
| `.is-renaming` | `FolderTree` | 文件夹重命名态 |

## 响应式维护

管理页是工作台，不建议在窄屏强行压缩为移动端卡片流。维护时遵循：

- 左侧 sidebar 有最小宽度，拖拽范围在 220–640px。
- 中央主区必须 `minmax(0, 1fr)`，避免长标题撑爆布局。
- 右侧栏在较窄窗口应降低优先级，可以下移或隐藏，但不能遮挡卡片。
- 右键菜单和级联菜单必须使用固定定位 / portal，避免被 `.workspace` 或滚动容器裁剪。

## Dark theme

`App.tsx` 会把 `settings.theme` 写入：

```ts
document.documentElement.dataset.theme = settings.theme;
```

`src/app/styles.css` 通过 `:root[data-theme="dark"]` 覆盖管理页语义变量。新增组件样式必须使用变量，不要在 dark theme 中复制整块 selector。

## 设计原则

- 管理页密度可以高，但按钮点击目标不能低于约 32px。
- 卡片 hover 优先改变边框和阴影，不做大幅位移。
- disabled 入口必须弱化视觉，不允许像可点击主操作一样显眼。
- 删除、危险操作使用 danger 色，不使用主色。
- 行内编辑 focus ring 必须可见，因为这是主要生产力操作。
