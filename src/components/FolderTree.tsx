import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent
} from "react";
import {
  canDragFolder,
  canDropBookmarkOnFolder,
  canDropFolderOnIntent,
  canReorderBookmarkOnIntent,
  createDraggedFolderSnapshot,
  getBookmarkTreeDropPosition,
  type BookmarkDropIntent,
  type DraggedBookmarkSnapshot,
  type DraggedFolderSnapshot,
  type FolderDropIntent,
  type FolderDropPosition
} from "../features/drag-drop";
import { getDisplayTitle, isBookmark, isFolder } from "../features/bookmarks";
import type { BookmarkNode } from "../features/bookmarks";

interface FolderTreeProps {
  nodes: BookmarkNode[];
  selectedFolderId?: string;
  showBookmarksInTree: boolean;
  expandedFolderIds: Set<string>;
  renamingFolderId?: string;
  draggedBookmark?: DraggedBookmarkSnapshot;
  draggedFolder?: DraggedFolderSnapshot;
  onSelectFolder(folderId: string): void;
  onToggleFolder(folderId: string): void;
  onSelectBookmark(bookmark: BookmarkNode): void;
  onBookmarkDragStart(bookmark: BookmarkNode): void;
  onBookmarkDragEnd(): void;
  onRenameFolder(folder: BookmarkNode, title: string): Promise<void>;
  onCancelRenameFolder(): void;
  onDropBookmark(folder: BookmarkNode): void;
  onDropBookmarkOnBookmark(intent: BookmarkDropIntent): void;
  onFolderDragStart(folder: BookmarkNode): void;
  onFolderDragEnd(): void;
  onDropFolder(intent: FolderDropIntent): void;
  onFolderContextMenu(folder: BookmarkNode, event: ReactMouseEvent<HTMLElement>): void;
}

