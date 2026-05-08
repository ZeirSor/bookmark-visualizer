import type { CascadeBlurEvent } from "./types";

export const CASCADE_SUBMENU_CLOSE_DELAY_MS = 320;

export function handleCascadeBlur(event: CascadeBlurEvent, onBlurOutside: () => void) {
  const nextTarget = event.relatedTarget;

  if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
    onBlurOutside();
  }
}
