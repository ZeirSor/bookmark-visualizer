# Surface Alignment Plan

## Surface Roles

Bookmark Visualizer 有三类主要前端界面，它们共享视觉系统，但承担不同任务。

| Surface | Role | Primary User Intent | Density |
|---|---|---|---|
| 管理页 | 高密度工作台 | 浏览、搜索、整理、编辑书签 | 高 |
| New Tab | 浏览器起始页 | 搜索、快速访问、轻浏览书签 | 中 |
| Popup | 快速保存工具 | 保存当前网页、选择位置、备注 | 高但短流程 |

## Shared Elements

三类界面必须共享：

- 蓝紫主色、浅灰表面、1px 边框、轻阴影。
- 图标按钮 hover/focus 语义。
- 输入框 focus ring。
- 卡片和 panel 的圆角等级。
- 菜单、级联浮层、toast 的视觉和 Escape 行为。
- 空态、错误态、加载态的文案语气。

## Allowed Differences

- 管理页可以更密、更偏工具台，不需要 New Tab 的大搜索 hero。
- New Tab 可以有柔和背景光斑和更大的搜索区域，但不能变成营销页。
- Popup 固定 780x600，优先稳定、可快速完成，不追求大面积装饰。

## Current Alignment Targets

### New Tab

- Header 主文本使用 `Bookmark Visualizer`，配 `新标签页` pill。
- 搜索框是第一视觉焦点。
- 固定快捷方式和书签分组不抢搜索焦点。
- Header actions 使用轻按钮，不使用强填色。

### Popup

- Header 保留 `我的书签 / Bookmark Visualizer`，因为 Popup 是工具栏保存入口，需要更明确的产品识别。
- 保存页字段顺序固定为：标题、URL、备注、保存位置。
- 保存位置组件是操作焦点，支持路径、搜索、新建和最近位置。
- 不在 React UI 组件中直接调用 `chrome.bookmarks`。

### 管理页

- 保持现有左右工作台信息架构。
- 后续只做 token 映射和组件状态统一，不重写主流程。
- 右键菜单、移动级联、搜索输入、卡片 hover/focus 应向 Popup/New Tab 靠齐。

## Non Goals

- 不引入 Tailwind、shadcn、Radix 或新的设计工具链。
- 不重新设计数据模型。
- 不把 Popup 改成 New Tab 或完整页面。
- 不为第一版添加 Firefox 专项兼容。
