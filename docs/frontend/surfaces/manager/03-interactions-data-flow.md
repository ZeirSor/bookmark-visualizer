# 管理页交互与数据链路

## 读取链路

```text
<App /> mount
  → useBookmarks()
    → bookmarksAdapter.getTree()
    → chrome.bookmarks.getTree()
  → useMetadata()
    → metadataService.loadMetadata()
    → storageAdapter.get()
  → useSettings()
    → settingsService.loadSettings()
    → storageAdapter.get()
  → loadRecentFolderState()
    → storageAdapter.get()
```

## 搜索链路

```text
SearchBar input
  → setQuery(query)
  → useMemo(searchBookmarks(tree, query))
  → isSearching = query.trim().length > 0
  → displayedBookmarks = searchResults.map({ bookmark, folderPath })
  → SearchFilterSummary 显示结果数量
  → BookmarkCommandBar sortLabel = "匹配度"
```

维护说明：当前 `searchBookmarks()` 只搜索标题和 URL。若要支持备注搜索，需要把 `metadata.bookmarkMetadata` 传入搜索 feature，并调整结果 score 与测试。

## 选择文件夹链路

```text
FolderTree row click / Breadcrumb click / FolderStrip click / New Tab deep link
  → handleSelectFolder() / handleBreadcrumbSelectFolder()
  → setQuery("") 或保留 query 逻辑
  → selectFolder(folderId) from useBookmarks()
  → selectedBookmarks 更新
  → WorkspaceContent 重新渲染
```

## 树内书签定位链路

```text
打开 settings.showBookmarksInTree
  → FolderTree 渲染 bookmark-row
  → 点击 bookmark-row
  → handleSelectTreeBookmark(bookmark)
  → selectFolder(bookmark.parentId)
  → setHighlightedBookmarkId(bookmark.id)
  → requestAnimationFrame setHighlightPulseId(bookmark.id)
  → App useEffect scrollIntoView
  → BookmarkCard 添加 is-highlighted / is-highlight-pulse
```

## 新建书签链路

```text
FolderHeader “新建书签” / EmptyState “新建书签” / 右键“前后新建”
  → openNewBookmarkDraftAtEnd() 或 openNewBookmarkDraft()
  → NewBookmarkDraftCard 渲染在 WorkspaceContent
  → handleCreateBookmark(state)
  → 校验 URL / title
  → bookmarksAdapter.create({ parentId, index, title, url })
  → updateTree(insertNodeInBookmarkTree())
  → selectFolderAndClearBreadcrumb(parentId)
  → highlightPulse
  → addOperation({ undo: remove(created.id) })
  → Toast “撤销”
```

## 行内编辑链路

```text
BookmarkCard 点击标题 / URL / 备注
  → setEditingTitle / setEditingUrl / setEditingNote
  → InlineInput autoFocus
  → blur / Enter 保存
  → onSaveTitle / onSaveUrl / onSaveNote
```

标题 / URL：

```text
App.handleSaveTitle / handleSaveUrl
  → 校验空标题 / URL 格式
  → bookmarksAdapter.update(bookmark.id, patch)
  → reload()
  → addOperation({ undo: update(previous) })
  → Toast
```

备注：

```text
App.handleSaveNote
  → updateNote(bookmark.id, note)
  → metadataService.saveMetadata()
  → storageAdapter.set()
  → addOperation({ undo: updateNote(previousNote) })
  → Toast
```

## 拖拽移动 / 重排链路

卡片拖到左侧文件夹：

```text
BookmarkCard dragStart
  → setDraggedBookmark(createDraggedBookmarkSnapshot(bookmark))
FolderTree folder drop
  → handleDropBookmark(folder)
  → canDropBookmarkOnFolder(snapshot, folder)
  → moveBookmarkWithUndo(snapshot, folder)
  → bookmarksAdapter.move(bookmark.id, { parentId: folder.id })
  → updateTree(moveNodeInBookmarkTree())
  → rememberRecentFolder(folder.id)
  → operationLog + Toast
```

卡片在网格内重排：

```text
BookmarkCard dragOver
  → getBookmarkDropPositionFromEvent(event)
  → setActiveBookmarkDropIntent(intent)
Drop on card
  → getBookmarkReorderDestination(snapshot, intent)
  → bookmarksAdapter.move(snapshot.id, { parentId, index })
  → updateTree(moveNodeInBookmarkTree())
```

文件夹拖拽：

```text
FolderTree folder dragStart
  → setDraggedFolder(createDraggedFolderSnapshot(folder))
FolderTree drop intent
  → handleDropFolder(intent)
  → canDropFolderOnIntent(snapshot, intent)
  → getFolderMoveDestination(snapshot, intent)
  → bookmarksAdapter.move(folder.id, destination)
  → reload / updateTree
```

## 右键菜单链路

```text
BookmarkCard contextmenu / more button
  → handleBookmarkContextMenu(bookmark, event)
  → getContextMenuPlacement(event, viewport)
  → setContextMenu({ bookmark, x, y, placement })
  → <BookmarkContextMenu />
```

菜单操作：

| 操作 | 链路 |
|---|---|
| 编辑 | `requestInlineBookmarkEdit(bookmark)` → `BookmarkCard` 收到 `editRequestId` → 三个字段进入编辑态 |
| 移动 | `FolderMoveSubmenuContent` / `FolderCascadeMenu` → `handleContextMoveBookmark()` |
| 新建文件夹 | `openNewFolderDialog(parentFolder, bookmarkToMove)` |
| 在前 / 后新建书签 | `openNewBookmarkDraft(bookmark, position)` |
| 删除 | `handleDeleteBookmark()` → confirm → `bookmarksAdapter.remove()` → undo 可重建 |

## 批量删除链路

```text
BookmarkCommandBar “批量操作”
  → selection.enter()
  → SelectionActionBar 出现
  → BookmarkCard selectable=true
  → 点击卡片 / checkbox → selection.toggle(bookmark.id)
  → 点击删除
  → handleDeleteSelectedBookmarks()
  → window.confirm()
  → for each bookmarksAdapter.remove(id)
  → reload()
  → selection.clear()
  → addOperation({ title: 批量删除书签, 无 undo })
```

## ESC 行为

`App.tsx` 注册 window keydown：

1. 如果有右键菜单、弹窗、新建草稿、快捷键设置、重命名、拖拽 intent，先关闭这些局部层。
2. 如果没有局部层但处于 selection mode，则清空批量选择。
3. 不直接关闭页面。

## Deep Link 链路

管理页支持 URL 参数：

```text
index.html?folderId=xxx
index.html?bookmarkId=yyy
```

处理位置：`src/app/App.tsx` 的 `deepLinkHandledRef` effect。

- `folderId` 命中文件夹：选择文件夹并展开路径。
- `bookmarkId` 命中书签：选择其父文件夹、展开路径、滚动并高亮卡片。

New Tab 的 `buildWorkspaceFolderPath(folderId)` 会生成 `index.html?folderId=...`。
