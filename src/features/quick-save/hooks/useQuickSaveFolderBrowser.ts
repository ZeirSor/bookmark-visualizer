import { useMemo, useState } from "react";
import {
  buildFolderBreadcrumbItems,
  canCreateBookmarkInFolder,
  filterFolderOptions,
  findNodeById,
  flattenFolders,
  getDisplayTitle,
  isFolder,
  type BookmarkNode,
  type FolderOption
} from "../../bookmarks";
import { QUICK_SAVE_CREATE_FOLDER, type QuickSaveInitialState } from "../types";
import { sendQuickSaveMessage } from "../quickSaveClient";

export function useQuickSaveFolderBrowser({
  setStatus
}: {
  setStatus(status: string): void;
}) {
  const [tree, setTree] = useState<BookmarkNode[]>([]);
  const [recentFolderIds, setRecentFolderIds] = useState<string[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [browsingFolderId, setBrowsingFolderId] = useState("");
  const [query, setQuery] = useState("");

  const rootId = useMemo(() => getRootFolderId(tree), [tree]);
  const folderOptions = useMemo(
    () => flattenFolders(tree).filter((option) => canCreateBookmarkInFolder(option.node)),
    [tree]
  );
  const folderOptionMap = useMemo(
    () => new Map(folderOptions.map((option) => [option.id, option])),
    [folderOptions]
  );
  const searchResults = useMemo(() => {
    const normalized = query.trim();
    return normalized ? filterFolderOptions(folderOptions, normalized).slice(0, 8) : [];
  }, [folderOptions, query]);
  const recentFolders = useMemo(
    () =>
      recentFolderIds
        .map((folderId) => folderOptionMap.get(folderId))
        .filter((option): option is FolderOption => Boolean(option))
        .slice(0, 5),
    [folderOptionMap, recentFolderIds]
  );
  const selectedFolder = selectedFolderId ? findNodeById(tree, selectedFolderId) : undefined;
  const selectedOption = selectedFolderId ? folderOptionMap.get(selectedFolderId) : undefined;
  const selectedFolderTitle = selectedFolder ? getDisplayTitle(selectedFolder) : "";
  const selectedPath = selectedOption?.path ?? selectedFolderTitle;
  const browsingFolder = browsingFolderId ? findNodeById(tree, browsingFolderId) : undefined;
  const browsingChildren = useMemo(
    () => getBrowsingFolders(tree, browsingFolderId || rootId),
    [browsingFolderId, rootId, tree]
  );
  const browsingBreadcrumbItems = useMemo(
    () => buildFolderBreadcrumbItems(tree, browsingFolderId || rootId),
    [browsingFolderId, rootId, tree]
  );

  function applyInitialState(state: QuickSaveInitialState) {
    const nextRootId = getRootFolderId(state.tree);
    const defaultFolder = state.defaultFolderId
      ? findNodeById(state.tree, state.defaultFolderId)
      : findFirstWritableFolder(state.tree);

    setTree(state.tree);
    setRecentFolderIds(state.recentFolderIds);

    if (defaultFolder && isFolder(defaultFolder)) {
      setSelectedFolderId(defaultFolder.id);
      setBrowsingFolderId(defaultFolder.parentId ?? nextRootId);
    } else {
      setBrowsingFolderId(nextRootId);
    }
  }

  function selectFolder(folder: BookmarkNode, syncBrowseToParent = false) {
    if (!canCreateBookmarkInFolder(folder)) {
      return;
    }

    setSelectedFolderId(folder.id);
    setStatus("");

    if (syncBrowseToParent) {
      setBrowsingFolderId(folder.parentId ?? rootId);
    }
  }

  function openFolder(folder: BookmarkNode) {
    if (!isFolder(folder)) {
      return;
    }

    setBrowsingFolderId(folder.id);
    setQuery("");
  }

  async function createFolder(parentFolder: BookmarkNode, folderTitle: string) {
    const title = folderTitle.trim();
    if (!title) {
      setStatus("文件夹名称不能为空。");
      return;
    }

    setStatus("");
    const response = await sendQuickSaveMessage({
      type: QUICK_SAVE_CREATE_FOLDER,
      payload: {
        parentId: parentFolder.id,
        title
      }
    });

    if (!response.ok || !("folder" in response)) {
      setStatus(response.ok ? "新建文件夹失败。" : response.error);
      return;
    }

    setTree(response.state.tree);
    setRecentFolderIds(response.state.recentFolderIds);
    setSelectedFolderId(response.folder.id);
    setBrowsingFolderId(response.folder.parentId ?? getRootFolderId(response.state.tree));
    setStatus(`已新建文件夹“${getDisplayTitle(response.folder)}”。`);
  }

  return {
    tree,
    query,
    setQuery,
    selectedFolderId,
    selectedFolderTitle,
    selectedPath,
    searchResults,
    recentFolders,
    browsingFolder,
    browsingChildren,
    browsingBreadcrumbItems,
    applyInitialState,
    selectFolder,
    openFolder,
    createFolder,
    setBrowsingFolderId
  };
}

function getRootFolderId(tree: BookmarkNode[]): string {
  return tree[0]?.id ?? "";
}

function findFirstWritableFolder(nodes: BookmarkNode[]): BookmarkNode | undefined {
  for (const node of nodes) {
    if (canCreateBookmarkInFolder(node)) {
      return node;
    }

    const nested = node.children ? findFirstWritableFolder(node.children) : undefined;
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function getBrowsingFolders(tree: BookmarkNode[], browsingFolderId: string): BookmarkNode[] {
  const rootId = getRootFolderId(tree);
  const folder = browsingFolderId ? findNodeById(tree, browsingFolderId) : undefined;

  if (!folder || folder.id === rootId) {
    return (tree[0]?.children ?? []).filter(isFolder);
  }

  return (folder.children ?? []).filter(isFolder);
}
