import {
  SAVE_OVERLAY_OPEN_EXTENSION_PAGE,
  SAVE_OVERLAY_OPEN_SHORTCUT_SETTINGS,
  type SaveOverlayExtensionPage,
  type SaveOverlayRequest,
  type SaveOverlayResponse
} from "./types";

export async function openOverlayExtensionPage(path: SaveOverlayExtensionPage): Promise<void> {
  await sendSaveOverlayRequest({
    type: SAVE_OVERLAY_OPEN_EXTENSION_PAGE,
    path
  });
}

export async function openOverlayShortcutSettings(): Promise<void> {
  await sendSaveOverlayRequest({
    type: SAVE_OVERLAY_OPEN_SHORTCUT_SETTINGS
  });
}

async function sendSaveOverlayRequest(message: SaveOverlayRequest): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    throw new Error("当前环境不支持扩展消息。");
  }

  const response = (await chrome.runtime.sendMessage(message)) as SaveOverlayResponse;
  if (!response.ok) {
    throw new Error(response.error);
  }
}
