# 当前代码对齐说明

## 本轮代码新增 / 强化的 UI 基准

当前源码相较旧版 UI 文档的最大变化不是单个样式，而是页面信息架构已经变了：

1. 管理页已经升级为三栏工作台：左侧树、中心工作区、右侧辅助栏。
2. 管理页新增命令栏、文件夹头部、子文件夹条、搜索筛选摘要、批量选择条和右侧快捷操作栏。
3. `BookmarkCard` 从简单卡片升级为包含 favicon、打开按钮、更多按钮、选择态、备注 chip、日期、星标占位、行内编辑的复合卡片。
4. 独立 `save.html` 保存小窗口复用 PopupApp，并已经形成两列结构：左侧页面预览，右侧标题 / URL / 备注 / 保存位置。
5. 保存位置组件已经拆分为路径行、级联菜单、原位搜索、新建文件夹行、最近位置 chips。
6. New Tab 作为独立入口存在，并通过设置开关控制 runtime redirect，不使用 `chrome_url_overrides`。
7. 统一 token 入口已经建立：`src/styles/tokens.css` 提供 `--bv-*` base token，并映射到 `--app-*`、`--popup-*`、`--nt-*`。
8. Quick Save 仍保留 Shadow DOM 内容脚本浮框能力，与保存小窗口有部分业务复用，但当前命令主入口已经转向 `save.html`。

## 当前页面入口链路

```text
index.html
  → src/main.tsx
  → src/styles/tokens.css
  → src/app/styles.css
  → src/app/App.tsx
  → src/app/workspace/* + src/components/* + src/features/*

save.html
  → src/save-window/main.tsx
  → src/styles/tokens.css
  → src/popup/styles.css
  → src/save-window/styles.css
  → src/save-window/SaveWindowApp.tsx
  → src/popup/PopupApp.tsx
  → src/popup/tabs/* + src/popup/components/* + src/features/popup/*

popup.html
  → src/popup/main.tsx
  → src/styles/tokens.css
  → src/popup/styles.css
  → src/popup/PopupApp.tsx
  → src/popup/tabs/* + src/popup/components/* + src/features/popup/*

newtab.html
  → src/newtab/main.tsx
  → src/styles/tokens.css
  → src/newtab/styles.css
  → src/newtab/NewTabApp.tsx
  → src/newtab/components/* + src/features/newtab/*

src/service-worker.ts
  → src/background/serviceWorker.ts
  → registerSaveWindowAction()
  → registerCommandHandlers()
  → registerMessageRouter()
  → registerNewTabRedirect() from src/features/newtab/newTabRedirect.ts

vite.config.ts closeBundle()
  → esbuild bundle src/features/quick-save/content.tsx
  → dist/quick-save-content.js
```

## 当前代码分层判断

| 层 | 当前目录 | 说明 | 维护原则 |
|---|---|---|---|
| 页面层 | `src/app`、`src/save-window`、`src/popup`、`src/newtab`、`src/features/quick-save/QuickSaveDialog.tsx` | 持有页面布局、局部状态和 UI 组合 | 可以组合 feature / shared components，不直接散落 Chrome API |
| 共享组件层 | `src/components` | 书签卡片、文件夹树、级联菜单、搜索框、图标 | 不能绑定某个页面文案，除非组件名明确属于页面 |
| feature 层 | `src/features/*` | 书签树、搜索、拖拽、settings、newtab、popup、quick-save 等业务能力 | 封装纯函数、存储、消息协议、状态推导 |
| Chrome 适配层 | `src/lib/chrome/*` | bookmarks / runtime / storage / permissions adapter | 所有 `chrome.*` 访问优先通过这里或 background handler |
| background 层 | `src/background/*` + `src/features/newtab/newTabRedirect.ts` | 命令、消息路由、New Tab runtime redirect | 不写 React，不写页面状态 |
| domain 层 | `src/domain/*` | 后续数据模型与导入导出基础 | 不直接依赖页面 UI |
| 样式 token 层 | `src/styles/tokens.css` | 跨页面视觉源头 | 新增颜色 / 圆角 / 阴影优先进 token，再映射到页面 alias |

## 当前维护风险

| 风险 | 位置 | 影响 | 建议 |
|---|---|---|---|
| 管理页 CSS 体量较大 | `src/app/styles.css` 约 3000 行 | 后续按钮 / 卡片 / 菜单样式容易互相影响 | 按模块逐步拆为 `workspace/layout.css`、`cards.css`、`menus.css`，但先保持构建稳定 |
| 保存窗口和 Quick Save 保存流程相似但 UI 不完全复用 | `src/save-window/*`、`src/popup/*` 与 `src/features/quick-save/*` | 修复保存位置行为时容易漏一边 | 把“保存位置业务规则”写在 shared 文档，UI 保持独立 |
| `FolderCascadeMenu` 同时服务管理页右键移动、保存窗口 / Popup fallback 保存位置、Settings 默认文件夹、Quick Save 浏览器 | `src/components/FolderCascadeMenu.tsx` | 一个行为调整可能影响四个入口 | 修改前先跑四个入口的级联菜单回归清单 |
| New Tab runtime redirect 依赖 settings | `src/features/newtab/newTabRedirect.ts` | 若设置默认值改错，可能意外接管新标签页 | `newTabOverrideEnabled` 必须默认 `false`，测试必须覆盖 |
| 批量能力目前只实现删除 | `src/app/workspace/components/SelectionActionBar.tsx`、`src/app/App.tsx` | UI 里有移动、标签、稍后阅读占位 | 禁用入口不能变成假功能；接入真实逻辑前保持 disabled |

## 本版文档对齐策略

- 管理页文档以 `src/app/App.tsx` 为主线，因为它持有绝大多数状态和事件入口。
- 保存窗口 / Popup 文档以 `src/save-window/SaveWindowApp.tsx`、`src/popup/PopupApp.tsx` 和 `SaveLocationPicker` 为主线，因为 source tab 与保存位置是最复杂交互。
- New Tab 文档以 `NewTabApp` + `features/newtab` 为主线，因为它既有 UI 又有 runtime redirect。
- Quick Save 文档单独维护，因为它运行在网页 Shadow DOM 内，样式隔离和消息链路不同。
- `shared/` 文档专门管理跨页面复用组件、数据存储和 Chrome API 边界。
