---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# New Tab 设置、状态与 Redirect 链路

## Settings 字段

文件：`src/features/settings/index.ts`

| 字段 | 默认值 | 说明 |
|---|---:|---|
| `newTabOverrideEnabled` | `false` | 是否接管浏览器新标签页；必须默认关闭 |
| `newTabDefaultSearchEngineId` | `google` | 默认搜索引擎 |
| `newTabDefaultSearchCategory` | `web` | 默认搜索类型 |
| `newTabLayoutMode` | `standard` | New Tab 布局模式 |
| `newTabShowRecentActivity` | `true` | 是否显示最近活动 |
| `newTabShowStorageUsage` | `true` | 是否显示存储说明卡 |
| `newTabShortcutsPerRow` | `8` | 快捷方式每行数量，normalize 到 4–10 |

写入入口：

- Popup SettingsTab。
- New Tab CustomizeLayoutPanel。默认搜索引擎、默认搜索类型、布局模式使用共享 native `Select`，`newTabShortcutsPerRow` 使用共享 `Input type="number"`；boolean 显示开关仍是本地 native checkbox，等待后续 Switch runtime。
- New Tab SearchPanel 引擎 / 分类切换。

## NewTabState 字段

文件：`src/features/newtab/newTabState.ts`

Storage key：`bookmarkVisualizerNewTabState`。

| 字段 | 说明 | 限制 |
|---|---|---|
| `version` | 当前版本，固定 1 | 未来 migration 用 |
| `pinnedShortcuts` | 用户固定快捷方式 | 最多 48 |
| `hiddenShortcutUrls` | 用户隐藏的 generated shortcut | 最多 300 |
| `selectedFolderIds` | 用户指定展示分组 | 最多 20 |
| `featuredBookmarkIds` | 用户指定精选书签 | 最多 50 |
| `collapsedSections` | 折叠 section | 最多 20 |

## Activity / Usage 存储

文件：`src/features/newtab/activity.ts`

| key | 用途 | 限制 |
|---|---|---|
| `bookmarkVisualizerNewTabActivity` | 最近活动 | 最多 100 |
| `bookmarkVisualizerNewTabUsageStats` | URL 使用统计 | 最多 300 |

记录链路：

```text
打开 suggestion / shortcut / featured bookmark
  → recordNewTabActivity({ type: "visited", title, url, bookmarkId, folderId })
  → storageAdapter.set(activity)
  → recordUsage(url, title, bookmarkId)
  → storageAdapter.set(usage)
  → refreshActivities()
```

## Runtime redirect

文件：`src/features/newtab/newTabRedirect.ts`

### 注册链路

```text
src/service-worker.ts
  → registerServiceWorker()
  → registerNewTabRedirect()
  → chrome.tabs.onCreated.addListener
  → chrome.tabs.onUpdated.addListener
```

### 判断链路

```text
maybeRedirectNewTab(tab)
  → tab.id 必须是 number
  → 不能是 redirectingTabIds 中正在处理的 tab
  → 不能是 incognito
  → isBrowserNewTab(tab) 只接受 chrome://newtab/ 和 edge://newtab/
  → loadSettings()
  → settings.newTabOverrideEnabled 必须 true
  → targetUrl = chrome.runtime.getURL("newtab.html")
  → chrome.tabs.update(tabId, { url: targetUrl })
  → 1 秒后释放 redirectingTabIds
```

### 维护规则

- 不要改成 manifest `chrome_url_overrides`，否则无法 runtime toggle。
- 不要默认开启 `newTabOverrideEnabled`。
- 不要 redirect incognito tab。
- 不要 redirect 已经是 extension `newtab.html` 的 tab。
- 新增浏览器支持时，只改 `NEW_TAB_URLS` 和测试，不要扩散到 UI。

## 搜索引擎链路

文件：`src/features/newtab/searchEngines.ts`

```text
SEARCH_ENGINES
  → google / bing / duckduckgo
  → categories: web/image/news/video/maps

buildSearchUrl(engineId, category, query)
  → findSearchEngine(engineId)
  → normalizeSearchCategory(category)
  → template.replace("{query}", encodeURIComponent(query))
```

新增搜索引擎时需要同步：

1. `SEARCH_ENGINES`。
2. `settingsService.ts` 中 `NEW_TAB_SEARCH_ENGINE_IDS`。
3. 测试：`searchEngines.test.ts` / Settings 相关测试。
4. Popup SettingsTab select 不需要手动加，因为它 map `SEARCH_ENGINES`。

## ViewModel 链路

```text
NewTabApp useMemo
  → deriveNewTabViewModel({ tree, state, settings, activities, usageStats, activeFolderId })
  → shortcuts = deriveShortcutViewModels(...)
  → folders = deriveFolderCards(...)
  → featuredBookmarks = deriveFeaturedBookmarks(...)
  → recentActivities = settings.newTabShowRecentActivity ? activities.slice(0, 8) : []
```

维护建议：New Tab UI 组件只消费 ViewModel，不直接遍历 Chrome bookmarks tree。新增展示模块优先在 `newTabViewModel.ts` 增加推导逻辑。
