# Toolbar Popup / Save PageDoc

## 页面定位

`popup.html` 当前是工具栏主保存入口。点击扩展图标或触发 `_execute_action` 快捷键会打开同一个 toolbar popup，默认进入 Save Tab，并保留 Manage / Settings。Popup 不是完整管理页，不能塞入复杂书签整理功能。

## 入口链路

```text
public/manifest.json
  → action.default_popup = "popup.html"
  → commands._execute_action = Ctrl+Shift+S / Command+Shift+S

popup.html
  → src/popup/main.tsx
    → import src/styles/tokens.css
    → import src/popup/styles.css
    → render <PopupApp />

optional page Ctrl+S
  → src/features/page-shortcut/content.ts
  → src/background/pageShortcutHandlers.ts
  → chrome.action.openPopup()
```

## 主要文件

| 责任 | 文件 |
|---|---|
| Popup 入口 | `src/popup/main.tsx`、`popup.html` |
| Popup 总控、tab 条件渲染、派生 view data | `src/popup/PopupApp.tsx` |
| Popup 初始状态 / 保存表单 / actions hooks | `src/popup/hooks/*` |
| 保存 Tab | `src/popup/tabs/SaveTab.tsx` |
| 管理 Tab | `src/popup/tabs/ManageTab.tsx` |
| 设置 Tab | `src/popup/tabs/SettingsTab.tsx` |
| 设置 Tab 子组件 | `src/popup/tabs/settings/*` |
| 页面预览卡 | `src/popup/components/PagePreviewCard.tsx` |
| 保存位置组合控件 | `src/popup/components/SaveLocationPicker.tsx` |
| 保存位置子组件 | `src/popup/components/save-location/*` |
| Footer 保存按钮和状态 | `src/popup/components/PopupFooter.tsx` |
| Tab 按钮 | `src/popup/components/TabButton.tsx` |
| Popup 图标 | `src/popup/components/PopupIcons.tsx` |
| source tab / Popup feature | `src/features/popup/*` |
| Quick Save 业务复用 | `src/features/quick-save/*` |
| Page Ctrl+S bridge | `src/features/page-shortcut/*`、`src/background/pageShortcutHandlers.ts` |
| Settings | `src/features/settings/*` |
| 样式 | `src/popup/styles.css`、`src/styles/tokens.css` |

## Popup 组件树

```text
<PopupApp>
  <header.popup-header>
    logo + brand + open workspace icon button
  <nav.popup-tabs>
    <TabButton>保存</TabButton>
    <TabButton>管理</TabButton>
    <TabButton>设置</TabButton>
  <section.popup-content>
    activeTab === save → <SaveTab>
      <PagePreviewCard />
      title input
      readonly URL input
      note textarea
      <SaveLocationPicker />
    activeTab === manage → <ManageTab />
    activeTab === settings → <SettingsTab />
  activeTab === save → <PopupFooter />
```

## Popup 状态

| 状态 | 文件 | 用途 |
|---|---|---|
| `activeTab` / `settings` / `pageDetails` / `tree` / `recentFolderIds` / `selectedFolderId` / `title` / footer status | `usePopupBootstrap.ts` | 初始加载和主状态 |
| `note` / `query` / `saving` / `creatingFolder` / `createOpen` / `folderName` / `createParentFolderId` / `previewFailed` | `usePopupSaveState.ts` | 保存表单瞬时状态 |
| `save()` / `createFolder()` / `updateSettings()` / `updateDefaultFolder()` | `usePopupSaveActions.ts` | 保存、新建和设置写入副作用 |

## Popup 视觉层

- `src/styles/tokens.css` 提供 `--popup-width: 800px`、`--popup-height: 600px` 和 popup radius / shadow token。
- `src/popup/styles.css` 让 `body` 保持透明外框，内部 `.popup-shell` 使用圆角、边框和阴影。
- `PopupApp` 只渲染 toolbar popup shell，不再保留 save-window variant。

## 当前已实现能力

- 保存当前网页为浏览器原生书签。
- 自动读取当前标签页标题、URL、候选预览图。
- `chrome://` / `edge://` 等浏览器内部页面可保存，但不执行 metadata 注入；popup 显示浏览器内部页面可保存说明。
- 编辑标题、填写备注、复制只读 URL。
- 选择保存位置：路径行、内联 folder picker、搜索、键盘树导航、新建文件夹、最近位置。
- 管理 Tab：dashboard 入口、搜索入口、最近保存、最近使用文件夹、可用快捷操作。
- 设置 Tab：New Tab 绑定、搜索引擎、搜索类型、布局模式、快捷键说明、默认保存位置、保存行为、界面偏好；主表单使用 `CustomSelect`，不使用原生 `<select>` 外观。
- 设置 Tab 可开启页面内 Ctrl+S；开启时请求 optional host permissions，授权后动态注册轻量 listener。
- 保存后可自动关闭 popup。

## 当前边界

- Popup 内不做完整书签管理。
- 保存位置搜索由共享 `src/components/folder-picker/InlineFolderPicker.tsx` 处理，最多显示 8 条结果。
- 保存位置路径文本只展示，真正打开级联菜单的是箭头按钮。
- Settings 中默认保存位置使用同一个内联 folder picker，不使用横向 floating cascade。
- Popup 主题设置存在并会持久化为 `popupThemeMode`，但当前尚未完整作用到 CSS dark mode。
- 页面内 Ctrl+S bridge 不渲染 UI，不读取页面内容，只打开同一个 toolbar popup。
