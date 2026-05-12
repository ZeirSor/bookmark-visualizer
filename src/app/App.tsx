import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type MouseEvent as ReactMouseEvent
} from "react";
import { FolderTree } from "../components/FolderTree";
import { WorkspaceContent } from "./workspace/WorkspaceContent";
import {
  BookmarkContextMenu,
  FolderContextMenu,
  FolderPickerDialog,
  NewFolderDialog,
  OperationLogDrawer,
  ShortcutSettingsDialog,
  Toast
} from "./workspace/WorkspaceComponents";
import { BookmarkCommandBar } from "./workspace/components/BookmarkCommandBar";
import { FolderHeader } from "./workspace/components/FolderHeader";
import { FolderStrip } from "./workspace/components/FolderStrip";
import { RightRail } from "./workspace/components/RightRail";
import { SearchFilterSummary } from "./workspace/components/SearchFilterSummary";
import { SelectionActionBar } from "./workspace/components/SelectionActionBar";
import { TopToolbar } from "./workspace/components/TopToolbar";
import { useExpandedFolders } from "./workspace/hooks/useExpandedFolders";
import { useOperationLog } from "./workspace/hooks/useOperationLog";
import { useRecentFolders } from "./workspace/hooks/useRecentFolders";
import { useSelectionState } from "./workspace/hooks/useSelectionState";
import { useWorkspaceDragDrop } from "./workspace/hooks/useWorkspaceDragDrop";
import { useWorkspaceDeepLink } from "./workspace/hooks/useWorkspaceDeepLink";
import {
  formatFolderUpdatedLabel,
  filterWorkspaceBookmarkItems,
  getDirectFolders,
  getFolderDisplayLabel,
  getFolderStats,
  getSelectedBookmarksForAction,
  hasActiveWorkspaceFilters,
  sortWorkspaceBookmarkItems
} from "./workspace/selectors/workspaceSelectors";
import type {
  BookmarkContextMenuState,
  FolderContextMenuState,
  FolderPickerDialogState,
  NewBookmarkDraftState,
  NewFolderDialogState,
  ToastState,
  WorkspaceFilters,
  WorkspaceSearchScope,
  WorkspaceSortMode
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
  canRenameFolder,
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
import { resolveRecentFolderOptions } from "../features/recent-folders";
import { searchBookmarks } from "../features/search";
import { useSettings } from "../features/settings";

export function App() {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<WorkspaceSortMode>("default");
  const [workspaceFilters, setWorkspaceFilters] = useState<WorkspaceFilters>({ hasNote: false });
  const [searchScope, setSearchScope] = useState<WorkspaceSearchScope>("all");
  const [highlightedBookmarkId, setHighlightedBookmarkId] = useState<string>();
  const [highlightPulseId, setHighlightPulseId] = useState<string>();
  const [contextMenu, setContextMenu] = useState<BookmarkContextMenuState>();
  const [folderContextMenu, setFolderContextMenu] = useState<FolderContextMenuState>();
  const [inlineEditRequest, setInlineEditRequest] = useState<{ bookmarkId: string; requestId: number }>();
  const [renamingFolderId, setRenamingFolderId] = useState<string>();
  const [newFolderDialog, setNewFolderDialog] = useState<NewFolderDialogState>();
  const [newBookmarkDraft, setNewBookmarkDraft] = useState<NewBookmarkDraftState>();
  const [folderPickerDialog, setFolderPickerDialog] = useState<FolderPickerDialogState>();
  const [shortcutDialogOpen, setShortcutDialogOpen] = useState(false);
  const [retainedBreadcrumbTailIds, setRetainedBreadcrumbTailIds] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastState>();
  const sidebarResizeCleanupRef = useRef<(() => void) | null>(null);
  const dragDrop = useWorkspaceDragDrop();
  const {
    draggedBookmark,
    setDraggedBookmark,
    draggedFolder,
    setDraggedFolder,
    activeBookmarkDropIntent,
    setActiveBookmarkDropIntent,
    handleBookmarkDragEnd
  } = dragDrop;
  const { recentFolderIds, rememberRecentFolder } = useRecentFolders();
  const { operationLogOpen, setOperationLogOpen, operationLog, addOperation, undoOperation } =
    useOperationLog({ setToast });
  const { metadata, updateNote } = useMetadata();
  const { settings, updateSettings } = useSettings();
  const selection = useSelectionState();
  const {
    tree,
    folders,
    selectedFolder,
    selectedFolderId,
    selectedBookmarks,
    loading,
    error,
    reload,
    selectFolder,
    updateTree
  } = useBookmarks();
  const {
    expandedFolderIds,
    toggleFolderExpanded,
    expandAllFolders,
    collapseAllFolders,
    expandFolders,
    expandFolderPath
  } = useExpandedFolders(tree);

  useWorkspaceDeepLink({
    tree,
    selectFolder,
    expandFolderPath,
    setHighlightedBookmarkId,
    setRetainedBreadcrumbTailIds
  });

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
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      const hasActiveLayer = Boolean(
        contextMenu ||
          folderContextMenu ||
          newFolderDialog ||
          newBookmarkDraft ||
          folderPickerDialog ||
          shortcutDialogOpen ||
          renamingFolderId ||
          activeBookmarkDropIntent
      );

      setContextMenu(undefined);
      setFolderContextMenu(undefined);
      setNewFolderDialog(undefined);
      setNewBookmarkDraft(undefined);
      setFolderPickerDialog(undefined);
      setShortcutDialogOpen(false);
      setRenamingFolderId(undefined);
      setActiveBookmarkDropIntent(undefined);

      if (!hasActiveLayer && selection.selectionMode) {
        selection.clear();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeBookmarkDropIntent,
    contextMenu,
    folderContextMenu,
    folderPickerDialog,
    newBookmarkDraft,
    newFolderDialog,
    renamingFolderId,
    selection,
    shortcutDialogOpen
  ]);

  useEffect(() => () => sidebarResizeCleanupRef.current?.(), []);

  const searchResults = useMemo(
    () =>
      searchBookmarks(tree, query, {
        metadata,
        scopeRootId: searchScope === "current-folder" ? selectedFolderId : undefined
      }),
    [metadata, query, searchScope, selectedFolderId, tree]
  );
  const isSearching = query.trim().length > 0;
  const hasActiveFilters = hasActiveWorkspaceFilters(workspaceFilters);
  const childFolders = useMemo(() => getDirectFolders(selectedFolder), [selectedFolder]);
  const folderStats = useMemo(() => getFolderStats(selectedFolder), [selectedFolder]);
  const folderTitle = getFolderDisplayLabel(selectedFolder);
  const folderUpdatedLabel = formatFolderUpdatedLabel(folderStats.updatedAt);
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
  const canCreateFolderHere = Boolean(selectedFolder && canCreateBookmarkInFolder(selectedFolder));

  const displayedBookmarks = useMemo(() => {
    const sourceItems: Array<{ bookmark: BookmarkNode; folderPath?: string }> = isSearching
      ? searchResults.map((result) => ({
          bookmark: result.bookmark,
          folderPath: result.folderPath
        }))
      : selectedBookmarks.map((bookmark) => ({ bookmark, folderPath: undefined }));

    return sortWorkspaceBookmarkItems(
      filterWorkspaceBookmarkItems(sourceItems, metadata, workspaceFilters),
      sortMode
    );
  }, [isSearching, metadata, searchResults, selectedBookmarks, sortMode, workspaceFilters]);
  const selectedBookmarksForAction = useMemo(
    () => getSelectedBookmarksForAction(selection.selectedIds, tree),
    [selection.selectedIds, tree]
  );
  const storageSummary = useMemo(() => {
    const noteCount = Object.values(metadata.bookmarkMetadata).filter((item) => item.note?.trim()).length;

    return {
      label: "本地扩展元数据",
      detail: noteCount > 0 ? `${noteCount} 条备注` : "尚无备注数据"
    };
  }, [metadata.bookmarkMetadata]);
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

  function clearWorkspaceFilters() {
    setQuery("");
    setWorkspaceFilters({ hasNote: false });
    setSearchScope("all");
  }

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
        <TopToolbar
          breadcrumbItems={breadcrumbItems}
          homeFolderId={homeFolderId}
          query={query}
          cardSize={settings.cardSize}
          theme={settings.theme}
          operationLogCount={operationLog.length}
          operationLogOpen={operationLogOpen}
          onSelectBreadcrumb={handleBreadcrumbSelectFolder}
          onSearchChange={setQuery}
          onClearSearch={() => setQuery("")}
          onCardSizeChange={(cardSize) => void handleSettingsChange({ ...settings, cardSize })}
          onToggleOperationLog={() => setOperationLogOpen((current) => !current)}
          onOpenShortcutSettings={() => setShortcutDialogOpen(true)}
          onToggleTheme={() =>
            void handleSettingsChange({
              ...settings,
              theme: settings.theme === "light" ? "dark" : "light"
            })
          }
        />

        <div className="manager-layout">
          <main className="manager-main" aria-live="polite">
            {selection.selectionMode ? (
              <SelectionActionBar
                selectedCount={selection.selectedCount}
                onDeleteSelected={() => void handleDeleteSelectedBookmarks()}
                onCancel={selection.clear}
              />
            ) : null}
            <FolderHeader
              title={folderTitle}
              bookmarkCount={folderStats.bookmarkCount}
              folderCount={folderStats.folderCount}
              updatedLabel={folderUpdatedLabel}
              isSearching={isSearching}
              resultCount={displayedBookmarks.length}
              canCreateBookmark={canCreateBookmarkHere && Boolean(selectedFolder)}
              onCreateBookmark={() => {
                if (selectedFolder) {
                  openNewBookmarkDraftAtEnd(selectedFolder);
                }
              }}
              onOpenMore={
                selectedFolder ? (event) => handleFolderContextMenu(selectedFolder, event) : undefined
              }
            />
            <SearchFilterSummary
              query={query}
              filters={workspaceFilters}
              resultCount={displayedBookmarks.length}
              searchScope={searchScope}
              onClearQuery={() => setQuery("")}
              onClearFilters={clearWorkspaceFilters}
              onClearHasNoteFilter={() =>
                setWorkspaceFilters((current) => ({ ...current, hasNote: false }))
              }
              onRefresh={() => void reload()}
              onSearchScopeChange={setSearchScope}
            />
            <BookmarkCommandBar
              defaultSortLabel={isSearching ? "匹配度" : "默认顺序"}
              filterLabel={workspaceFilters.hasNote ? "有备注" : "全部"}
              filters={workspaceFilters}
              sortMode={sortMode}
              selectionMode={selection.selectionMode}
              onSortModeChange={setSortMode}
              onToggleHasNoteFilter={() =>
                setWorkspaceFilters((current) => ({ ...current, hasNote: !current.hasNote }))
              }
              onEnterSelectionMode={selection.enter}
            />
            {!isSearching ? (
              <FolderStrip folders={childFolders} onSelectFolder={handleSelectFolder} />
            ) : null}
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
              hasActiveFilters={hasActiveFilters}
              inlineEditRequest={inlineEditRequest}
              isSearching={isSearching}
              loading={loading}
              metadata={metadata}
              newBookmarkDraft={newBookmarkDraft}
              openBookmark={openBookmark}
              openNewBookmarkDraftAtEnd={openNewBookmarkDraftAtEnd}
              onClearSearch={clearWorkspaceFilters}
              onToggleBookmarkSelected={(bookmark) => selection.toggle(bookmark.id)}
              selectedBookmarkIds={selection.selectedIds}
              selectedBookmarks={selectedBookmarks}
              selectedFolder={selectedFolder}
              selectedFolderId={selectedFolderId}
              selectionMode={selection.selectionMode}
              setDraggedBookmark={setDraggedBookmark}
              setNewBookmarkDraft={setNewBookmarkDraft}
            />
          </main>
          <RightRail
            activities={operationLog}
            canCreateFolder={canCreateFolderHere}
            storage={storageSummary}
            onCreateFolder={() => {
              if (selectedFolder) {
                openNewFolderDialog(selectedFolder);
              }
            }}
            onViewAllActivity={() => setOperationLogOpen(true)}
          />
        </div>
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

  function handleSidebarResizeStart(event: ReactMouseEvent<HTMLDivElement>) {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = settings.sidebarWidth;
    let nextWidth = startWidth;

    function handleMouseMove(moveEvent: MouseEvent) {
      nextWidth = Math.min(640, Math.max(220, startWidth + moveEvent.clientX - startX));
      document.documentElement.style.setProperty("--live-sidebar-width", `${nextWidth}px`);
    }

    function cleanup() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.documentElement.style.removeProperty("--live-sidebar-width");
      sidebarResizeCleanupRef.current = null;
    }

    function handleMouseUp() {
      cleanup();
      void handleSettingsChange({ ...settings, sidebarWidth: nextWidth });
    }

    sidebarResizeCleanupRef.current?.();
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    sidebarResizeCleanupRef.current = cleanup;
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

  async function handleDeleteSelectedBookmarks() {
    const deletableBookmarks = selectedBookmarksForAction;

    if (deletableBookmarks.length === 0) {
      setToast({ message: "请先选择要删除的书签。" });
      return;
    }

    const confirmed = window.confirm(
      `确定要删除选中的 ${deletableBookmarks.length} 个书签吗？此批量操作暂不支持撤回。`
    );
    if (!confirmed) {
      return;
    }

    const results = await Promise.allSettled(
      deletableBookmarks.map((bookmark) => bookmarksAdapter.remove(bookmark.id))
    );
    const succeededCount = results.filter((r) => r.status === "fulfilled").length;
    const failedCount = results.length - succeededCount;

    await reload();
    selection.clear();
    setHighlightedBookmarkId(undefined);
    setHighlightPulseId(undefined);

    if (succeededCount > 0) {
      addOperation({
        title: "批量删除书签",
        detail: failedCount > 0
          ? `已删除 ${succeededCount}/${deletableBookmarks.length} 个书签，${failedCount} 个删除失败。此批量操作不可撤回。`
          : `已删除 ${succeededCount} 个书签。此批量操作不可撤回。`
      });
    }

    setToast({
      message: failedCount === 0
        ? `已删除 ${succeededCount} 个书签，当前批量操作不可撤回。`
        : succeededCount === 0
        ? "全部书签删除失败，请重试。"
        : `已删除 ${succeededCount}/${deletableBookmarks.length} 个书签，${failedCount} 个失败。`
    });
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

}
