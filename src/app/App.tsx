import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type FormEvent,
  type MouseEvent as ReactMouseEvent
} from "react";
import { BookmarkCard } from "../components/BookmarkCard";
import { FolderTree } from "../components/FolderTree";
import { SearchBar } from "../components/SearchBar";
import { bookmarksAdapter } from "../lib/chrome";
import {
  collectFolderIds,
  canRenameFolder,
  getDisplayTitle,
  insertNodeInBookmarkTree,
  isFolder,
  moveNodeInBookmarkTree,
  removeNodeFromBookmarkTree,
  useBookmarks,
  type BookmarkNode
} from "../features/bookmarks";
import { getContextMenuPlacement, type ContextMenuPlacement } from "../features/context-menu";
import {
  canDropBookmarkOnFolder,
  canDropFolderOnIntent,
  canMoveBookmarkToFolder,
  canReorderBookmarkOnIntent,
  createDraggedBookmarkSnapshot,
  createDraggedFolderSnapshot,
  getBookmarkCardDropPosition,
  getBookmarkReorderDestination,
  getFolderMoveDestination,
  type BookmarkDropIntent,
  type BookmarkDropPosition,
  type DraggedBookmarkSnapshot,
  type DraggedFolderSnapshot,
  type FolderDropIntent
} from "../features/drag-drop";
import { useMetadata } from "../features/metadata";
import { searchBookmarks } from "../features/search";
import { useSettings, type CardSize } from "../features/settings";

interface ToastState {
  message: string;
  actionLabel?: string;
  action?: () => Promise<void>;
}

interface OperationLogEntry {
  id: string;
  title: string;
  detail: string;
  createdAt: number;
  status: "ready" | "undone" | "failed";
  undo?: () => Promise<void>;
}

interface BookmarkContextMenuState extends ContextMenuPlacement {
  bookmark: BookmarkNode;
}

interface FolderContextMenuState extends ContextMenuPlacement {
  folder: BookmarkNode;
}

interface NewFolderDialogState {
  parentFolder: BookmarkNode;
  name: string;
  bookmarkToMove?: BookmarkNode;
}

interface NewBookmarkDraftState {
  parentId: string;
  index: number;
  title: string;
  url: string;
}

const CONTEXT_MENU_CLOSE_DELAY_MS = 220;

