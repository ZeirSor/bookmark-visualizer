---
type: reference
status: active
scope: product
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# 界面设计

## 当前页面结构

当前项目不是单一“两栏书签页”，而是由四个前端 surface 共同组成：

| Surface | 入口 | 样式入口 | 设计定位 |
|---|---|---|---|
| 管理页 Manager | `index.html` → `src/app/App.tsx` | `src/app/styles.css` | 三栏书签工作台 |
| Toolbar Popup | `popup.html` → `src/popup/PopupApp.tsx` | `src/popup/styles.css` | 当前页保存 + 管理 / 设置入口 |
| New Tab Portal | `newtab.html` → `src/newtab/NewTabApp.tsx` | `src/newtab/styles.css` | 搜索优先的新标签页 |
| Page Ctrl+S bridge | `page-shortcut-content.js` → `src/features/page-shortcut/content.ts` | 无 UI 样式 | 可选快捷键 listener，只打开 toolbar popup |

所有页面都应先使用 `src/styles/tokens.css` 中的 `--bv-*` 基础 token，再映射到页面级 alias：`--app-*`、`--popup-*`、`--nt-*`。

## 管理页：三栏工作台

当前管理页采用“三栏 + 顶部工作区”的结构：

```text
┌────────────────┬──────────────────────────────────────────┬──────────────────┐
│ Sidebar        │ Manager Main                             │ RightRail        │
│ FolderTree     │ TopToolbar                               │ Recent Activity  │
│ Resize Handle  │ FolderHeader                             │ Quick Actions    │
│                │ SearchFilterSummary                      │ Storage Card     │
│                │ BookmarkCommandBar                       │                  │
│                │ FolderStrip                              │                  │
│                │ WorkspaceContent / Bookmark Cards        │                  │
└────────────────┴──────────────────────────────────────────┴──────────────────┘
```

### Sidebar

代码链路：

```text
src/app/App.tsx
  → src/components/FolderTree.tsx
  → src/app/styles.css
```

UI 细节：

- 产品标识与状态区放在侧栏顶部。
- 文件夹树使用缩进、展开箭头、文件夹图标表达层级。
- “显示书签条目”开关由 `settings.showBookmarksInTree` 控制。
- 侧栏宽度由 `settings.sidebarWidth` 控制，拖拽分隔条后写入 `bookmarkVisualizerSettings`。
- 文件夹右键菜单提供新建子文件夹、重命名等入口；顶层特殊文件夹不可重命名。

维护重点：侧栏树和中间工作区是独立滚动区域，修改高度、overflow、position 时必须验证长书签树、拖拽自动滚动和右键菜单层级。

### Manager Main

代码链路：

```text
src/app/App.tsx
  → src/app/workspace/components/TopToolbar.tsx
  → src/app/workspace/components/FolderHeader.tsx
  → src/app/workspace/components/SearchFilterSummary.tsx
  → src/app/workspace/components/BookmarkCommandBar.tsx
  → src/app/workspace/components/FolderStrip.tsx
  → src/app/workspace/WorkspaceContent.tsx
  → src/components/BookmarkCard.tsx
  → src/app/styles.css
```

关键 UI：

| 区域 | 代码 | 说明 |
|---|---|---|
| 顶部搜索 | `TopToolbar.tsx` + `SearchBar.tsx` | 全局搜索标题 / URL / 备注；不要再新增第二个重复搜索框 |
| 文件夹头部 | `FolderHeader.tsx` | 展示当前路径、文件夹摘要、新建入口 |
| 搜索摘要 | `SearchFilterSummary.tsx` | 展示关键词、备注筛选、结果数量和搜索范围 |
| 命令栏 | `BookmarkCommandBar.tsx` | 批量选择、排序、有备注筛选等入口；未实现能力必须保持 disabled |
| 子文件夹条 | `FolderStrip.tsx` | 展示当前文件夹下的子文件夹 quick access |
| 卡片内容 | `WorkspaceContent.tsx` | 展示书签卡片、空状态、搜索结果 |

### RightRail

代码链路：

```text
src/app/workspace/components/RightRail.tsx
  → src/app/App.tsx activities / storage summary
  → src/app/styles.css
```

当前右侧栏包含：

- 最近活动：展示本轮操作日志前 5 条，完整日志由 drawer 展示。
- 快捷操作：新建文件夹可用；导入书签、导出当前文件夹、查找重复、回收站当前是禁用占位。
- 存储信息：展示本地存储提示；“升级空间”是未来云能力占位。

