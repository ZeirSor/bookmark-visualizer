import type { MouseEvent as ReactMouseEvent } from "react";
import type { BookmarkNode } from "../../features/bookmarks";
import type {
  BookmarkDropIntent,
  DraggedBookmarkSnapshot,
  DraggedFolderSnapshot,
  FolderDropIntent
} from "../../features/drag-drop";

export interface FolderTreeProps {
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

export interface FolderTreeNodeProps extends Omit<FolderTreeProps, "nodes"> {
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
