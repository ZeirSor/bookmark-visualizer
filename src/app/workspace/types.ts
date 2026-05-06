import type { BookmarkNode } from "../../features/bookmarks";
import type { ContextMenuPlacement } from "../../features/context-menu";

export interface ToastState {
  message: string;
  actionLabel?: string;
  action?: () => Promise<void>;
}

export interface OperationLogEntry {
  id: string;
  title: string;
  detail: string;
  createdAt: number;
  status: "ready" | "undone" | "failed";
  undo?: () => Promise<void>;
}

export interface BookmarkContextMenuState extends ContextMenuPlacement {
  bookmark: BookmarkNode;
}

export interface FolderContextMenuState extends ContextMenuPlacement {
  folder: BookmarkNode;
}

export interface NewFolderDialogState {
  parentFolder: BookmarkNode;
  name: string;
  bookmarkToMove?: BookmarkNode;
}

export interface NewBookmarkDraftState {
  parentId: string;
  index: number;
  title: string;
  url: string;
}

export interface FolderPickerDialogState {
  bookmark: BookmarkNode;
  query: string;
  selectedFolderId?: string;
}
