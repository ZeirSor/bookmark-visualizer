const SAVE_WINDOW_PATH = "save.html";
const SAVE_WINDOW_WIDTH = 960;
const SAVE_WINDOW_HEIGHT = 680;

let saveWindowId: number | undefined;
let saveWindowTabId: number | undefined;
let registered = false;

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

  const created = await chrome.windows.create({
    url,
    type: "popup",
    width: SAVE_WINDOW_WIDTH,
    height: SAVE_WINDOW_HEIGHT,
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
    }
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
    await chrome.windows.update(windowId, { focused: true });
  } catch {
    saveWindowId = undefined;
    saveWindowTabId = undefined;
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
