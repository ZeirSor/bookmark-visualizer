# 数据与存储

## 数据源原则

浏览器原生书签树是唯一书签结构数据源。插件不得维护一份可以独立决定文件夹结构的副本。

```text
书签标题 / URL / 父文件夹 / 顺序
  → chrome.bookmarks
  → src/lib/chrome/bookmarksAdapter.ts

备注 / 预览图 / 最近文件夹 / UI 设置 / New Tab 个性化状态
  → chrome.storage.local
  → src/lib/chrome/storageAdapter.ts
```

## 原生书签数据

来自 `chrome.bookmarks` API：

- `id`
- `parentId`
- `index`
- `title`
- `url`
- `children`
- `dateAdded`
- `dateGroupModified`
- `dateLastUsed`
- `unmodifiable`

有 `url` 的节点视为书签；没有 `url` 且有 `children` 的节点视为文件夹。

## 当前 storage key

| key | 文件 | 当前用途 | 维护说明 |
|---|---|---|---|
| `bookmarkVisualizerSettings` | `src/features/settings/settingsService.ts` | 管理页、保存窗口 / Popup fallback、New Tab 的设置 | 主设置 key |
| `bookmarkVisualizerMetadata` | `src/features/metadata/metadataService.ts` | 书签备注、预览图 URL、page kind、source URL、预留摘要字段 | 只保存扩展元数据，不保存书签结构 |
| `bookmarkVisualizerRecentFolders` | `src/features/recent-folders/recentFolders.ts` | 最近保存 / 移动目标文件夹 | 当前最近文件夹主 key |
| `bookmarkVisualizerNewTabState` | `src/features/newtab/newTabState.ts` | 固定快捷方式、隐藏快捷方式、选中文件夹、精选书签、折叠 section | New Tab 个性化状态 |
| `bookmarkVisualizerNewTabActivity` | `src/features/newtab/activity.ts` | New Tab 最近活动 | 最多保留 100 条 |
| `bookmarkVisualizerNewTabUsageStats` | `src/features/newtab/activity.ts` | URL 打开次数和最近打开时间 | 最多保留 300 条 |
| `bookmarkVisualizerQuickSaveUiState` | `src/features/recent-folders/recentFolders.ts` | 旧版最近文件夹兼容读取 | 当前不再作为主写入 key；会迁移到 `bookmarkVisualizerRecentFolders` |

## `bookmarkVisualizerSettings`

类型来源：`src/features/settings/index.ts`。

```ts
interface SettingsState {
  showBookmarksInTree: boolean;
  theme: "light" | "dark";
  cardDensity: "comfortable";
  cardSize: "small" | "medium" | "large" | "extra-large";
  sidebarWidth: number;
  popupAutoCloseAfterSave: boolean;
  popupShowSuccessToast: boolean;
  popupRememberLastFolder: boolean;
  popupShowThumbnail: boolean;
  popupDefaultOpenTab: "save" | "manage" | "settings";
  popupThemeMode: "system" | "light" | "dark";
  popupDefaultFolderId?: string;
  newTabOverrideEnabled: boolean;
  newTabDefaultSearchEngineId: string;
  newTabDefaultSearchCategory: "web" | "image" | "news" | "video" | "maps";
  newTabLayoutMode: "standard" | "sidebar" | "tabs";
  newTabShowRecentActivity: boolean;
  newTabShowStorageUsage: boolean;
  newTabShortcutsPerRow: number;
}
```

维护说明：

- `newTabOverrideEnabled` 默认必须是 `false`，避免安装后直接接管新标签页。
- `cardDensity` 当前固定 normalize 为 `comfortable`，不是可配置 UI。
- `popupThemeMode` 当前作为 Popup 主题偏好持久化，用于后续主题适配；当前 Popup CSS 尚未完整消费它，不能描述成已完整生效的暗色主题。
- `sidebarWidth` 被限制在 220–640。
- `newTabShortcutsPerRow` 被限制在 4–10。
- 新增字段必须同步 `defaultSettings`、`normalizeSettings()`、对应 UI 文档和回归测试。

## `bookmarkVisualizerMetadata`

