---
type: decision
status: active
scope: architecture
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# ADR 0010: 使用本地 favicon cache

## 状态

已接受。

## 背景

New Tab 的快速访问、精选书签、文件夹预览和最近活动需要显示真实网站图标。旧实现主要显示品牌 / 字母 fallback，管理页 `BookmarkCard` 还直接拼接 Google s2 favicon URL，导致图标策略分散、离线体验弱，并引入默认第三方 favicon 请求。

Chrome / Edge Manifest V3 提供官方 `_favicon` URL，可让扩展页面读取浏览器已知的网站 favicon，但需要声明 `favicon` permission。

## 决策

新增 `favicon` permission，并将网站图标获取收敛到 `src/features/favicon/*`：

- favicon 只作为 UI 辅助缓存，不是书签结构或 metadata 数据源。
- 使用 IndexedDB `bookmarkVisualizerFaviconCache` / `favicons` 保存 data URL、site key、size、来源、TTL 和访问时间。
- 成功缓存默认 7 天过期，失败记录默认 1 小时后可重试，最多保留 500 条并按失败 / 最久未访问优先清理。
- New Tab 和管理页通过共享 `SiteFavicon` 组件消费缓存；加载失败或非 `http(s)` URL 时显示本地 fallback。
- 不默认使用 Google s2、DuckDuckGo 或其它第三方 favicon 服务。
- v1 不新增 `web_accessible_resources`，因为 favicon 渲染限定在扩展页面内，不在 content script 页面中直接嵌入。

## 后果

- New Tab 和管理页图标体验更接近用户熟悉的网站标识，刷新后可命中本地 cache。
- 扩展安装权限增加 `favicon`，需要在 README、架构文档和 manifest 测试中持续说明用途。
- favicon cache 可被安全清空；清空不会影响 `chrome.bookmarks`、settings、metadata 或 New Tab 状态。
- 如果未来需要内容脚本页面直接显示 `_favicon` 资源，必须另行评估 `web_accessible_resources` 和对应安全边界。
