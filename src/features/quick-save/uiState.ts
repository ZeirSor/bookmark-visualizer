import {
  filterRecentFolderIds,
  loadRecentFolderState,
  saveRecentFolder
} from "../recent-folders";

export interface QuickSaveUiState {
  uiStateVersion: 1;
  recentFolderIds: string[];
}

export const defaultQuickSaveUiState: QuickSaveUiState = {
  uiStateVersion: 1,
  recentFolderIds: []
};

export async function loadQuickSaveUiState(): Promise<QuickSaveUiState> {
  const state = await loadRecentFolderState();
  return {
    uiStateVersion: 1,
    recentFolderIds: state.folderIds
  };
}

export async function saveQuickSaveRecentFolder(folderId: string): Promise<QuickSaveUiState> {
  const state = await saveRecentFolder(folderId);
  return {
    uiStateVersion: 1,
    recentFolderIds: state.folderIds
  };
}

export { filterRecentFolderIds };
