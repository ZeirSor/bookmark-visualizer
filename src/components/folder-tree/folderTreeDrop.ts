import type { FolderDropPosition } from "../../features/drag-drop";

export interface FolderDropBounds {
  top: number;
  height: number;
}

export function getFolderDropPosition(
  pointerY: number,
  bounds: FolderDropBounds
): FolderDropPosition {
  const ratio = (pointerY - bounds.top) / bounds.height;

  if (ratio < 0.25) {
    return "before";
  }

  if (ratio > 0.75) {
    return "after";
  }

  return "inside";
}
