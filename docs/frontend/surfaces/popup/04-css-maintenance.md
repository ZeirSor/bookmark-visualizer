# Popup CSS 与维护规则

## 样式入口

```text
src/popup/main.tsx
  → import "../styles/tokens.css"
  → import "./styles.css"

src/save-window/main.tsx
  → import "../styles/tokens.css"
  → import "../popup/styles.css"
  → import "./styles.css"
```

## Popup 尺寸

Popup 固定尺寸来自 token：

| token | 值 | 用途 |
|---|---|---|
| `--popup-width` | `800px` | Popup 宽度 |
| `--popup-height` | `600px` | Popup 高度 |
| `--popup-outer-padding` | `8px` | 透明外框和内部圆角留白 |
| `--popup-control-height` | `40px` | 输入框 / 控件高度 |
| `--popup-row-height` | `34px` | 紧凑列表行高 |
| `--popup-tab-height` | `42px` | 顶部 Tab 高度 |

## 保存窗口尺寸

独立 `save.html` 入口使用 `--save-*` alias，不改变 `popup.html` fallback 尺寸。

| token | 值 | 用途 |
|---|---|---|
| `--save-window-width` | `960px` | 保存窗口默认宽度 |
| `--save-window-height` | `680px` | 保存窗口默认高度 |
| `--save-window-min-width` | `840px` | 保存窗口最小适配宽度 |
| `--save-window-min-height` | `600px` | 保存窗口最小适配高度 |

## 页面结构 selector

| selector | 说明 |
|---|---|
| `.popup-shell` | Popup 根，grid rows：header / tabs / content / footer |
| `.save-window-shell` | 保存窗口根 variant，覆盖尺寸、header、tabs、content、footer |
| `.popup-header` | logo + brand + 打开管理页按钮 |
| `.popup-tabs` | 三个 Tab，active 下划线 |
| `.popup-content` | 当前 Tab 内容滚动区 |
| `.tab-scroll-area` | Manage / Settings 滚动内容 |
| `.popup-footer` | SaveTab 下固定 footer |

## 保存页 selector

| selector | 用途 |
|---|---|
| `.save-tab` | form 根 |
| `.save-layout` | 两列布局 |
| `.save-layout.without-preview` | 隐藏预览时的单列布局 |
| `.save-preview-column` | 预览列 |
| `.save-editor-column` | 表单列 |
| `.field-stack.compact` | 标题 / URL 组 |
| `.note-field.compact` | 备注 |
| `.note-label-row` | 备注 label + 字数提示 |
| `.url-input` | readonly URL |
| `.save-info-banner` | 浏览器内部页面可保存提示 |

## 保存位置 selector

| selector | 用途 |
|---|---|
| `.location-panel` | 保存位置 section |
| `.location-picker-shell` | 路径行和内联 picker 容器 |
| `.location-path-row` | 当前路径行 |
| `.location-path-row.is-disabled` | loading / 无目标时弱化 |
| `.path-display` | 路径文本省略 |
| `.current-badge` | 当前路径标签 |
| `.location-arrow-button` / `.is-open` | 打开内联 picker 的箭头按钮 |
| `.inline-folder-picker` | 内联 folder picker 根 |
| `.folder-search-input` | 搜索框 shell |
| `.picker-create-toggle` | 新建文件夹开关 |
| `.folder-tree` / `.folder-tree-item` | 内联树 |
| `.create-folder-row` | 原位新建文件夹 |
| `.button-spinner` | 新建 loading |
| `.recent-row` | 最近位置区域 |
| `.recent-chips` / `.is-expanded` | 最近位置 chips |

## Settings / Manage selector

| selector | 用途 |
|---|---|
| `.settings-section-body` | Settings section 内容栈 |
| `.setting-row` | Settings label / helper / control 行 |
| `.custom-select` / `.custom-select-trigger` / `.custom-select-menu` / `.custom-select-option` | Settings 非原生 select |
| `.manager-hero-card` | Manage dashboard 主入口 |
| `.manager-search-row` | Manage 搜索入口 |
| `.manager-action-grid` | Manage 快捷操作 |

## 菜单层级

Popup 的主保存位置选择器使用内联树。维护时注意：

- `.popup-shell` 仍然 `overflow: hidden`，所以 picker 自身需要内部滚动。
- `.inline-folder-picker-body` 负责深层文件夹滚动。
- 不要把 Save Tab 或 Settings 默认保存位置重新接回横向 floating cascade。
- legacy `.location-cascade-overlay` 只服务旧代码路径。

## 视觉规则

- Popup 是高频短流程，控件密度可以比 New Tab 高。
- 按钮圆角不宜过大，当前 token 偏 6–10px；外壳圆角用 `--popup-radius-shell`。
- 主按钮只用于保存 / 确认。
- Icon-only button 必须有 `aria-label` 和 `title`。
- readonly URL 仍要保持可读和可选中文本。
- 搜索和新建互斥，视觉上不能同时占满保存位置区域。
- `popupThemeMode` 当前只持久化设置状态，尚未接入 `.popup-shell` class / data attribute 或完整暗色变量映射；维护文档不能把它写成已完整生效的 Popup 暗色主题。

## 回归清单

- 800×600 下所有 Tab 不出现双重横向滚动。
- 960×680 保存窗口下 Save / Manage / Settings 三个 Tab 层级一致。
- 840×600 保存窗口下 Save Tab 隐藏 preview，Settings 行改为单列。
- SaveTab footer 固定，内容滚动时保存按钮仍可见。
- 保存位置内联 picker 不被裁剪，内部滚动可访问深层文件夹。
- Settings 主表单不出现原生 select 外观。
- 搜索结果过长时单行省略，不撑破布局。
- 最近 chips 展开时正常换行，图标和文字间距一致。
- Settings 默认保存位置内联 picker 打开、搜索和选择稳定。
