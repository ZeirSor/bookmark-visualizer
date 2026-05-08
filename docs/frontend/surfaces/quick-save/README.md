# Quick Save 内容脚本浮框 PageDoc

## 页面定位

Quick Save 是通过扩展 command 注入当前网页的 Shadow DOM 浮框，用于低权限快速保存当前网页。它不是 Toolbar Popup，也不是管理页。

## 入口链路

```text
public/manifest.json
  → commands.open-quick-save = Ctrl+Shift+S / Command+Shift+S

src/service-worker.ts
  → registerServiceWorker()
  → registerCommandHandlers()
  → chrome.commands.onCommand
  → inject src/features/quick-save/content.tsx bundled output

vite.config.ts
  → closeBundle()
  → esbuild IIFE bundle src/features/quick-save/content.tsx
  → dist/quick-save-content.js
```

## 主要文件

| 责任 | 文件 |
|---|---|
| 内容脚本入口、Shadow DOM host | `src/features/quick-save/content.tsx` |
| 浮框 React UI | `src/features/quick-save/QuickSaveDialog.tsx` |
| Shadow DOM CSS 字符串 | `src/features/quick-save/contentStyle.ts` |
| 页面信息提取 | `src/features/quick-save/pageDetails.ts` |
| 文件夹创建 helper | `src/features/quick-save/createFolder.ts` |
| folder utilities | `src/features/quick-save/folders.ts` |
| UI state helpers | `src/features/quick-save/uiState.ts` |
| 快捷键权限 / 支持判断 | `src/features/quick-save/shortcutAccess.ts` |
| 消息协议 | `src/features/quick-save/types.ts` |
| background handler | `src/background/quickSaveHandlers.ts` |
| command 注册 | `src/background/commandHandlers.ts` |

## 运行边界

- UI 注入网页，但 CSS 在 Shadow DOM 内隔离。
- 业务数据通过 `chrome.runtime.sendMessage()` 请求 background。
- background 负责读取 bookmarks tree、创建书签、创建文件夹、保存 metadata、记录最近文件夹。
- 页面不直接读取正文，只提取 title / url / previewImageUrl 等页面级信息。

## 与 Popup 的区别

| 项 | Popup SaveTab | Quick Save |
|---|---|---|
| 入口 | toolbar popup | command 注入网页 |
| 容器 | extension popup window | Shadow DOM overlay |
| CSS | `src/popup/styles.css` | `contentStyle.ts` 字符串 |
| 保存位置 UI | 路径行 + 搜索 + 最近 + portal cascade | 搜索 + 最近 + 浏览文件夹 + cascade |
| 关闭行为 | 保存后可根据 settings 自动关闭 | 保存成功 700ms 后关闭 |
| 设置入口 | 有 SettingsTab | 无设置入口 |
| 主要风险 | popup 边界裁剪 | 网页环境、Shadow DOM、焦点陷阱 |