export function FolderTree({
  nodes,
  selectedFolderId,
  showBookmarksInTree,
  expandedFolderIds,
  renamingFolderId,
  draggedBookmark,
  draggedFolder,
  onSelectFolder,
  onToggleFolder,
  onSelectBookmark,
  onBookmarkDragStart,
  onBookmarkDragEnd,
  onRenameFolder,
  onCancelRenameFolder,
  onDropBookmark,
  onDropBookmarkOnBookmark,
  onFolderDragStart,
  onFolderDragEnd,
  onDropFolder,
  onFolderContextMenu
}: FolderTreeProps) {
  const [activeBookmarkDropFolderId, setActiveBookmarkDropFolderId] = useState<string>();
  const [activeBookmarkReorderIntent, setActiveBookmarkReorderIntent] =
    useState<BookmarkDropIntent>();
  const [activeFolderDropIntent, setActiveFolderDropIntent] = useState<FolderDropIntent>();
  const treeRef = useRef<HTMLElement>(null);
  const pointerYRef = useRef<number | undefined>(undefined);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!draggedBookmark && !draggedFolder) {
      setActiveBookmarkDropFolderId(undefined);
      setActiveBookmarkReorderIntent(undefined);
      setActiveFolderDropIntent(undefined);
      stopAutoScroll();
    }

    return stopAutoScroll;
  }, [draggedBookmark, draggedFolder]);

  function stopAutoScroll() {
    pointerYRef.current = undefined;

    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }

  function updateAutoScroll(clientY: number) {
    if (!draggedBookmark && !draggedFolder) {
      stopAutoScroll();
      return;
    }

    pointerYRef.current = clientY;

    if (!animationFrameRef.current) {
      animationFrameRef.current = window.requestAnimationFrame(tickAutoScroll);
    }
  }

  function tickAutoScroll() {
    animationFrameRef.current = undefined;

    const treeElement = treeRef.current;
    const pointerY = pointerYRef.current;

    if (!treeElement || typeof pointerY !== "number") {
      return;
    }

    const bounds = treeElement.getBoundingClientRect();
    const edgeSize = 56;
    const maxSpeed = 16;
    let scrollDelta = 0;

    if (pointerY < bounds.top + edgeSize) {
      const intensity = 1 - Math.max(0, pointerY - bounds.top) / edgeSize;
      scrollDelta = -Math.ceil(intensity * maxSpeed);
    } else if (pointerY > bounds.bottom - edgeSize) {
      const intensity = 1 - Math.max(0, bounds.bottom - pointerY) / edgeSize;
      scrollDelta = Math.ceil(intensity * maxSpeed);
    }

    if (scrollDelta !== 0) {
      treeElement.scrollTop += scrollDelta;
      animationFrameRef.current = window.requestAnimationFrame(tickAutoScroll);
    }
  }

  function handleWheelDuringDrag(event: WheelEvent<HTMLElement>) {
    if (!draggedBookmark && !draggedFolder) {
      return;
    }

    const treeElement = treeRef.current;
    if (!treeElement || event.deltaY === 0) {
      return;
    }

    event.preventDefault();
    treeElement.scrollTop += event.deltaY;
    updateAutoScroll(event.clientY);
  }

  return (
    <nav
      ref={treeRef}
      className="folder-tree"
      aria-label="Bookmark folders"
      onDragOverCapture={(event) => updateAutoScroll(event.clientY)}
      onWheelCapture={handleWheelDuringDrag}
      onDragLeave={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setActiveBookmarkDropFolderId(undefined);
          setActiveBookmarkReorderIntent(undefined);
          setActiveFolderDropIntent(undefined);
          stopAutoScroll();
        }
      }}
      onDrop={() => {
        setActiveBookmarkDropFolderId(undefined);
        setActiveBookmarkReorderIntent(undefined);
        setActiveFolderDropIntent(undefined);
        stopAutoScroll();
      }}
    >
      {nodes.map((node) => (
        <FolderTreeNode
          key={node.id}
          node={node}
          level={0}
          selectedFolderId={selectedFolderId}
          showBookmarksInTree={showBookmarksInTree}
          expandedFolderIds={expandedFolderIds}
          renamingFolderId={renamingFolderId}
          draggedBookmark={draggedBookmark}
          draggedFolder={draggedFolder}
          activeBookmarkDropFolderId={activeBookmarkDropFolderId}
          activeBookmarkReorderIntent={activeBookmarkReorderIntent}
          activeFolderDropIntent={activeFolderDropIntent}
          tree={nodes}
          onSelectFolder={onSelectFolder}
          onToggleFolder={onToggleFolder}
          onSelectBookmark={onSelectBookmark}
          onBookmarkDragStart={onBookmarkDragStart}
          onBookmarkDragEnd={onBookmarkDragEnd}
          onRenameFolder={onRenameFolder}
          onCancelRenameFolder={onCancelRenameFolder}
          onDropBookmark={onDropBookmark}
          onDropBookmarkOnBookmark={onDropBookmarkOnBookmark}
          onFolderDragStart={onFolderDragStart}
          onFolderDragEnd={onFolderDragEnd}
          onDropFolder={onDropFolder}
          onFolderContextMenu={onFolderContextMenu}
          onActiveBookmarkDropFolderChange={setActiveBookmarkDropFolderId}
          onActiveBookmarkReorderIntentChange={setActiveBookmarkReorderIntent}
          onActiveFolderDropIntentChange={setActiveFolderDropIntent}
        />
      ))}
    </nav>
  );
}

interface FolderTreeNodeProps extends Omit<FolderTreeProps, "nodes"> {
  node: BookmarkNode;
  level: number;
  tree: BookmarkNode[];
  activeBookmarkDropFolderId?: string;
  activeBookmarkReorderIntent?: BookmarkDropIntent;
  activeFolderDropIntent?: FolderDropIntent;
  onActiveBookmarkDropFolderChange(folderId?: string): void;
  onActiveBookmarkReorderIntentChange(intent?: BookmarkDropIntent): void;
  onActiveFolderDropIntentChange(intent?: FolderDropIntent): void;
}

