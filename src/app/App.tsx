import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type MouseEvent as ReactMouseEvent
} from "react";
import { BreadcrumbNav } from "../components/BreadcrumbNav";
import { FolderTree } from "../components/FolderTree";
import { SearchBar } from "../components/SearchBar";
import { WorkspaceContent } from "./workspace/WorkspaceContent";
import {
  BookmarkContextMenu,
  CardSizeControl,
  FolderContextMenu,
  FolderPickerDialog,
  NewFolderDialog,
  OperationLogDrawer,
  ShortcutSettingsDialog,
  Toast
} from "./workspace/WorkspaceComponents";
import type {
  BookmarkContextMenuState,
  FolderContextMenuState,
  FolderPickerDialogState,
  NewBookmarkDraftState,
  NewFolderDialogState,
  OperationLogEntry,
  ToastState
} from "./workspace/types";
import {
  getBookmarkDropPositionFromEvent,
  getErrorMessage,
  getTitleFromUrl,
  isValidBookmarkUrl
} from "./workspace/helpers";
import { bookmarksAdapter } from "../lib/chrome";
import {
  buildRetainedFolderBreadcrumbItems,
  canCreateBookmarkInFolder,
  collectFolderIds,
  canRenameFolder,
  findNodeById,
  getDisplayTitle,
  getFolderEndIndex,
  getRetainedBreadcrumbTailIds,
  insertNodeInBookmarkTree,
  moveNodeInBookmarkTree,
  removeNodeFromBookmarkTree,
  useBookmarks,
  type BookmarkNode
} from "../features/bookmarks";
import { getContextMenuPlacement } from "../features/context-menu";
import {
  canDropBookmarkOnFolder,
  canDropFolderOnIntent,
  canMoveBookmarkToFolder,
  canReorderBookmarkOnIntent,
  createDraggedBookmarkSnapshot,
  createDraggedFolderSnapshot,
  getBookmarkReorderDestination,
  getFolderMoveDestination,
  type BookmarkDropIntent,
  type BookmarkDropPosition,
  type DraggedBookmarkSnapshot,
  type DraggedFolderSnapshot,
  type FolderDropIntent
} from "../features/drag-drop";
import { useMetadata } from "../features/metadata";
import {
  loadRecentFolderState,
  resolveRecentFolderOptions,
  saveRecentFolder
} from "../features/recent-folders";
import { searchBookmarks } from "../features/search";
import { useSettings } from "../features/settings";

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
  const [folderPickerDialog, setFolderPickerDialog] = useState<FolderPickerDialogState>();
  const [shortcutDialogOpen, setShortcutDialogOpen] = useState(false);
  const [activeBookmarkDropIntent, setActiveBookmarkDropIntent] = useState<BookmarkDropIntent>();
  const [recentFolderIds, setRecentFolderIds] = useState<string[]>([]);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
  const [retainedBreadcrumbTailIds, setRetainedBreadcrumbTailIds] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastState>();
  const { metadata, updateNote } = useMetadata();
  const { settings, updateSettings } = useSettings();
  const {
    tree,
    folders,
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
    const params = new URLSearchParams(window.location.search);
    if (params.get("quickSave") === "unsupported") {
      setToast({
        message:
          "当前页面不支持注入快捷保存浮框。请在普通网页点击扩展图标使用保存 popup。"
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    operationLogRef.current = operationLog;
  }, [operationLog]);

  useEffect(() => {
    let cancelled = false;

    async function loadRecentFolders() {
      try {
        const state = await loadRecentFolderState();
        if (!cancelled) {
          setRecentFolderIds(state.folderIds);
        }
      } catch {
        // 最近文件夹只是辅助 UI，读取失败不阻塞主界面。
      }
    }

    void loadRecentFolders();

    return () => {
      cancelled = true;
    };
  }, []);

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
      setFolderPickerDialog(undefined);
      setShortcutDialogOpen(false);
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
  const breadcrumbItems = useMemo(
    () => buildRetainedFolderBreadcrumbItems(tree, selectedFolderId, retainedBreadcrumbTailIds),
    [retainedBreadcrumbTailIds, selectedFolderId, tree]
  );
  const recentFolderOptions = useMemo(
    () => resolveRecentFolderOptions(folders, recentFolderIds, 5),
    [folders, recentFolderIds]
  );
  const homeFolderId = folders[0]?.id;
  const canCreateBookmarkHere = !isSearching && canCreateBookmarkInFolder(selectedFolder);

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
            onBookmarkDragStart={(bookmark) => setDraggedBookmark(createDraggedBookmarkSnapshot(bookmark))}
            onBookmarkDragEnd={handleBookmarkDragEnd}
            onRenameFolder={handleRenameFolder}
            onCancelRenameFolder={() => setRenamingFolderId(undefined)}
            onDropBookmark={(folder) => void handleDropBookmark(folder)}
            onDropBookmarkOnBookmark={(intent) => void handleDropBookmarkOnTreeBookmark(intent)}
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
          <BreadcrumbNav
            items={breadcrumbItems}
            homeFolderId={homeFolderId}
            onSelectFolder={handleBreadcrumbSelectFolder}
          />
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
              className="shortcut-button"
              type="button"
              aria-label="打开快捷键设置"
              title="快捷键设置"
              onClick={() => setShortcutDialogOpen(true)}
            >
              快捷键
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
            <div className="section-heading-actions">
              <span>{isSearching ? "只读搜索" : `${selectedBookmarks.length} 个直接书签`}</span>
              {canCreateBookmarkHere && selectedFolder ? (
                <button
                  className="section-action-button"
                  type="button"
                  onClick={() => openNewBookmarkDraftAtEnd(selectedFolder)}
                >
                  新建书签
                </button>
              ) : null}
            </div>
          </div>

                    <WorkspaceContent
            activeBookmarkDropIntent={activeBookmarkDropIntent}
            canCreateBookmarkHere={canCreateBookmarkHere}
            displayedBookmarks={displayedBookmarks}
            error={error}
            handleBookmarkCardDragLeave={handleBookmarkCardDragLeave}
            handleBookmarkCardDragOver={handleBookmarkCardDragOver}
            handleBookmarkContextMenu={handleBookmarkContextMenu}
            handleBookmarkDragEnd={handleBookmarkDragEnd}
            handleCreateBookmark={handleCreateBookmark}
            handleDropBookmarkOnCard={handleDropBookmarkOnCard}
            handleSaveNote={handleSaveNote}
            handleSaveTitle={handleSaveTitle}
            handleSaveUrl={handleSaveUrl}
            highlightedBookmarkId={highlightedBookmarkId}
            highlightPulseId={highlightPulseId}
            inlineEditRequest={inlineEditRequest}
            isSearching={isSearching}
            loading={loading}
            metadata={metadata}
            newBookmarkDraft={newBookmarkDraft}
            openBookmark={openBookmark}
            openNewBookmarkDraftAtEnd={openNewBookmarkDraftAtEnd}
            searchResults={searchResults}
            selectedBookmarks={selectedBookmarks}
            selectedFolder={selectedFolder}
            selectedFolderId={selectedFolderId}
            setDraggedBookmark={setDraggedBookmark}
            setNewBookmarkDraft={setNewBookmarkDraft}
          />
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
          recentFolders={recentFolderOptions}
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
      {folderPickerDialog ? (
        <FolderPickerDialog
          state={folderPickerDialog}
          tree={tree}
          onChange={setFolderPickerDialog}
          onClose={() => setFolderPickerDialog(undefined)}
          onMove={(bookmark, folder) => void handleFolderPickerMove(bookmark, folder)}
          onCreateFolder={(bookmark, parentFolder) => openNewFolderDialog(parentFolder, bookmark)}
        />
      ) : null}
      {shortcutDialogOpen ? (
        <ShortcutSettingsDialog onClose={() => setShortcutDialogOpen(false)} />
      ) : null}
      {toast ? <Toast toast={toast} onClose={() => setToast(undefined)} /> : null}
    </main>
  );

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
    selectFolderAndClearBreadcrumb(bookmark.parentId);
    setHighlightedBookmarkId(bookmark.id);
    window.requestAnimationFrame(() => setHighlightPulseId(bookmark.id));
  }

  function handleSelectFolder(folderId: string) {
    setHighlightedBookmarkId(undefined);
    setHighlightPulseId(undefined);
    selectFolderAndClearBreadcrumb(folderId);
  }

  function handleBreadcrumbSelectFolder(folderId: string) {
    setQuery("");
    setHighlightedBookmarkId(undefined);
    setHighlightPulseId(undefined);
    setRetainedBreadcrumbTailIds(getRetainedBreadcrumbTailIds(breadcrumbItems, folderId));
    selectFolder(folderId);
  }

  function selectFolderAndClearBreadcrumb(folderId: string) {
    setRetainedBreadcrumbTailIds([]);
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

  async function handleDropBookmarkOnTreeBookmark(intent: BookmarkDropIntent) {
    const snapshot = draggedBookmark;

    if (!snapshot || !canReorderBookmarkOnIntent(snapshot, intent)) {
      return;
    }

    await reorderBookmarkWithUndo(snapshot, intent);
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
      await rememberRecentFolder(folder.id);
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

  async function rememberRecentFolder(folderId: string) {
    try {
      const state = await saveRecentFolder(folderId);
      setRecentFolderIds(state.folderIds);
    } catch {
      // 最近文件夹写入失败不影响书签移动结果。
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
      selectFolderAndClearBreadcrumb(snapshot.id);

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
          selectFolderAndClearBreadcrumb(snapshot.id);
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
    setFolderPickerDialog(undefined);
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
    selectFolderAndClearBreadcrumb(folder.id);
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

  function openNewBookmarkDraftAtEnd(folder: BookmarkNode) {
    if (!canCreateBookmarkInFolder(folder)) {
      setToast({ message: "不能在这个文件夹中新建书签。" });
      return;
    }

    setNewBookmarkDraft({
      parentId: folder.id,
      index: getFolderEndIndex(folder),
      title: "",
      url: ""
    });
    selectFolderAndClearBreadcrumb(folder.id);
  }

  function openFolderPicker(bookmark: BookmarkNode) {
    setContextMenu(undefined);
    setFolderPickerDialog({
      bookmark,
      query: "",
      selectedFolderId: bookmark.parentId ?? selectedFolderId
    });
  }

  async function handleFolderPickerMove(bookmark: BookmarkNode, folder: BookmarkNode) {
    setFolderPickerDialog(undefined);
    await moveBookmarkWithUndo(createDraggedBookmarkSnapshot(bookmark), folder);
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
      selectFolderAndClearBreadcrumb(createdFolder.id);

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
      selectFolderAndClearBreadcrumb(state.parentId);
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
      selectFolderAndClearBreadcrumb(folder.id);
      setRenamingFolderId(undefined);

      const operationId = addOperation({
        title: "重命名文件夹",
        detail: `“${previousTitle || "Untitled"}”改为“${trimmedTitle}”。`,
        undo: async () => {
          await bookmarksAdapter.update(folder.id, { title: previousTitle });
          await reload();
          selectFolderAndClearBreadcrumb(folder.id);
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
