import type { BookmarkNode } from "../bookmarks";
import type { QuickSaveCreateFolderPayload } from "./createFolder";

export const QUICK_SAVE_GET_INITIAL_STATE = "bookmark-visualizer.quickSave.getInitialState";
export const QUICK_SAVE_CREATE_BOOKMARK = "bookmark-visualizer.quickSave.createBookmark";
export const QUICK_SAVE_CREATE_FOLDER = "bookmark-visualizer.quickSave.createFolder";

export interface QuickSavePageDetails {
  url: string;
  title: string;
  previewImageUrl?: string;
}

export interface QuickSaveInitialState {
  tree: BookmarkNode[];
  defaultFolderId?: string;
}

export interface QuickSaveCreatePayload {
  parentId: string;
  title: string;
  url: string;
  note: string;
  previewImageUrl?: string;
}

export type QuickSaveRequest =
  | { type: typeof QUICK_SAVE_GET_INITIAL_STATE }
  | { type: typeof QUICK_SAVE_CREATE_BOOKMARK; payload: QuickSaveCreatePayload }
  | { type: typeof QUICK_SAVE_CREATE_FOLDER; payload: QuickSaveCreateFolderPayload };

export type QuickSaveResponse =
  | { ok: true; state: QuickSaveInitialState }
  | { ok: true; bookmarkId: string }
  | { ok: true; folder: BookmarkNode; state: QuickSaveInitialState }
  | { ok: false; error: string };
