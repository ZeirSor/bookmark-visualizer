# 05. 分阶段实现指南

## Phase 0：先改文档与测试预期

### 目标

明确 New Tab 是可选入口页，不是完整管理页。

### 修改

```text
docs/adr/0002-use-new-tab-as-primary-surface.md
  补充说明：完整管理页仍不使用 New Tab；New Tab 作为可选搜索/启动页重新引入。

docs/adr/0009-use-toggleable-new-tab-redirect.md
  新增：为什么不用 chrome_url_overrides，为什么用 tabs 条件重定向。

src/lib/chrome/manifest.test.ts
  保留“不声明 chrome_url_overrides”的测试，但描述改成：
  does not use static new tab override because binding is controlled by runtime settings
```

## Phase 1：新增 newtab 独立入口

### 文件

```text
newtab.html
src/newtab/main.tsx
src/newtab/NewTabApp.tsx
src/newtab/styles.css
src/newtab/components/NewTabShell.tsx
src/newtab/components/NewTabHeader.tsx
```

### Vite

`vite.config.ts` 新增 `newtab` input。

### 验收

```text
npm run build 后 dist/newtab.html 存在
打开 chrome-extension://<id>/newtab.html 能看到基础页面
不影响 index.html 和 popup.html
```

## Phase 2：设置中加入 New Tab 开关

### 修改 SettingsState

```text
src/features/settings/index.ts
src/features/settings/settingsService.ts
src/features/settings/settingsService.test.ts
```

新增：

```text
newTabOverrideEnabled
newTabDefaultSearchEngineId
newTabDefaultSearchCategory
newTabLayoutMode
newTabShowRecentActivity
newTabShowStorageUsage
newTabShortcutsPerRow
```

### 修改 Popup 设置页

```text
src/popup/tabs/SettingsTab.tsx
src/popup/styles.css
```

在“界面偏好”前新增设置卡片：

```text
新标签页
[开关] 绑定新标签页
开启后点击浏览器 + 会打开 Bookmark Visualizer 新标签页。

默认搜索引擎  Google
默认搜索类型    Web
布局模式        标准 / 侧栏 / 分区
```

### 验收

```text
开关默认关闭
打开开关后刷新 popup 仍保持开启
关闭开关后刷新 popup 仍保持关闭
旧 storage 数据不报错
```

## Phase 3：service worker 条件重定向

### 新增文件

```text
src/features/newtab/newTabRedirect.ts
```

### 修改

```text
src/background/serviceWorker.ts
```

注册：

```ts
registerNewTabRedirect();
```

### 行为

```text
newTabOverrideEnabled=false → 点击 + 保留默认 New Tab
newTabOverrideEnabled=true  → 点击 + 跳转 newtab.html
已在 newtab.html          → 不重复跳转
普通页面新开 tab          → 不处理
```

### 验收

```text
不使用 chrome_url_overrides
没有循环跳转
切换开关立即对后续新标签页生效
```

## Phase 4：New Tab 基础 UI

### 组件

```text
SearchPanel
PinnedShortcutGrid
BookmarkGroupStrip
FeaturedBookmarkRow
RecentActivityPanel
NewTabQuickActions
StorageUsageMiniCard
```

### 数据

```text
bookmarksAdapter.getTree()
loadSettings()
loadNewTabState()
loadRecentActivities()
deriveNewTabViewModel()
```

### UI 要求

```text
顶部品牌：Bookmark Visualizer · 新标签页
不出现大标题“我的书签”
搜索模块优先
固定快捷方式在书签分组前
快捷操作不出现“保存当前标签页”
```

### 验收

```text
空数据环境使用 mockBookmarks 也能显示
真实扩展环境能读取 Chrome 书签
右侧最近活动无数据时显示空状态
```

## Phase 5：固定快捷方式

### 新增

```text
src/features/newtab/newTabState.ts
src/features/newtab/shortcuts.ts
```

### 功能

```text
自动从高频 / 最近 / 默认推荐生成快捷方式
用户可添加自定义网站
用户可从书签固定
用户可隐藏自动推荐
后续再做拖拽排序
```

### MVP 简化

第一版可以不做拖拽，只做：

```text
添加网站
移除固定
从当前书签分组固定
```

## Phase 6：混合搜索

### 新增

```text
src/features/newtab/searchEngines.ts
src/features/newtab/mixedSearch.ts
```

### 搜索面板行为

```text
输入 query → 本地书签建议 + 网络搜索建议
Enter → 当前选中项或当前搜索分类
URL → 直接打开
↑↓ → 移动选中
Tab → 切换建议区域
Esc → 关闭
```

### 复用

```text
src/features/search/searchBookmarks.ts
src/features/bookmarks/buildFolderPathMap
```

### 验收

```text
搜索 prompt 能显示本地结果和网络搜索
搜索 URL 能直接打开
不同分类生成不同搜索 URL
```

## Phase 7：书签分组与管理页深链接

### New Tab

```text
BookmarkGroupStrip 点击文件夹 → 展开 preview
查看全部 → openWorkspace(`index.html?folderId=${id}`)
```

### 管理页

修改 `src/app` 初始化逻辑，支持 query：

```text
folderId → 选中文件夹
bookmarkId → 定位书签所在文件夹并高亮
```

如果当前管理页状态集中在 `App.tsx`，不要在多个组件里各自解析 URL；新增 helper：

```text
src/app/workspace/urlState.ts
```

## Phase 8：活动记录

### 新增

```text
src/features/newtab/activity.ts
```

### 记录点

```text
点击快捷方式
点击搜索结果书签
点击精选书签
从 popup 保存成功后可选记录 saved
导入 HTML 成功后可选记录 imported
```

popup 保存成功记录可以放在后续阶段，不要阻塞 New Tab MVP。

## Phase 9：布局自定义

### 功能

```text
标准布局 standard
动态侧栏 sidebar
Tab 分区 tabs
显示 / 隐藏最近活动
显示 / 隐藏精选书签
快捷方式每行数量
```

### 实现建议

第一版 `CustomizeLayoutPanel` 只改 settings，不做复杂拖拽。

## Phase 10：清理与长期维护

```text
抽取共享 design tokens
补齐 docs/architecture 和 docs/product
为每个新 feature 文件补测试
删除临时代码和 demo mock
更新 README 或 docs/guides/testing-and-acceptance.md
```

## 建议提交拆分

```text
commit 1: docs + ADR + manifest test wording
commit 2: newtab entry + vite build
commit 3: settings fields + popup toggle
commit 4: service worker redirect
commit 5: newtab basic UI
commit 6: shortcuts + folders view model
commit 7: mixed search
commit 8: tests + docs final sync
```
