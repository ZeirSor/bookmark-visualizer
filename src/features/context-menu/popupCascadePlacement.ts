import type { ContextMenuViewport } from "./index";

export interface PopupCascadeAnchorRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PopupCascadeRootPlacementOptions {
  rootWidth: number;
  columnWidth: number;
  preferredColumns: number;
  gap?: number;
  edgeGap?: number;
  menuHeight?: number;
  offset?: number;
}

export interface PopupCascadeRootPlacement {
  x: number;
  y: number;
  maxHeight: number;
}

export function getPopupCascadeRootPlacement(
  anchor: PopupCascadeAnchorRect,
  viewport: ContextMenuViewport,
  options: PopupCascadeRootPlacementOptions
): PopupCascadeRootPlacement {
  const gap = options.gap ?? 6;
  const edgeGap = options.edgeGap ?? 12;
  const offset = options.offset ?? 8;
  const menuHeight = options.menuHeight ?? 330;
  const totalWidth =
    options.rootWidth + (options.preferredColumns - 1) * (options.columnWidth + gap);
  const preferredX = anchor.right - options.rootWidth;
  const maxXWithRunway = viewport.width - totalWidth - edgeGap;
  const maxX = Math.max(edgeGap, maxXWithRunway);
  const x = clamp(preferredX, edgeGap, maxX);
  const belowY = anchor.bottom + offset;
  const maxHeightBelow = viewport.height - belowY - edgeGap;
  const shouldOpenUp = maxHeightBelow < Math.min(menuHeight, 180) && anchor.top > maxHeightBelow;
  const preferredY = shouldOpenUp ? anchor.top - menuHeight - offset : belowY;
  const maxHeight = Math.min(
    menuHeight,
    Math.max(180, shouldOpenUp ? anchor.top - edgeGap - offset : maxHeightBelow)
  );
  const y = clamp(preferredY, edgeGap, Math.max(edgeGap, viewport.height - maxHeight - edgeGap));

  return { x, y, maxHeight };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
