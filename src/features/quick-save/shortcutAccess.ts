import { permissionsAdapter } from "../../lib/chrome";

export const QUICK_SAVE_CONTENT_FILE = "quick-save-content.js";

export interface QuickSaveShortcutAccessTarget {
  tabId?: number;
  url: string;
  hostname: string;
  originPattern: string;
  hasAccess: boolean;
}

export interface QuickSaveShortcutCommandConflict {
  name: string;
  label: string;
  shortcut: string;
}

interface WorkspaceSource {
  tabId?: number;
  url?: string;
}

export function getQuickSaveOriginPattern(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }

    return `${parsed.protocol}//${parsed.hostname}/*`;
  } catch {
    return undefined;
  }
}

export function getQuickSaveHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function isQuickSaveInjectableUrl(url?: string): boolean {
  return Boolean(url && getQuickSaveOriginPattern(url));
}

export function getWorkspaceSource(search: string): WorkspaceSource {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const rawTabId = params.get("sourceTabId");
  const tabId = rawTabId && /^\d+$/.test(rawTabId) ? Number(rawTabId) : undefined;
  const url = params.get("sourceUrl") ?? undefined;

  return { tabId, url };
}

export async function getQuickSaveShortcutAccessTarget(
  search = typeof window !== "undefined" ? window.location.search : ""
): Promise<QuickSaveShortcutAccessTarget | undefined> {
  const source = getWorkspaceSource(search);
  const tab = source.tabId ? await getTab(source.tabId) : undefined;
  const recentTab = tab ?? (source.url ? undefined : await getMostRecentInjectableTab());
  const url = recentTab?.url ?? source.url;
  const originPattern = url ? getQuickSaveOriginPattern(url) : undefined;

  if (!url || !originPattern) {
    return undefined;
  }

  return {
    tabId: recentTab?.id ?? source.tabId,
    url,
    hostname: getQuickSaveHostname(url),
    originPattern,
    hasAccess: await permissionsAdapter.containsOrigins([originPattern])
  };
}

export async function requestQuickSaveShortcutAccess(
  target: QuickSaveShortcutAccessTarget
): Promise<boolean> {
  if (target.hasAccess) {
    return true;
  }

  return permissionsAdapter.requestOrigins([target.originPattern]);
}

export async function removeQuickSaveShortcutAccess(
  target: QuickSaveShortcutAccessTarget
): Promise<boolean> {
  return permissionsAdapter.removeOrigins([target.originPattern]);
}

export async function getGrantedQuickSaveShortcutOrigins(): Promise<string[]> {
  return (await permissionsAdapter.getAllOrigins())
    .map((origin) => normalizeGrantedQuickSaveOrigin(origin))
    .filter((origin): origin is string => Boolean(origin));
}

export function normalizeGrantedQuickSaveOrigin(origin: string): string | undefined {
  if (!origin.startsWith("http://") && !origin.startsWith("https://")) {
    return undefined;
  }

  return origin.endsWith("/*") ? origin : getQuickSaveOriginPattern(origin);
}

export async function injectQuickSaveDialog(tabId: number): Promise<void> {
  if (!canUseScriptingExecuteScript()) {
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: [QUICK_SAVE_CONTENT_FILE]
  });
}

export async function getQuickSaveShortcutCommandConflicts(): Promise<
  QuickSaveShortcutCommandConflict[]
> {
  if (typeof chrome === "undefined" || !chrome.commands?.getAll) {
    return [];
  }

  const commands = await chrome.commands.getAll();
  return commands
    .filter((command) => isCtrlSShortcut(command.shortcut))
    .map((command) => ({
      name: command.name ?? "",
      label: getCommandLabel(command),
      shortcut: command.shortcut ?? ""
    }));
}

export function isCtrlSShortcut(shortcut?: string): boolean {
  const normalized = shortcut?.replace(/\s+/g, "").toLocaleLowerCase();
  return normalized === "ctrl+s" || normalized === "command+s";
}

function getCommandLabel(command: chrome.commands.Command): string {
  if (command.name === "_execute_action") {
    return "Activate the extension";
  }

  if (command.name === "open-quick-save") {
    return command.description ?? "Save the current page to Bookmark Visualizer";
  }

  return command.description ?? command.name ?? "Unknown command";
}

async function getTab(tabId: number): Promise<chrome.tabs.Tab | undefined> {
  if (typeof chrome === "undefined" || !chrome.tabs?.get) {
    return undefined;
  }

  try {
    const tab = await chrome.tabs.get(tabId);
    return isQuickSaveInjectableUrl(tab.url) ? tab : undefined;
  } catch {
    return undefined;
  }
}

async function getMostRecentInjectableTab(): Promise<chrome.tabs.Tab | undefined> {
  if (typeof chrome === "undefined" || !chrome.tabs?.query) {
    return undefined;
  }

  const tabs = await chrome.tabs.query({});
  return tabs
    .filter((tab) => isQuickSaveInjectableUrl(tab.url))
    .sort((left, right) => (right.lastAccessed ?? 0) - (left.lastAccessed ?? 0))[0];
}

function canUseScriptingExecuteScript(): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome.scripting?.executeScript);
}
