---
type: decision
status: active
scope: architecture
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# ADR 0013: 恢复工具栏 popup 作为主保存入口

## 状态

已接受

## 背景

历史 ADR 0011 和 ADR 0012 先后尝试用独立 `save.html` 保存窗口和内容脚本 Save Overlay 承载主保存体验。它们解决了 popup 尺寸或当前页沉浸感问题，但也引入了入口分叉、内容脚本注入边界、fallback 说明复杂度和更多 background 入口状态。

当前产品优先级回到“点击工具栏图标即可打开稳定、可验证、功能完整的 Save / Manage / Settings popup”。后续 ADR 0014 已删除旧 overlay / save-window 代码，并新增默认关闭的页面内 Ctrl+S popup bridge。

## 决策

恢复 Manifest V3 标准 toolbar popup：

- `public/manifest.json` 声明 `action.default_popup = "popup.html"`。
- 默认快捷键改为特殊命令 `_execute_action`，使 `Ctrl+Shift+S` / macOS `Command+Shift+S` 打开同一个 action popup。
- `src/background/serviceWorker.ts` 不再注册 Save Overlay / save-window toolbar click 入口，也不再注册 legacy `open-quick-save` command handler。
- Service worker 仍注册 runtime message router 和 New Tab redirect；popup 继续通过 Quick Save message 协议读取保存状态、创建书签、创建文件夹、写 metadata 和更新最近文件夹。
- `save.html`、Save Overlay 和 legacy command helper 在 ADR 0014 中被删除，不再作为当前代码路径。

## 后果

- 点击扩展图标和触发扩展快捷键都会打开 `popup.html`。
- 工具栏点击不再注入 `save-overlay-content.js`，也不再打开 `save.html` fallback。
- 浏览器内部页面仍可在 popup 中保存为 URL 引用；metadata 注入只在允许的普通页面执行。
- Popup 的保存位置主交互使用内联 folder picker，避免横向 floating cascade 被工具栏 popup 边界裁剪。
- 当前入口验证命令为 `npm run verify:popup-entry`；旧 save-window verifier 已移除。