类型来源：`src/features/metadata/index.ts`。

```ts
interface ExtensionMetadataState {
  metadataVersion: 1;
  bookmarkMetadata: Record<string, {
    note?: string;
    previewImageUrl?: string;
    pageKind?: "web" | "browser-internal" | "extension-page" | "file" | "unsupported";
    sourceUrl?: string;
    summary?: string;
    summarySource?: "manual" | "meta-description" | "ai";
    updatedAt?: number;
  }>;
}
```

当前真实写入链路：

```text
管理页备注编辑
  → useMetadata().updateNote(bookmarkId, note)
  → saveBookmarkNote()
  → saveBookmarkMetadata(bookmarkId, { note })

保存窗口 / Popup fallback / Quick Save 保存
  → QUICK_SAVE_CREATE_BOOKMARK
  → background/quickSaveHandlers.ts
  → bookmarksAdapter.create()
  → saveBookmarkMetadata(created.id, { note, previewImageUrl, pageKind, sourceUrl })
```

维护说明：当前代码中 `summary` / `summarySource` 是类型预留，不代表已经实现网页 description 抓取或 AI 摘要。文档描述时不要把它写成已上线能力。

## `bookmarkVisualizerRecentFolders`

当前最近文件夹已经从 Quick Save 局部状态上移为共享 feature：

```text
src/features/recent-folders/recentFolders.ts
  → loadRecentFolderState()
  → saveRecentFolder(folderId)
  → resolveRecentFolderOptions()
```

它被保存窗口 / Popup fallback 保存位置、Quick Save 保存位置，以及移动 / 保存相关场景复用。旧的 `bookmarkVisualizerQuickSaveUiState` 仅用于读取历史 recentFolderIds 并迁移。

## New Tab 状态

`bookmarkVisualizerNewTabState` 保存：

- `pinnedShortcuts`
- `hiddenShortcutUrls`
- `selectedFolderIds`
- `featuredBookmarkIds`
- `collapsedSections`

`bookmarkVisualizerNewTabActivity` 保存 New Tab 最近打开、访问、文件夹等活动。

`bookmarkVisualizerNewTabUsageStats` 保存 URL 打开次数和最近打开时间，用于推导常用快捷入口。

## Favicon 本地缓存

真实 favicon 属于 UI 辅助缓存，不属于书签结构，也不写入 `chrome.storage.local` 的主设置或 New Tab 状态 key。

```text
IndexedDB database: bookmarkVisualizerFaviconCache
Object store: favicons
Primary key: <normalized site key>|<size>
```

维护规则：

- 缓存记录由 `src/features/favicon/*` 统一读写，当前用于 New Tab 和管理页书签卡片。
- `siteKey` 只接受 `http(s)` 页面 URL，并按协议 + 去除 `www.` 的 hostname + port 分组。
- 成功缓存默认 7 天过期；失败记录默认 1 小时后可重试；最多保留 500 条，按失败记录和最久未访问记录优先清理。
- 缓存 miss 时通过 Manifest V3 `favicon` permission 支持的 `_favicon` 扩展 URL 获取图标，并转为 data URL 存入 IndexedDB。
- 删除或清空 favicon cache 不得影响 `chrome.bookmarks`、metadata、settings、New Tab state 或 recent activity。

## 操作日志

当前管理页操作日志保存在页面运行时内存中，用于本次会话撤回移动、编辑、删除等操作。它不是持久化审计日志，刷新扩展页面后会清空。

## 导入和导出

`src/features/import-export/*` 已有导入导出基础模块和测试，但当前 UI 中部分入口仍是禁用占位。文档描述时应区分：

- 已有基础能力：JSON / CSV / Netscape HTML import-export 模块。
- 未完整接入 UI：RightRail 中“导入书签 / 导出当前文件夹”等按钮当前 disabled。

## 隐私

- 备注和预览图 URL 默认只保存在本地。
- 保存窗口页面信息提取只读取 source tab URL、标题、候选预览图和 favicon，不持久化网页正文；浏览器内部页面不执行脚本注入。
- Quick Save 不下载或转存网页图片，只保存候选图片 URL。
- 当前未上传书签树和备注到远程服务。
