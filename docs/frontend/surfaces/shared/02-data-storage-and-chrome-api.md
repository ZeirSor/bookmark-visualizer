# 数据、存储与 Chrome API 链路

## Chrome API 适配层

| 文件 | 责任 |
|---|---|
| `src/lib/chrome/bookmarksAdapter.ts` | 封装 `chrome.bookmarks`，提供 getTree / create / update / move / remove 等 |
| `src/lib/chrome/storageAdapter.ts` | 封装 `chrome.storage.local` |
| `src/lib/chrome/runtime.ts` | runtime helper |
| `src/lib/chrome/permissionsAdapter.ts` | 权限相关封装 |
| `src/lib/chrome/mockBookmarks.ts` | 非扩展环境 fallback / 测试数据 |

维护规则：页面组件不应直接调用 `chrome.bookmarks` 或 `chrome.storage`。例外是明确的导航 helper，例如 `src/features/newtab/navigation.ts` 使用浏览器 API 打开 URL 或扩展页。

## 主要 storage key

| key | 所属 feature | 文件 | 内容 |
|---|---|---|---|
| `bookmarkVisualizerSettings` | settings | `src/features/settings/settingsService.ts` | 全局 UI 和行为设置 |
| `bookmarkVisualizerMetadata` | metadata | `src/features/metadata/metadataService.ts` | 书签备注、预览图 URL、page kind、source URL、预留摘要字段 |
| `bookmarkVisualizerRecentFolders` | recent-folders | `src/features/recent-folders/recentFolders.ts` | 最近保存 / 移动目标文件夹 |
| `bookmarkVisualizerNewTabState` | newtab | `src/features/newtab/newTabState.ts` | pinned shortcuts、hidden urls、selected folders、featured bookmarks |
| `bookmarkVisualizerNewTabActivity` | newtab | `src/features/newtab/activity.ts` | New Tab 最近活动 |
| `bookmarkVisualizerNewTabUsageStats` | newtab | `src/features/newtab/activity.ts` | URL 打开次数和最近时间 |
| `bookmarkVisualizerQuickSaveUiState` | legacy | `src/features/recent-folders/recentFolders.ts` | 旧版最近文件夹兼容读取；当前会迁移到 `bookmarkVisualizerRecentFolders` |

## 设置模型

文件：`src/features/settings/index.ts`。

主要设置分组：

| 分组 | 字段 |
|---|---|
| 管理页 | `showBookmarksInTree`、`theme`、`cardDensity`、`cardSize`、`sidebarWidth` |
| Toolbar Popup / page shortcut 保存行为 | `popupAutoCloseAfterSave`、`enablePageCtrlSShortcut`、`popupShowSuccessToast`、`popupRememberLastFolder`、`popupShowThumbnail` |
| Toolbar Popup / legacy 偏好 | `popupDefaultOpenTab`、`popupThemeMode`、`popupDefaultFolderId` |
| New Tab | `newTabOverrideEnabled`、`newTabDefaultSearchEngineId`、`newTabDefaultSearchCategory`、`newTabLayoutMode`、`newTabShowRecentActivity`、`newTabShowStorageUsage`、`newTabShortcutsPerRow` |

Normalize 规则在 `settingsService.ts`。当前 `cardDensity` 固定 normalize 为 `comfortable`，不是完整可选 UI。

## 书签本体与扩展元数据

| 数据 | 存储位置 | 代码链路 |
|---|---|---|
| 标题 | Chrome bookmarks | `bookmarksAdapter.update(id, { title })` |
| URL | Chrome bookmarks | `bookmarksAdapter.update(id, { url })` |
| 文件夹 | Chrome bookmarks | `bookmarksAdapter.create({ parentId, title })` |
| 书签移动 | Chrome bookmarks | `bookmarksAdapter.move(id, { parentId, index })` |
| 删除 | Chrome bookmarks | `bookmarksAdapter.remove(id)` |
| 备注 | extension storage | `useMetadata().updateNote()` → `saveBookmarkNote()` → `saveBookmarkMetadata()` |
| 预览图 URL / page kind / source URL | extension storage | Popup / legacy 保存页 / Quick Save 保存时传给 `saveBookmarkMetadata()` |
| 最近文件夹 | extension storage | `src/features/recent-folders/recentFolders.ts` |

维护重点：不要把备注写进原生 bookmark title；不要把原生 bookmark id 当作永远稳定 ID，删除恢复会生成新 ID。

## Background message 路由

文件：`src/background/messageRouter.ts`、`src/background/quickSaveHandlers.ts`。

Quick Save 消息类型来自 `src/features/quick-save/types.ts`：

| message | 用途 |
|---|---|
| `QUICK_SAVE_GET_INITIAL_STATE` | 获取 bookmarks tree、默认文件夹、最近文件夹 |
| `QUICK_SAVE_CREATE_BOOKMARK` | 创建书签并保存 metadata / 最近文件夹 |
| `QUICK_SAVE_CREATE_FOLDER` | 创建文件夹并返回新 state |

Toolbar Popup、legacy Save Overlay、legacy 保存页和 Legacy Quick Save 当前发送相同 quick-save message，因此这些保存入口共享 background 创建链路。

## Manifest 相关

文件：`public/manifest.json`

当前权限：

```json
["bookmarks", "storage", "activeTab", "scripting", "tabs"]
```

入口：

- `action.default_popup = "popup.html"`，工具栏点击打开 toolbar popup
- `_execute_action` 打开同一个 action popup
- `background.service_worker = service-worker.js`

维护规则：

- 新增权限要先同步 `docs/architecture/` 或 `docs/adr/`，再补充对应 surfaces 维护说明。
- New Tab runtime redirect 不应改成 `chrome_url_overrides`，除非重新写 ADR。
- 注入内容脚本应基于用户主动操作，不默认请求全部站点权限。

## 导入导出模块

文件：`src/features/import-export/*`。

当前代码已有导入 / 导出基础模块和测试，但 RightRail 的“导入书签 / 导出当前文件夹”等按钮仍为 disabled。接入真实 UI 时需要：

1. 明确入口页面：管理页 / New Tab。
2. 明确作用范围：全部书签 / 当前文件夹。
3. 复用 schema 和测试。
4. UI 反馈进入 toast / operation log。
