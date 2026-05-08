import { type CSSProperties, type DragEvent } from "react";
import { getDisplayTitle, type BookmarkNode } from "../../features/bookmarks";
import {
  canReorderBookmarkOnIntent,
  getBookmarkTreeDropPosition,
  type BookmarkDropIntent,
  type DraggedBookmarkSnapshot
} from "../../features/drag-drop";

export function FolderTreeBookmarkRow({
  bookmark,
  level,
  draggedBookmark,
  activeBookmarkReorderIntent,
  onSelectBookmark,
  onBookmarkDragStart,
  onBookmarkDragEnd,
  onDropBookmarkOnBookmark,
  onActiveBookmarkDropFolderChange,
  onActiveBookmarkReorderIntentChange
}: {
  bookmark: BookmarkNode;
  level: number;
  draggedBookmark?: DraggedBookmarkSnapshot;
  activeBookmarkReorderIntent?: BookmarkDropIntent;
  onSelectBookmark(bookmark: BookmarkNode): void;
  onBookmarkDragStart(bookmark: BookmarkNode): void;
  onBookmarkDragEnd(): void;
  onDropBookmarkOnBookmark(intent: BookmarkDropIntent): void;
  onActiveBookmarkDropFolderChange(folderId?: string): void;
  onActiveBookmarkReorderIntentChange(intent?: BookmarkDropIntent): void;
}) {
  const activeBookmarkDropPosition =
    activeBookmarkReorderIntent?.targetBookmark.id === bookmark.id
      ? activeBookmarkReorderIntent.position
      : undefined;

  function handleBookmarkDragStart(event: DragEvent<HTMLButtonElement>) {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", bookmark.id);
    onBookmarkDragStart(bookmark);
  }

  function getBookmarkDropIntent(event: DragEvent<HTMLButtonElement>): BookmarkDropIntent {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      targetBookmark: bookmark,
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

    if (activeBookmarkReorderIntent?.targetBookmark.id === bookmark.id) {
      onActiveBookmarkReorderIntentChange(undefined);
    }
  }

  function handleBookmarkDrop(event: DragEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (!draggedBookmark) {
      return;
    }

    const intent =
      activeBookmarkReorderIntent?.targetBookmark.id === bookmark.id
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
      onClick={() => onSelectBookmark(bookmark)}
      onDragStart={handleBookmarkDragStart}
      onDragEnd={handleBookmarkDragEnd}
      onDragOver={handleBookmarkDragOver}
      onDragLeave={handleBookmarkDragLeave}
      onDrop={handleBookmarkDrop}
    >
      <span className="bookmark-glyph" aria-hidden="true" />
      <span className="tree-title">{getDisplayTitle(bookmark)}</span>
    </button>
  );
}
