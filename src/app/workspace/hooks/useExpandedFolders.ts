import { useEffect, useState } from "react";
import { buildFolderBreadcrumbItems, collectFolderIds, type BookmarkNode } from "../../../features/bookmarks";

export function useExpandedFolders(tree: BookmarkNode[]) {
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const folderIds = collectFolderIds(tree);
    const availableFolderIds = new Set(folderIds);

    setExpandedFolderIds((current) => {
      if (folderIds.length === 0) {
        return current.size === 0 ? current : new Set();
      }

      const next = new Set([...current].filter((id) => availableFolderIds.has(id)));

      if (next.size === 0) {
        return new Set(folderIds);
      }

      return next;
    });
  }, [tree]);

  function toggleFolderExpanded(folderId: string) {
    setExpandedFolderIds((current) => {
      const next = new Set(current);

      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }

      return next;
    });
  }

  function expandAllFolders() {
    setExpandedFolderIds(new Set(collectFolderIds(tree)));
  }

  function collapseAllFolders() {
    setExpandedFolderIds(new Set());
  }

  function expandFolders(...folderIds: Array<string | undefined>) {
    setExpandedFolderIds((current) => {
      const next = new Set(current);

      folderIds.forEach((folderId) => {
        if (folderId) {
          next.add(folderId);
        }
      });

      return next;
    });
  }

  function expandFolderPath(folderId: string) {
    const pathItems = buildFolderBreadcrumbItems(tree, folderId);
    expandFolders(...pathItems.map((item) => item.id));
  }

  return {
    expandedFolderIds,
    toggleFolderExpanded,
    expandAllFolders,
    collapseAllFolders,
    expandFolders,
    expandFolderPath
  };
}
