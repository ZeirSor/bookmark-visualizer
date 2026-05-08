import { useState } from "react";
import type {
  BookmarkDropIntent,
  DraggedBookmarkSnapshot,
  DraggedFolderSnapshot
} from "../../../features/drag-drop";

export function useWorkspaceDragDrop() {
  const [draggedBookmark, setDraggedBookmark] = useState<DraggedBookmarkSnapshot>();
  const [draggedFolder, setDraggedFolder] = useState<DraggedFolderSnapshot>();
  const [activeBookmarkDropIntent, setActiveBookmarkDropIntent] = useState<BookmarkDropIntent>();

  function handleBookmarkDragEnd() {
    setDraggedBookmark(undefined);
    setActiveBookmarkDropIntent(undefined);
  }

  return {
    draggedBookmark,
    setDraggedBookmark,
    draggedFolder,
    setDraggedFolder,
    activeBookmarkDropIntent,
    setActiveBookmarkDropIntent,
    handleBookmarkDragEnd
  };
}
