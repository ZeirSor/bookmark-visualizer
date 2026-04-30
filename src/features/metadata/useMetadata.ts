import { useCallback, useEffect, useState } from "react";
import {
  defaultMetadataState,
  loadMetadataState,
  saveBookmarkNote,
  saveMetadataState
} from "./metadataService";
import type { ExtensionMetadataState } from "./index";

export function useMetadata() {
  const [metadata, setMetadata] = useState<ExtensionMetadataState>(defaultMetadataState);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setMetadata(await loadMetadataState());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const updateNote = useCallback(async (bookmarkId: string, note: string) => {
    const next = await saveBookmarkNote(bookmarkId, note);
    setMetadata(next);
  }, []);

  const replaceMetadata = useCallback(async (next: ExtensionMetadataState) => {
    await saveMetadataState(next);
    setMetadata(next);
  }, []);

  return {
    metadata,
    loading,
    reload,
    updateNote,
    replaceMetadata
  };
}
