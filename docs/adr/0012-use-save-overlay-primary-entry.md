# ADR 0012: 使用内容脚本 Save Overlay 作为主保存入口（not current implementation）

## 状态

已被 ADR 0013 和 ADR 0014 取代

2026-05-09 起，工具栏主保存入口恢复为 `action.default_popup = "popup.html"`。ADR 0014 已删除本 ADR 描述的 Save Overlay、fallback 保存页和 legacy content dialog 代码；本文仅保留历史决策背景。

## 背景

ADR 0011 把工具栏点击和 `Ctrl+Shift+S` 统一到独立 `save.html` 小窗口，解决了 toolbar popup 尺寸和失焦关闭限制。但用户当前更希望在普通网页上不离开页面、不出现系统窗口标题栏，直接完成保存、管理入口和常用设置操作。

内容脚本 Save Overlay 可以在用户主动点击工具栏图标或触发扩展命令后注入当前网页，并通过 Shadow DOM 隔离样式。它仍会遇到浏览器内部页、扩展页、文件 URL 和注入失败等边界，因此需要保留一个 extension page fallback。

## 备选方案

- 继续使用独立 `save.html` 小窗口作为主路径：权限和页面环境更简单，但用户会离开当前网页，并继续看到系统窗口外壳。
- 恢复 `action.default_popup = popup.html`：改动小，但重新引入浏览器 popup 的尺寸、失焦和层级限制。
- 在 manifest 中声明全局 content script 或 `<all_urls>` host access：可减少注入失败面，但权限成本高，不符合当前低权限策略。

## 决策

工具栏 action 和 `commands.open-quick-save` 统一调用 `openSaveExperience()`：

- 普通 `http` / `https` 页面通过 `chrome.scripting.executeScript()` 注入 `save-overlay-content.js`。
- `chrome://`、`edge://`、`chrome-extension://`、`file://` 等不可注入页面，以及注入失败场景，打开普通扩展标签页形式的 `save.html?...sourceUrl=...` fallback。
- `popup.html` 和 `save.html` 继续作为构建入口保留；`save.html` 是 fallback / legacy 页面，不再由工具栏主路径创建 OS popup window。
- manifest 继续不声明 `action.default_popup`、全局 `host_permissions` 或默认 `content_scripts`，并继续依赖用户主动操作授予的 `activeTab` + `scripting` 能力。
- Save Overlay、`save.html` fallback、Popup fallback 和 legacy Quick Save 复用现有 Quick Save message 协议完成书签创建、备注、最近文件夹和新建文件夹。

## 后果

- 普通网页的主保存体验不再显示系统窗口标题栏，并可在当前页面内完成保存。
- 受限页面仍可通过 fallback 标签页保存 URL 引用，但不会执行 metadata 内容脚本注入。
- `src/background/saveExperienceHandlers.ts` 成为工具栏保存入口边界；`src/background/saveWindow.ts` 只保留为 legacy helper / 测试覆盖，不能重新接回主路径。
- 构建和入口校验必须同时关注 `dist/save-overlay-content.js`、`dist/quick-save-content.js`、`dist/save.html`、`dist/popup.html`、`dist/manifest.json` 和 `dist/service-worker.js`。
- 未来如果要删除 legacy Quick Save 或独立保存窗口 helper，应另开清理任务，并先确认 fallback、文档和测试覆盖完整。
