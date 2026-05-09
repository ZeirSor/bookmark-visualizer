# Save Overlay / Quick Save PageDoc

## 页面定位

Save Overlay 是保留的 legacy 内容脚本保存体验。当前普通网页主保存体验已经恢复为 toolbar popup；Save Overlay 和 Legacy Quick Save 内容脚本仍保留为独立 bundle 和历史能力，但不再是普通网页主入口。

## 入口链路

```text
public/manifest.json
  → action.default_popup = popup.html
  → commands._execute_action = Ctrl+Shift+S / Command+Shift+S

src/service-worker.ts
  → registerServiceWorker()
  → registerMessageRouter()
  → registerNewTabRedirect()

vite.config.ts
  → closeBundle()
  → esbuild IIFE bundle src/features/save-overlay/content.tsx
  → dist/save-overlay-content.js
  → esbuild IIFE bundle src/features/quick-save/content.tsx
  → dist/quick-save-content.js
```

## 主要文件

| 责任 | 文件 |
|---|---|
| Save Overlay 内容脚本入口、Shadow DOM host | `src/features/save-overlay/content.tsx` |
| Save Overlay React UI | `src/features/save-overlay/SaveOverlayApp.tsx` |
| Save Overlay Shadow DOM CSS 注入 | `src/features/save-overlay/contentStyle.ts` |
| Save Overlay 内联文件夹选择 | `src/features/save-overlay/components/FolderPathSelector.tsx`、`InlineFolderPicker.tsx`、`FolderTree.tsx` |
| Legacy Quick Save 内容脚本入口、Shadow DOM host | `src/features/quick-save/content.tsx` |
| Legacy Quick Save 浮框 React UI | `src/features/quick-save/QuickSaveDialog.tsx` |
| Legacy Quick Save Shadow DOM CSS 字符串 | `src/features/quick-save/contentStyle.ts` |
| 页面信息提取 | `src/features/quick-save/pageDetails.ts` |
| 文件夹创建 helper | `src/features/quick-save/createFolder.ts` |
| folder utilities | `src/features/quick-save/folders.ts` |
| UI state helpers | `src/features/quick-save/uiState.ts` |
| 快捷键权限 / 支持判断 | `src/features/quick-save/shortcutAccess.ts` |
| 消息协议 | `src/features/quick-save/types.ts` |
| background save experience handler | `src/background/saveExperienceHandlers.ts` |
| background bookmark/folder handler | `src/background/quickSaveHandlers.ts` |
| command 注册 | `src/background/commandHandlers.ts` |

## 运行边界

- Save Overlay UI 注入网页，但当前不由 toolbar 主路径注册；CSS 在 Shadow DOM 内隔离。
- 业务数据通过 `chrome.runtime.sendMessage()` 请求 background。
- background 负责读取 bookmarks tree、创建书签、创建文件夹、保存 metadata、记录最近文件夹。
- 页面不直接读取正文，只提取 title / url / previewImageUrl 等页面级信息。
- `chrome://` / `edge://` / extension / `file://` 页面不注入 Save Overlay，改为 `save.html` fallback。

## 与 Popup 的区别

| 项 | Toolbar Popup SaveTab | Legacy Save Overlay |
|---|---|---|
| 入口 | toolbar action / `_execute_action` | legacy helper，等待 cleanup |
| 容器 | extension toolbar popup | Shadow DOM overlay |
| CSS | `src/popup/styles.css` | Shadow DOM 注入 tokens / popup / save-window CSS + overlay overrides |
| 保存位置 UI | 路径行 + 内联文件夹树 + 搜索 + 最近 + 新建 | 单个路径选择控件 + 内联文件夹树 + 搜索 + 最近 + 新建 |
| 关闭行为 | 保存后可根据 settings 自动关闭 popup | 保存后可根据 settings 自动关闭 overlay，Esc / 遮罩 / 取消关闭 |
| 设置入口 | 有 SettingsTab | 有 SettingsTab，默认保存位置使用内联 picker |
| 主要风险 | extension page source tab 传递 | 网页环境、Shadow DOM、焦点陷阱、注入失败 fallback |
