import { useEffect, useRef, useState, type CSSProperties, type DragEvent } from "react";
import { canDropBookmarkOnFolder, type DraggedBookmarkSnapshot } from "../features/drag-drop";
import { getDisplayTitle, isBookmark, isFolder } from "../features/bookmarks";
import type { BookmarkNode } from "../features/bookmarks";

interface FolderTreeProps {
  nodes: BookmarkNode[];
  selectedFolderId?: string;
  showBookmarksInTree: boolean;
  expandedFolderIds: Set<string>;
  draggedBookmark?: DraggedBookmarkSnapshot;
  onSelectFolder(folderId: string): void;
  onToggleFolder(folderId: string): void;
  onSelectBookmark(bookmark: BookmarkNode): void;
  onDropBookmark(folder: BookmarkNode): void;
}

export function FolderTree({
  nodes,
  selectedFolderId,
  showBookmarksInTree,
  expandedFolderIds,
  draggedBookmark,
  onSelectFolder,
  onToggleFolder,
  onSelectBookmark,
  onDropBookmark
}: FolderTreeProps) {
  const [activeDropFolderId, setActiveDropFolderId] = useState<string>();
  const treeRef = useRef<HTMLElement>(null);
  const pointerYRef = useRef<number | undefined>(undefined);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!draggedBookmark) {
      stopAutoScroll();
    }

    return stopAutoScroll;
  }, [draggedBookmark]);

  function stopAutoScroll() {
    pointerYRef.current = undefined;

    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }

  function updateAutoScroll(clientY: number) {
    if (!draggedBookmark) {
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
          setActiveDropFolderId(undefined);
          stopAutoScroll();
        }
      }}
      onDrop={() => {
        setActiveDropFolderId(undefined);
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
          activeDropFolderId={activeDropFolderId}
          onSelectFolder={onSelectFolder}
          onToggleFolder={onToggleFolder}
          onSelectBookmark={onSelectBookmark}
          onDropBookmark={onDropBookmark}
          onActiveDropFolderChange={setActiveDropFolderId}
        />
      ))}
    </nav>
  );
}

interface FolderTreeNodeProps extends Omit<FolderTreeProps, "nodes"> {
  node: BookmarkNode;
  level: number;
  activeDropFolderId?: string;
  onActiveDropFolderChange(folderId?: string): void;
}

function FolderTreeNode({
  node,
  level,
  selectedFolderId,
  showBookmarksInTree,
  expandedFolderIds,
  draggedBookmark,
  activeDropFolderId,
  onSelectFolder,
  onToggleFolder,
  onSelectBookmark,
  onDropBookmark,
  onActiveDropFolderChange
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
  const canDrop = canDropBookmarkOnFolder(draggedBookmark, node);
  const isDropTarget = canDrop && activeDropFolderId === node.id;
  const visibleChildren = !node.parentId || expanded ? node.children : [];

  function handleDragEnter(event: DragEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (!canDrop) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    onActiveDropFolderChange(node.id);
  }

  function handleDragOver(event: DragEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (!canDrop) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (activeDropFolderId !== node.id) {
      onActiveDropFolderChange(node.id);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLButtonElement>) {
    event.stopPropagation();

    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    if (activeDropFolderId === node.id) {
      onActiveDropFolderChange(undefined);
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onActiveDropFolderChange(undefined);

    if (!canDrop) {
      return;
    }

    event.preventDefault();
    onDropBookmark(node);
  }

  function handleFolderClick() {
    onSelectFolder(node.id);
    onToggleFolder(node.id);
  }

  return (
    <div>
      {node.parentId ? (
        <button
          className={`tree-row folder-row ${isSelected ? "is-selected" : ""} ${
            canDrop ? "can-drop" : ""
          } ${isDropTarget ? "is-drop-target" : ""
          }`}
          style={{ "--level": level } as CSSProperties}
          type="button"
          onClick={handleFolderClick}
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
          activeDropFolderId={activeDropFolderId}
          onSelectFolder={onSelectFolder}
          onToggleFolder={onToggleFolder}
          onSelectBookmark={onSelectBookmark}
          onDropBookmark={onDropBookmark}
          onActiveDropFolderChange={onActiveDropFolderChange}
        />
      ))}
    </div>
  );
}
