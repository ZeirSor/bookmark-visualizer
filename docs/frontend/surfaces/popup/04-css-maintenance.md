# Popup CSS 与维护规则

## 样式入口

```text
src/popup/main.tsx
  → import "../styles/tokens.css"
  → import "./styles.css"
```

## Popup 尺寸

Popup 固定尺寸来自 token：

| token | 值 | 用途 |
|---|---|---|
| `--popup-width` | `780px` | Popup 宽度 |
| `--popup-height` | `600px` | Popup 高度 |
| `--popup-control-height` | `40px` | 输入框 / 控件高度 |
| `--popup-row-height` | `34px` | 紧凑列表行高 |
| `--popup-tab-height` | `42px` | 顶部 Tab 高度 |

## 页面结构 selector

| selector | 说明 |
|---|---|
| `.popup-shell` | Popup 根，grid rows：header / tabs / content / footer |
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
| `.url-input` | readonly URL |

## 保存位置 selector

| selector | 用途 |
|---|---|
| `.location-panel` | 保存位置 section |
| `.location-picker-shell` | 路径行和 cascade anchor |
| `.location-path-row` | 当前路径行 |
| `.location-path-row.is-disabled` | loading / 无目标时弱化 |
| `.path-display` | 路径文本省略 |
| `.current-badge` | 当前路径标签 |
| `.location-arrow-button` / `.is-open` | 打开 cascade 的箭头按钮 |
| `.location-cascade-overlay` | body portal 根 |
| `.folder-search-row` | 搜索 + 新建按钮行 |
| `.folder-search` | 搜索框 shell |
| `.folder-search-clear` | 清除按钮 |
| `.folder-results` | 搜索结果 |
| `.result-badge` | 最佳匹配 |
| `.create-folder-row` | 原位新建文件夹 |
| `.button-spinner` | 新建 loading |
| `.recent-row` | 最近位置区域 |
| `.recent-chips` / `.is-expanded` | 最近位置 chips |

## 菜单层级

Popup 的保存位置级联菜单使用 `document.body` portal。维护时注意：

- `.popup-shell` 仍然 `overflow: hidden`，所以菜单不能作为 shell 内普通子元素展开。
- `.location-cascade-overlay` 必须 `position: fixed`。
- 子级 cascade 继续由 `FolderCascadeMenu` 管理。
- 滚轮事件应停在菜单内，避免 Popup 内容跟着滚。

## 视觉规则

- Popup 是高频短流程，控件密度可以比 New Tab 高。
- 按钮圆角不宜过大，当前 token 偏 6–10px；外壳圆角用 `--popup-radius-shell`。
- 主按钮只用于保存 / 确认。
- Icon-only button 必须有 `aria-label` 和 `title`。
- readonly URL 仍要保持可读和可选中文本。
- 搜索和新建互斥，视觉上不能同时占满保存位置区域。
- `popupThemeMode` 当前只持久化设置状态，尚未接入 `.popup-shell` class / data attribute 或完整暗色变量映射；维护文档不能把它写成已完整生效的 Popup 暗色主题。

## 回归清单

- 780×600 下所有 Tab 不出现双重横向滚动。
- SaveTab footer 固定，内容滚动时保存按钮仍可见。
- 保存位置 cascade 不被裁剪。
- 搜索结果过长时单行省略，不撑破布局。
- 最近 chips 展开时正常换行，图标和文字间距一致。
- Settings 默认保存位置菜单 hover 不闪烁。