export function App() {
  const [query, setQuery] = useState("");
  const [draggedBookmark, setDraggedBookmark] = useState<DraggedBookmarkSnapshot>();
  const [draggedFolder, setDraggedFolder] = useState<DraggedFolderSnapshot>();
  const [highlightedBookmarkId, setHighlightedBookmarkId] = useState<string>();
  const [highlightPulseId, setHighlightPulseId] = useState<string>();
  const [operationLogOpen, setOperationLogOpen] = useState(false);
  const [operationLog, setOperationLog] = useState<OperationLogEntry[]>([]);
  const operationLogRef = useRef<OperationLogEntry[]>([]);
  const [contextMenu, setContextMenu] = useState<BookmarkContextMenuState>();
  const [folderContextMenu, setFolderContextMenu] = useState<FolderContextMenuState>();
  const [inlineEditRequest, setInlineEditRequest] = useState<{ bookmarkId: string; requestId: number }>();
  const [renamingFolderId, setRenamingFolderId] = useState<string>();
  const [newFolderDialog, setNewFolderDialog] = useState<NewFolderDialogState>();
  const [newBookmarkDraft, setNewBookmarkDraft] = useState<NewBookmarkDraftState>();
  const [activeBookmarkDropIntent, setActiveBookmarkDropIntent] = useState<BookmarkDropIntent>();
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<ToastState>();
  const { metadata, updateNote } = useMetadata();
  const { settings, updateSettings } = useSettings();
  const {
    tree,
    selectedFolder,
    selectedFolderId,
    selectedBookmarks,
    folderPathMap,
    loading,
    error,
    reload,
    selectFolder,
    updateTree
  } = useBookmarks();

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    operationLogRef.current = operationLog;
  }, [operationLog]);

  useEffect(() => {
    const folderIds = collectFolderIds(tree);
    const availableFolderIds = new Set(folderIds);

    setExpandedFolderIds((current) => {
      if (folderIds.length === 0) {
        return current.size === 0 ? current : new Set();
      }

      const next = new Set([...current].filter((id) => availableFolderIds.has(id)));

      if (next.size === 0) {
        return new Set(folderIds);
      }

      return next;
    });
  }, [tree]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setContextMenu(undefined);
      setFolderContextMenu(undefined);
      setNewFolderDialog(undefined);
      setNewBookmarkDraft(undefined);
      setRenamingFolderId(undefined);
      setActiveBookmarkDropIntent(undefined);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const searchResults = useMemo(() => searchBookmarks(tree, query), [query, tree]);
  const isSearching = query.trim().length > 0;
  const heading = isSearching
    ? `搜索结果：${searchResults.length}`
    : selectedFolder
      ? getDisplayTitle(selectedFolder)
      : "选择一个文件夹";
  const activePath = selectedFolderId ? folderPathMap.get(selectedFolderId) : undefined;

  const displayedBookmarks = isSearching
    ? searchResults.map((result) => ({
        bookmark: result.bookmark,
        folderPath: result.folderPath
      }))
    : selectedBookmarks.map((bookmark) => ({ bookmark, folderPath: undefined }));
  useEffect(() => {
    if (!highlightedBookmarkId || isSearching) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(
        `[data-bookmark-id="${highlightedBookmarkId}"]`
      );
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [highlightedBookmarkId, isSearching, selectedFolderId, selectedBookmarks]);

  useEffect(() => {
    if (!highlightPulseId) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setHighlightPulseId((current) => (current === highlightPulseId ? undefined : current));
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [highlightPulseId]);

  return (
    <main
      className="app-shell"
      data-card-size={settings.cardSize}
      style={{ "--sidebar-width": `${settings.sidebarWidth}px` } as CSSProperties}
    >
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <h1>我的书签</h1>
            <p>Bookmark Visualizer</p>
          </div>
        </div>

        <label className="tree-toggle">
          <input
            type="checkbox"
            checked={settings.showBookmarksInTree}
            onChange={(event) =>
              void handleSettingsChange({ ...settings, showBookmarksInTree: event.target.checked })
            }
          />
          显示树内书签
        </label>

        <div className="tree-toolbar" aria-label="文件夹树操作">
          <button type="button" onClick={expandAllFolders}>
            展开全部
          </button>
          <button type="button" onClick={collapseAllFolders}>
            收起全部
          </button>
        </div>

        <div className="sidebar-status">
          {selectedFolder ? `当前：${getDisplayTitle(selectedFolder)}` : "正在读取书签树"}
        </div>

        {loading ? <p className="muted">读取浏览器书签中...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        {!loading ? (
          <FolderTree
            nodes={tree}
            selectedFolderId={selectedFolderId}
            showBookmarksInTree={settings.showBookmarksInTree}
            expandedFolderIds={expandedFolderIds}
            renamingFolderId={renamingFolderId}
            draggedBookmark={draggedBookmark}
            draggedFolder={draggedFolder}
            onSelectFolder={handleSelectFolder}
            onToggleFolder={toggleFolderExpanded}
            onSelectBookmark={handleSelectTreeBookmark}
            onRenameFolder={handleRenameFolder}
            onCancelRenameFolder={() => setRenamingFolderId(undefined)}
            onDropBookmark={(folder) => void handleDropBookmark(folder)}
            onFolderDragStart={(folder) => setDraggedFolder(createDraggedFolderSnapshot(folder))}
            onFolderDragEnd={() => setDraggedFolder(undefined)}
            onDropFolder={(intent) => void handleDropFolder(intent)}
            onFolderContextMenu={handleFolderContextMenu}
          />
        ) : null}
      </aside>

      <div
        className="resize-handle"
        role="separator"
        aria-orientation="vertical"
        aria-label="调整侧边栏宽度"
        onMouseDown={handleSidebarResizeStart}
      />

      <section className="workspace">
        <header className="toolbar">
          <div className="breadcrumb">首页 / {activePath ?? "书签栏"}</div>
          <SearchBar value={query} onChange={setQuery} />
          <div className="toolbar-meta">
            <CardSizeControl
              value={settings.cardSize}
              onChange={(cardSize) => void handleSettingsChange({ ...settings, cardSize })}
            />
            <button
              className="log-button"
              type="button"
              aria-expanded={operationLogOpen}
              onClick={() => setOperationLogOpen((current) => !current)}
            >
              操作日志
              {operationLog.length > 0 ? <span>{operationLog.length}</span> : null}
            </button>
            <button
              className="theme-button"
              type="button"
              aria-label={settings.theme === "light" ? "切换为深色主题" : "切换为浅色主题"}
              title={settings.theme === "light" ? "切换为深色主题" : "切换为浅色主题"}
              onClick={() =>
                void handleSettingsChange({
                  ...settings,
                  theme: settings.theme === "light" ? "dark" : "light"
                })
              }
            >
              <span className={settings.theme === "light" ? "moon-mark" : "sun-mark"} />
            </button>
          </div>
        </header>

        <section className="content-panel" aria-live="polite">
          <div className="section-heading">
            <div>
              <p>{isSearching ? "Title and URL" : "Current folder"}</p>
              <h2>{heading}</h2>
            </div>
            <span>{isSearching ? "只读搜索" : `${selectedBookmarks.length} 个直接书签`}</span>
          </div>

          {renderContent()}
        </section>
      </section>
      <OperationLogDrawer
        open={operationLogOpen}
        entries={operationLog}
        onClose={() => setOperationLogOpen(false)}
        onUndo={(id) => void undoOperation(id)}
      />
      {contextMenu ? (
        <BookmarkContextMenu
          state={contextMenu}
          tree={tree}
          onClose={() => setContextMenu(undefined)}
          canInsertBookmark={!isSearching}
          onEdit={(bookmark) => requestInlineBookmarkEdit(bookmark)}
          onMove={(bookmark, folder) => void handleContextMoveBookmark(bookmark, folder)}
          onCreateFolder={(bookmark, parentFolder) => openNewFolderDialog(parentFolder, bookmark)}
          onCreateBookmark={(bookmark, position) => openNewBookmarkDraft(bookmark, position)}
          onDelete={(bookmark) => void handleDeleteBookmark(bookmark)}
        />
      ) : null}
      {folderContextMenu ? (
        <FolderContextMenu
          state={folderContextMenu}
          onClose={() => setFolderContextMenu(undefined)}
          onCreateFolder={(folder) => openNewFolderDialog(folder)}
          onRenameFolder={(folder) => startFolderRename(folder)}
        />
      ) : null}
      {newFolderDialog ? (
        <NewFolderDialog
          state={newFolderDialog}
          onChange={setNewFolderDialog}
          onClose={() => setNewFolderDialog(undefined)}
          onSubmit={(state) => void handleCreateFolder(state)}
        />
      ) : null}
      {toast ? <Toast toast={toast} onClose={() => setToast(undefined)} /> : null}
    </main>
  );

  function renderContent() {
    if (loading) {
      return <EmptyState title="正在加载书签" body="如果在 Vite dev 环境中运行，会自动使用 mock 数据。" />;
    }

    if (error) {
      return <EmptyState title="读取失败" body="请确认扩展 manifest 声明了 bookmarks 权限。" />;
    }

    if (isSearching) {
      if (searchResults.length === 0) {
        return <EmptyState title="没有找到匹配项" body="试试输入书签标题、域名或 URL 片段。" />;
      }

      return renderCards(displayedBookmarks);
    }

    if (
      selectedBookmarks.length === 0 &&
      (!newBookmarkDraft || newBookmarkDraft.parentId !== selectedFolderId)
    ) {
      return <EmptyState title="当前文件夹没有直接书签" body="子文件夹中的书签会在搜索中出现。" />;
    }

    return renderCards(displayedBookmarks);
  }

  function renderCards(items: Array<{ bookmark: BookmarkNode; folderPath?: string }>) {
    const shouldShowDraft =
      Boolean(newBookmarkDraft) && !isSearching && newBookmarkDraft?.parentId === selectedFolderId;
    const draftIndex = shouldShowDraft ? Math.max(0, newBookmarkDraft?.index ?? 0) : -1;

    return (
      <div className="card-grid">
        {shouldShowDraft && draftIndex === 0 ? renderNewBookmarkDraft() : null}
        {items.map(({ bookmark, folderPath }, index) => (
          <Fragment key={bookmark.id}>
            <BookmarkCard
              bookmark={bookmark}
              folderPath={folderPath}
              note={metadata.bookmarkMetadata[bookmark.id]?.note}
              highlighted={highlightedBookmarkId === bookmark.id}
              highlightPulse={highlightPulseId === bookmark.id}
              editRequestId={
                inlineEditRequest?.bookmarkId === bookmark.id
                  ? inlineEditRequest.requestId
                  : undefined
              }
              activeDropPosition={
                activeBookmarkDropIntent?.targetBookmark.id === bookmark.id
                  ? activeBookmarkDropIntent.position
                  : undefined
              }
              onDragStart={(dragged) => setDraggedBookmark(createDraggedBookmarkSnapshot(dragged))}
              onDragEnd={handleBookmarkDragEnd}
              onDragOverBookmark={handleBookmarkCardDragOver}
              onDragLeaveBookmark={handleBookmarkCardDragLeave}
              onDropOnBookmark={handleDropBookmarkOnCard}
              onOpen={openBookmark}
              onSaveTitle={handleSaveTitle}
              onSaveUrl={handleSaveUrl}
              onSaveNote={handleSaveNote}
              onContextMenu={handleBookmarkContextMenu}
            />
            {shouldShowDraft && draftIndex === index + 1 ? renderNewBookmarkDraft() : null}
          </Fragment>
        ))}
        {shouldShowDraft && draftIndex > items.length ? renderNewBookmarkDraft() : null}
      </div>
    );
  }

  function renderNewBookmarkDraft() {
    if (!newBookmarkDraft) {
      return null;
    }

    return (
      <NewBookmarkDraftCard
        key="new-bookmark-draft"
        state={newBookmarkDraft}
        onChange={setNewBookmarkDraft}
        onCancel={() => setNewBookmarkDraft(undefined)}
        onSubmit={handleCreateBookmark}
      />
    );
  }

  async function handleSettingsChange(nextSettings: typeof settings) {
    try {
      await updateSettings(nextSettings);
    } catch (cause) {
      setToast({ message: getErrorMessage(cause, "设置保存失败。") });
    }
  }

  function handleSelectTreeBookmark(bookmark: BookmarkNode) {
    if (!bookmark.parentId) {
      return;
    }

    setQuery("");
    setHighlightPulseId(undefined);
    selectFolder(bookmark.parentId);
    setHighlightedBookmarkId(bookmark.id);
    window.requestAnimationFrame(() => setHighlightPulseId(bookmark.id));
  }

  function handleSelectFolder(folderId: string) {
    setHighlightedBookmarkId(undefined);
    setHighlightPulseId(undefined);
    selectFolder(folderId);
  }

  function toggleFolderExpanded(folderId: string) {
    setExpandedFolderIds((current) => {
      const next = new Set(current);

      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }

      return next;
    });
  }

  function expandAllFolders() {
    setExpandedFolderIds(new Set(collectFolderIds(tree)));
  }

  function collapseAllFolders() {
    setExpandedFolderIds(new Set());
  }

  function handleSidebarResizeStart(event: ReactMouseEvent<HTMLDivElement>) {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = settings.sidebarWidth;
    let nextWidth = startWidth;

    function handleMouseMove(moveEvent: MouseEvent) {
      nextWidth = Math.min(640, Math.max(220, startWidth + moveEvent.clientX - startX));
      document.documentElement.style.setProperty("--live-sidebar-width", `${nextWidth}px`);
    }

    function handleMouseUp() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.documentElement.style.removeProperty("--live-sidebar-width");
      void handleSettingsChange({ ...settings, sidebarWidth: nextWidth });
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  async function handleDropBookmark(folder: BookmarkNode) {
    const snapshot = draggedBookmark;

    if (!snapshot || !canDropBookmarkOnFolder(snapshot, folder)) {
      return;
    }

    setDraggedBookmark(undefined);
    await moveBookmarkWithUndo(snapshot, folder);
  }

  function handleBookmarkDragEnd() {
    setDraggedBookmark(undefined);
    setActiveBookmarkDropIntent(undefined);
  }

  function handleBookmarkCardDragOver(bookmark: BookmarkNode, event: DragEvent<HTMLElement>) {
    if (isSearching || !draggedBookmark) {
      return;
    }

    const intent: BookmarkDropIntent = {
      targetBookmark: bookmark,
      position: getBookmarkDropPositionFromEvent(event)
    };

    if (!canReorderBookmarkOnIntent(draggedBookmark, intent)) {
      setActiveBookmarkDropIntent(undefined);
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setActiveBookmarkDropIntent(intent);
  }

  function handleBookmarkCardDragLeave(bookmark: BookmarkNode, event: DragEvent<HTMLElement>) {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    if (activeBookmarkDropIntent?.targetBookmark.id === bookmark.id) {
      setActiveBookmarkDropIntent(undefined);
    }
  }

  async function handleDropBookmarkOnCard(bookmark: BookmarkNode, event: DragEvent<HTMLElement>) {
    if (isSearching || !draggedBookmark) {
      return;
    }

    const intent =
      activeBookmarkDropIntent?.targetBookmark.id === bookmark.id
        ? activeBookmarkDropIntent
        : {
            targetBookmark: bookmark,
            position: getBookmarkDropPositionFromEvent(event)
          };

    setActiveBookmarkDropIntent(undefined);

    if (!canReorderBookmarkOnIntent(draggedBookmark, intent)) {
      return;
    }

    event.preventDefault();
    await reorderBookmarkWithUndo(draggedBookmark, intent);
  }

  async function handleDropFolder(intent: FolderDropIntent) {
    const snapshot = draggedFolder;

    if (!snapshot || !canDropFolderOnIntent(snapshot, intent, tree)) {
      return;
    }

    setDraggedFolder(undefined);
    await moveFolderWithUndo(snapshot, intent);
  }

  async function moveBookmarkWithUndo(snapshot: DraggedBookmarkSnapshot, folder: BookmarkNode) {
    if (!canDropBookmarkOnFolder(snapshot, folder)) {
      setToast({ message: "不能移动到这个文件夹。" });
      return;
    }

    try {
      await bookmarksAdapter.move(snapshot.id, { parentId: folder.id });
      await reload();
      const operationId = addOperation({
        title: "移动书签",
        detail: `“${snapshot.title || "Untitled"}”已移动到“${getDisplayTitle(folder)}”。`,
        undo: async () => {
          if (!snapshot.parentId) {
            return;
          }

          await bookmarksAdapter.move(snapshot.id, {
            parentId: snapshot.parentId,
            index: snapshot.index
          });
          await reload();
        }
      });
      setToast({
        message: `已移动“${snapshot.title || "Untitled"}”。`,
        actionLabel: "撤销",
        action: async () => undoOperation(operationId)
      });
    } catch (cause) {
      await reload();
      setToast({ message: getErrorMessage(cause, "移动书签失败。") });
    }
  }

  async function reorderBookmarkWithUndo(
    snapshot: DraggedBookmarkSnapshot,
    intent: BookmarkDropIntent
  ) {
    if (!canReorderBookmarkOnIntent(snapshot, intent)) {
      setToast({ message: "不能移动到这个位置。" });
      return;
    }

    const destination = getBookmarkReorderDestination(snapshot, intent);

    try {
      await bookmarksAdapter.move(snapshot.id, destination);
      updateTree((currentTree) => moveNodeInBookmarkTree(currentTree, snapshot.id, destination));

      const operationId = addOperation({
        title: "调整书签顺序",
        detail: `“${snapshot.title || "Untitled"}”已重新排序。`,
        undo: async () => {
          if (!snapshot.parentId) {
            return;
          }

          const previousParentId = snapshot.parentId;
          await bookmarksAdapter.move(snapshot.id, {
            parentId: previousParentId,
            index: snapshot.index
          });
          updateTree((currentTree) =>
            moveNodeInBookmarkTree(currentTree, snapshot.id, {
              parentId: previousParentId,
              index: snapshot.index
            })
          );
        }
      });

      setToast({
        message: "书签顺序已更新。",
        actionLabel: "撤销",
        action: async () => undoOperation(operationId)
      });
    } catch (cause) {
      await reload();
      setToast({ message: getErrorMessage(cause, "调整书签顺序失败。") });
    } finally {
      setDraggedBookmark(undefined);
    }
  }

  async function moveFolderWithUndo(snapshot: DraggedFolderSnapshot, intent: FolderDropIntent) {
    if (!canDropFolderOnIntent(snapshot, intent, tree)) {
      setToast({ message: "不能移动到这个文件夹位置。" });
      return;
    }

    const destination = getFolderMoveDestination(snapshot, intent);

    try {
      await bookmarksAdapter.move(snapshot.id, destination);
      await reload();
      expandFolders(destination.parentId, intent.position === "inside" ? intent.targetFolder.id : undefined);
      selectFolder(snapshot.id);

      const operationId = addOperation({
        title: "移动文件夹",
        detail: `“${snapshot.title || "Untitled"}”已移动。`,
        undo: async () => {
          if (!snapshot.parentId) {
            return;
          }

          await bookmarksAdapter.move(snapshot.id, {
            parentId: snapshot.parentId,
            index: snapshot.index
          });
          await reload();
          expandFolders(snapshot.parentId);
          selectFolder(snapshot.id);
        }
      });

      setToast({
        message: `已移动文件夹“${snapshot.title || "Untitled"}”。`,
        actionLabel: "撤销",
        action: async () => undoOperation(operationId)
      });
    } catch (cause) {
      await reload();
      setToast({ message: getErrorMessage(cause, "移动文件夹失败。") });
    }
  }

  function handleBookmarkContextMenu(
    bookmark: BookmarkNode,
    event: ReactMouseEvent<HTMLElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    const placement = getContextMenuPlacement(
      { x: event.clientX, y: event.clientY },
      { width: window.innerWidth, height: window.innerHeight }
    );

    setContextMenu({ bookmark, ...placement });
    setFolderContextMenu(undefined);
  }

  function handleFolderContextMenu(folder: BookmarkNode, event: ReactMouseEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!folder.parentId || folder.unmodifiable) {
      return;
    }

    const placement = getContextMenuPlacement(
      { x: event.clientX, y: event.clientY },
      { width: window.innerWidth, height: window.innerHeight }
    );

    setFolderContextMenu({ folder, ...placement });
    setContextMenu(undefined);
  }

  function openNewFolderDialog(parentFolder: BookmarkNode, bookmarkToMove?: BookmarkNode) {
    setContextMenu(undefined);
    setFolderContextMenu(undefined);
    setNewFolderDialog({
      parentFolder,
      name: "",
      bookmarkToMove
    });
  }

  function startFolderRename(folder: BookmarkNode) {
    if (!canRenameFolder(folder)) {
      setToast({ message: "这个文件夹不能重命名。" });
      return;
    }

    setFolderContextMenu(undefined);
    setRenamingFolderId(folder.id);
    selectFolder(folder.id);
  }

  function requestInlineBookmarkEdit(bookmark: BookmarkNode) {
    setContextMenu(undefined);
    setInlineEditRequest({
      bookmarkId: bookmark.id,
      requestId: Date.now()
    });
  }

  function openNewBookmarkDraft(bookmark: BookmarkNode, position: BookmarkDropPosition) {
    setContextMenu(undefined);

    if (isSearching || !bookmark.parentId) {
      setToast({ message: "搜索结果中不能按当前位置新建书签。" });
      return;
    }

    const rawIndex = (bookmark.index ?? 0) + (position === "after" ? 1 : 0);
    setNewBookmarkDraft({
      parentId: bookmark.parentId,
      index: Math.max(0, rawIndex),
      title: "",
      url: ""
    });
  }

  async function handleCreateFolder(state: NewFolderDialogState) {
    const title = state.name.trim();

    if (!title) {
      setToast({ message: "文件夹名称不能为空。" });
      return;
    }

    try {
      const createdFolder = await bookmarksAdapter.create({
        parentId: state.parentFolder.id,
        title
      });

      setNewFolderDialog(undefined);
      expandFolders(state.parentFolder.id, createdFolder.id);
      selectFolder(createdFolder.id);

      if (state.bookmarkToMove) {
        await moveBookmarkWithUndo(createDraggedBookmarkSnapshot(state.bookmarkToMove), createdFolder);
        return;
      }

      await reload();
      setToast({ message: `已新建文件夹“${title}”。` });
    } catch (cause) {
      await reload();
      setToast({ message: getErrorMessage(cause, "新建文件夹失败。") });
    }
  }

  async function handleCreateBookmark(state: NewBookmarkDraftState) {
    const trimmedUrl = state.url.trim();

    if (!isValidBookmarkUrl(trimmedUrl)) {
      setToast({ message: "请输入有效的 URL。" });
      throw new Error("Bookmark URL is invalid.");
    }

    const title = state.title.trim() || getTitleFromUrl(trimmedUrl);

    try {
      const createdBookmark = await bookmarksAdapter.create({
        parentId: state.parentId,
        index: state.index,
        title,
        url: trimmedUrl
      });

      setNewBookmarkDraft(undefined);
      updateTree((currentTree) =>
        insertNodeInBookmarkTree(
          currentTree,
          createdBookmark,
          state.parentId,
          createdBookmark.index ?? state.index
        )
      );
      selectFolder(state.parentId);
      setHighlightPulseId(createdBookmark.id);

      const operationId = addOperation({
        title: "新建书签",
        detail: `已新建“${title || "Untitled"}”。`,
        undo: async () => {
          await bookmarksAdapter.remove(createdBookmark.id);
          updateTree((currentTree) => removeNodeFromBookmarkTree(currentTree, createdBookmark.id));
          if (highlightedBookmarkId === createdBookmark.id) {
            setHighlightedBookmarkId(undefined);
          }
          setHighlightPulseId(undefined);
        }
      });

      setToast({
        message: "书签已新建。",
        actionLabel: "撤销",
        action: async () => undoOperation(operationId)
      });
    } catch (cause) {
      await reload();
      setToast({ message: getErrorMessage(cause, "新建书签失败。") });
      throw cause;
    }
  }

  async function handleRenameFolder(folder: BookmarkNode, title: string) {
    const trimmedTitle = title.trim();
    const previousTitle = folder.title;

    if (!canRenameFolder(folder)) {
      setToast({ message: "这个文件夹不能重命名。" });
      return;
    }

    if (!trimmedTitle) {
      setToast({ message: "文件夹名称不能为空。" });
      throw new Error("Folder title cannot be empty.");
    }

    if (trimmedTitle === previousTitle.trim()) {
      setRenamingFolderId(undefined);
      return;
    }

    try {
      await bookmarksAdapter.update(folder.id, { title: trimmedTitle });
      await reload();
      selectFolder(folder.id);
      setRenamingFolderId(undefined);

      const operationId = addOperation({
        title: "重命名文件夹",
        detail: `“${previousTitle || "Untitled"}”改为“${trimmedTitle}”。`,
        undo: async () => {
          await bookmarksAdapter.update(folder.id, { title: previousTitle });
          await reload();
          selectFolder(folder.id);
        }
      });

      setToast({
        message: "文件夹已重命名。",
        actionLabel: "撤销",
        action: async () => undoOperation(operationId)
      });
    } catch (cause) {
      await reload();
      setToast({ message: getErrorMessage(cause, "文件夹重命名失败。") });
      throw cause;
    }
  }

  async function handleContextMoveBookmark(bookmark: BookmarkNode, folder: BookmarkNode) {
    setContextMenu(undefined);
    await moveBookmarkWithUndo(createDraggedBookmarkSnapshot(bookmark), folder);
  }

  async function handleDeleteBookmark(bookmark: BookmarkNode) {
    setContextMenu(undefined);

    if (!bookmark.parentId || !bookmark.url) {
      return;
    }

    const confirmed = window.confirm(`确定要删除“${bookmark.title || "Untitled"}”吗？`);
    if (!confirmed) {
      return;
    }

    const previous = {
      parentId: bookmark.parentId,
      index: bookmark.index,
      title: bookmark.title,
      url: bookmark.url,
      note: metadata.bookmarkMetadata[bookmark.id]?.note ?? ""
    };

    try {
      await bookmarksAdapter.remove(bookmark.id);
      await reload();
      if (highlightedBookmarkId === bookmark.id) {
        setHighlightedBookmarkId(undefined);
        setHighlightPulseId(undefined);
      }

      const operationId = addOperation({
        title: "删除书签",
        detail: `已删除“${previous.title || "Untitled"}”。`,
        undo: async () => {
          const restored = await bookmarksAdapter.create({
            parentId: previous.parentId,
            index: previous.index,
            title: previous.title,
            url: previous.url
          });

          if (previous.note) {
            await updateNote(restored.id, previous.note);
          }

          await reload();
          setHighlightedBookmarkId(restored.id);
        }
      });

      setToast({
        message: "书签已删除。",
        actionLabel: "撤销",
        action: async () => undoOperation(operationId)
      });
    } catch (cause) {
      await reload();
      setToast({ message: getErrorMessage(cause, "删除书签失败。") });
    }
  }

  function openBookmark(bookmark: BookmarkNode) {
    if (!bookmark.url) {
      return;
    }

    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  }

  function expandFolders(...folderIds: Array<string | undefined>) {
    setExpandedFolderIds((current) => {
      const next = new Set(current);

      folderIds.forEach((folderId) => {
        if (folderId) {
          next.add(folderId);
        }
      });

      return next;
    });
  }

  async function handleSaveTitle(bookmark: BookmarkNode, title: string) {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setToast({ message: "标题不能为空。" });
      throw new Error("Bookmark title cannot be empty.");
    }

    const previousTitle = bookmark.title;

    try {
      await bookmarksAdapter.update(bookmark.id, { title: trimmedTitle });
      await reload();
      const operationId = addOperation({
        title: "编辑标题",
        detail: `“${previousTitle || "Untitled"}”改为“${trimmedTitle}”。`,
        undo: async () => {
          await bookmarksAdapter.update(bookmark.id, { title: previousTitle });
          await reload();
        }
      });
      setToast({
        message: "标题已更新。",
        actionLabel: "撤销",
        action: async () => undoOperation(operationId)
      });
    } catch (cause) {
      await reload();
      setToast({ message: getErrorMessage(cause, "标题更新失败。") });
      throw cause;
    }
  }

  async function handleSaveUrl(bookmark: BookmarkNode, url: string) {
    const trimmedUrl = url.trim();
    const previousUrl = bookmark.url ?? "";

    if (!isValidBookmarkUrl(trimmedUrl)) {
      setToast({ message: "请输入有效的 URL。" });
      throw new Error("Bookmark URL is invalid.");
    }

    if (trimmedUrl === previousUrl.trim()) {
      return;
    }

    try {
      await bookmarksAdapter.update(bookmark.id, { url: trimmedUrl });
      await reload();

      const operationId = addOperation({
        title: "编辑 URL",
        detail: `已更新“${bookmark.title || "Untitled"}”的 URL。`,
        undo: async () => {
          await bookmarksAdapter.update(bookmark.id, { url: previousUrl });
          await reload();
        }
      });

      setToast({
        message: "URL 已更新。",
        actionLabel: "撤销",
        action: async () => undoOperation(operationId)
      });
    } catch (cause) {
      await reload();
      setToast({ message: getErrorMessage(cause, "URL 更新失败。") });
      throw cause;
    }
  }

  async function handleSaveNote(bookmark: BookmarkNode, note: string) {
    const previousNote = metadata.bookmarkMetadata[bookmark.id]?.note ?? "";

    try {
      await updateNote(bookmark.id, note);
      const operationId = addOperation({
        title: "编辑备注",
        detail: `已更新“${bookmark.title || "Untitled"}”的备注。`,
        undo: async () => {
          await updateNote(bookmark.id, previousNote);
        }
      });
      setToast({
        message: "备注已保存。",
        actionLabel: "撤销",
        action: async () => undoOperation(operationId)
      });
    } catch (cause) {
      setToast({ message: getErrorMessage(cause, "备注保存失败。") });
      throw cause;
    }
  }

  function addOperation(operation: Omit<OperationLogEntry, "id" | "createdAt" | "status">): string {
    const id = crypto.randomUUID();
    const entry: OperationLogEntry = {
      id,
      createdAt: Date.now(),
      status: "ready",
      ...operation
    };

    operationLogRef.current = [entry, ...operationLogRef.current];
    setOperationLog(operationLogRef.current);

    return id;
  }

  async function undoOperation(id: string) {
    const entry = operationLogRef.current.find((item) => item.id === id);

    if (!entry?.undo || entry.status !== "ready") {
      return;
    }

    try {
      await entry.undo();
      operationLogRef.current = operationLogRef.current.map((item) =>
        item.id === id ? { ...item, status: "undone" } : item
      );
      setOperationLog(operationLogRef.current);
      setToast({ message: "已撤回该操作。" });
    } catch (cause) {
      operationLogRef.current = operationLogRef.current.map((item) =>
        item.id === id ? { ...item, status: "failed" } : item
      );
      setOperationLog(operationLogRef.current);
      setToast({ message: getErrorMessage(cause, "撤回失败。") });
    }
  }
}

function CardSizeControl({
  value,
  onChange
}: {
  value: CardSize;
  onChange(value: CardSize): void;
}) {
  const sizes: Array<{ value: CardSize; label: string; title: string }> = [
    { value: "small", label: "S", title: "小卡片" },
    { value: "medium", label: "M", title: "中卡片" },
    { value: "large", label: "L", title: "大卡片" },
    { value: "extra-large", label: "XL", title: "超大卡片" }
  ];

  return (
    <div className="card-size-control" aria-label="调节书签卡片大小">
      {sizes.map((size) => (
        <button
          key={size.value}
          className={value === size.value ? "is-active" : ""}
          type="button"
          title={size.title}
          aria-label={size.title}
          onClick={() => onChange(size.value)}
        >
          {size.label}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function OperationLogDrawer({
  open,
  entries,
  onClose,
  onUndo
}: {
  open: boolean;
  entries: OperationLogEntry[];
  onClose(): void;
  onUndo(id: string): void;
}) {
  return (
    <aside className={`operation-log-drawer ${open ? "is-open" : ""}`} aria-label="操作日志">
      <div className="operation-log-heading">
        <button className="drawer-close" type="button" aria-label="收起操作日志" onClick={onClose}>
          <span aria-hidden="true" />
        </button>
        <div>
          <h3>操作日志</h3>
          <span>可撤回的历史操作</span>
        </div>
      </div>
      {entries.length === 0 ? (
        <p className="operation-log-empty">还没有可记录的操作。</p>
      ) : (
        <ol className="operation-log-list">
          {entries.map((entry) => (
            <li key={entry.id} className={`operation-log-item is-${entry.status}`}>
              <div>
                <strong>{entry.title}</strong>
                <p>{entry.detail}</p>
                <time>{new Date(entry.createdAt).toLocaleTimeString()}</time>
              </div>
              <button
                type="button"
                disabled={entry.status !== "ready" || !entry.undo}
                onClick={() => onUndo(entry.id)}
              >
                {entry.status === "undone" ? "已撤回" : entry.status === "failed" ? "失败" : "撤回"}
              </button>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}

function BookmarkContextMenu({
  state,
  tree,
  onClose,
  canInsertBookmark,
  onEdit,
  onMove,
  onCreateFolder,
  onCreateBookmark,
  onDelete
}: {
  state: BookmarkContextMenuState;
  tree: BookmarkNode[];
  onClose(): void;
  canInsertBookmark: boolean;
  onEdit(bookmark: BookmarkNode): void;
  onMove(bookmark: BookmarkNode, folder: BookmarkNode): void;
  onCreateFolder(bookmark: BookmarkNode, parentFolder: BookmarkNode): void;
  onCreateBookmark(bookmark: BookmarkNode, position: BookmarkDropPosition): void;
  onDelete(bookmark: BookmarkNode): void;
}) {
  const snapshot = createDraggedBookmarkSnapshot(state.bookmark);
  const closeTimerRef = useRef<number | undefined>(undefined);

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(onClose, CONTEXT_MENU_CLOSE_DELAY_MS);
  }

  useEffect(() => clearCloseTimer, []);

  return (
    <div
      className="context-menu-layer"
      onClick={onClose}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div
        className={`context-menu-panel opens-${state.submenuDirection}`}
        style={{ left: state.x, top: state.y }}
        role="menu"
        onClick={(event) => event.stopPropagation()}
        onMouseEnter={clearCloseTimer}
        onMouseLeave={scheduleClose}
      >
        <button type="button" role="menuitem" onClick={() => onEdit(state.bookmark)}>
          编辑
        </button>
        {canInsertBookmark ? (
          <>
            <button type="button" role="menuitem" onClick={() => onCreateBookmark(state.bookmark, "before")}>
              在前面新建书签
            </button>
            <button type="button" role="menuitem" onClick={() => onCreateBookmark(state.bookmark, "after")}>
              在后面新建书签
            </button>
          </>
        ) : null}
        <div className="context-menu-item has-submenu" role="menuitem" tabIndex={0}>
          <span>移动</span>
          <span className="menu-chevron" aria-hidden="true" />
          <div className="context-submenu move-submenu" role="menu" aria-label="移动到文件夹">
            <MoveFolderMenu
              nodes={tree}
              snapshot={snapshot}
              onMove={(folder) => onMove(state.bookmark, folder)}
              onCreateFolder={(parentFolder) => onCreateFolder(state.bookmark, parentFolder)}
            />
          </div>
        </div>
        <button
          className="is-danger"
          type="button"
          role="menuitem"
          onClick={() => onDelete(state.bookmark)}
        >
          删除
        </button>
      </div>
    </div>
  );
}

function FolderContextMenu({
  state,
  onClose,
  onCreateFolder,
  onRenameFolder
}: {
  state: FolderContextMenuState;
  onClose(): void;
  onCreateFolder(folder: BookmarkNode): void;
  onRenameFolder(folder: BookmarkNode): void;
}) {
  return (
    <div
      className="context-menu-layer"
      onClick={onClose}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div
        className={`context-menu-panel opens-${state.submenuDirection}`}
        style={{ left: state.x, top: state.y }}
        role="menu"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" role="menuitem" onClick={() => onCreateFolder(state.folder)}>
          新建文件夹
        </button>
        {canRenameFolder(state.folder) ? (
          <button type="button" role="menuitem" onClick={() => onRenameFolder(state.folder)}>
            重命名
          </button>
        ) : null}
      </div>
    </div>
  );
}

function MoveFolderMenu({
  nodes,
  snapshot,
  onMove,
  onCreateFolder
}: {
  nodes: BookmarkNode[];
  snapshot: DraggedBookmarkSnapshot;
  onMove(folder: BookmarkNode): void;
  onCreateFolder(parentFolder: BookmarkNode): void;
}) {
  const folders = nodes.filter(isFolder);

  if (folders.length === 0) {
    return <div className="move-menu-empty">没有可用文件夹</div>;
  }

  return (
    <div className="move-menu-list">
      {folders.map((folder) => {
        const canMove = canMoveBookmarkToFolder(snapshot, folder);
        const nestedFolders = folder.children?.filter(isFolder) ?? [];
        const hasSubmenu = Boolean(folder.parentId);
        const isCurrentParent = snapshot.parentId === folder.id;
        const title = folder.parentId ? getDisplayTitle(folder) : "Root";

        if (!folder.parentId) {
          return (
            <MoveFolderMenu
              key={folder.id}
              nodes={folder.children ?? []}
              snapshot={snapshot}
              onMove={onMove}
              onCreateFolder={onCreateFolder}
            />
          );
        }

        return (
          <div
            key={folder.id}
            className={`move-folder-row ${hasSubmenu ? "has-children" : ""} ${
              isCurrentParent ? "is-current-parent" : ""
            }`}
          >
            <button
              type="button"
              aria-disabled={!canMove}
              disabled={!canMove && !hasSubmenu}
              onClick={() => {
                if (canMove) {
                  onMove(folder);
                }
              }}
            >
              <span className="folder-glyph" aria-hidden="true" />
              <span>{title}</span>
              {isCurrentParent ? <span className="move-menu-note">当前位置</span> : null}
              {hasSubmenu ? <span className="menu-chevron" aria-hidden="true" /> : null}
            </button>
            {hasSubmenu ? (
              <div className="context-submenu nested-submenu" role="menu">
                <MoveFolderMenu
                  nodes={nestedFolders}
                  snapshot={snapshot}
                  onMove={onMove}
                  onCreateFolder={onCreateFolder}
                />
                <button
                  className="move-folder-create"
                  type="button"
                  role="menuitem"
                  onClick={() => onCreateFolder(folder)}
                >
                  新建文件夹...
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function NewBookmarkDraftCard({
  state,
  onChange,
  onCancel,
  onSubmit
}: {
  state: NewBookmarkDraftState;
  onChange(state: NewBookmarkDraftState): void;
  onCancel(): void;
  onSubmit(state: NewBookmarkDraftState): Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (saving) {
      return;
    }

    setSaving(true);
    try {
      await onSubmit(state);
    } catch {
      // Validation is surfaced through toast; keep the draft card available.
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="bookmark-card new-bookmark-card" aria-label="新建书签草稿">
      <form
        className="new-bookmark-form"
        onSubmit={(event) => void handleSubmit(event)}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          event.stopPropagation();

          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
      >
        <span className="new-bookmark-heading">新建书签</span>
        <label>
          标题
          <input
            value={state.title}
            autoFocus
            placeholder="可留空，自动使用域名"
            onChange={(event) => onChange({ ...state, title: event.target.value })}
          />
        </label>
        <label>
          URL
          <input
            value={state.url}
            placeholder="https://example.com"
            onChange={(event) => onChange({ ...state, url: event.target.value })}
          />
        </label>
        <div className="new-bookmark-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </article>
  );
}

function NewFolderDialog({
  state,
  onChange,
  onClose,
  onSubmit
}: {
  state: NewFolderDialogState;
  onChange(state: NewFolderDialogState): void;
  onClose(): void;
  onSubmit(state: NewFolderDialogState): void;
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(state);
  }

  return (
    <div className="dialog-layer" role="presentation" onMouseDown={onClose}>
      <form
        className="bookmark-edit-dialog"
        onSubmit={handleSubmit}
        onMouseDown={(event) => event.stopPropagation()}
        aria-label={state.bookmarkToMove ? "新建文件夹并移动书签" : "新建文件夹"}
      >
        <div className="dialog-heading">
          <div>
            <h3>{state.bookmarkToMove ? "新建并移动" : "新建文件夹"}</h3>
            <span>位置：{getDisplayTitle(state.parentFolder)}</span>
          </div>
          <button type="button" aria-label="关闭新建文件夹窗口" onClick={onClose}>
            Close
          </button>
        </div>
        <label>
          文件夹名称
          <input
            value={state.name}
            autoFocus
            onChange={(event) => onChange({ ...state, name: event.target.value })}
          />
        </label>
        <div className="dialog-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">{state.bookmarkToMove ? "新建并移动" : "新建"}</button>
        </div>
      </form>
    </div>
  );
}

function Toast({ toast, onClose }: { toast: ToastState; onClose(): void }) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="toast" role="status">
      <span>{toast.message}</span>
      {toast.action ? (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await toast.action?.();
              onClose();
            } finally {
              setBusy(false);
            }
          }}
        >
          {toast.actionLabel ?? "Undo"}
        </button>
      ) : null}
      <button type="button" onClick={onClose} aria-label="关闭提示">
        Close
      </button>
    </div>
  );
}

function getErrorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}

function isValidBookmarkUrl(value: string): boolean {
  if (!value) {
    return false;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getTitleFromUrl(url: string): string {
  try {
    return new URL(url).hostname || "Untitled bookmark";
  } catch {
    return "Untitled bookmark";
  }
}

function getBookmarkDropPositionFromEvent(event: DragEvent<HTMLElement>): BookmarkDropPosition {
  const bounds = event.currentTarget.getBoundingClientRect();
  return getBookmarkCardDropPosition(
    { x: event.clientX, y: event.clientY },
    {
      top: bounds.top,
      right: bounds.right,
      bottom: bounds.bottom,
      left: bounds.left
    }
  );
}
