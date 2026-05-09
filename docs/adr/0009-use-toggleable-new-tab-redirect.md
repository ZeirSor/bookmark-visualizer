# ADR 0009: 使用可开关的新标签页重定向

## 状态

已接受。

## 背景

Bookmark Visualizer 需要新增一个浏览器 New Tab Portal，用于搜索、打开常用网站和轻量浏览书签分组。该页面不是完整管理页，也不替代独立保存小窗口入口。

用户需要能在 popup 设置中运行时开启或关闭“绑定新标签页”。Chrome / Edge 的 `chrome_url_overrides.newtab` 是 manifest 静态声明，适合永久覆盖新标签页，但不能被扩展内设置真正启停。

## 决策

manifest 不声明 `chrome_url_overrides.newtab`。扩展新增 `newtab.html` 入口，并由 service worker 注册运行时条件重定向：

- `newTabOverrideEnabled=false` 时不处理新建标签页。
- `newTabOverrideEnabled=true` 时，识别 `chrome://newtab/` 和 `edge://newtab/`，并跳转到 `chrome.runtime.getURL("newtab.html")`。
- 不处理普通 URL、隐身标签页和已经位于扩展 `newtab.html` 的标签页。
- 使用短期 tabId 记录避免 onCreated / onUpdated 造成重复跳转。

## 后果

- 用户可以在 popup 中开关 New Tab 绑定，默认关闭，首次安装不会接管浏览器首页。
- 关闭绑定后，浏览器默认 New Tab 保持原样。
- 相比静态 override，开启时可能有轻微跳转感；如果未来产品要求零闪烁，需要重新评估是否接受无法运行时关闭的静态覆盖方案。
- `tabs` 权限继续保留，用于当前 popup/命令能力和运行时 New Tab 重定向。
