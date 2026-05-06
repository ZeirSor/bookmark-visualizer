import { loadSettings } from "../settings";

const NEW_TAB_URLS = new Set(["chrome://newtab/", "edge://newtab/"]);
const redirectingTabIds = new Set<number>();

export interface NewTabRedirectTab {
  id?: number;
  url?: string;
  pendingUrl?: string;
  incognito?: boolean;
}

export interface NewTabRedirectDependencies {
  loadSettings(): Promise<{ newTabOverrideEnabled: boolean }>;
  getExtensionUrl(path: string): string;
  updateTab(tabId: number, properties: { url: string }): Promise<unknown> | unknown;
  releaseTabId(tabId: number, release: () => void): void;
}

export function registerNewTabRedirect(): void {
  if (
    typeof chrome === "undefined" ||
    !chrome.tabs?.onCreated ||
    !chrome.tabs?.onUpdated ||
    !chrome.tabs?.update ||
    !chrome.runtime?.getURL
  ) {
    return;
  }

  chrome.tabs.onCreated.addListener((tab) => {
    void maybeRedirectNewTab(tab);
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo.url && !tab.pendingUrl) {
      return;
    }

    void maybeRedirectNewTab({ ...tab, id: tabId });
  });
}

export async function maybeRedirectNewTab(
  tab: NewTabRedirectTab,
  dependencies = createChromeRedirectDependencies()
): Promise<boolean> {
  const tabId = tab.id;

  if (typeof tabId !== "number" || redirectingTabIds.has(tabId) || tab.incognito) {
    return false;
  }

  if (!isBrowserNewTab(tab)) {
    return false;
  }

  const settings = await dependencies.loadSettings();

  if (!settings.newTabOverrideEnabled) {
    return false;
  }

  const targetUrl = dependencies.getExtensionUrl("newtab.html");

  if (tab.url === targetUrl || tab.pendingUrl === targetUrl) {
    return false;
  }

  redirectingTabIds.add(tabId);

  try {
    await dependencies.updateTab(tabId, { url: targetUrl });
    dependencies.releaseTabId(tabId, () => redirectingTabIds.delete(tabId));
    return true;
  } catch (error) {
    redirectingTabIds.delete(tabId);
    throw error;
  }
}

export function isBrowserNewTab(tab: NewTabRedirectTab): boolean {
  const url = tab.pendingUrl || tab.url || "";
  return NEW_TAB_URLS.has(url);
}

function createChromeRedirectDependencies(): NewTabRedirectDependencies {
  return {
    loadSettings,
    getExtensionUrl: (path) => chrome.runtime.getURL(path),
    updateTab: (tabId, properties) => chrome.tabs.update(tabId, properties),
    releaseTabId: (_tabId, release) => {
      setTimeout(release, 1000);
    }
  };
}
