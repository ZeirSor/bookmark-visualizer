import { useEffect, useRef, useState, type FormEvent } from "react";
import { FolderMoveSubmenuContent } from "../../components/FolderMoveSubmenuContent";
import {
  canCreateBookmarkInFolder,
  canRenameFolder,
  filterFolderOptions,
  findNodeById,
  flattenFolders,
  getDisplayTitle,
  type BookmarkNode,
  type FolderOption
} from "../../features/bookmarks";
import { getCascadeMenuPlacement } from "../../features/context-menu";
import {
  canMoveBookmarkToFolder,
  createDraggedBookmarkSnapshot,
  type BookmarkDropPosition
} from "../../features/drag-drop";
import {
  getQuickSaveShortcutCommandConflicts,
  type QuickSaveShortcutCommandConflict
} from "../../features/quick-save";
import type { CardSize } from "../../features/settings";
import type {
  BookmarkContextMenuState,
  FolderContextMenuState,
  FolderPickerDialogState,
  NewBookmarkDraftState,
  NewFolderDialogState,
  OperationLogEntry,
  ToastState
} from "./types";

const CONTEXT_MENU_CLOSE_DELAY_MS = 320;

export function CardSizeControl({
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

export function EmptyState({
  title,
  body,
  action
}: {
  title: string;
  body: string;
  action?: { label: string; onClick(): void };
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{body}</p>
      {action ? (
        <button className="empty-state-action" type="button" onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

export function OperationLogDrawer({
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

export function BookmarkContextMenu({
  state,
  tree,
  recentFolders,
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
  recentFolders: FolderOption[];
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
  const moveMenuCloseTimerRef = useRef<number | undefined>(undefined);
  const moveTriggerRef = useRef<HTMLDivElement>(null);
  const moveSubmenuRef = useRef<HTMLDivElement>(null);
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);
  const [moveFolderQuery, setMoveFolderQuery] = useState("");

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
  }

  function clearMoveMenuCloseTimer() {
    if (moveMenuCloseTimerRef.current) {
      window.clearTimeout(moveMenuCloseTimerRef.current);
      moveMenuCloseTimerRef.current = undefined;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(onClose, CONTEXT_MENU_CLOSE_DELAY_MS);
  }

  function scheduleMoveMenuClose() {
    clearMoveMenuCloseTimer();
    moveMenuCloseTimerRef.current = window.setTimeout(() => {
      setMoveMenuOpen(false);
    }, CONTEXT_MENU_CLOSE_DELAY_MS);
  }

  function positionMoveSubmenu() {
    clearCloseTimer();
    clearMoveMenuCloseTimer();
    setMoveMenuOpen(true);
    positionNestedSubmenu(moveTriggerRef.current, moveSubmenuRef.current);
  }

  function keepMoveCascadeOpen() {
    clearCloseTimer();
    clearMoveMenuCloseTimer();
    setMoveMenuOpen(true);
  }

  function scheduleMoveCascadeClose() {
    scheduleMoveMenuClose();
    scheduleClose();
  }

  useEffect(() => {
    return () => {
      clearCloseTimer();
      clearMoveMenuCloseTimer();
    };
  }, []);

  useEffect(() => {
    setMoveFolderQuery("");
  }, [state.bookmark.id]);

  return (
    <div
      className="context-menu-layer"
      onClick={onClose}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div
        className={`context-menu-panel opens-${state.submenuDirection} opens-${state.submenuBlockDirection}`}
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
        <div
          ref={moveTriggerRef}
          className={`context-menu-item has-submenu ${moveMenuOpen ? "is-open" : ""}`}
          role="menuitem"
          tabIndex={0}
          onMouseEnter={positionMoveSubmenu}
          onMouseLeave={scheduleMoveMenuClose}
          onFocus={positionMoveSubmenu}
        >
          <span>移动</span>
          <span className="menu-chevron" aria-hidden="true" />
          <div
            ref={moveSubmenuRef}
            className="context-submenu move-submenu"
            role="menu"
            aria-label="移动到文件夹"
          >
            <FolderMoveSubmenuContent
              nodes={tree}
              recentFolders={recentFolders}
              snapshot={snapshot}
              query={moveFolderQuery}
              onQueryChange={setMoveFolderQuery}
              onRequestCloseMenu={onClose}
              onMove={(folder) => onMove(state.bookmark, folder)}
              onCreateFolder={(parentFolder) => onCreateFolder(state.bookmark, parentFolder)}
              onCascadeEnter={keepMoveCascadeOpen}
              onCascadeLeave={scheduleMoveCascadeClose}
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

function positionNestedSubmenu(trigger: HTMLElement | null, submenu: HTMLElement | null) {
  if (!trigger || !submenu) {
    return;
  }

  trigger.classList.remove("opens-left", "opens-right", "opens-up", "opens-down");
  const width = Math.max(submenu.offsetWidth || 260, 260);
  const height = Math.max(submenu.scrollHeight || submenu.offsetHeight || 180, 180);
  const placement = getCascadeMenuPlacement(
    trigger.getBoundingClientRect(),
    { width: window.innerWidth, height: window.innerHeight },
    { width, height }
  );

  trigger.classList.add(`opens-${placement.submenuDirection}`, `opens-${placement.submenuBlockDirection}`);
  submenu.style.maxHeight = `${placement.maxHeight}px`;
  submenu.style.overflowY = placement.needsScroll ? "auto" : "visible";
  submenu.style.overflowX = "hidden";
}

export function FolderContextMenu({
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
        className={`context-menu-panel opens-${state.submenuDirection} opens-${state.submenuBlockDirection}`}
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

export function FolderPickerDialog({
  state,
  tree,
  onChange,
  onClose,
  onMove,
  onCreateFolder
}: {
  state: FolderPickerDialogState;
  tree: BookmarkNode[];
  onChange(state: FolderPickerDialogState): void;
  onClose(): void;
  onMove(bookmark: BookmarkNode, folder: BookmarkNode): void;
  onCreateFolder(bookmark: BookmarkNode, parentFolder: BookmarkNode): void;
}) {
  const snapshot = createDraggedBookmarkSnapshot(state.bookmark);
  const folders = filterFolderOptions(flattenFolders(tree), state.query);
  const selectedFolder = state.selectedFolderId
    ? findNodeById(tree, state.selectedFolderId)
    : undefined;
  const canCreateInSelectedFolder = canCreateBookmarkInFolder(selectedFolder);
  const selectedFolderTitle = selectedFolder ? getDisplayTitle(selectedFolder) : "未选择位置";

  return (
    <div className="dialog-layer" role="presentation" onMouseDown={onClose}>
      <section
        className="bookmark-edit-dialog folder-picker-dialog"
        aria-label="搜索移动目标文件夹"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <h3>移动到文件夹</h3>
            <span>{state.bookmark.title || "Untitled"}</span>
          </div>
          <button type="button" aria-label="关闭文件夹搜索窗口" onClick={onClose}>
            Close
          </button>
        </div>
        <label className="folder-picker-search">
          搜索文件夹
          <input
            value={state.query}
            autoFocus
            placeholder="输入文件夹名称或路径"
            onChange={(event) => onChange({ ...state, query: event.target.value })}
          />
        </label>
        <div className="folder-picker-create">
          <div>
            <strong>新建目标文件夹</strong>
            <span>位置：{selectedFolderTitle}</span>
          </div>
          <button
            type="button"
            disabled={!canCreateInSelectedFolder || !selectedFolder}
            onClick={() => {
              if (selectedFolder && canCreateInSelectedFolder) {
                onCreateFolder(state.bookmark, selectedFolder);
              }
            }}
          >
            新建目标文件夹...
          </button>
        </div>
        <div className="folder-picker-list" role="listbox" aria-label="文件夹搜索结果">
          {folders.length === 0 ? (
            <div className="folder-picker-empty">没有匹配的文件夹</div>
          ) : (
            folders.map((option) => {
              const canMove = canMoveBookmarkToFolder(snapshot, option.node);
              const isCurrentParent = snapshot.parentId === option.id;
              const selected = state.selectedFolderId === option.id;

              return (
                <button
                  key={option.id}
                  className={`folder-picker-row ${selected ? "is-selected" : ""}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-disabled={!canMove}
                  disabled={!canMove}
                  onMouseEnter={() => {
                    if (canCreateBookmarkInFolder(option.node)) {
                      onChange({ ...state, selectedFolderId: option.id });
                    }
                  }}
                  onFocus={() => {
                    if (canCreateBookmarkInFolder(option.node)) {
                      onChange({ ...state, selectedFolderId: option.id });
                    }
                  }}
                  onClick={() => {
                    if (canMove) {
                      onMove(state.bookmark, option.node);
                    }
                  }}
                >
                  <span className="folder-glyph" aria-hidden="true" />
                  <span>
                    <strong>{option.title}</strong>
                    <small>{option.path}</small>
                  </span>
                  {isCurrentParent ? <em>当前位置</em> : null}
                </button>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export function NewBookmarkDraftCard({
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

export function NewFolderDialog({
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

export function ShortcutSettingsDialog({ onClose }: { onClose(): void }) {
  const [conflicts, setConflicts] = useState<QuickSaveShortcutCommandConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const nextConflicts = await getQuickSaveShortcutCommandConflicts();

        if (!cancelled) {
          setConflicts(nextConflicts);
        }
      } catch {
        if (!cancelled) {
          setStatus("无法读取 Chrome 快捷键冲突状态。");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function openShortcutSettings() {
    const shortcutsUrl = "chrome://extensions/shortcuts";

    if (typeof chrome !== "undefined" && chrome.tabs?.create) {
      void chrome.tabs.create({ url: shortcutsUrl });
      onClose();
      return;
    }

    window.open(shortcutsUrl, "_blank", "noopener,noreferrer");
    onClose();
  }

  return (
    <div className="dialog-layer" role="presentation" onMouseDown={onClose}>
      <section
        className="bookmark-edit-dialog shortcut-settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <h3 id="shortcut-settings-title">快捷键设置</h3>
            <span>默认命令快捷键：Ctrl + Shift + S</span>
          </div>
          <button type="button" aria-label="关闭快捷键设置窗口" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="shortcut-settings-body">
          <p>
            当前主入口是浏览器工具栏 popup：在普通网页点击 Bookmark Visualizer 图标后，可在“保存”
            Tab 保存当前网页。
          </p>
          <p>
            Ctrl + S 快捷键路线已暂停，不再默认注入全局网页 listener，也不再请求 http/https
            全局站点权限。Ctrl + Shift + S 仍保留为扩展命令入口，供后续诊断和低权限快捷保存使用。
          </p>
          <div className="shortcut-site-access">
            <span className="shortcut-site-label">Popup 保存</span>
            {loading ? (
              <strong>正在读取...</strong>
            ) : (
              <>
                <strong>已启用</strong>
                <span>通过 manifest action.default_popup 打开，不依赖站点 content script。</span>
              </>
            )}
          </div>
          {conflicts.length > 0 ? (
            <div className="shortcut-conflict-warning" role="status">
              Chrome 快捷键页里已有 Ctrl + S 绑定：
              {conflicts.map((conflict) => conflict.label).join("、")}。当前版本不依赖 Ctrl + S，
              如测试 popup 保存可先清除该绑定，避免误判入口行为。
            </div>
          ) : null}
          {status ? <div className="shortcut-status">{status}</div> : null}
        </div>
        <div className="dialog-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="primary-action" onClick={openShortcutSettings}>
            打开快捷键设置
          </button>
        </div>
      </section>
    </div>
  );
}

export function Toast({ toast, onClose }: { toast: ToastState; onClose(): void }) {
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
