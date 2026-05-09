# ADR 0007: 使用扩展命令和全局 listener 实现快捷保存

## 状态

已废弃，由 [ADR 0008](0008-use-toolbar-popup-for-current-page-save.md) 取代。

## 背景

产品需要从普通网页快速保存当前页面为浏览器原生书签，并在保存时补充备注和预览图片。用户希望使用接近浏览器保存语义的 `Ctrl + S`，但 Chrome / Edge 的浏览器和系统快捷键可能优先于扩展 command，不能保证通过 `chrome.commands` 稳定覆盖默认保存页面行为。

项目既有原则曾是不默认请求广泛 host 权限；但按站点授权入口无法自然定位目标标签页，导致 `Ctrl + S` 验证路径过重。本决策显式调整为默认请求普通 `http/https` 页面权限，用于验证和稳定快捷保存入口。

## 备选方案

- 默认注入所有普通网页并拦截 `Ctrl + S`：体验最直接，便于验证保存链路，但需要 `http/https` host permissions。
- 默认使用 `Ctrl + S` 命令：更贴近用户对“保存当前网页”的预期，但浏览器或系统保留快捷键可能优先，并可能在 `chrome://extensions/shortcuts` 中显示为未分配。
- 使用单一 `Ctrl + Shift + S` 命令：沿用官方 commands API，避免多个保存命令在 Chrome 快捷键页重复出现。
- 按站点授权后注入轻量 `Ctrl + S` listener：权限更克制，但当前工作台无法自然定位用户想配置的具体标签页，验证路径过重。

## 决策

第一版快捷保存保留单一 `Ctrl + Shift + S` / macOS `Command + Shift + S` 的扩展命令，不声明备用保存命令，也不使用 `_execute_action`。

历史决策曾为了先让 `Ctrl + S` 在普通网页中稳定可测，计划让 manifest 默认声明 `host_permissions` 和 `content_scripts`，在所有 `http/https` 顶层页面注入轻量 `quick-save-listener.js`。该路线已暂停，不再作为当前实现。

扩展命令触发时，service worker 使用 `chrome.commands.onCommand` 事件传入的 `tab` 注入快捷保存浮框，避免重新查询当前活动 tab 导致目标页漂移。站点 listener 触发时，service worker 使用 `sender.tab` 注入浮框。

浮框读取当前页面 URL、标题和候选图片；保存请求回到 service worker，由 `chrome.bookmarks` 创建原生书签，并把备注、预览图片 URL 写入 `chrome.storage.local` 的插件元数据，同时维护快捷保存最近使用文件夹。

注入脚本必须保持可重复执行：运行时代码包在局部闭包中，只通过一个命名的 `window.__bookmarkVisualizerQuickSaveOpen__` 入口暴露重开能力，关闭浮框时清理该入口。这样同一页面连续触发命令时，不会因为内容脚本顶层 lexical 声明重复而在 guard 运行前失败。

自定义 `Ctrl + Shift + S` 命令快捷键仍交给 Chrome / Edge 原生扩展快捷键管理页处理。稳定 `Ctrl + S` 不再由默认 content script listener 提供，当前主入口改为独立 `save.html` 保存小窗口。

## 后果

- 扩展当前不再请求 `http/https` host permissions，也不默认在普通网页运行轻量 listener content script。
- listener 相关设计仅保留为历史背景，不作为当前验收项。
- 快捷保存无法在 `chrome://`、扩展商店等不可注入页面直接显示浮框，需要降级提示。
- 用户可以通过浏览器原生快捷键管理修改 `Ctrl + Shift + S` 组合键；`Ctrl + S` 当前不作为默认稳定入口。
- Chrome 快捷键页里的 `Activate the extension` 属于工具栏 action，不是快捷保存命令；它可以保持 `Not set`。
- 如果用户现有安装实例仍残留已删除的旧命令，应先重新加载 unpacked extension；仍残留时移除并重新加载该扩展以清除 Chrome 对旧 manifest commands 的安装态缓存。
- 同一普通网页中关闭快捷保存浮框后再次触发命令，应重新注入或重新打开浮框。
- 保存书签结构仍以浏览器原生 bookmarks API 为唯一事实来源；插件只保存备注和预览图片等补充元数据。
