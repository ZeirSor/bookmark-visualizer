# ADR 0011: 使用独立保存小窗口作为主保存入口

## 状态

已被 ADR 0012 取代；当前又由 ADR 0013 取代

2026-05-09 起，普通 `http` / `https` 页面主保存入口先改为内容脚本 Save Overlay，随后恢复为 `action.default_popup = "popup.html"` 的工具栏 popup。`save.html` 和 Save Overlay 相关代码仅作为 legacy / 后续清理对象保留。

## 背景

ADR 0008 使用 `action.default_popup = popup.html` 承载当前网页保存，但工具栏 popup 的尺寸和失焦关闭行为限制了保存位置级联菜单、管理入口和设置页的可用空间。独立 extension page 小窗口可以继续复用扩展页面权限和现有保存链路，同时摆脱浏览器工具栏 popup 的 viewport 边界。

独立窗口打开后，`save.html` 自身会成为当前活动扩展页面，因此保存 UI 不能再依赖 `chrome.tabs.query({ active: true, currentWindow: true })` 作为原始网页来源。后台必须在点击工具栏图标或触发命令时把原始 tab 上下文传给 `save.html`。

## 决策

移除 manifest 中的 `action.default_popup`。工具栏 action click 和 `commands.open-quick-save` 都由 service worker 打开或聚焦独立 `save.html` 小窗口。

后台维护保存窗口 id 和 tab id，并在再次触发时聚焦已有窗口、刷新 `save.html?sourceTabId=...&sourceUrl=...`，避免重复创建多个保存窗口。若保存窗口 id 失效，后台会搜索现有 `save.html` tab 后复用，找不到时再创建新窗口。

`save.html` 复用现有 Save / Manage / Settings 三 Tab 组件。保存页优先通过 `sourceTabId` 读取原始 tab，必要时退回 query 参数中的 `sourceUrl` / `sourceTitle`。页面 URL 判定拆分为“可创建书签”和“可注入 metadata”：`http(s)` 页面可保存且可注入 metadata；`chrome://`、`edge://` 等浏览器内部页面可保存但不可注入脚本。

`popup.html` 暂时保留为构建产物和 fallback / dev entry，但不再是工具栏主保存入口。

## 替代方案

- 保留 toolbar popup 并继续优化内部布局：改动少，但无法解决浏览器 popup 边界。
- 保留 popup 作为 launcher，再由按钮打开独立窗口：风险低，但用户需要额外点击一次，入口状态也会分叉。
- 改用 content script Quick Save 浮框作为主入口：快捷感强，但会重新引入注入边界、受保护页面限制和权限说明复杂度。

## 后果

- 点击扩展图标和 `Ctrl+Shift+S` 行为一致，都会打开独立保存窗口。
- `chrome.action.onClicked` 只有在 manifest 不声明 `default_popup` 时才会触发，因此后续不得把 `default_popup` 加回主 manifest。
- 保存窗口必须通过 source tab 参数识别原始网页，不能把 `save.html` 自己当作保存对象。
- 浏览器内部页面可以作为书签保存，但不执行 `chrome.scripting.executeScript`。
- 打包验证需要检查 `dist/save.html`、`dist/popup.html` fallback、`dist/manifest.json`、`dist/service-worker.js` 和保留的 `dist/quick-save-content.js`。
