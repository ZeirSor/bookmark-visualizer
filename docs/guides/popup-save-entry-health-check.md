# 保存小窗口入口健康检查

## 背景

快捷保存当前主入口是独立 extension page 小窗口：用户在普通网页点击工具栏图标后，service worker 通过 `chrome.action.onClicked` 打开或聚焦 `save.html`，由保存小窗口的“保存”Tab 完成当前网页保存。

项目仍保留一个标准 command：`commands.open-quick-save`，默认快捷键为 `Ctrl + Shift + S` / macOS `Command + Shift + S`。它现在与工具栏点击一致，打开或聚焦 `save.html`。

`Ctrl + S` 路线已暂停。manifest 不应默认声明全局 `host_permissions`，也不应默认声明 `content_scripts` 注入 `quick-save-listener.js`。

官方依据：[Chrome popup](https://developer.chrome.com/docs/extensions/develop/ui/add-popup)、[Chrome action API](https://developer.chrome.com/docs/extensions/reference/api/action)、[Chrome tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs)、[Chrome message passing](https://developer.chrome.com/docs/extensions/mv3/messaging)。

## 修改入口后的必查项

每次改动 `public/manifest.json`、`save.html`、`popup.html`、`src/save-window/*`、`src/popup/*`、`src/features/popup/*`、`src/background/saveWindow.ts`、`src/service-worker.ts`、`scripts/verify-save-window-entry.mjs` 或 `vite.config.ts` 后，必须做以下检查：

1. `public/manifest.json` 不得声明 `action.default_popup`。
2. manifest 不声明 `chrome_url_overrides.newtab`、全局 `host_permissions` 或默认 `content_scripts`。
3. manifest 只声明一个快捷保存命令：`open-quick-save`。
4. 不存在 `open-quick-save-fallback`、`quick-save-listener.js` 或第二个保存命令。
5. `open-quick-save` 默认快捷键为 `Ctrl + Shift + S` / macOS `Command + Shift + S`。
6. service worker 必须注册 `chrome.action.onClicked` 作为工具栏主入口。
7. service worker 仍处理 popup 的 quick-save 保存、新建文件夹和初始状态消息。
8. Vite 多页面构建必须包含 `save.html` 和 `popup.html` fallback。
9. `dist/save.html`、`dist/popup.html`、`dist/manifest.json` 和 `dist/quick-save-content.js` 必须在构建后存在。
10. `dist/quick-save-content.js` 必须是自包含脚本，不能以顶层 ESM `import` 开头。

## 推荐验证命令

```powershell
npm run typecheck
npm run test
npm run build
npm run verify:save-window-entry
```

使用 `npm run verify:save-window-entry` 验证主入口；旧命令 `npm run verify:quick-save-shortcut` 暂时保留为别名，方便历史脚本过渡。

## 手动复现和验收

1. 运行 `npm run build`。
2. 在 Chrome / Edge 扩展管理页重新加载 `dist` 扩展。
3. 打开普通 `https://` 网页。
4. 点击扩展工具栏图标，期望出现 Bookmark Visualizer 保存小窗口，并默认选中“保存”Tab。
5. 确认标题、只读 URL、备注、预览图和保存位置区域正常显示。
6. 搜索或点击最近文件夹后，主按钮显示 `保存到 {文件夹名}`。
7. 点击保存后，浏览器原生书签树出现新书签，备注和预览图片 URL 写入插件 metadata。
8. 点击顶部外链按钮或“管理”Tab 入口，期望打开完整 `index.html` 工作台。
9. 打开 `chrome://extensions/` 等浏览器内部页面再点击扩展图标，期望保存小窗口允许保存，但不触发脚本注入错误。

## 常见故障定位

- 扩展 action 没有打开保存窗口：检查 manifest 是否意外加回 `action.default_popup`，以及 service worker 是否注册 `chrome.action.onClicked`。
- `save.html` 不出现在打包产物：检查 Vite Rollup input 是否包含 `save.html`。
- 保存窗口中当前页信息为空：检查 source tab query、`tabs` 权限、`chrome.tabs.get(sourceTabId)` 和 query fallback。
- 普通页面无法提取预览图：检查 `activeTab`、`scripting` 权限和保存窗口中的 `chrome.scripting.executeScript` 错误处理；该失败不应阻塞保存。
- 保存按钮失败：检查 service worker quick-save message handler、bookmarks adapter 和 metadata 写入。
- Chrome 快捷键页看到残留旧 fallback 命令：重新加载 unpacked extension；仍残留时移除并重新加载该扩展，以清除 Chrome 对旧 manifest commands 的安装态缓存。
