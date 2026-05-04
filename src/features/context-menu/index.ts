export interface ContextMenuPoint {
  x: number;
  y: number;
}

export interface ContextMenuViewport {
  width: number;
  height: number;
}

export interface ContextMenuPlacement extends ContextMenuPoint {
  submenuDirection: "left" | "right";
  submenuBlockDirection: "up" | "down";
}

export interface CascadeMenuAnchorRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface CascadeMenuSize {
  width: number;
  height: number;
}

export interface CascadeMenuPlacement extends ContextMenuPoint {
  maxHeight: number;
  needsScroll: boolean;
  submenuDirection: "left" | "right";
  submenuBlockDirection: "up" | "down";
}

export interface CascadeRowBehavior {
  hasSubmenu: boolean;
  buttonDisabled: boolean;
  canSelect: boolean;
}

export const CASCADE_ROW_BUTTON_CLASS = "move-folder-button";

const EDGE_GAP = 12;
const SUBMENU_GAP = 6;
const MIN_CASCADE_HEIGHT = 140;

export function getContextMenuPlacement(
  point: ContextMenuPoint,
  viewport: ContextMenuViewport,
  menuSize = { width: 236, height: 150 },
  submenuSize = { width: 280, height: 360 }
): ContextMenuPlacement {
  const maxX = Math.max(EDGE_GAP, viewport.width - menuSize.width - EDGE_GAP);
  const maxY = Math.max(EDGE_GAP, viewport.height - menuSize.height - EDGE_GAP);
  const x = Math.min(Math.max(point.x, EDGE_GAP), maxX);
  const y = Math.min(Math.max(point.y, EDGE_GAP), maxY);
  const submenuDirection =
    x + menuSize.width + submenuSize.width + EDGE_GAP > viewport.width ? "left" : "right";
  const submenuBlockDirection =
    y + submenuSize.height + EDGE_GAP > viewport.height ? "up" : "down";

  return { x, y, submenuDirection, submenuBlockDirection };
}

export function getCascadeMenuPlacement(
  anchor: CascadeMenuAnchorRect,
  viewport: ContextMenuViewport,
  menuSize: CascadeMenuSize,
  options: { edgeGap?: number; gap?: number; minHeight?: number } = {}
): CascadeMenuPlacement {
  const edgeGap = options.edgeGap ?? EDGE_GAP;
  const gap = options.gap ?? SUBMENU_GAP;
  const minHeight = Math.min(options.minHeight ?? MIN_CASCADE_HEIGHT, viewport.height - edgeGap * 2);
  const rightSpace = viewport.width - anchor.right - gap - edgeGap;
  const leftSpace = anchor.left - gap - edgeGap;
  const opensLeft = rightSpace < menuSize.width && leftSpace > rightSpace;
  const rawX = opensLeft ? anchor.left - gap - menuSize.width : anchor.right + gap;
  const maxX = Math.max(edgeGap, viewport.width - menuSize.width - edgeGap);
  const x = Math.min(Math.max(rawX, edgeGap), maxX);

  const downSpace = Math.max(0, viewport.height - anchor.top - edgeGap);
  const upSpace = Math.max(0, anchor.bottom - edgeGap);
  const opensUp = menuSize.height > downSpace && upSpace > downSpace;
  const availableBlockSpace = Math.max(opensUp ? upSpace : downSpace, minHeight);
  const maxHeight = Math.min(menuSize.height, availableBlockSpace);
  const rawY = opensUp ? anchor.bottom - maxHeight : anchor.top;
  const maxY = Math.max(edgeGap, viewport.height - maxHeight - edgeGap);
  const y = Math.min(Math.max(rawY, edgeGap), maxY);

  return {
    x,
    y,
    maxHeight,
    needsScroll: menuSize.height > maxHeight,
    submenuDirection: opensLeft ? "left" : "right",
    submenuBlockDirection: opensUp ? "up" : "down"
  };
}

export function getCascadePathOnRowEnter(
  parentPath: string[],
  folderId: string,
  hasSubmenu: boolean
): string[] {
  return hasSubmenu ? [...parentPath, folderId] : [...parentPath];
}

export function getCascadeRowBehavior({
  selectable,
  nestedFolderCount,
  canCreateFolder
}: {
  selectable: boolean;
  nestedFolderCount: number;
  canCreateFolder: boolean;
}): CascadeRowBehavior {
  const hasSubmenu = nestedFolderCount > 0 || canCreateFolder;

  return {
    hasSubmenu,
    buttonDisabled: !selectable && !hasSubmenu,
    canSelect: selectable
  };
}

export function getCascadeButtonClassName(extraClassName?: string): string {
  return [CASCADE_ROW_BUTTON_CLASS, extraClassName].filter(Boolean).join(" ");
}
