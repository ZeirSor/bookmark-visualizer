# ADR 0008: 使用工具栏 popup 承载当前网页保存

## 状态

已被 [ADR 0011](0011-use-independent-save-window.md) 取代

## 背景

用户希望先绕开 `Ctrl + S` 在 Chrome 普通网页中无法稳定触发的问题，改为点击扩展工具栏图标后出现参考图风格的小浮窗，并优先完成第一个 Tab 的“保存”功能。

Chrome / Edge Manifest V3 官方模型中，`action.default_popup` 是工具栏点击后展示轻量 UI 的标准方式。popup 失焦后会自动关闭，可以通过 `chrome.tabs.query({ active: true, currentWindow: true })` 获取当前标签页，也可以通过 runtime message 请求 service worker 完成书签创建和 metadata 写入。

## 决策

工具栏点击改为打开 `popup.html`。popup 使用 React + TypeScript + Vite 多页面入口实现，顶部包含“保存 / 管理 / 设置”三个 Tab，第一阶段只完整实现“保存”Tab。

popup 的保存 Tab 读取当前标签页标题、URL、favicon 和候选预览图，展示标题、只读 URL、备注、保存位置、文件夹搜索、最近使用文件夹和新建文件夹入口。保存请求发送给 service worker，由现有 bookmarks adapter 创建浏览器原生书签，并把备注和预览图片 URL 写入 `chrome.storage.local` 元数据。

完整管理页面仍保留为 `index.html`，由 popup 顶部外链按钮或“管理”Tab 打开。service worker 不再使用 `chrome.action.onClicked` 作为工具栏主入口。

暂停默认 `Ctrl + S` listener 路线。manifest 不再声明全局 `host_permissions` 或默认 `content_scripts`，也不再打包 `quick-save-listener.js`。保留单一 `commands.open-quick-save`，默认 `Ctrl + Shift + S` / macOS `Command + Shift + S`，用于低权限快捷保存入口和后续诊断。

## 替代方案

- 继续修复全局 `Ctrl + S` listener：快捷感更强，但会重新引入广泛 host 权限、常驻 content script 和浏览器快捷键优先级问题。
- 只使用完整工作台保存：实现简单，但不符合参考图的小浮窗体验。
- 侧边栏保存：空间更稳定，但需要新增侧边栏产品形态和浏览器支持边界。

## 后果

- 普通保存路径符合浏览器扩展标准 popup 模型，更容易手动验收和维护。
- 当前版本不默认抢占 `Ctrl + S`，因此不会阻止浏览器原生保存网页行为。
- popup 空间有限，复杂文件夹浏览和深度管理继续交给完整工作台。
- 受保护页面可能无法执行页面 metadata 提取；popup 必须回退到 tab 信息或禁用保存。
- 打包验证需要同时检查 `dist/popup.html`、`dist/manifest.json` 和保留的 `dist/quick-save-content.js`。

## 取代说明

2026-05-09 起，主保存入口改为 ADR 0011 定义的独立 `save.html` 小窗口。`popup.html` 暂时保留为构建 fallback / dev entry，但 `public/manifest.json` 不再声明 `action.default_popup`。
