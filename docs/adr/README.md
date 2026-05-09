# ADR

本目录记录已经接受、废弃或被取代的长期架构决策。ADR 用于保存“为什么这样做”，不是日常任务清单。

## 当前决策

- [ADR 0001: 第一版使用 Chrome / Edge Manifest V3](0001-use-chrome-edge-mv3.md)
- [ADR 0003: 使用浏览器原生书签作为唯一结构数据源](0003-use-native-bookmarks-as-source-of-truth.md)
- [ADR 0004: 插件元数据保存在本地并支持导入导出](0004-store-extension-metadata-locally.md)
- [ADR 0005: 前端使用 React + TypeScript + Vite](0005-use-react-typescript-vite.md)
- [ADR 0006: 使用工具栏图标作为启动入口](0006-use-toolbar-action-as-launch-entry.md)
- [ADR 0009: 使用可开关的新标签页重定向](0009-use-toggleable-new-tab-redirect.md)
- [ADR 0010: 使用本地 favicon cache](0010-use-local-favicon-cache.md)
- [ADR 0013: 恢复工具栏 popup 作为主保存入口](0013-restore-toolbar-popup-primary-entry.md)
- [ADR 0014: 删除 legacy 保存入口并保留可选页面快捷键 bridge](0014-remove-legacy-save-surfaces.md)

## 历史决策

- [ADR 0002: 主界面使用新标签页](0002-use-new-tab-as-primary-surface.md)：已废弃，由 ADR 0006 取代；可选 New Tab Portal 的新决策见 ADR 0009。
- [ADR 0007: 使用扩展命令和全局 listener 实现快捷保存](0007-use-command-shortcut-active-tab-quick-save.md)：已废弃，由 ADR 0008 取代。
- [ADR 0008: 使用工具栏 popup 承载当前网页保存](0008-use-toolbar-popup-for-current-page-save.md)：曾被 ADR 0011 取代；当前主方向由 ADR 0013 恢复为 toolbar popup。
- [ADR 0011: 使用独立保存小窗口作为主保存入口](0011-use-independent-save-window.md)：已被 ADR 0012 取代，后续又由 ADR 0013 / ADR 0014 取代。
- [ADR 0012: 使用内容脚本 Save Overlay 作为主保存入口](0012-use-save-overlay-primary-entry.md)：已被 ADR 0013 / ADR 0014 取代，相关代码已删除。

## 使用规则

当工作改变持久架构原则、启动入口、权限策略、数据事实源、存储策略或技术栈时，新增或更新 ADR。普通功能细节和短期任务记录不要写成 ADR。
