import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type MouseEvent as ReactMouseEvent
} from "react";
import {
  canDragFolder,
  canDropBookmarkOnFolder,
  canDropFolderOnIntent,
  createDraggedFolderSnapshot,
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
  draggedBookmark?: DraggedBookmarkSnapshot;
  draggedFolder?: DraggedFolderSnapshot;
  onSelectFolder(folderId: string): void;
  onToggleFolder(folderId: string): void;
  onSelectBookmark(bookmark: BookmarkNode): void;
  onDropBookmark(folder: BookmarkNode): void;
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
  draggedBookmark,
  draggedFolder,
  onSelectFolder,
  onToggleFolder,
  onSelectBookmark,
  onDropBookmark,
  onFolderDragStart,
  onFolderDragEnd,
  onDropFolder,
  onFolderContextMenu
}: FolderTreeProps) {
  const [activeBookmarkDropFolderId, setActiveBookmarkDropFolderId] = useState<string>();
  const [activeFolderDropIntent, setActiveFolderDropIntent] = useState<FolderDropIntent>();
  const treeRef = useRef<HTMLElement>(null);
  const pointerYRef = useRef<number | undefined>(undefined);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!draggedBookmark && !draggedFolder) {
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

  return (
    <nav
      ref={treeRef}
      className="folder-tree"
      aria-label="Bookmark folders"
      onDragOverCapture={(event) => updateAutoScroll(event.clientY)}
      onDragLeave={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setActiveBookmarkDropFolderId(undefined);
          setActiveFolderDropIntent(undefined);
          stopAutoScroll();
        }
      }}
      onDrop={() => {
        setActiveBookmarkDropFolderId(undefined);
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
          draggedBookmark={draggedBookmark}
          draggedFolder={draggedFolder}
          activeBookmarkDropFolderId={activeBookmarkDropFolderId}
          activeFolderDropIntent={activeFolderDropIntent}
          tree={nodes}
          onSelectFolder={onSelectFolder}
          onToggleFolder={onToggleFolder}
          onSelectBookmark={onSelectBookmark}
          onDropBookmark={onDropBookmark}
          onFolderDragStart={onFolderDragStart}
          onFolderDragEnd={onFolderDragEnd}
          onDropFolder={onDropFolder}
          onFolderContextMenu={onFolderContextMenu}
          onActiveBookmarkDropFolderChange={setActiveBookmarkDropFolderId}
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
  activeFolderDropIntent?: FolderDropIntent;
  onActiveBookmarkDropFolderChange(folderId?: string): void;
  onActiveFolderDropIntentChange(intent?: FolderDropIntent): void;
}

function FolderTreeNode({
  node,
  level,
  selectedFolderId,
  showBookmarksInTree,
  expandedFolderIds,
  draggedBookmark,
  draggedFolder,
  tree,
  activeBookmarkDropFolderId,
  activeFolderDropIntent,
  onSelectFolder,
  onToggleFolder,
  onSelectBookmark,
  onDropBookmark,
  onFolderDragStart,
  onFolderDragEnd,
  onDropFolder,
  onFolderContextMenu,
  onActiveBookmarkDropFolderChange,
  onActiveFolderDropIntentChange
}: FolderTreeNodeProps) {
  if (isBookmark(node) && !showBookmarksInTree) {
    return null;
  }

  if (isBookmark(node)) {
    return (
      <button
        className="tree-row bookmark-row"
        style={{ "--level": level } as CSSProperties}
        type="button"
        onClick={() => onSelectBookmark(node)}
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
      {node.parentId ? (
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
          draggedBookmark={draggedBookmark}
          draggedFolder={draggedFolder}
          tree={tree}
          activeBookmarkDropFolderId={activeBookmarkDropFolderId}
          activeFolderDropIntent={activeFolderDropIntent}
          onSelectFolder={onSelectFolder}
          onToggleFolder={onToggleFolder}
          onSelectBookmark={onSelectBookmark}
          onDropBookmark={onDropBookmark}
          onFolderDragStart={onFolderDragStart}
          onFolderDragEnd={onFolderDragEnd}
          onDropFolder={onDropFolder}
          onFolderContextMenu={onFolderContextMenu}
          onActiveBookmarkDropFolderChange={onActiveBookmarkDropFolderChange}
          onActiveFolderDropIntentChange={onActiveFolderDropIntentChange}
        />
      ))}
    </div>
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
