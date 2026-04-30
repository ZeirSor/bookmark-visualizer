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
}

const EDGE_GAP = 12;

export function getContextMenuPlacement(
  point: ContextMenuPoint,
  viewport: ContextMenuViewport,
  menuSize = { width: 236, height: 150 },
  submenuWidth = 280
): ContextMenuPlacement {
  const maxX = Math.max(EDGE_GAP, viewport.width - menuSize.width - EDGE_GAP);
  const maxY = Math.max(EDGE_GAP, viewport.height - menuSize.height - EDGE_GAP);
  const x = Math.min(Math.max(point.x, EDGE_GAP), maxX);
  const y = Math.min(Math.max(point.y, EDGE_GAP), maxY);
  const submenuDirection = x + menuSize.width + submenuWidth > viewport.width ? "left" : "right";

  return { x, y, submenuDirection };
}