function FolderTreeNode({
  node,
  level,
  selectedFolderId,
  showBookmarksInTree,
  expandedFolderIds,
  renamingFolderId,
  draggedBookmark,
  draggedFolder,
  tree,
  activeBookmarkDropFolderId,
  activeBookmarkReorderIntent,
  activeFolderDropIntent,
  onSelectFolder,
  onToggleFolder,
  onSelectBookmark,
  onBookmarkDragStart,
  onBookmarkDragEnd,
  onRenameFolder,
  onCancelRenameFolder,
  onDropBookmark,
  onDropBookmarkOnBookmark,
  onFolderDragStart,
  onFolderDragEnd,
  onDropFolder,
  onFolderContextMenu,
  onActiveBookmarkDropFolderChange,
  onActiveBookmarkReorderIntentChange,
  onActiveFolderDropIntentChange
}: FolderTreeNodeProps) {
  if (isBookmark(node) && !showBookmarksInTree) {
    return null;
  }

  if (isBookmark(node)) {
    const activeBookmarkDropPosition =
      activeBookmarkReorderIntent?.targetBookmark.id === node.id
        ? activeBookmarkReorderIntent.position
        : undefined;

    function handleBookmarkDragStart(event: DragEvent<HTMLButtonElement>) {
      event.stopPropagation();
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", node.id);
      onBookmarkDragStart(node);
    }

    function getBookmarkDropIntent(event: DragEvent<HTMLButtonElement>): BookmarkDropIntent {
      const rect = event.currentTarget.getBoundingClientRect();
      return {
        targetBookmark: node,
        position: getBookmarkTreeDropPosition({ x: event.clientX, y: event.clientY }, rect)
      };
    }

    function handleBookmarkDragOver(event: DragEvent<HTMLButtonElement>) {
      event.stopPropagation();

      if (!draggedBookmark) {
        return;
      }

      const intent = getBookmarkDropIntent(event);
      onActiveBookmarkDropFolderChange(undefined);

      if (!canReorderBookmarkOnIntent(draggedBookmark, intent)) {
        onActiveBookmarkReorderIntentChange(undefined);
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      onActiveBookmarkReorderIntentChange(intent);
    }

    function handleBookmarkDragLeave(event: DragEvent<HTMLButtonElement>) {
      event.stopPropagation();

      const nextTarget = event.relatedTarget;
      if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
        return;
      }

      if (activeBookmarkReorderIntent?.targetBookmark.id === node.id) {
        onActiveBookmarkReorderIntentChange(undefined);
      }
    }

    function handleBookmarkDrop(event: DragEvent<HTMLButtonElement>) {
      event.stopPropagation();

      if (!draggedBookmark) {
        return;
      }

      const intent =
        activeBookmarkReorderIntent?.targetBookmark.id === node.id
          ? activeBookmarkReorderIntent
          : getBookmarkDropIntent(event);

      onActiveBookmarkReorderIntentChange(undefined);

      if (!canReorderBookmarkOnIntent(draggedBookmark, intent)) {
        return;
      }

      event.preventDefault();
      onDropBookmarkOnBookmark(intent);
    }

    function handleBookmarkDragEnd() {
      onActiveBookmarkReorderIntentChange(undefined);
      onBookmarkDragEnd();
    }

    return (
      <button
        className={`tree-row bookmark-row can-drag-bookmark ${
          activeBookmarkDropPosition ? `is-bookmark-drop-${activeBookmarkDropPosition}` : ""
        }`}
        style={{ "--level": level } as CSSProperties}
        type="button"
        draggable
        onClick={() => onSelectBookmark(node)}
        onDragStart={handleBookmarkDragStart}
        onDragEnd={handleBookmarkDragEnd}
        onDragOver={handleBookmarkDragOver}
        onDragLeave={handleBookmarkDragLeave}
        onDrop={handleBookmarkDrop}
      >
        <span className="bookmark-glyph" aria-hidden="true" />
        <span className="tree-title">{getDisplayTitle(node)}</span>
      </button>
    );
  }

  if (!isFolder(node)) {
    return null;
  }

  const isSelected = selectedFolderId === node.id;
  const displayTitle = node.parentId ? getDisplayTitle(node) : "Root";
  const expanded = expandedFolderIds.has(node.id);
  const isRenaming = renamingFolderId === node.id;
  const canDropBookmark = canDropBookmarkOnFolder(draggedBookmark, node);
  const isBookmarkDropTarget = canDropBookmark && activeBookmarkDropFolderId === node.id;
  const canDragCurrentFolder = canDragFolder(node);
  const activeFolderDropPosition =
    activeFolderDropIntent?.targetFolder.id === node.id ? activeFolderDropIntent.position : undefined;
  const visibleChildren = !node.parentId || expanded ? node.children : [];

  function handleDragEnter(event: DragEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (draggedFolder) {
      handleFolderDragOver(event);
      return;
    }

    if (!canDropBookmark) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    onActiveBookmarkReorderIntentChange(undefined);
    onActiveBookmarkDropFolderChange(node.id);
  }

  function handleDragOver(event: DragEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (draggedFolder) {
      handleFolderDragOver(event);
      return;
    }

    if (!canDropBookmark) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    onActiveBookmarkReorderIntentChange(undefined);
    if (activeBookmarkDropFolderId !== node.id) {
      onActiveBookmarkDropFolderChange(node.id);
    }
  }

  function handleFolderDragOver(event: DragEvent<HTMLButtonElement>) {
    if (!draggedFolder) {
      return;
    }

    const intent = {
      targetFolder: node,
      position: getFolderDropPosition(event)
    };

    if (!canDropFolderOnIntent(draggedFolder, intent, tree)) {
      onActiveFolderDropIntentChange(undefined);
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    onActiveFolderDropIntentChange(intent);
  }

  function handleDragLeave(event: DragEvent<HTMLButtonElement>) {
    event.stopPropagation();

    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    if (activeBookmarkDropFolderId === node.id) {
      onActiveBookmarkDropFolderChange(undefined);
    }

    if (activeFolderDropIntent?.targetFolder.id === node.id) {
      onActiveFolderDropIntentChange(undefined);
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (draggedFolder) {
      const intent = activeFolderDropIntent;
      onActiveFolderDropIntentChange(undefined);

      if (!intent || !canDropFolderOnIntent(draggedFolder, intent, tree)) {
        return;
      }

      event.preventDefault();
      onDropFolder(intent);
      return;
    }

    onActiveBookmarkDropFolderChange(undefined);

    if (!canDropBookmark) {
      return;
    }

    event.preventDefault();
    onDropBookmark(node);
  }

  function handleFolderClick() {
    onSelectFolder(node.id);
    onToggleFolder(node.id);
  }

  function handleFolderDragStart(event: DragEvent<HTMLButtonElement>) {
    if (!canDragCurrentFolder) {
      event.preventDefault();
      return;
    }

    event.stopPropagation();
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", node.id);
    onFolderDragStart(node);
  }

  return (
    <div>
      {node.parentId && isRenaming ? (
        <div
          className={`tree-row folder-row is-selected is-renaming ${
            canDragCurrentFolder ? "can-drag-folder" : ""
          }`}
          style={{ "--level": level } as CSSProperties}
        >
          <span
            className={`tree-caret ${expanded ? "is-expanded" : ""}`}
            aria-hidden="true"
          />
          <span className="folder-glyph" aria-hidden="true" />
          <FolderRenameInput
            folder={node}
            onSave={onRenameFolder}
            onCancel={onCancelRenameFolder}
          />
        </div>
      ) : node.parentId ? (
        <button
          className={`tree-row folder-row ${isSelected ? "is-selected" : ""} ${
            canDropBookmark ? "can-drop" : ""
          } ${isBookmarkDropTarget ? "is-drop-target" : ""} ${
            canDragCurrentFolder ? "can-drag-folder" : ""
          } ${activeFolderDropPosition ? `is-folder-drop-${activeFolderDropPosition}` : ""
          }`}
          style={{ "--level": level } as CSSProperties}
          type="button"
          draggable={canDragCurrentFolder}
          onClick={handleFolderClick}
          onContextMenu={(event) => onFolderContextMenu(node, event)}
          onDragStart={handleFolderDragStart}
          onDragEnd={onFolderDragEnd}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <span
            className={`tree-caret ${expanded ? "is-expanded" : ""}`}
            aria-hidden="true"
          />
          <span className="folder-glyph" aria-hidden="true" />
          <span className="tree-title">{displayTitle}</span>
        </button>
      ) : null}
      {visibleChildren?.map((child) => (
        <FolderTreeNode
          key={child.id}
          node={child}
          level={node.parentId ? level + 1 : level}
          selectedFolderId={selectedFolderId}
          showBookmarksInTree={showBookmarksInTree}
          expandedFolderIds={expandedFolderIds}
          renamingFolderId={renamingFolderId}
          draggedBookmark={draggedBookmark}
          draggedFolder={draggedFolder}
          tree={tree}
          activeBookmarkDropFolderId={activeBookmarkDropFolderId}
          activeBookmarkReorderIntent={activeBookmarkReorderIntent}
          activeFolderDropIntent={activeFolderDropIntent}
          onSelectFolder={onSelectFolder}
          onToggleFolder={onToggleFolder}
          onSelectBookmark={onSelectBookmark}
          onBookmarkDragStart={onBookmarkDragStart}
          onBookmarkDragEnd={onBookmarkDragEnd}
          onRenameFolder={onRenameFolder}
          onCancelRenameFolder={onCancelRenameFolder}
          onDropBookmark={onDropBookmark}
          onDropBookmarkOnBookmark={onDropBookmarkOnBookmark}
          onFolderDragStart={onFolderDragStart}
          onFolderDragEnd={onFolderDragEnd}
          onDropFolder={onDropFolder}
          onFolderContextMenu={onFolderContextMenu}
          onActiveBookmarkDropFolderChange={onActiveBookmarkDropFolderChange}
          onActiveBookmarkReorderIntentChange={onActiveBookmarkReorderIntentChange}
          onActiveFolderDropIntentChange={onActiveFolderDropIntentChange}
        />
      ))}
    </div>
  );
}

function FolderRenameInput({
  folder,
  onSave,
  onCancel
}: {
  folder: BookmarkNode;
  onSave(folder: BookmarkNode, title: string): Promise<void>;
  onCancel(): void;
}) {
  const [value, setValue] = useState(folder.title);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  async function save() {
    if (saving) {
      return;
    }

    setSaving(true);
    try {
      await onSave(folder, value);
    } catch {
      // The app shows validation feedback; keep the inline editor active.
    } finally {
      setSaving(false);
    }
  }

  return (
    <span className="folder-rename-editor">
      <input
        ref={inputRef}
        value={value}
        aria-label="重命名文件夹"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onBlur={() => void save()}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          event.stopPropagation();

          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
            return;
          }

          if (event.key === "Enter") {
            event.preventDefault();
            void save();
          }
        }}
      />
      <span>{saving ? "保存中..." : "Enter 保存，Esc 取消"}</span>
    </span>
  );
}

function getFolderDropPosition(event: DragEvent<HTMLElement>): FolderDropPosition {
  const bounds = event.currentTarget.getBoundingClientRect();
  const ratio = (event.clientY - bounds.top) / bounds.height;

  if (ratio < 0.25) {
    return "before";
  }

  if (ratio > 0.75) {
    return "after";
  }

  return "inside";
}
