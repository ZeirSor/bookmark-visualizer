# Toolbar Popup PageDoc

## 页面定位

Popup 是浏览器工具栏入口，目标是快速保存当前网页，并提供轻量管理入口和常用设置。它不是完整管理页，不能塞入复杂书签整理功能。

## 入口链路

```text
public/manifest.json
  → action.default_popup = "popup.html"

popup.html
  → src/popup/main.tsx
    → import src/styles/tokens.css
    → import src/popup/styles.css
    → render <PopupApp />
```

## 主要文件

| 责任 | 文件 |
|---|---|
| Popup 总控、状态、保存、新建文件夹、设置更新 | `src/popup/PopupApp.tsx` |
| 保存 Tab | `src/popup/tabs/SaveTab.tsx` |
| 管理 Tab | `src/popup/tabs/ManageTab.tsx` |
| 设置 Tab | `src/popup/tabs/SettingsTab.tsx` |
| 页面预览卡 | `src/popup/components/PagePreviewCard.tsx` |
| 保存位置组合控件 | `src/popup/components/SaveLocationPicker.tsx` |
| 保存位置子组件 | `src/popup/components/save-location/*` |
| Footer 保存按钮和状态 | `src/popup/components/PopupFooter.tsx` |
| Tab 按钮 | `src/popup/components/TabButton.tsx` |
| Popup 图标 | `src/popup/components/PopupIcons.tsx` |
| Popup feature | `src/features/popup/*` |
| Quick Save 业务复用 | `src/features/quick-save/*` |
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
| `activeTab` | `PopupApp.tsx` | 当前 Tab：save / manage / settings |
| `settings` | `PopupApp.tsx` | Popup 行为、新标签页设置、默认保存位置 |
| `pageDetails` | `PopupApp.tsx` | 当前标签页 title/url/preview/canSave |
| `tree` | `PopupApp.tsx` | 文件夹树，用于保存位置选择 |
| `recentFolderIds` | `PopupApp.tsx` | 最近保存位置 |
| `selectedFolderId` | `PopupApp.tsx` | 当前保存目标 |
| `title` | `PopupApp.tsx` | 可编辑保存标题 |
| `note` | `PopupApp.tsx` | 保存备注 |
| `query` | `PopupApp.tsx` | 文件夹搜索词 |
| `status` / `statusTone` | `PopupApp.tsx` | Footer 状态反馈 |
| `saving` | `PopupApp.tsx` | 保存按钮 loading/disabled |
| `creatingFolder` | `PopupApp.tsx` | 新建文件夹 loading |
| `createOpen` / `folderName` / `createParentFolderId` | `PopupApp.tsx` | 原位新建文件夹 |
| `previewFailed` | `PopupApp.tsx` | 页面预览图片 fallback |

## 当前已实现能力

- 保存当前网页为浏览器原生书签。
- 自动读取当前标签页标题、URL、候选预览图。
- 编辑标题、填写备注、复制只读 URL。
- 选择保存位置：路径行、箭头打开级联菜单、原位搜索、原位新建、最近位置。
- 管理 Tab：打开完整管理页、最近保存、最近使用文件夹。
- 设置 Tab：New Tab 绑定、搜索引擎、搜索类型、布局模式、快捷键说明、默认保存位置、保存行为、界面偏好。
- 保存后可自动关闭 Popup。

## 当前边界

- Popup 内不做完整书签管理。
- Popup 保存位置搜索最多显示 4 条结果，由 `PopupApp.tsx` slice 控制。
- 保存位置路径文本只展示，真正打开级联菜单的是箭头按钮。
- Settings 中默认保存位置的级联菜单挂在 `settings-cascade-host` 内，不是全局 portal。
- Popup 主题设置存在，但当前需要继续核对是否已完全作用到 CSS dark mode。
