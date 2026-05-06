import { storageAdapter } from "../../lib/chrome";
import type { FolderOption } from "../bookmarks";

const RECENT_FOLDERS_KEY = "bookmarkVisualizerRecentFolders";
const LEGACY_QUICK_SAVE_UI_STATE_KEY = "bookmarkVisualizerQuickSaveUiState";
const MAX_RECENT_FOLDERS = 8;

interface LegacyQuickSaveUiState {
  uiStateVersion?: number;
  recentFolderIds?: string[];
}

export interface RecentFolderState {
  version: 1;
  folderIds: string[];
}

export const defaultRecentFolderState: RecentFolderState = {
  version: 1,
  folderIds: []
};

export async function loadRecentFolderState(): Promise<RecentFolderState> {
  const result = await storageAdapter.get<{
    [RECENT_FOLDERS_KEY]: RecentFolderState;
    [LEGACY_QUICK_SAVE_UI_STATE_KEY]?: LegacyQuickSaveUiState;
  }>({
    [RECENT_FOLDERS_KEY]: defaultRecentFolderState,
    [LEGACY_QUICK_SAVE_UI_STATE_KEY]: undefined
  });

  const currentState = normalizeRecentFolderState(result[RECENT_FOLDERS_KEY]);
  if (currentState.folderIds.length > 0) {
    return currentState;
  }

  const legacyFolderIds = normalizeRecentFolderIds(
    result[LEGACY_QUICK_SAVE_UI_STATE_KEY]?.recentFolderIds ?? []
  );
  if (legacyFolderIds.length === 0) {
    return currentState;
  }

  const migratedState: RecentFolderState = {
    version: 1,
    folderIds: legacyFolderIds
  };
  await storageAdapter.set({ [RECENT_FOLDERS_KEY]: migratedState });
  return migratedState;
}

export async function saveRecentFolder(folderId: string): Promise<RecentFolderState> {
  const state = await loadRecentFolderState();
  const folderIds = normalizeRecentFolderIds([folderId, ...state.folderIds]);
  const nextState: RecentFolderState = {
    version: 1,
    folderIds
  };

  await storageAdapter.set({ [RECENT_FOLDERS_KEY]: nextState });
  return nextState;
}

export function normalizeRecentFolderIds(
  folderIds: string[],
  limit = MAX_RECENT_FOLDERS
): string[] {
  const seen = new Set<string>();
  const recentFolderIds: string[] = [];

  for (const folderId of folderIds) {
    const normalized = folderId.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    recentFolderIds.push(normalized);

    if (recentFolderIds.length >= limit) {
      break;
    }
  }

  return recentFolderIds;
}

export function filterRecentFolderIds(
  folderIds: string[],
  canUseFolder: (folderId: string) => boolean,
  limit = MAX_RECENT_FOLDERS
): string[] {
  return normalizeRecentFolderIds(folderIds).filter(canUseFolder).slice(0, limit);
}

export function resolveRecentFolderOptions(
  folderOptions: FolderOption[],
  folderIds: string[],
  limit = MAX_RECENT_FOLDERS
): FolderOption[] {
  const folderOptionMap = new Map(folderOptions.map((option) => [option.id, option]));

  return normalizeRecentFolderIds(folderIds)
    .map((folderId) => folderOptionMap.get(folderId))
    .filter((option): option is FolderOption => Boolean(option))
    .slice(0, limit);
}

function normalizeRecentFolderState(state?: RecentFolderState): RecentFolderState {
  return {
    version: 1,
    folderIds: normalizeRecentFolderIds(state?.folderIds ?? [])
  };
}
