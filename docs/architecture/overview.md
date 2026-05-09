# 架构设计

## 总体架构

Bookmark Visualizer 是 Manifest V3 浏览器扩展。工具栏图标和默认扩展快捷键打开 `popup.html`，popup 内提供 Save / Manage / Settings 三个 Tab。React 应用负责渲染和交互，浏览器扩展 API 负责读取和修改书签。

```text
Toolbar Action / Ctrl+Shift+S
  → public/manifest.json action.default_popup = "popup.html"
  → commands._execute_action
  → Popup React UI
  → src/features/popup/popupClient.ts
  → current tab / chrome.scripting when allowed
  → service worker message router
  → quickSaveHandlers

Popup Manage Entry
  → chrome.tabs.create(chrome.runtime.getURL("index.html"))
  → Workspace React UI
  → feature services
  → Chrome API adapters
  → chrome.bookmarks / chrome.storage

Optional New Tab Portal
  → settings.newTabOverrideEnabled
  → src/features/newtab/newTabRedirect.ts
  → tabs.onCreated / tabs.onUpdated runtime redirect
  → newtab.html
  → Search / Shortcuts / Bookmark Groups

Legacy Save Overlay / Quick Save Content Dialog
  → save-overlay-content.js / quick-save-content.js
  → preserved legacy content-script UI
  → runtime message
  → quickSaveHandlers
```

## Manifest V3

当前 manifest 已落地：

- `action.default_popup = "popup.html"`：工具栏点击打开标准扩展 popup。
- `background.service_worker = service-worker.js`：后台命令、消息路由和 New Tab 条件重定向。
- `commands._execute_action`：默认 `Ctrl+Shift+S` / macOS `Command+Shift+S`，打开同一个 action popup。
- `permissions.bookmarks`：读取、创建、编辑、删除和移动书签。
- `permissions.storage`：保存备注、预览图 URL、UI 状态、最近文件夹和设置。
- `permissions.activeTab` / `permissions.scripting` / `permissions.tabs`：在 popup 中读取当前 tab，并在允许时执行一次页面信息提取。
- `permissions.favicon`：允许扩展页面通过官方 `_favicon` URL 读取浏览器已知的网站图标，用于本地 favicon cache；不引入默认第三方 favicon 服务。

当前扩展不声明：

- `chrome_url_overrides.newtab`
- 全局 `host_permissions`
- 默认 `content_scripts`

因此扩展不会静态接管浏览器默认新标签页，也不会在所有网页常驻脚本。

## 页面入口

| 页面 | HTML | React 入口 | 样式入口 |
|---|---|---|---|
| 管理页 | `index.html` | `src/main.tsx` → `src/app/App.tsx` | `src/styles/tokens.css` + `src/app/styles.css` |
| Toolbar Popup | `popup.html` | `src/popup/main.tsx` → `src/popup/PopupApp.tsx` | `src/styles/tokens.css` + `src/popup/styles.css` |
| Legacy Save Overlay | `save-overlay-content.js` | `src/features/save-overlay/content.tsx` → `SaveOverlayApp.tsx` | Shadow DOM style injection from tokens / popup / save-window CSS plus overlay overrides |
| Legacy 保存页 | `save.html` | `src/save-window/main.tsx` → `src/save-window/SaveWindowApp.tsx` → `src/popup/PopupApp.tsx` | `src/styles/tokens.css` + `src/popup/styles.css` + `src/save-window/styles.css` |
| New Tab | `newtab.html` | `src/newtab/main.tsx` → `src/newtab/NewTabApp.tsx` | `src/styles/tokens.css` + `src/newtab/styles.css` |
| Legacy Quick Save | `quick-save-content.js` | `src/features/quick-save/content.tsx` → `QuickSaveDialog.tsx` | `src/features/quick-save/contentStyle.ts` |

## 分层

```text
UI entrypoints
  → feature / use-case orchestration
  → domain models and pure rules
  → infrastructure adapters
```

| 层 | 当前目录 | 说明 |
|---|---|---|
| UI entrypoints | `src/app`、`src/popup`、`src/newtab`、`src/features/save-overlay/*`、`src/features/quick-save/QuickSaveDialog.tsx` | 页面布局、局部状态和用户事件绑定 |
| Shared components | `src/components` | 书签卡片、文件夹树、级联菜单、搜索框、图标 |
| Feature services | `src/features/*` | 书签树、搜索、拖拽、settings、metadata、newtab、favicon、popup、quick-save 等业务能力 |
| Chrome adapters | `src/lib/chrome/*` | `chrome.bookmarks`、`chrome.storage`、runtime、permissions 等封装 |
| Background | `src/background/*` + `src/features/newtab/newTabRedirect.ts` | service worker 注册、命令处理、消息路由、New Tab redirect |
| Domain | `src/domain/*` | 后续稳定领域模型与纯规则，目前部分模块仍是基础模型与类型 |

