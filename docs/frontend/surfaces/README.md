# Bookmark Visualizer Frontend Surfaces

> 本目录按当前仓库源码维护 Bookmark Visualizer 的页面级 UI surface、组件路径、CSS selector、状态链路和回归清单。

## 适用目标

这套文档用于长期维护 Bookmark Visualizer 插件的页面级 UI 与功能链路。每当新增 surface、改动组件、修改交互、调整 CSS token、改变数据存储或 Chrome API 路径时，都应该同步更新对应 surface 文档。

本目录不是产品、架构、数据或 ADR 的事实源。产品行为以 `docs/product/` 为准，模块边界和权限入口以 `docs/architecture/` 为准，storage key 和数据模型以 `docs/data/` 为准，长期技术决策以 `docs/adr/` 为准；surfaces 文档只记录这些决策在 UI surface 上的当前实现和维护入口。

## 当前前端页面边界

| 页面 / Surface | 入口 | 主 React 根组件 | 样式入口 | 页面定位 |
|---|---|---|---|---|
| 管理页 Workspace | `index.html` | `src/app/App.tsx` | `src/main.tsx` → `src/styles/tokens.css` + `src/app/styles.css` | 高密度书签管理工作台 |
| 保存小窗口 | `save.html` | `src/save-window/SaveWindowApp.tsx` → `src/popup/PopupApp.tsx` | `src/save-window/main.tsx` → `src/styles/tokens.css` + `src/popup/styles.css` + `src/save-window/styles.css` | 保存当前网页 / 快速管理 / 常用设置 |
| Popup fallback | `popup.html` | `src/popup/PopupApp.tsx` | `src/popup/main.tsx` → `src/styles/tokens.css` + `src/popup/styles.css` | fallback / dev entry |
| New Tab Portal | `newtab.html` | `src/newtab/NewTabApp.tsx` | `src/newtab/main.tsx` → `src/styles/tokens.css` + `src/newtab/styles.css` | 搜索优先的新标签页入口 |
| Quick Save 内容脚本浮框 | esbuild IIFE → `dist/quick-save-content.js` | `src/features/quick-save/QuickSaveDialog.tsx` | `src/features/quick-save/contentStyle.ts` 注入 Shadow DOM | 低权限快捷保存浮框 |
| Service Worker | `src/service-worker.ts` | `registerServiceWorker()` | 无 UI CSS | 快捷键、消息路由、New Tab runtime redirect |

## 文档目录

```text
docs/frontend/surfaces/
  README.md
  00-current-code-alignment.md
  00-doc-architecture-and-maintenance-rules.md
  manager/
    README.md
    01-layout-ui-map.md
    02-component-catalog.md
    03-interactions-data-flow.md
    04-css-design-tokens.md
    05-maintenance-plan.md
  popup/
    README.md
    01-save-tab-ui-map.md
    02-location-picker-flow.md
    03-settings-and-manage-tab.md
    04-css-maintenance.md
  newtab/
    README.md
    01-layout-search-shortcuts.md
    02-settings-state-and-redirect-flow.md
    03-css-maintenance.md
  quick-save/
    README.md
    01-dialog-ui-and-shadow-dom.md
    02-injection-and-background-flow.md
    03-css-and-shadow-dom.md
  shared/
    README.md
    01-shared-components.md
    02-data-storage-and-chrome-api.md
    03-folder-cascade-menu.md
    04-icons-and-ui-primitives.md
  reference/
    01-code-navigation-index.md
    02-ui-element-index.md
    03-regression-checklist.md
    04-docs-code-alignment-2026-05-08.md
```

## 阅读顺序

开发新功能时先读：`00-current-code-alignment.md` → 对应页面 `README.md` → 对应页面的 UI map / data flow → `shared/` 中的共享能力。

做 UI 细节修复时先读：对应页面的 CSS 文档 → `reference/02-ui-element-index.md` → `reference/03-regression-checklist.md`。

做架构或数据链路修改时先读：`shared/02-data-storage-and-chrome-api.md` → `00-doc-architecture-and-maintenance-rules.md` → 现有 `docs/architecture/`、`docs/data/` 和 `docs/adr/`。


## 最近对齐记录

- [Docs 与当前代码对齐记录（2026-05-08）](reference/04-docs-code-alignment-2026-05-08.md)
