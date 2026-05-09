export const SAVE_OVERLAY_OPEN_EXTENSION_PAGE =
  "bookmark-visualizer.saveOverlay.openExtensionPage";
export const SAVE_OVERLAY_OPEN_SHORTCUT_SETTINGS =
  "bookmark-visualizer.saveOverlay.openShortcutSettings";

export type SaveOverlayExtensionPage = "index.html" | `index.html?${string}`;

export type SaveOverlayRequest =
  | {
      type: typeof SAVE_OVERLAY_OPEN_EXTENSION_PAGE;
      path: SaveOverlayExtensionPage;
    }
  | {
      type: typeof SAVE_OVERLAY_OPEN_SHORTCUT_SETTINGS;
    };

export type SaveOverlayResponse = { ok: true } | { ok: false; error: string };