页面层不得直接散落调用 `chrome.*` API。例外应收敛到明确 helper，例如 `src/features/newtab/navigation.ts` 负责打开 URL / 管理页。

`src/features/favicon/*` 负责 favicon URL 归一化、`_favicon` URL 构建、IndexedDB cache 和 stale-while-refresh 策略。共享 UI 通过 `SiteFavicon` / `useSiteFavicon()` 消费，不在各个页面组件中拼接远程 favicon 服务 URL。

## 当前保存体验页面信息提取

Toolbar popup 通过 `chrome.tabs.query()` 获取当前 tab，并在允许时通过 `chrome.scripting.executeScript()` 读取：

- `og:title`
- `twitter:title`
- `document.title`
- 当前页面 URL
- `og:image`
- `twitter:image`
- favicon
- 页面首个尺寸足够的图片

当前代码**没有**提取 `description` 或 `canonical`。失败时回退到 URL host 或空预览图。

浏览器内部页面只保存 URL / tab 标题，不注入脚本。`save.html` legacy 页面仍保留 source tab 参数解析能力，但不是当前 toolbar 主路径。

代码链路：

```text
src/features/popup/popupClient.ts
  → getCurrentTabDetails()
  → resolveSaveSourceTab(sourceTabId)
  → chrome.scripting.executeScript(extractPopupPageDetailsFromPage)
  → normalizePopupPageDetails()
```

`chrome://` / `edge://` 等浏览器内部页面可以保存为书签，但不会执行 `chrome.scripting.executeScript`。

## Background 链路

```text
src/service-worker.ts
  → registerServiceWorker()
  → src/background/serviceWorker.ts
    → registerMessageRouter()
    → registerNewTabRedirect()
```

具体职责：

| 文件 | 职责 |
|---|---|
| `src/background/serviceWorker.ts` | 聚合注册 runtime message router 和 New Tab redirect |
| `src/background/saveExperienceHandlers.ts` | legacy Save Overlay / fallback helper，当前不由 service worker 注册 |
| `src/background/saveWindow.ts` | 保留的独立保存窗口 helper / legacy 测试覆盖，不再是 toolbar 主路径 |
| `src/background/commandHandlers.ts` | legacy `open-quick-save` helper，当前不由 service worker 注册 |
| `src/background/messageRouter.ts` | 接收 runtime message，转发给 legacy page-open handler 或 Quick Save handler |
| `src/background/quickSaveHandlers.ts` | 创建书签、创建文件夹、读取初始保存状态 |
| `src/background/openWorkspace.ts` | 打开 `index.html`，必要时附带 source tab 信息 |
| `src/features/newtab/newTabRedirect.ts` | 注册 tabs event，根据 settings 条件重定向 `chrome://newtab/` / `edge://newtab/` |

## 保存链路

Toolbar popup、legacy Save Overlay、`save.html` legacy 页面与 Legacy Quick Save 都复用 Quick Save message 协议创建书签：

```text
SaveTab / SaveOverlayTab / QuickSaveDialog
  → QUICK_SAVE_CREATE_BOOKMARK
  → chrome.runtime.sendMessage()
  → src/background/messageRouter.ts
  → handleQuickSaveMessage()
  → bookmarksAdapter.create({ parentId, title, url })
  → saveBookmarkMetadata(created.id, { note, previewImageUrl })
  → saveQuickSaveRecentFolder(parentId)
```

维护重点：如果未来清理 legacy Save Overlay / save-window handler，应保证 toolbar popup 的 `bookmarksAdapter.create()`、`saveBookmarkMetadata()`、`saveRecentFolder()` 行为不回退。

## New Tab 条件重定向

New Tab 不使用 manifest 静态覆盖，而是运行时判断：

```text
tabs.onCreated / tabs.onUpdated
  → maybeRedirectNewTab(tab)
  → isBrowserNewTab(tab)
  → loadSettings()
  → settings.newTabOverrideEnabled
  → chrome.tabs.update(tabId, { url: chrome.runtime.getURL("newtab.html") })
```

`newTabOverrideEnabled` 默认必须保持 `false`。
