---
type: archive
status: archived
scope: archive
owner: project
last_verified: 2026-05-14
source_of_truth: false
archived_reason: "superseded, historical, or temporary content"
archived_from: "docs/adr/0002-use-new-tab-as-primary-surface.md"
current_source: "docs/README.md"
---

# ADR 0002: 主界面使用新标签页

## 状态

已废弃，由 [ADR 0006](0006-use-toolbar-action-as-launch-entry.md) 取代。

## 背景

产品需要同时展示文件夹树、卡片列表、搜索结果、右键菜单和移动弹窗。弹窗和侧边栏空间有限，容易影响拖拽和卡片体验。

## 决策

历史决策：第一版曾计划使用新标签页作为主界面。该决策已被 ADR 0006 废弃，当前入口改为工具栏图标。

## 替代方案

- 浏览器侧边栏：适合轻量辅助，但不适合舒展卡片和复杂拖拽。
- 扩展 popup：空间太小，不适合书签管理。
- 替换书签管理器：更贴近管理场景，但比新标签页入口弱，且扩展只能覆盖一种 Chrome 页面。

## 后果

- 该文档仅保留历史背景。
- 当前 manifest 不再声明 `chrome_url_overrides.newtab`。
- 当前主界面仍以完整页面打开，足够支持左右布局和搜索。
- 2026-05 新增的 New Tab Portal 不恢复“新标签页作为完整主界面”的历史方案；它是由 ADR 0009 定义的可选搜索 / 启动页，默认关闭，并通过运行时设置控制。
