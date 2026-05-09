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
  return saveBookmarkMetadata(bookmarkId, { note });
}

export async function saveBookmarkMetadata(
  bookmarkId: string,
  metadata: Partial<Pick<BookmarkMetadata, "note" | "previewImageUrl" | "pageKind" | "sourceUrl">>
): Promise<ExtensionMetadataState> {
  const state = await loadMetadataState();
  const existing = state.bookmarkMetadata[bookmarkId];
  const nextMetadata: BookmarkMetadata = {
    ...existing,
    summarySource: existing?.summarySource,
    updatedAt: Date.now()
  };

  if (hasMetadataField(metadata, "note")) {
    nextMetadata.note = metadata.note?.trim();
  }

  if (hasMetadataField(metadata, "previewImageUrl")) {
    nextMetadata.previewImageUrl = metadata.previewImageUrl?.trim() || undefined;
  }

  if (hasMetadataField(metadata, "pageKind")) {
    nextMetadata.pageKind = metadata.pageKind;
  }

  if (hasMetadataField(metadata, "sourceUrl")) {
    nextMetadata.sourceUrl = metadata.sourceUrl?.trim() || undefined;
  }

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

function hasMetadataField(
  metadata: Partial<Pick<BookmarkMetadata, "note" | "previewImageUrl" | "pageKind" | "sourceUrl">>,
  field: "note" | "previewImageUrl" | "pageKind" | "sourceUrl"
): boolean {
  return Object.prototype.hasOwnProperty.call(metadata, field);
}
