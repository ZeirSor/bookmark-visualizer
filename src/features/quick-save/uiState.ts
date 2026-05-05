import { storageAdapter } from "../../lib/chrome";

const QUICK_SAVE_UI_STATE_KEY = "bookmarkVisualizerQuickSaveUiState";
const MAX_RECENT_FOLDERS = 5;

export interface QuickSaveUiState {
  uiStateVersion: 1;
  recentFolderIds: string[];
}

export const defaultQuickSaveUiState: QuickSaveUiState = {
  uiStateVersion: 1,
  recentFolderIds: []
};

export async function loadQuickSaveUiState(): Promise<QuickSaveUiState> {
  const result = await storageAdapter.get<{ [QUICK_SAVE_UI_STATE_KEY]: QuickSaveUiState }>({
    [QUICK_SAVE_UI_STATE_KEY]: defaultQuickSaveUiState
  });

  return normalizeQuickSaveUiState(result[QUICK_SAVE_UI_STATE_KEY]);
}

export async function saveQuickSaveRecentFolder(folderId: string): Promise<QuickSaveUiState> {
  const state = await loadQuickSaveUiState();
  const recentFolderIds = normalizeRecentFolderIds([folderId, ...state.recentFolderIds]);
  const nextState: QuickSaveUiState = {
    uiStateVersion: 1,
    recentFolderIds
  };

  await storageAdapter.set({ [QUICK_SAVE_UI_STATE_KEY]: nextState });
  return nextState;
}

export function filterRecentFolderIds(
  recentFolderIds: string[],
  canUseFolder: (folderId: string) => boolean
): string[] {
  return normalizeRecentFolderIds(recentFolderIds).filter(canUseFolder);
}

function normalizeQuickSaveUiState(state?: QuickSaveUiState): QuickSaveUiState {
  return {
    uiStateVersion: 1,
    recentFolderIds: normalizeRecentFolderIds(state?.recentFolderIds ?? [])
  };
}

function normalizeRecentFolderIds(folderIds: string[]): string[] {
  const seen = new Set<string>();
  const recentFolderIds: string[] = [];

  for (const folderId of folderIds) {
    const normalized = folderId.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    recentFolderIds.push(normalized);

    if (recentFolderIds.length >= MAX_RECENT_FOLDERS) {
      break;
    }
  }

  return recentFolderIds;
}
