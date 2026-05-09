import { loadSettings } from "../features/settings";

const SAVE_WINDOW_PATH = "save.html";
const SAVE_WINDOW_WIDTH = 960;
const SAVE_WINDOW_HEIGHT = 680;
const SAVE_WINDOW_BLUR_CLOSE_DELAY_MS = 450;

let saveWindowId: number | undefined;
let saveWindowTabId: number | undefined;
let registered = false;
let blurCloseTimer: ReturnType<typeof setTimeout> | undefined;

export async function openSaveWindowForTab(sourceTab?: chrome.tabs.Tab): Promise<void> {
  const tab = sourceTab?.id || sourceTab?.url ? sourceTab : await getCurrentTab();
  const url = buildSaveWindowUrl(tab);
  const existingTab = await findExistingSaveWindowTab();

  if (existingTab?.id) {
    saveWindowTabId = existingTab.id;
    saveWindowId = existingTab.windowId;
    await focusSaveWindow(existingTab.windowId);
    await chrome.tabs.update(existingTab.id, { active: true, url });
    return;
  }

  const position = await getCenteredSaveWindowPosition();
  const created = await chrome.windows.create({
    url,
    type: "popup",
    width: SAVE_WINDOW_WIDTH,
    height: SAVE_WINDOW_HEIGHT,
    ...position,
    focused: true
  });

  saveWindowId = created.id;
  saveWindowTabId = created.tabs?.[0]?.id;
}

export function registerSaveWindowAction(): void {
  if (registered) {
    return;
  }

  registered = true;
  chrome.action.onClicked.addListener((tab) => {
    void openSaveWindowForTab(tab);
  });

  chrome.windows.onRemoved.addListener((windowId) => {
    if (windowId === saveWindowId) {
      saveWindowId = undefined;
      saveWindowTabId = undefined;
      clearBlurCloseTimer();
    }
  });

  chrome.windows.onFocusChanged.addListener((focusedWindowId) => {
    void handleSaveWindowFocusChange(focusedWindowId);
  });
}

async function findExistingSaveWindowTab(): Promise<chrome.tabs.Tab | undefined> {
  const tracked = await getTrackedSaveWindowTab();
  if (tracked) {
    return tracked;
  }

  const saveWindowUrl = chrome.runtime.getURL(SAVE_WINDOW_PATH);
  try {
    const tabs = await chrome.tabs.query({ url: `${saveWindowUrl}*` });
    return tabs.find((tab) => isSaveWindowUrl(tab.url));
  } catch {
    const tabs = await chrome.tabs.query({});
    return tabs.find((tab) => isSaveWindowUrl(tab.url));
  }
}

async function getTrackedSaveWindowTab(): Promise<chrome.tabs.Tab | undefined> {
  if (!saveWindowTabId) {
    return undefined;
  }

  try {
    const tab = await chrome.tabs.get(saveWindowTabId);
    if (tab.id && isSaveWindowUrl(tab.url)) {
      saveWindowId = tab.windowId;
      return tab;
    }
  } catch {
    saveWindowId = undefined;
    saveWindowTabId = undefined;
  }

  return undefined;
}

async function focusSaveWindow(windowId?: number): Promise<void> {
  if (!windowId) {
    return;
  }

  try {
    clearBlurCloseTimer();
    await chrome.windows.update(windowId, { focused: true });
  } catch {
    saveWindowId = undefined;
    saveWindowTabId = undefined;
  }
}

async function handleSaveWindowFocusChange(focusedWindowId: number): Promise<void> {
  if (!saveWindowId || focusedWindowId === saveWindowId) {
    clearBlurCloseTimer();
    return;
  }

  const settings = await loadSettings();
  if (!settings.autoCloseSaveWindowOnBlur) {
    clearBlurCloseTimer();
    return;
  }

  clearBlurCloseTimer();
  blurCloseTimer = setTimeout(() => {
    void closeTrackedSaveWindow();
  }, SAVE_WINDOW_BLUR_CLOSE_DELAY_MS);
}

async function closeTrackedSaveWindow(): Promise<void> {
  if (!saveWindowId) {
    return;
  }

  const windowId = saveWindowId;
  try {
    await chrome.windows.remove(windowId);
    if (windowId === saveWindowId) {
      saveWindowId = undefined;
      saveWindowTabId = undefined;
    }
  } catch {
    if (windowId === saveWindowId) {
      saveWindowId = undefined;
      saveWindowTabId = undefined;
    }
  }
}

function clearBlurCloseTimer(): void {
  if (!blurCloseTimer) {
    return;
  }

  clearTimeout(blurCloseTimer);
  blurCloseTimer = undefined;
}

async function getCenteredSaveWindowPosition(): Promise<{ left: number; top: number }> {
  try {
    const baseWindow = await chrome.windows.getLastFocused();
    const baseLeft = baseWindow.left ?? 0;
    const baseTop = baseWindow.top ?? 0;
    const baseWidth = baseWindow.width ?? 1280;
    const baseHeight = baseWindow.height ?? 800;

    return {
      left: Math.max(0, Math.round(baseLeft + (baseWidth - SAVE_WINDOW_WIDTH) / 2)),
      top: Math.max(0, Math.round(baseTop + (baseHeight - SAVE_WINDOW_HEIGHT) / 2))
    };
  } catch {
    return { left: 0, top: 0 };
  }
}

function buildSaveWindowUrl(tab?: chrome.tabs.Tab): string {
  const url = new URL(chrome.runtime.getURL(SAVE_WINDOW_PATH));

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

function isSaveWindowUrl(url?: string): boolean {
  return Boolean(url?.startsWith(chrome.runtime.getURL(SAVE_WINDOW_PATH)));
}

async function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}
