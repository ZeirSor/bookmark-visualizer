import { storageAdapter } from "../../lib/chrome";
import type { BookmarkMetadata, ExtensionMetadataState } from "./index";

const METADATA_KEY = "bookmarkVisualizerMetadata";

export const defaultMetadataState: ExtensionMetadataState = {
  metadataVersion: 1,
  bookmarkMetadata: {}
};

export async function loadMetadataState(): Promise<ExtensionMetadataState> {
  const result = await storageAdapter.get<{ [METADATA_KEY]: ExtensionMetadataState }>({
    [METADATA_KEY]: defaultMetadataState
  });

  return normalizeMetadataState(result[METADATA_KEY]);
}

export async function saveBookmarkNote(
  bookmarkId: string,
  note: string
): Promise<ExtensionMetadataState> {
  const state = await loadMetadataState();
  const trimmedNote = note.trim();
  const nextMetadata: BookmarkMetadata = {
    ...state.bookmarkMetadata[bookmarkId],
    note: trimmedNote,
    summarySource: state.bookmarkMetadata[bookmarkId]?.summarySource,
    updatedAt: Date.now()
  };

  const nextState: ExtensionMetadataState = {
    ...state,
    bookmarkMetadata: {
      ...state.bookmarkMetadata,
      [bookmarkId]: nextMetadata
    }
  };

  await storageAdapter.set({ [METADATA_KEY]: nextState });
  return nextState;
}

export async function saveMetadataState(state: ExtensionMetadataState): Promise<void> {
  await storageAdapter.set({ [METADATA_KEY]: normalizeMetadataState(state) });
}

function normalizeMetadataState(state?: ExtensionMetadataState): ExtensionMetadataState {
  return {
    metadataVersion: 1,
    bookmarkMetadata: state?.bookmarkMetadata ?? {}
  };
}
