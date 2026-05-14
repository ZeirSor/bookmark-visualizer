---
type: archive
status: archived
scope: archive
owner: project
last_verified: 2026-05-14
source_of_truth: false
archived_reason: "superseded, historical, or temporary content"
archived_from: "docs/frontend/surfaces/quick-save/01-dialog-ui-and-shadow-dom.md"
current_source: "docs/README.md"
---

# Legacy Quick Save Dialog UI 与 Shadow DOM 细节（not current implementation）

本文档记录保留的 legacy Quick Save 内容脚本浮框。当前普通网页主保存体验已经迁移到 `src/features/save-overlay/` 的 Save Overlay；本页仅在维护旧 `quick-save-content.js` 或复用历史浮框能力时使用。

## content.tsx 注入逻辑

```text
content.tsx 执行
  → 如果 window.__bookmarkVisualizerQuickSaveOpen__ 已存在：直接调用打开
  → 否则注册 open/close 方法
  → 创建 host div#bookmark-visualizer-quick-save
  → host.attachShadow({ mode: "open" })
  → shadowRoot.append(createQuickSaveStyle())
  → extractQuickSavePageDetails()
  → render <QuickSaveDialog pageDetails shadowRoot onClose />
```

关闭逻辑：

```text
close()
  → root.unmount()
  → host.remove()
  → 删除 window.__bookmarkVisualizerQuickSaveOpen__/Close__
```

## Dialog 结构

```text
.quick-save-layer
  .quick-save-dialog[role="dialog"]
    .quick-save-header
      h2 保存当前网页
      secondary close button
    form.quick-save-form
      .page-details-grid
        .preview-image
        .detail-fields
          title input
          readonly URL input
          note textarea
      .save-location-panel
        .location-heading
        .location-grid
          .location-search
            .search-box
            .search-results
            .recent-folders
          .folder-browser
            .browser-heading
            .folder-breadcrumb
            .browse-list
              <FolderCascadeMenu />
      p.status[aria-live]
      .quick-save-footer
        Cancel
        primary save button
```

## UI 元素表

| UI 元素 | selector | 代码 | 行为 |
|---|---|---|---|
| overlay | `.quick-save-layer` | `QuickSaveDialog.tsx` | 点击遮罩关闭 |
| dialog | `.quick-save-dialog` | `QuickSaveDialog.tsx` | `role="dialog"` + `aria-modal` |
| header close | `.secondary-button` | `QuickSaveDialog.tsx` | onClose |
| preview | `.preview-image` | `QuickSaveDialog.tsx` | 有图显示 img，失败显示“无预览图” |
| 标题 input | `.detail-fields input` | `QuickSaveDialog.tsx` | mount 后 focus |
| URL input | `.detail-fields input[readOnly]` | `QuickSaveDialog.tsx` | focus select 文本 |
| 备注 textarea | `.detail-fields textarea` | `QuickSaveDialog.tsx` | 保存到 metadata |
| 保存位置 heading | `.location-heading` | `QuickSaveDialog.tsx` | 显示当前 selectedPath |
| 搜索框 | `.search-box input` | `QuickSaveDialog.tsx` | 更新 query |
| 清空搜索 | `.search-box button` | `QuickSaveDialog.tsx` | setQuery("") |
| 搜索结果 | `.search-results .folder-result` | `QuickSaveDialog.tsx` | 点击选择文件夹并同步浏览父级 |
| 最近使用 | `.recent-folders button` | `QuickSaveDialog.tsx` | 点击选择文件夹 |
| 浏览文件夹 | `.folder-browser` | `QuickSaveDialog.tsx` | 浏览树层级 |
| 路径面包屑 | `.folder-breadcrumb` | `FolderBreadcrumb` | 点击切换 browsingFolderId |
| 新建文件夹 | `.create-folder-link` / `.create-folder-form` | `CreateFolderAction` | 在当前浏览文件夹或 cascade 内创建 |
| 状态 | `.status` | `QuickSaveDialog.tsx` | `aria-live="polite"` |
| 保存按钮 | `.primary-button` | `QuickSaveDialog.tsx` | disabled when saving / no selectedFolderId |

Quick Save 状态边界：

| 责任 | 文件 |
|---|---|
| 背景消息发送 | `src/features/quick-save/quickSaveClient.ts` |
| 初始状态读取 | `src/features/quick-save/hooks/useQuickSaveInitialState.ts` |
| 文件夹搜索 / 浏览 / 最近 / 创建 | `src/features/quick-save/hooks/useQuickSaveFolderBrowser.ts` |
| title / note / preview fallback / save submit | `src/features/quick-save/hooks/useQuickSaveFormState.ts` |
| Shadow DOM Tab 焦点限制 | `src/features/quick-save/focusTrap.ts` |

## 快捷键与焦点

`QuickSaveDialog` 在 shadowRoot 上监听 keydown：

| 按键 | 行为 |
|---|---|
| Escape | 关闭浮框 |
| Ctrl/Cmd + S | 保存 |
| Ctrl/Cmd + Enter | 保存 |
| Tab | `trapFocus()`，焦点限制在 Shadow DOM 内 |

## 保存链路

```text
useQuickSaveFormState.save()
  → if saving return
  → if !selectedFolderId setStatus("请选择保存位置。")
  → payload = { parentId, title, url, note, previewImageUrl }
  → chrome.runtime.sendMessage({ type: QUICK_SAVE_CREATE_BOOKMARK, payload })
  → background handleQuickSaveMessage()
  → bookmarksAdapter.create({ parentId, title, url })
  → saveBookmarkMetadata(created.id, { note, previewImageUrl })
  → saveQuickSaveRecentFolder(parentId)
  → response ok
  → setStatus(`已保存到 ${selectedFolderTitle}。`)
  → 700ms 后 onClose()
```

## 文件夹创建链路

```text
CreateFolderAction submit
  → useQuickSaveFolderBrowser.createFolder(parentFolder, title)
  → sendMessage({ type: QUICK_SAVE_CREATE_FOLDER, payload })
  → background create folder
  → response.state.tree + response.state.recentFolderIds
  → setTree / setRecentFolderIds
  → selectedFolderId = response.folder.id
  → browsingFolderId = response.folder.parentId
```

## Shadow DOM CSS 维护

CSS 不在普通 `.css` 文件，而在 `src/features/quick-save/contentStyle.ts`。

维护规则：

- 所有 quick-save selector 必须存在于 contentStyle 字符串中。
- 不要依赖宿主页面 CSS reset；`:host { all: initial; color-scheme: light; }` 是隔离基础。
- `FolderCascadeMenu` 共享 class 也要在 contentStyle 中提供样式，例如 `.move-folder-row`、`.context-submenu`。
- 修改 `FolderCascadeMenu` class 时必须同步 `contentStyle.ts`。

## 回归清单

- 在普通网页按快捷键能打开浮框。
- 重复触发不会生成多个 host。
- 点击遮罩关闭，点击 dialog 内部不关闭。
- Tab 焦点不会跑出 Shadow DOM。
- 搜索结果选择后当前路径更新。
- 浏览文件夹 cascade 可以滚动，不被浮框裁剪。
- 新建文件夹后自动选中新文件夹。
- 保存成功后 700ms 关闭。
