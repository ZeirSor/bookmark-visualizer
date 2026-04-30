import { useCallback, useEffect, useMemo, useState } from "react";
import { bookmarksAdapter } from "../../lib/chrome";
import {
  buildFolderPathMap,
  findNodeById,
  flattenFolders,
  getDirectBookmarks
} from "./bookmarkTree";
import type { BookmarkNode } from "./types";

interface UseBookmarksState {
  tree: BookmarkNode[];
  folders: ReturnType<typeof flattenFolders>;
  folderPathMap: Map<string, string>;
  selectedFolder?: BookmarkNode;
  selectedFolderId?: string;
  selectedBookmarks: BookmarkNode[];
  loading: boolean;
  error?: string;
  reload(): Promise<void>;
  selectFolder(folderId: string): void;
  updateTree(updater: (tree: BookmarkNode[]) => BookmarkNode[]): void;
}

export function useBookmarks(): UseBookmarksState {
  const [tree, setTree] = useState<BookmarkNode[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const nextTree = await bookmarksAdapter.getTree();
      const folders = flattenFolders(nextTree);

      setTree(nextTree);
      setSelectedFolderId((current) => current ?? folders[0]?.id);
      setError(undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load bookmarks.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTree = useCallback((updater: (tree: BookmarkNode[]) => BookmarkNode[]) => {
    setTree((current) => updater(current));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function guardedLoad() {
      await loadBookmarks();

      if (cancelled) {
        return;
      }
    }

    void guardedLoad();

    return () => {
      cancelled = true;
    };
  }, [loadBookmarks]);

  const folders = useMemo(() => flattenFolders(tree), [tree]);
  const folderPathMap = useMemo(() => buildFolderPathMap(tree), [tree]);
  const selectedFolder = useMemo(
    () => (selectedFolderId ? findNodeById(tree, selectedFolderId) : undefined),
    [selectedFolderId, tree]
  );
  const selectedBookmarks = useMemo(() => getDirectBookmarks(selectedFolder), [selectedFolder]);

  return {
    tree,
    folders,
    folderPathMap,
    selectedFolder,
    selectedFolderId,
    selectedBookmarks,
    loading,
    error,
    reload: loadBookmarks,
    selectFolder: setSelectedFolderId,
    updateTree
  };
}
