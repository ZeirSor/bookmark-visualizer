import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type MouseEvent as ReactMouseEvent
} from "react";
import { BookmarkCard } from "../components/BookmarkCard";
import { FolderTree } from "../components/FolderTree";
import { SearchBar } from "../components/SearchBar";
import { bookmarksAdapter, canUseChromeBookmarks } from "../lib/chrome";
import {
  collectFolderIds,
  getDisplayTitle,
  isFolder,
  useBookmarks,
  type BookmarkNode
} from "../features/bookmarks";
import { getContextMenuPlacement, type ContextMenuPlacement } from "../features/context-menu";
import {
  canDropBookmarkOnFolder,
  canMoveBookmarkToFolder,
  createDraggedBookmarkSnapshot,
  type DraggedBookmarkSnapshot
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

interface BookmarkEditState {
  bookmark: BookmarkNode;
  title: string;
  url: string;
  note: string;
}

export function App() {
  const [query, setQuery] = useState("");
  const [draggedBookmark, setDraggedBookmark] = useState<DraggedBookmarkSnapshot>();
  const [highlightedBookmarkId, setHighlightedBookmarkId] = useState<string>();
  const [highlightPulseId, setHighlightPulseId] = useState<string>();
  const [operationLogOpen, setOperationLogOpen] = useState(false);
  const [operationLog, setOperationLog] = useState<OperationLogEntry[]>([]);
  const operationLogRef = useRef<OperationLogEntry[]>([]);
  const [contextMenu, setContextMenu] = useState<BookmarkContextMenuState>();
  const [editingBookmark, setEditingBookmark] = useState<BookmarkEditState>();
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
    selectFolder
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
      setEditingBookmark(undefined);
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
  const canLoadRealBookmarks = canUseChromeBookmarks();

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

        <button
          className="load-real-bookmarks-button"
          type="button"
          onClick={() => void handleLoadRealBookmarks()}
        >
          加载真实书签
          <span>{canLoadRealBookmarks ? "Extension" : "Mock 模式"}</span>
        </button>

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
            draggedBookmark={draggedBookmark}
            onSelectFolder={handleSelectFolder}
            onToggleFolder={toggleFolderExpanded}
            onSelectBookmark={handleSelectTreeBookmark}
            onDropBookmark={(folder) => void handleDropBookmark(folder)}
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

        <section className="hero-search" aria-label="主搜索">
          <SearchBar value={query} onChange={setQuery} />
        </section>

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
          onEdit={(bookmark) => openBookmarkEditor(bookmark)}
          onMove={(bookmark, folder) => void handleContextMoveBookmark(bookmark, folder)}
          onDelete={(bookmark) => void handleDeleteBookmark(bookmark)}
        />
      ) : null}
      {editingBookmark ? (
        <BookmarkEditDialog
          state={editingBookmark}
          onChange={setEditingBookmark}
          onClose={() => setEditingBookmark(undefined)}
          onSubmit={(state) => void handleSaveBookmarkDetails(state)}
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

    if (selectedBookmarks.length === 0) {
      return <EmptyState title="当前文件夹没有直接书签" body="子文件夹中的书签会在搜索中出现。" />;
    }

    return renderCards(displayedBookmarks);
  }

  function renderCards(items: Array<{ bookmark: BookmarkNode; folderPath?: string }>) {
    return (
      <div className="card-grid">
        {items.map(({ bookmark, folderPath }) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            folderPath={folderPath}
            note={metadata.bookmarkMetadata[bookmark.id]?.note}
            highlighted={highlightedBookmarkId === bookmark.id}
            highlightPulse={highlightPulseId === bookmark.id}
            onDragStart={(dragged) => setDraggedBookmark(createDraggedBookmarkSnapshot(dragged))}
            onDragEnd={() => setDraggedBookmark(undefined)}
            onOpen={openBookmark}
            onSaveTitle={handleSaveTitle}
            onSaveNote={handleSaveNote}
            onContextMenu={handleBookmarkContextMenu}
          />
        ))}
      </div>
    );
  }

  async function handleSettingsChange(nextSettings: typeof settings) {
    try {
      await updateSettings(nextSettings);
    } catch (cause) {
      setToast({ message: getErrorMessage(cause, "设置保存失败。") });
    }
  }

  async function handleLoadRealBookmarks() {
    if (!canLoadRealBookmarks) {
      setToast({
        message: "当前是 Vite Mock 模式。请将 dist 作为 Chrome / Edge 未打包扩展加载后读取真实书签。"
      });
      return;
    }

    try {
      await reload();
      setToast({ message: "已重新加载浏览器真实书签。" });
    } catch (cause) {
      setToast({ message: getErrorMessage(cause, "真实书签加载失败。") });
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
  }

  function openBookmarkEditor(bookmark: BookmarkNode) {
    setContextMenu(undefined);
    setEditingBookmark({
      bookmark,
      title: bookmark.title,
      url: bookmark.url ?? "",
      note: metadata.bookmarkMetadata[bookmark.id]?.note ?? ""
    });
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

  async function handleSaveBookmarkDetails(state: BookmarkEditState) {
    const trimmedTitle = state.title.trim();
    const trimmedUrl = state.url.trim();
    const previousTitle = state.bookmark.title;
    const previousUrl = state.bookmark.url ?? "";
    const previousNote = metadata.bookmarkMetadata[state.bookmark.id]?.note ?? "";
    const nextNote = state.note.trim();

    if (!trimmedTitle) {
      setToast({ message: "标题不能为空。" });
      return;
    }

    if (!isValidBookmarkUrl(trimmedUrl)) {
      setToast({ message: "请输入有效的 URL。" });
      return;
    }

    const shouldUpdateBookmark =
      trimmedTitle !== previousTitle.trim() || trimmedUrl !== previousUrl.trim();
    const shouldUpdateNote = nextNote !== previousNote.trim();

    if (!shouldUpdateBookmark && !shouldUpdateNote) {
      setEditingBookmark(undefined);
      return;
    }

    try {
      if (shouldUpdateBookmark) {
        await bookmarksAdapter.update(state.bookmark.id, {
          title: trimmedTitle,
          url: trimmedUrl
        });
      }

      if (shouldUpdateNote) {
        await updateNote(state.bookmark.id, nextNote);
      }

      await reload();
      setEditingBookmark(undefined);

      const operationId = addOperation({
        title: "编辑书签",
        detail: `已更新“${trimmedTitle || "Untitled"}”。`,
        undo: async () => {
          await bookmarksAdapter.update(state.bookmark.id, {
            title: previousTitle,
            url: previousUrl
          });
          await updateNote(state.bookmark.id, previousNote);
          await reload();
        }
      });

      setToast({
        message: "书签已更新。",
        actionLabel: "撤销",
        action: async () => undoOperation(operationId)
      });
    } catch (cause) {
      await reload();
      setToast({ message: getErrorMessage(cause, "书签更新失败。") });
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
  onEdit,
  onMove,
  onDelete
}: {
  state: BookmarkContextMenuState;
  tree: BookmarkNode[];
  onClose(): void;
  onEdit(bookmark: BookmarkNode): void;
  onMove(bookmark: BookmarkNode, folder: BookmarkNode): void;
  onDelete(bookmark: BookmarkNode): void;
}) {
  const snapshot = createDraggedBookmarkSnapshot(state.bookmark);

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
        onMouseLeave={onClose}
      >
        <button type="button" role="menuitem" onClick={() => onEdit(state.bookmark)}>
          编辑
        </button>
        <div className="context-menu-item has-submenu" role="menuitem" tabIndex={0}>
          <span>移动</span>
          <span className="menu-chevron" aria-hidden="true" />
          <div className="context-submenu move-submenu" role="menu" aria-label="移动到文件夹">
            <MoveFolderMenu
              nodes={tree}
              snapshot={snapshot}
              onMove={(folder) => onMove(state.bookmark, folder)}
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

function MoveFolderMenu({
  nodes,
  snapshot,
  onMove
}: {
  nodes: BookmarkNode[];
  snapshot: DraggedBookmarkSnapshot;
  onMove(folder: BookmarkNode): void;
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
        const hasNestedFolders = nestedFolders.length > 0;
        const isCurrentParent = snapshot.parentId === folder.id;
        const title = folder.parentId ? getDisplayTitle(folder) : "Root";

        if (!folder.parentId) {
          return (
            <MoveFolderMenu
              key={folder.id}
              nodes={folder.children ?? []}
              snapshot={snapshot}
              onMove={onMove}
            />
          );
        }

        return (
          <div
            key={folder.id}
            className={`move-folder-row ${hasNestedFolders ? "has-children" : ""} ${
              isCurrentParent ? "is-current-parent" : ""
            }`}
          >
            <button
              type="button"
              aria-disabled={!canMove}
              disabled={!canMove && !hasNestedFolders}
              onClick={() => {
                if (canMove) {
                  onMove(folder);
                }
              }}
            >
              <span className="folder-glyph" aria-hidden="true" />
              <span>{title}</span>
              {isCurrentParent ? <span className="move-menu-note">当前位置</span> : null}
              {hasNestedFolders ? <span className="menu-chevron" aria-hidden="true" /> : null}
            </button>
            {hasNestedFolders ? (
              <div className="context-submenu nested-submenu" role="menu">
                <MoveFolderMenu nodes={nestedFolders} snapshot={snapshot} onMove={onMove} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function BookmarkEditDialog({
  state,
  onChange,
  onClose,
  onSubmit
}: {
  state: BookmarkEditState;
  onChange(state: BookmarkEditState): void;
  onClose(): void;
  onSubmit(state: BookmarkEditState): void;
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
        aria-label="编辑书签"
      >
        <div className="dialog-heading">
          <div>
            <h3>编辑书签</h3>
            <span>{getUrlLabel(state.bookmark.url)}</span>
          </div>
          <button type="button" aria-label="关闭编辑窗口" onClick={onClose}>
            Close
          </button>
        </div>
        <label>
          标题
          <input
            value={state.title}
            autoFocus
            onChange={(event) => onChange({ ...state, title: event.target.value })}
          />
        </label>
        <label>
          URL
          <input
            value={state.url}
            onChange={(event) => onChange({ ...state, url: event.target.value })}
          />
        </label>
        <label>
          备注
          <textarea
            rows={4}
            value={state.note}
            onChange={(event) => onChange({ ...state, note: event.target.value })}
          />
        </label>
        <div className="dialog-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">Save</button>
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

function getUrlLabel(url?: string): string {
  if (!url) {
    return "Bookmark";
  }

  try {
    return new URL(url).hostname || url;
  } catch {
    return url;
  }
}
