export function trapFocus(event: KeyboardEvent, root: ShadowRoot) {
  const focusable = Array.from(
    root.querySelectorAll<HTMLElement>("button, input, textarea, [tabindex]:not([tabindex='-1'])")
  ).filter((element) => !element.hasAttribute("disabled"));

  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && root.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && root.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
