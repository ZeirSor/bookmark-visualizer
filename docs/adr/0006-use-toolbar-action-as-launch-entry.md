# ADR 0006: 使用工具栏图标作为启动入口

## 状态

已接受

## 背景

早期方案使用 `chrome_url_overrides.newtab` 把浏览器新标签页替换为 Bookmark Visualizer。实际使用中，用户更希望默认新标签页保持浏览器原生体验，只在需要整理书签时主动打开工作台。

Chrome 官方文档中，`chrome_url_overrides.newtab` 用于替换 Chrome 提供的新标签页；`chrome.action` 用于控制工具栏图标，并可通过 `default_popup` 打开标准扩展 popup，或在没有 popup 时通过 `onClicked` 响应点击。

## 决策

第一版改为使用工具栏图标作为启动入口。manifest 保留 `action`、`background.service_worker` 和图标配置，不再声明 `chrome_url_overrides.newtab`。

当前工具栏点击由 ADR 0013 定义的 `action.default_popup = "popup.html"` 打开 toolbar popup；完整 `index.html` 工作台由 popup 顶部外链按钮或“管理”Tab 打开。

## 替代方案

- 继续接管新标签页：入口更强，但会打断用户对浏览器默认新标签页的预期。
- 使用 popup 作为唯一界面：启动轻量，但空间不足以承载文件夹树、卡片重排、右键菜单和批量整理体验。
- 使用侧边栏：适合辅助浏览，但当前 Chrome / Edge 第一版目标仍以完整页面为主。

## 后果

- 普通新标签页保持浏览器默认页面。
- 用户需要点击或固定扩展工具栏图标来打开 Bookmark Visualizer popup。
- 快速保存由 toolbar popup 承载，完整管理仍然保留完整页面空间，适合拖拽、搜索、行内编辑和操作日志。
