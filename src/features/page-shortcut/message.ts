export const PAGE_SHORTCUT_CONTENT_SCRIPT_ID = "bookmark-visualizer-page-shortcut";
export const PAGE_SHORTCUT_CONTENT_FILE = "page-shortcut-content.js";
export const PAGE_SHORTCUT_ORIGINS = ["http://*/*", "https://*/*"];
export const OPEN_POPUP_FROM_PAGE_SHORTCUT =
  "bookmark-visualizer.openPopupFromPageShortcut";
export const SYNC_PAGE_SHORTCUT_REGISTRATION =
  "bookmark-visualizer.syncPageShortcutRegistration";

export interface OpenPopupFromPageShortcutMessage {
  type: typeof OPEN_POPUP_FROM_PAGE_SHORTCUT;
}

export interface SyncPageShortcutRegistrationMessage {
  type: typeof SYNC_PAGE_SHORTCUT_REGISTRATION;
  enabled: boolean;
}

export type PageShortcutRequest =
  | OpenPopupFromPageShortcutMessage
  | SyncPageShortcutRegistrationMessage;

export type PageShortcutResponse =
  | { ok: true }
  | { ok: false; error: string };

export function isOpenPopupFromPageShortcutMessage(
  message: unknown
): message is OpenPopupFromPageShortcutMessage {
  return hasType(message, OPEN_POPUP_FROM_PAGE_SHORTCUT);
}

export function isSyncPageShortcutRegistrationMessage(
  message: unknown
): message is SyncPageShortcutRegistrationMessage {
  return (
    hasType(message, SYNC_PAGE_SHORTCUT_REGISTRATION) &&
    typeof (message as { enabled?: unknown }).enabled === "boolean"
  );
}

export function isPageShortcutRequest(message: unknown): message is PageShortcutRequest {
  return (
    isOpenPopupFromPageShortcutMessage(message) ||
    isSyncPageShortcutRegistrationMessage(message)
  );
}

function hasType(message: unknown, type: string): message is { type: string } {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as { type?: unknown }).type === type
  );
}
