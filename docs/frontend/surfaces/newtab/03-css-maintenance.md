# New Tab CSS 与设计维护

## 样式入口

```text
src/newtab/main.tsx
  → import "../styles/tokens.css"
  → import "./styles.css"
```

## Token 使用

New Tab 使用 `--nt-*` alias，这些 alias 来自 `src/styles/tokens.css`：

| token | 用途 |
|---|---|
| `--nt-bg` | 页面背景 |
| `--nt-panel` | 半透明 panel |
| `--nt-panel-solid` | 实色 panel |
| `--nt-text` | 主文本 |
| `--nt-muted` | 辅助文本 |
| `--nt-line` / `--nt-line-soft` | 边框 |
| `--nt-accent` | 主色 |
| `--nt-accent-soft/softer/ring` | hover / focus |
| `--nt-radius-*` | 圆角 |
| `--nt-shadow-*` | 阴影 |

New Tab 也可以直接消费共享 component tokens：

- 已迁移的 header 管理页入口和主导航动作使用 `src/design-system/primitives/Button/`，对应 `.bv-button` / `.bv-icon-button` 与 `--bv-button-*`、`--bv-icon-button-*`。
- 已迁移的 `CustomizeLayoutPanel` native selects / 数字输入和 `ShortcutDialog` 标题 / URL 输入使用 `src/design-system/primitives/FormControls/`，对应 `.bv-select`、`.bv-input-shell`、`.bv-input-control` 与 `--bv-input-*`。
- 后续替换 SearchPanel combobox、panel、drawer、dialog、toast、chip 时，应复用 `--bv-input-*`、`--bv-panel-*`、`--bv-dialog-*`、`--bv-drawer-*`、`--bv-toast-*`、`--bv-chip-*`，再保留必要的 `--nt-*` 布局 alias。
- `.nt-page` 的搜索首屏背景光斑是当前例外，记录在 [Token exceptions](../reference/token-exceptions.md)；不要把该背景样式扩散到其他 surface。
- 新增页面级 CSS 必须遵守 [CSS hardcode policy](../reference/css-hardcode-policy.md)，避免新增 raw 视觉值。

## 主要 selector

| selector | 组件 | 说明 |
|---|---|---|
| `.nt-page` | `NewTabApp` | 页面背景和布局模式 class：`.is-standard-mode` 等 |
| `.nt-header` | `NewTabApp` | sticky header |
| `.nt-main-nav` | `NewTabApp` | 顶部轻导航 |
| `.nt-scroll-root` | `NewTabApp` | 页面滚动根 |
| `.nt-container` | `NewTabApp` | 内容最大宽度 |
| `.nt-main-grid` | `NewTabApp` | 中央列 + 右侧栏 |
| `.nt-center-column` | `NewTabApp` | 搜索和主要内容 |
| `.nt-right-rail` | `NewTabApp` | 辅助栏 |
| `.nt-search-hero` | `SearchPanel` | 搜索主卡 |
| `.nt-search-box` | `SearchPanel` | 搜索输入 shell |
| `.nt-suggestion-panel` | `SearchPanel` | 建议浮层 |
| `.bv-input-shell` / `.bv-input-control` / `.bv-select` | `ShortcutDialog` / `CustomizeLayoutPanel` | 共享 FormControls 字段 |
| `.nt-shortcut-grid` | `PinnedShortcutGrid` | 快捷方式网格 |
| `.nt-folder-strip` | `BookmarkGroupStrip` | 书签分组横向流 |
| `.nt-featured-row` | `FeaturedBookmarkRow` | 精选书签列表 |
| `.nt-side-panel` | 右侧栏组件 | 最近活动 / 快捷操作 / 存储 |
| `.nt-drawer-backdrop` | 抽屉 / 对话框 | overlay |
| `.nt-toast` | `NewTabApp` | 短反馈 |

## 布局模式

`NewTabApp` 会在根节点输出布局 class：

| 模式 | class | 当前实现说明 |
|---|---|---|
| standard | `.is-standard-mode` | 默认布局。主要通过 React 渲染默认 section 组合，CSS 中没有大量专属覆盖。 |
| sidebar | `.is-sidebar-mode` | 当前 CSS 中存在明显布局覆盖，例如 `.is-sidebar-mode .nt-container`，用于动态侧栏布局。 |
| tabs | `.is-tabs-mode` | 主要通过 React 条件渲染 `.nt-content-tabs` 和 active tab 内容，CSS 专属覆盖较少。 |

维护重点：不要误以为三个模式都有完整对称的 CSS 体系。修改布局时需要同时检查 `NewTabApp.tsx` 的条件渲染和 `src/newtab/styles.css` 中 `.is-sidebar-mode` 的覆盖。

## 设计规则

- 搜索 hero 必须是第一视觉焦点。
- Header 品牌要克制，不要变成大标题。
- 快捷方式可以多，但不应超过首屏过多；`newTabShortcutsPerRow` 限制 4–10。
- 右侧栏是辅助信息，不应抢搜索焦点。
- 背景光斑只在 New Tab 使用，不要迁移到管理页或 Popup。
- 不要在 `.nt-shortcut-icon` 以外大量使用随机品牌色。

## 响应式重点

- 小宽度下右侧栏应下移或隐藏，不压缩搜索框。
- `.nt-suggestion-panel` 要跟随搜索框宽度，不超出 viewport。
- shortcut grid 使用 CSS var 控列数，但窄屏必须覆盖为较少列。
- sidebar mode 的 `.nt-hover-sidebar` 不能遮住搜索输入。

## 回归清单

- 默认 standard 布局首屏搜索位置居中、右侧栏不挤压。
- 搜索输入时 suggestion panel 层级高于快捷方式。
- 选择不同搜索分类，chip active 状态正确。
- 添加网站 dialog 和 customize drawer 层级正常。
- 快捷方式隐藏后不会重新出现，除非清除 hidden state。
- layoutMode 切换 standard / sidebar / tabs 后内容不丢失。
