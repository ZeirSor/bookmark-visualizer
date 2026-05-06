# 08. 给程序员 / Coding Agent 的执行提示词

```text
你要在当前 Bookmark Visualizer 仓库里实现一个可开关的 New Tab 页面。请严格结合现有架构，不要把代码堆在一个大组件里，也不要直接在 UI 组件里散落调用 chrome.* API。

当前项目结构：
- 管理页入口：index.html → src/main.tsx → src/app/App.tsx
- popup 入口：popup.html → src/popup/main.tsx → src/popup/PopupApp.tsx
- service worker：src/service-worker.ts → src/background/serviceWorker.ts
- 设置：src/features/settings/index.ts + settingsService.ts
- 书签树：src/features/bookmarks/*
- 搜索：src/features/search/searchBookmarks.ts
- Chrome API adapter：src/lib/chrome/*

目标：
1. 新增 newtab.html 和 src/newtab 入口。
2. New Tab 页面以网络搜索和固定快捷方式为主，不要做成管理页缩小版。
3. 顶部只显示轻量品牌 “Bookmark Visualizer · 新标签页”，不要大标题“我的书签”。
4. 页面结构：搜索模块 → 固定快捷方式 → 书签分组 → 精选书签，右侧保留最近活动和快捷操作。
5. 快捷操作里不要出现“保存当前标签页”，改为：打开管理页、新建书签、导入 HTML、自定义布局。
6. 在 popup 设置页新增“绑定新标签页”开关。默认关闭。
7. 不要使用 manifest 的 chrome_url_overrides.newtab，因为用户需要运行时开关。使用 service worker 监听新建 tab，开关开启时把 chrome://newtab/ 或 edge://newtab/ 跳转到 chrome.runtime.getURL("newtab.html")。
8. 保持 manifest 不声明 chrome_url_overrides。
9. 复用现有 settingsService / bookmarksAdapter / storageAdapter / searchBookmarks，不要新建重复 adapter。
10. 新增 src/features/newtab 模块，放 newTabState、searchEngines、mixedSearch、shortcuts、activity、newTabRedirect 等逻辑。

第一阶段请实现：
- newtab.html
- src/newtab/main.tsx
- src/newtab/NewTabApp.tsx
- src/newtab/styles.css
- vite.config.ts 新增 newtab input
- SettingsState 新增 newTabOverrideEnabled 等字段并 normalize
- popup SettingsTab 新增“新标签页”设置卡片
- service worker 注册 registerNewTabRedirect
- New Tab 页面显示基础 UI：搜索框、分类 chips、固定快捷方式、书签分组、最近活动、快捷操作

搜索功能：
- 支持搜索引擎 Google / Bing / DuckDuckGo
- 支持 Web / 图片 / 新闻 / 视频 / 地图
- 输入时显示本地书签和网络搜索建议
- Enter 打开选中建议或执行网络搜索
- URL 输入直接打开

样式要求：
- 延续项目浅色、白卡片、紫色强调、圆角、轻阴影风格
- 比管理页更轻、更像首页
- 固定快捷方式类似 Infinity 的常用网站网格，但卡片更克制
- 书签分组是第二层，不要抢主视觉

测试要求：
- 更新 manifest.test：说明“不使用静态 chrome_url_overrides，因为 New Tab 绑定由运行时设置控制”
- settingsService.test 覆盖新增字段默认值和非法值 normalize
- newTabRedirect.test 覆盖开关开/关、chrome://newtab/、普通 URL、避免循环
- searchEngines.test 覆盖搜索 URL 构建
- mixedSearch.test 覆盖本地书签和网络搜索建议合并

文档要求：
- 新增 docs/adr/0009-use-toggleable-new-tab-redirect.md
- 更新 docs/architecture/overview.md
- 更新 docs/architecture/module-boundaries.md
- 更新 docs/product/requirements.md 或 docs/product/interactions.md

不要做：
- 不要引入天气、壁纸、待办等无关组件
- 不要上云、账号、订阅
- 不要做完整文件夹树管理
- 不要在 New Tab 里放复杂拖拽管理
- 不要默认开启绑定 New Tab
- 不要用远程 favicon 服务作为必需依赖

完成后运行：
- npm run typecheck
- npm test
- npm run build

并手动验收：
- 开关关闭 → 点击 + 是浏览器默认 New Tab
- 开关开启 → 点击 + 是 Bookmark Visualizer New Tab
- 搜索 prompt → 同时显示本地书签和网络搜索建议
- 快捷操作不包含“保存当前标签页”
```