维护重点：RightRail 是辅助栏，不应抢占中间搜索和卡片操作的视觉焦点；禁用占位不要写成已实现能力。

## 书签卡片

代码链路：

```text
src/components/BookmarkCard.tsx
  → src/app/App.tsx handlers
  → src/features/metadata/useMetadata.ts
  → src/lib/chrome/bookmarksAdapter.ts
  → src/app/styles.css
```

卡片字段：favicon、标题、URL / 域名、备注 chip、日期、打开按钮、更多按钮、选择态 checkbox、星标占位、拖拽状态。

交互规则：

- 普通模式下点击卡片主体打开 URL。
- 选择模式下点击卡片主体切换选中，不打开 URL。
- 标题、URL、备注行内编辑时不触发打开。
- 更多按钮 / 右键菜单提供编辑、新建到前后、移动、删除。
- 搜索结果状态不允许当前文件夹内重排。

## Toolbar Popup 与页面快捷键

当前主保存体验是 Toolbar Popup：工具栏图标和 `Ctrl+Shift+S` 打开 `popup.html`，在标准扩展 popup 中渲染“保存 / 管理 / 设置”三 Tab。页面内 `Ctrl+S` 是默认关闭的可选 bridge，开启后只打开同一个 popup。

```text
Toolbar action / Ctrl+Shift+S
  → action.default_popup = popup.html
  → src/popup/main.tsx
  → src/popup/PopupApp.tsx
  → SaveTab / ManageTab / SettingsTab
```

页面内 Ctrl+S bridge 不渲染 UI：

```text
src/features/page-shortcut/content.ts
  → listen Ctrl+S / Command+S outside editable fields
  → chrome.runtime.sendMessage()
  → src/background/pageShortcutHandlers.ts
  → chrome.action.openPopup()
```

必须细化维护的 UI 元素：

| 元素 | 代码 | 样式 / selector 方向 | 说明 |
|---|---|---|---|
| 内联文件夹树 | `InlineFolderPicker.tsx`、`FolderTree.tsx`、`FolderTreeItem.tsx` | `.inline-folder-picker` | 展开树、搜索、最近位置、新建文件夹，不使用横向 floating cascade |
| 设置 Tab | `SettingsTab.tsx` | `.settings-tab` | Switch、CustomSelect、默认保存位置内联选择、页面内 Ctrl+S 开关 |
| 管理 Tab | `ManageTab.tsx` | `.manage-tab` | 打开完整管理页、最近保存、最近位置 |

## New Tab Portal

New Tab 设计目标是搜索优先，而不是把完整管理页压缩到新标签页。

代码链路：

```text
src/newtab/NewTabApp.tsx
  → SearchPanel.tsx
  → NewTabSections.tsx
  → CustomizeLayoutPanel.tsx
  → ShortcutDialog.tsx
  → src/newtab/styles.css
```

关键规则：

- 搜索 hero 是第一视觉焦点。
- 网络搜索与本地书签建议同时出现。
- 搜索建议项实际 selector 是 `.nt-suggestion-item`，不是 `.nt-search-row`。
- `.nt-search-row` 是搜索输入所在布局行。
- 布局模式有 `standard`、`sidebar`、`tabs` 三种 class；其中明显 CSS 覆盖主要集中在 `.is-sidebar-mode`，`standard` / `tabs` 更多通过 React 条件渲染切换内容。

## Quick Save Core

Quick Save 现在是 popup 保存链路复用的消息协议和业务 helper，不再包含网页 Shadow DOM 保存浮框。

代码链路：

```text
src/popup/tabs/SaveTab.tsx
  → src/features/popup/popupClient.ts
  → chrome.runtime.sendMessage()
  → src/background/messageRouter.ts
  → src/background/quickSaveHandlers.ts
```

保存链路：

```text
SaveTab.save()
  → QUICK_SAVE_CREATE_BOOKMARK
  → handleQuickSaveMessage()
  → bookmarksAdapter.create()
  → saveBookmarkMetadata(created.id, { note, previewImageUrl })
  → saveQuickSaveRecentFolder(parentId)
```

维护重点：`FolderCascadeMenu` 仍被管理页右键移动等场景复用；当前 Popup 主保存位置使用共享内联树。修改 class、hover buffer、portal 定位或滚动逻辑时，必须同时验证相关入口。

## 视觉方向

当前视觉锚点是干净、明亮、轻量阴影、较大圆角和清晰网格。管理页偏效率工作台，Toolbar Popup 偏当前页轻量表单，New Tab 偏搜索首页。不要把 New Tab 的背景光斑、大面积 hero 风格直接迁移到管理页或保存体验。
