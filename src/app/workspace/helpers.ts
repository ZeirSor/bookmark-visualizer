import type { DragEvent } from "react";
import {
  getBookmarkCardDropPosition,
  type BookmarkDropPosition
} from "../../features/drag-drop";

export function getErrorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}

export function isValidBookmarkUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getTitleFromUrl(url: string): string {
  try {
    return new URL(url).hostname || "Untitled bookmark";
  } catch {
    return "Untitled bookmark";
  }
}

export function getBookmarkDropPositionFromEvent(
  event: DragEvent<HTMLElement>
): BookmarkDropPosition {
  const rect = event.currentTarget.getBoundingClientRect();
  return getBookmarkCardDropPosition(
    {
      x: event.clientX,
      y: event.clientY
    },
    {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left
    }
  );
}
