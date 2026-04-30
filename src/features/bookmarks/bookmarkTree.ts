import type { BookmarkNode, FolderOption } from "./types";

export interface BookmarkTreeMoveDestination {
  parentId: string;
  index?: number;
}

export function isBookmark(node: BookmarkNode): boolean {
  return Boolean(node.url);
}

export function isFolder(node: BookmarkNode): boolean {
  return !node.url && Array.isArray(node.children);
}

export function canRenameFolder(node: BookmarkNode | undefined): boolean {
  return Boolean(
    node &&
      isFolder(node) &&
      node.parentId &&
      node.parentId !== "0" &&
      !node.unmodifiable
  );
}

export function getDisplayTitle(node: BookmarkNode): string {
  return node.title.trim() || "Untitled";
}

export function flattenBookmarks(nodes: BookmarkNode[]): BookmarkNode[] {
  return nodes.flatMap((node) => {
    const current = isBookmark(node) ? [node] : [];
    const children = node.children ? flattenBookmarks(node.children) : [];
    return [...current, ...children];
  });
}

export function flattenFolders(nodes: BookmarkNode[], parentPath = ""): FolderOption[] {
  return nodes.flatMap((node) => {
    if (!isFolder(node)) {
      return [];
    }

    const title = node.parentId ? getDisplayTitle(node) : "Root";
    const path = parentPath ? `${parentPath} / ${title}` : title;
    const current = node.parentId ? [{ id: node.id, title, path, node }] : [];
    const children = node.children ? flattenFolders(node.children, path) : [];

    return [...current, ...children];
  });
}

export function collectFolderIds(nodes: BookmarkNode[]): string[] {
  return nodes.flatMap((node) => {
    if (!isFolder(node)) {
      return [];
    }

    return [node.id, ...collectFolderIds(node.children ?? [])];
  });
}

export function findNodeById(nodes: BookmarkNode[], id: string): BookmarkNode | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    const match = node.children ? findNodeById(node.children, id) : undefined;
    if (match) {
      return match;
    }
  }

  return undefined;
}

export function getDirectBookmarks(folder?: BookmarkNode): BookmarkNode[] {
  if (!folder?.children) {
    return [];
  }

  return folder.children.filter(isBookmark);
}

export function buildFolderPathMap(nodes: BookmarkNode[]): Map<string, string> {
  const pathMap = new Map<string, string>();

  function walk(node: BookmarkNode, parentPath: string) {
    const title = node.parentId ? getDisplayTitle(node) : "Root";
    const currentPath = parentPath ? `${parentPath} / ${title}` : title;

    if (isFolder(node)) {
      pathMap.set(node.id, currentPath);
      node.children?.forEach((child) => walk(child, currentPath));
      return;
    }

    if (node.parentId) {
      pathMap.set(node.id, parentPath);
    }
  }

  nodes.forEach((node) => walk(node, ""));
  return pathMap;
}

export function moveNodeInBookmarkTree(
  tree: BookmarkNode[],
  id: string,
  destination: BookmarkTreeMoveDestination
): BookmarkNode[] {
  const nextTree = structuredClone(tree);
  const detached = detachNode(nextTree, id);

  if (!detached) {
    return tree;
  }

  const targetFolder = findNodeById(nextTree, destination.parentId);
  if (!targetFolder?.children) {
    return tree;
  }

  const sameParent = detached.node.parentId === destination.parentId;
  const requestedIndex =
    typeof destination.index === "number" ? destination.index : targetFolder.children.length;
  const adjustedIndex =
    sameParent &&
    typeof detached.previousIndex === "number" &&
    detached.previousIndex < requestedIndex
      ? requestedIndex - 1
      : requestedIndex;
  const nextIndex = clampIndex(adjustedIndex, targetFolder.children.length);

  detached.node.parentId = destination.parentId;
  targetFolder.children.splice(nextIndex, 0, detached.node);
  reindex(targetFolder.children);

  return nextTree;
}

export function insertNodeInBookmarkTree(
  tree: BookmarkNode[],
  node: BookmarkNode,
  parentId: string,
  index?: number
): BookmarkNode[] {
  const nextTree = structuredClone(tree);
  const targetFolder = findNodeById(nextTree, parentId);

  if (!targetFolder?.children) {
    return tree;
  }

  const nextNode = structuredClone(node);
  nextNode.parentId = parentId;

  const nextIndex = clampIndex(
    typeof index === "number" ? index : targetFolder.children.length,
    targetFolder.children.length
  );

  targetFolder.children.splice(nextIndex, 0, nextNode);
  reindex(targetFolder.children);

  return nextTree;
}

export function removeNodeFromBookmarkTree(tree: BookmarkNode[], id: string): BookmarkNode[] {
  const nextTree = structuredClone(tree);
  const detached = detachNode(nextTree, id);

  return detached ? nextTree : tree;
}

interface DetachedNode {
  node: BookmarkNode;
  previousIndex?: number;
}

function detachNode(nodes: BookmarkNode[], id: string): DetachedNode | undefined {
  for (const node of nodes) {
    if (!node.children) {
      continue;
    }

    const index = node.children.findIndex((child) => child.id === id);
    if (index >= 0) {
      const [removed] = node.children.splice(index, 1);
      reindex(node.children);
      return { node: removed, previousIndex: index };
    }

    const nested = detachNode(node.children, id);
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function reindex(nodes: BookmarkNode[]) {
  nodes.forEach((node, index) => {
    node.index = index;
  });
}

function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(index, length));
}
