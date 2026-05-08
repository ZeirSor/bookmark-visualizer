# 架构设计

## 总体架构

Bookmark Visualizer 是 Manifest V3 浏览器扩展。工具栏图标触发标准 Popup，Popup 承载当前网页保存入口，并可打开完整管理页。React 应用负责渲染和交互，浏览器扩展 API 负责读取和修改书签。

```text
Toolbar Action
  → public/manifest.json: action.default_popup = popup.html
  → Popup React UI
  → src/features/popup/popupClient.ts
  → chrome.tabs / chrome.scripting / runtime message
  → service worker message router
  → quickSaveHandlers
  → chrome.bookmarks / chrome.storage

Popup Manage Entry
  → openWorkspace("index.html")
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

Quick Save Command
  → commands.open-quick-save
  → src/background/commandHandlers.ts
  → injectQuickSaveDialog()
  → quick-save content script Shadow DOM
  → runtime message
  → quickSaveHandlers
```

## Manifest V3

当前 manifest 已落地：

- `action.default_popup = popup.html`：工具栏 Popup 启动入口。
- `background.service_worker = service-worker.js`：后台命令、消息路由和 New Tab 条件重定向。
- `commands.open-quick-save`：默认 `Ctrl+Shift+S` / macOS `Command+Shift+S`，触发当前页快捷保存。
- `permissions.bookmarks`：读取、创建、编辑、删除和移动书签。
- `permissions.storage`：保存备注、预览图 URL、UI 状态、最近文件夹和设置。
- `permissions.activeTab` / `permissions.scripting` / `permissions.tabs`：在用户主动打开 Popup 或触发扩展命令时读取当前标签页详情，必要时执行一次页面信息提取。

当前扩展不声明：

- `chrome_url_overrides.newtab`
- 全局 `host_permissions`
- 默认 `content_scripts`

因此扩展不会静态接管浏览器默认新标签页，也不会在所有网页常驻脚本。

## 页面入口

| 页面 | HTML | React 入口 | 样式入口 |
|---|---|---|---|
| 管理页 | `index.html` | `src/main.tsx` → `src/app/App.tsx` | `src/styles/tokens.css` + `src/app/styles.css` |
| Popup | `popup.html` | `src/popup/main.tsx` → `src/popup/PopupApp.tsx` | `src/styles/tokens.css` + `src/popup/styles.css` |
| New Tab | `newtab.html` | `src/newtab/main.tsx` → `src/newtab/NewTabApp.tsx` | `src/styles/tokens.css` + `src/newtab/styles.css` |
| Quick Save | `quick-save-content.js` | `src/features/quick-save/content.tsx` → `QuickSaveDialog.tsx` | `src/features/quick-save/contentStyle.ts` |

## 分层

```text
UI entrypoints
  → feature / use-case orchestration
  → domain models and pure rules
  → infrastructure adapters
```

| 层 | 当前目录 | 说明 |
|---|---|---|
| UI entrypoints | `src/app`、`src/popup`、`src/newtab`、`src/features/quick-save/QuickSaveDialog.tsx` | 页面布局、局部状态和用户事件绑定 |
| Shared components | `src/components` | 书签卡片、文件夹树、级联菜单、搜索框、图标 |
| Feature services | `src/features/*` | 书签树、搜索、拖拽、settings、metadata、newtab、popup、quick-save 等业务能力 |
| Chrome adapters | `src/lib/chrome/*` | `chrome.bookmarks`、`chrome.storage`、runtime、permissions 等封装 |
| Background | `src/background/*` + `src/features/newtab/newTabRedirect.ts` | service worker 注册、命令处理、消息路由、New Tab redirect |
| Domain | `src/domain/*` | 后续稳定领域模型与纯规则，目前部分模块仍是基础模型与类型 |

页面层不得直接散落调用 `chrome.*` API。例外应收敛到明确 helper，例如 `src/features/newtab/navigation.ts` 负责打开 URL / 管理页。

## 当前 Popup 页面信息提取

Popup 在普通网页中通过用户手势带来的 `activeTab` 和 `chrome.scripting.executeScript` 提取：

- `og:title`
- `twitter:title`
- `document.title`
- 当前页面 URL
- `og:image`
- `twitter:image`
- favicon
- 页面首个尺寸足够的图片

当前代码**没有**提取 `description` 或 `canonical`。失败时回退到 tab 标题、URL、favicon 或空预览图。

代码链路：

```text
src/features/popup/popupClient.ts
  → getCurrentTabDetails()
  → chrome.tabs.query()
  → chrome.scripting.executeScript(extractPopupPageDetailsFromPage)
  → normalizePopupPageDetails()
```

## Background 链路

```text
src/service-worker.ts
  → registerServiceWorker()
  → src/background/serviceWorker.ts
    → registerCommandHandlers()
    → registerMessageRouter()
    → registerNewTabRedirect()
```

具体职责：

| 文件 | 职责 |
|---|---|
| `src/background/serviceWorker.ts` | 聚合注册入口，不承载具体业务 |
| `src/background/commandHandlers.ts` | 处理 `open-quick-save` 扩展命令，注入 Quick Save 或打开工作台 fallback |
| `src/background/messageRouter.ts` | 接收 runtime message，转发给 Quick Save handler |
| `src/background/quickSaveHandlers.ts` | 创建书签、创建文件夹、读取初始保存状态 |
| `src/background/openWorkspace.ts` | 打开 `index.html`，必要时附带 source tab 信息 |
| `src/features/newtab/newTabRedirect.ts` | 注册 tabs event，根据 settings 条件重定向 `chrome://newtab/` / `edge://newtab/` |

## 保存链路

Popup 与 Quick Save 都复用 Quick Save message 协议创建书签：

```text
SaveTab / QuickSaveDialog
  → QUICK_SAVE_CREATE_BOOKMARK
  → chrome.runtime.sendMessage()
  → src/background/messageRouter.ts
  → handleQuickSaveMessage()
  → bookmarksAdapter.create({ parentId, title, url })
  → saveBookmarkMetadata(created.id, { note, previewImageUrl })
  → saveQuickSaveRecentFolder(parentId)
```

维护重点：如果未来拆分 Popup 专属保存 handler，应保证 `bookmarksAdapter.create()`、`saveBookmarkMetadata()`、`saveRecentFolder()` 的行为一致，避免 Popup 和 Quick Save 保存结果不一致。

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
