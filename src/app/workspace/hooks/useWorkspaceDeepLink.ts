import { useEffect, useRef } from "react";
import { findNodeById, type BookmarkNode } from "../../../features/bookmarks";

export function useWorkspaceDeepLink({
  tree,
  selectFolder,
  expandFolderPath,
  setHighlightedBookmarkId,
  setRetainedBreadcrumbTailIds
}: {
  tree: BookmarkNode[];
  selectFolder(folderId: string): void;
  expandFolderPath(folderId: string): void;
  setHighlightedBookmarkId(bookmarkId?: string): void;
  setRetainedBreadcrumbTailIds(ids: string[]): void;
}) {
  const deepLinkHandledRef = useRef(false);

  useEffect(() => {
    if (deepLinkHandledRef.current || tree.length === 0) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const folderId = params.get("folderId");
    const bookmarkId = params.get("bookmarkId");
    const linkedFolder = folderId ? findNodeById(tree, folderId) : undefined;

    if (linkedFolder?.children) {
      deepLinkHandledRef.current = true;
      setHighlightedBookmarkId(undefined);
      setRetainedBreadcrumbTailIds([]);
      selectFolder(linkedFolder.id);
      expandFolderPath(linkedFolder.id);
      return;
    }

    const linkedBookmark = bookmarkId ? findNodeById(tree, bookmarkId) : undefined;

    if (linkedBookmark?.url && linkedBookmark.parentId) {
      deepLinkHandledRef.current = true;
      setHighlightedBookmarkId(linkedBookmark.id);
      setRetainedBreadcrumbTailIds([]);
      selectFolder(linkedBookmark.parentId);
      expandFolderPath(linkedBookmark.parentId);
    }
  }, [expandFolderPath, selectFolder, setHighlightedBookmarkId, setRetainedBreadcrumbTailIds, tree]);
}
