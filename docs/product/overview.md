# 项目概览

## 愿景

Bookmark Visualizer 希望把浏览器书签从“层级菜单”变成“可浏览、可搜索、可整理、可快速保存的工作台”。它不重建一套独立收藏系统，而是在浏览器原生书签之上提供更好的可视化、保存、搜索和整理体验。

## 当前入口

当前项目是 Manifest V3 浏览器扩展，入口由 `public/manifest.json` 定义：

```text
public/manifest.json
  → action without default_popup
  → background.service_worker = service-worker.js
  → commands.open-quick-save = Ctrl+Shift+S / Command+Shift+S opens save.html
```

因此，**点击浏览器工具栏插件图标时打开的是独立 `save.html` 保存小窗口，不是直接打开完整管理页**。

当前主要页面与运行场景：

| 页面 / 场景 | 入口 | 代码链路 | 用途 |
|---|---|---|---|
| 保存小窗口 | `save.html` | `src/save-window/main.tsx` → `src/save-window/SaveWindowApp.tsx` → `src/popup/PopupApp.tsx` | 保存当前网页、进入管理页、修改基础设置 |
| Popup fallback | `popup.html` | `src/popup/main.tsx` → `src/popup/PopupApp.tsx` | fallback / dev entry |
| 完整管理页 | `index.html` | `src/main.tsx` → `src/app/App.tsx` | 书签树浏览、搜索、拖拽整理、批量操作、右侧辅助信息 |
| New Tab Portal | `newtab.html` | `src/newtab/main.tsx` → `src/newtab/NewTabApp.tsx` | 可选的新标签页搜索与快捷入口 |
| Quick Save 浮框 | `quick-save-content.js` | `src/features/quick-save/content.tsx` → `QuickSaveDialog.tsx` | 通过扩展命令注入网页的快捷保存浮框 |
| Service Worker | `service-worker.js` | `src/service-worker.ts` → `src/background/serviceWorker.ts` | 注册命令、消息路由、New Tab 条件重定向 |

## 使用场景

- 用户点击工具栏图标或按 `Ctrl+Shift+S`，打开保存小窗口的“保存”Tab，确认标题、URL、备注和保存位置后保存当前网页。
- 用户在保存小窗口的“管理”Tab 点击入口，打开完整管理页 `index.html`。
- 用户在完整管理页查看三栏工作台：左侧文件夹树、中间书签工作区、右侧辅助栏。
- 用户点击左侧某个文件夹，在中间区域查看该文件夹下的子文件夹、书签卡片和命令栏。
- 用户通过顶部搜索框搜索书签标题和 URL；备注 / 摘要搜索仍属于后续增强。
- 用户拖拽书签卡片或树节点，浏览器原生书签位置同步变化。
- 用户通过书签卡片右键菜单编辑、新建、移动或删除书签。
- 用户通过文件夹右键菜单新建子文件夹或重命名普通文件夹。
- 用户删除或移动书签后，可以在本次会话内通过操作日志撤回部分操作。
- 用户在设置中开启“绑定新标签页”后，浏览器新标签页会被运行时重定向到 `newtab.html`；默认保持关闭。
- 用户通过 `Ctrl+Shift+S` / `Command+Shift+S` 扩展命令打开同一个保存小窗口；保留的 Quick Save 内容脚本浮框不再是默认键盘主入口。

## 产品边界

Bookmark Visualizer 管理的是浏览器当前 Profile 的原生书签。文件夹、标题、URL、书签位置等主数据来自 `chrome.bookmarks` API。

插件只保存浏览器原生书签没有的数据，例如备注、预览图 URL、最近使用文件夹、New Tab 个性化状态和 UI 设置。这些数据不得成为书签结构的唯一事实来源。

当前已落地的主要本地存储 key：

| key | 说明 |
|---|---|
| `bookmarkVisualizerSettings` | 管理页、保存小窗口 / Popup fallback、New Tab 的 UI 与行为设置 |
| `bookmarkVisualizerMetadata` | 书签备注、预览图 URL、page kind、source URL 等扩展元数据 |
| `bookmarkVisualizerRecentFolders` | 最近保存 / 移动目标文件夹 |
| `bookmarkVisualizerNewTabState` | New Tab 固定快捷方式、隐藏项、选中分组等状态 |
| `bookmarkVisualizerNewTabActivity` | New Tab 最近活动 |
| `bookmarkVisualizerNewTabUsageStats` | New Tab URL 使用统计 |
| `bookmarkVisualizerQuickSaveUiState` | 旧版兼容读取 key；当前已迁移到 `bookmarkVisualizerRecentFolders` |

## 成功标准

- 用户无需导出书签 HTML，就能看到当前浏览器书签层级。
- 用户能在保存小窗口内快速保存当前网页。
- 用户能在完整管理页中搜索、拖拽、编辑、移动、删除和批量整理书签。
- 用户能通过 New Tab 快速搜索网页、打开快捷站点和进入常用书签分组。
- 用户能放心执行修改操作，并能在误操作后获得明确反馈或撤回入口。
- 后续工程实现者能通过文档追踪页面、组件、样式、状态和 Chrome API 链路。
