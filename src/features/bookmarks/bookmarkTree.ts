import type { BookmarkNode, FolderOption } from "./types";

export function isBookmark(node: BookmarkNode): boolean {
  return Boolean(node.url);
}

export function isFolder(node: BookmarkNode): boolean {
  return !node.url && Array.isArray(node.children);
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
