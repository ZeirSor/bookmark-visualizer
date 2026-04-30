# ADR 0006: 使用工具栏图标作为启动入口

## 状态

已接受

## 背景

早期方案使用 `chrome_url_overrides.newtab` 把浏览器新标签页替换为 Bookmark Visualizer。实际使用中，用户更希望默认新标签页保持浏览器原生体验，只在需要整理书签时主动打开工作台。

Chrome 官方文档中，`chrome_url_overrides.newtab` 用于替换 Chrome 提供的新标签页；`chrome.action` 用于控制工具栏图标，并可在没有 popup 时通过 `onClicked` 响应点击。

## 决策

第一版改为使用工具栏图标作为启动入口。manifest 保留 `action`、`background.service_worker` 和图标配置，不再声明 `chrome_url_overrides.newtab`。点击工具栏图标后，service worker 打开扩展内的 `index.html` 完整页面。

## 替代方案

- 继续接管新标签页：入口更强，但会打断用户对浏览器默认新标签页的预期。
- 使用 popup：启动轻量，但空间不足以承载文件夹树、卡片重排、右键菜单和批量整理体验。
- 使用侧边栏：适合辅助浏览，但当前 Chrome / Edge 第一版目标仍以完整页面为主。

## 后果

- 普通新标签页保持浏览器默认页面。
- 用户需要点击或固定扩展工具栏图标来打开 Bookmark Visualizer。
- 主界面仍然保留完整页面空间，适合拖拽、搜索、行内编辑和操作日志。
