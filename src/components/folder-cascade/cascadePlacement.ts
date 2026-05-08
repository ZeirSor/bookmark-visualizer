import type { CSSProperties } from "react";
import { isFolder, type BookmarkNode } from "../../features/bookmarks";
import type {
  CascadeMenuAnchorRect,
  CascadeMenuPlacement,
  CascadeMenuSize
} from "../../features/context-menu";

export const FLOATING_CASCADE_WIDTH = 260;
export const FLOATING_CASCADE_MIN_HEIGHT = 180;
export const FLOATING_CASCADE_ROW_HEIGHT = 34;
export const FLOATING_CASCADE_PADDING = 12;

export function getMenuFolders(nodes: BookmarkNode[]): BookmarkNode[] {
  return nodes.flatMap((node) => {
    if (!isFolder(node)) {
      return [];
    }

    if (!node.parentId) {
      return getMenuFolders(node.children ?? []);
    }

    return [node];
  });
}

export function buildFolderMap(folders: BookmarkNode[]): Map<string, BookmarkNode> {
  const map = new Map<string, BookmarkNode>();

  function walk(nodes: BookmarkNode[]) {
    nodes.forEach((node) => {
      map.set(node.id, node);
      walk(getMenuFolders(node.children ?? []));
    });
  }

  walk(folders);
  return map;
}

export function estimateLayerSize(
  folder: BookmarkNode,
  canCreateFolder: boolean,
  menuWidth: number
): CascadeMenuSize {
  const rowCount = getMenuFolders(folder.children ?? []).length + (canCreateFolder ? 1 : 0);

  return {
    width: menuWidth,
    height: Math.max(
      FLOATING_CASCADE_MIN_HEIGHT,
      rowCount * FLOATING_CASCADE_ROW_HEIGHT + FLOATING_CASCADE_PADDING
    )
  };
}

export function rectToAnchor(rect: DOMRect): CascadeMenuAnchorRect {
  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left
  };
}

export function getViewport() {
  if (typeof window === "undefined") {
    return { width: 1024, height: 768 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
}

export function getFloatingLayerStyle(
  placement: CascadeMenuPlacement,
  zIndex: number
): CSSProperties {
  return {
    left: placement.x,
    top: placement.y,
    maxHeight: placement.maxHeight,
    overflowY: placement.needsScroll ? "auto" : "visible",
    overflowX: "hidden",
    zIndex
  };
}
