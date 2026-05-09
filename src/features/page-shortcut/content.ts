import { OPEN_POPUP_FROM_PAGE_SHORTCUT } from "./message";

window.addEventListener(
  "keydown",
  (event) => {
    if (!isPageSaveShortcut(event) || isEditableTarget(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    void chrome.runtime
      .sendMessage({ type: OPEN_POPUP_FROM_PAGE_SHORTCUT })
      .catch(() => undefined);
  },
  true
);

function isPageSaveShortcut(event: KeyboardEvent): boolean {
  return (
    !event.repeat &&
    (event.ctrlKey || event.metaKey) &&
    !event.shiftKey &&
    !event.altKey &&
    event.key.toLocaleLowerCase() === "s"
  );
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.closest("[contenteditable=''], [contenteditable='true']") !== null ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}
