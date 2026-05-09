import { isMetadataInjectableUrl } from "../domain/page-kind";
import {
  SAVE_OVERLAY_CONTENT_FILE,
  SAVE_OVERLAY_OPEN_EXTENSION_PAGE,
  SAVE_OVERLAY_OPEN_SHORTCUT_SETTINGS,
  type SaveOverlayRequest,
  type SaveOverlayResponse
} from "../features/save-overlay";

const FALLBACK_SAVE_PAGE = "save.html";

let registered = false;

export function registerSaveExperienceHandlers(): void {
  if (registered) {
    return;
  }

  registered = true;
  chrome.action.onClicked.addListener((tab) => {
    void openSaveExperience(tab);
  });
}

export async function openSaveExperience(sourceTab?: chrome.tabs.Tab): Promise<void> {
  const tab = sourceTab?.id || sourceTab?.url ? sourceTab : await getCurrentTab();

  if (tab?.id && isMetadataInjectableUrl(tab.url)) {
    try {
      await injectSaveOverlay(tab.id);
      return;
    } catch {
      await openFallbackSavePage(tab);
      return;
    }
  }

  await openFallbackSavePage(tab);
}

export function isSaveExperienceRequest(message: unknown): message is SaveOverlayRequest {
  if (!hasMessageType(message)) {
    return false;
  }

  return (
    message.type === SAVE_OVERLAY_OPEN_EXTENSION_PAGE ||
    message.type === SAVE_OVERLAY_OPEN_SHORTCUT_SETTINGS
  );
}

export async function handleSaveExperienceMessage(
  message: SaveOverlayRequest
): Promise<SaveOverlayResponse> {
  if (message.type === SAVE_OVERLAY_OPEN_EXTENSION_PAGE) {
    await createTab(chrome.runtime.getURL(message.path));
    return { ok: true };
  }

  if (message.type === SAVE_OVERLAY_OPEN_SHORTCUT_SETTINGS) {
    await createTab("chrome://extensions/shortcuts");
    return { ok: true };
  }

  return { ok: false, error: "未知的保存浮层请求。" };
}

async function injectSaveOverlay(tabId: number): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.scripting?.executeScript) {
    throw new Error("当前环境不支持内容脚本注入。");
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: [SAVE_OVERLAY_CONTENT_FILE]
  });
}

async function openFallbackSavePage(tab?: chrome.tabs.Tab): Promise<void> {
  await createTab(buildFallbackSaveUrl(tab));
}

function buildFallbackSaveUrl(tab?: chrome.tabs.Tab): string {
  const url = new URL(chrome.runtime.getURL(FALLBACK_SAVE_PAGE));
  url.searchParams.set("saveExperience", "fallback");

  if (tab?.id) {
    url.searchParams.set("sourceTabId", String(tab.id));
  }

  if (tab?.windowId) {
    url.searchParams.set("sourceWindowId", String(tab.windowId));
  }

  if (tab?.url) {
    url.searchParams.set("sourceUrl", tab.url);
  }

  if (tab?.title) {
    url.searchParams.set("sourceTitle", tab.title);
  }

  if (tab?.favIconUrl) {
    url.searchParams.set("sourceFaviconUrl", tab.favIconUrl);
  }

  return url.href;
}

async function createTab(url: string): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.tabs?.create) {
    throw new Error("当前环境无法打开扩展页面。");
  }

  await chrome.tabs.create({ url, active: true });
}

async function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}

function hasMessageType(message: unknown): message is { type: string } {
  return typeof message === "object" && message !== null && "type" in message;
}
