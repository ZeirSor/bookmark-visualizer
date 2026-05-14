---
type: decision
status: active
scope: architecture
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# ADR 0014: 删除 legacy 保存入口并保留可选页面快捷键 bridge

## 状态

已接受

## 背景

ADR 0013 已恢复 `action.default_popup = "popup.html"`，让工具栏点击和 `_execute_action` 默认快捷键进入同一个 Save / Manage / Settings popup。旧的独立保存页、Save Overlay 和 Quick Save Shadow DOM dialog 继续留在代码库会造成入口事实分叉，让后续维护者误以为仍有多个当前保存 surface。

用户仍希望保留“页面内 Ctrl+S 触发保存”的能力，但该能力必须复用 popup，不应重新引入页面浮层、独立保存页或新的保存 UI。

## 决策

- 删除 legacy save page、legacy save window directory、legacy Save Overlay directory、legacy save experience/background command helpers，以及 legacy Quick Save content dialog UI；这些路径不是当前实现。
- 保留 `src/features/quick-save/` 中的 message types、folder helpers、create-folder helpers 和 UI-state compatibility facade，作为 popup 保存链路的业务协议。
- 新增 `src/features/page-shortcut/` 和 `src/background/pageShortcutHandlers.ts`，用于可选页面内 Ctrl+S bridge。
- 页面内 Ctrl+S 默认关闭；开启时请求 `http://*/*` / `https://*/*` optional host permissions，并动态注册 `page-shortcut-content.js`。
- Page shortcut content script 不渲染 UI、不读取 DOM metadata、不创建书签，只在非编辑元素中捕获 Ctrl+S / Command+S 并请求 background 打开 toolbar popup。

## 后果

- 当前保存入口只有 toolbar popup。
- 打包产物不再包含 `save.html`、`save-overlay-content.js` 或 `quick-save-content.js`。
- `npm run verify:popup-entry` 同时验证 popup entry、旧入口缺失断言和 page shortcut bundle。
- README、架构文档、PageDocs 和测试验收文档必须把 old save surfaces 描述为 historical / not current implementation，不能作为当前路径。
- ADR 0011 和 ADR 0012 仍保留历史原因，但其代码路径已由本 ADR 删除。
