# Save Window / Popup PageDoc

## 页面定位

独立 `save.html` 保存小窗口是浏览器工具栏和 `Ctrl+Shift+S` 的主保存入口，目标是快速保存当前网页，并提供轻量管理入口和常用设置。`popup.html` 仍作为 fallback / dev entry 参与构建。它们不是完整管理页，不能塞入复杂书签整理功能。

## 入口链路

```text
public/manifest.json
  → action without default_popup
  → service worker registers chrome.action.onClicked

save.html
  → src/save-window/main.tsx
    → import src/styles/tokens.css
    → import src/popup/styles.css
    → import src/save-window/styles.css
    → render <SaveWindowApp />
      → <PopupApp bootstrapOptions={sourceParams} />

popup.html
  → src/popup/main.tsx
    → import src/styles/tokens.css
    → import src/popup/styles.css
    → render <PopupApp />
```

## 主要文件

| 责任 | 文件 |
|---|---|
| 保存小窗口入口 | `src/save-window/*` |
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
| Settings | `src/features/settings/*` |
| 样式 | `src/popup/styles.css`、`src/save-window/styles.css`、`src/styles/tokens.css` |

## 保存窗口组件树

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

## 保存窗口 / Popup 状态

| 状态 | 文件 | 用途 |
|---|---|---|
| `activeTab` / `settings` / `pageDetails` / `tree` / `recentFolderIds` / `selectedFolderId` / `title` / footer status | `usePopupBootstrap.ts` | 初始加载和主状态；保存窗口传入 source tab params |
| `note` / `query` / `saving` / `creatingFolder` / `createOpen` / `folderName` / `createParentFolderId` / `previewFailed` | `usePopupSaveState.ts` | 保存表单瞬时状态 |
| `save()` / `createFolder()` / `updateSettings()` / `updateDefaultFolder()` | `usePopupSaveActions.ts` | 保存、新建和设置写入副作用 |

## 当前已实现能力

- 保存当前网页为浏览器原生书签。
- 通过 `sourceTabId` 自动读取原始标签页标题、URL、候选预览图。
- `chrome://` / `edge://` 等浏览器内部页面可保存，但不执行 metadata 注入。
- 编辑标题、填写备注、复制只读 URL。
- 选择保存位置：路径行、箭头打开级联菜单、原位搜索、原位新建、最近位置。
- 管理 Tab：打开完整管理页、最近保存、最近使用文件夹。
- 设置 Tab：New Tab 绑定、搜索引擎、搜索类型、布局模式、快捷键说明、默认保存位置、保存行为、界面偏好。
- 保存后可自动关闭保存窗口。

## 当前边界

- 保存窗口内不做完整书签管理。
- 保存位置搜索最多显示 4 条结果，由 `PopupApp.tsx` 派生 searchResults 时 slice 控制。
- 保存位置路径文本只展示，真正打开级联菜单的是箭头按钮。
- Settings 中默认保存位置的级联菜单挂在 `settings-cascade-host` 内，不是全局 portal。
- Popup 主题设置存在并会持久化为 `popupThemeMode`，但当前尚未完整作用到 CSS dark mode。
