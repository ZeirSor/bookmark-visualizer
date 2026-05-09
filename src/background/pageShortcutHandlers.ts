import { loadSettings, saveSettings } from "../features/settings";
import {
  isPageShortcutRequest,
  isOpenPopupFromPageShortcutMessage,
  isSyncPageShortcutRegistrationMessage,
  PAGE_SHORTCUT_CONTENT_FILE,
  PAGE_SHORTCUT_CONTENT_SCRIPT_ID,
  PAGE_SHORTCUT_ORIGINS,
  type PageShortcutRequest,
  type PageShortcutResponse
} from "../features/page-shortcut";

export interface PageShortcutRegistrationDependencies {
  containsOrigins(origins: string[]): Promise<boolean>;
  getRegisteredContentScripts(
    filter: chrome.scripting.ContentScriptFilter
  ): Promise<chrome.scripting.RegisteredContentScript[]>;
  registerContentScripts(scripts: chrome.scripting.RegisteredContentScript[]): Promise<void>;
  unregisterContentScripts(filter: chrome.scripting.ContentScriptFilter): Promise<void>;
}

export function registerPageShortcutHandlers(): void {
  if (typeof chrome === "undefined") {
    return;
  }

  chrome.runtime?.onInstalled?.addListener(() => {
    void syncPageShortcutRegistrationFromSettings();
  });
  chrome.runtime?.onStartup?.addListener(() => {
    void syncPageShortcutRegistrationFromSettings();
  });
  chrome.permissions?.onRemoved?.addListener((permissions) => {
    const removedPageAccess = permissions.origins?.some((origin) =>
      PAGE_SHORTCUT_ORIGINS.includes(origin)
    );

    if (removedPageAccess) {
      void disablePageShortcutAfterPermissionRemoval();
    }
  });
}

export { isPageShortcutRequest };

export async function handlePageShortcutMessage(
  message: PageShortcutRequest,
  sender: chrome.runtime.MessageSender
): Promise<PageShortcutResponse> {
  try {
    if (isOpenPopupFromPageShortcutMessage(message)) {
      await openPopupFromSender(sender);
      return { ok: true };
    }

    if (isSyncPageShortcutRegistrationMessage(message)) {
      await syncPageShortcutContentScript(message.enabled);
      return { ok: true };
    }

    return { ok: false, error: "未知的页面快捷键请求。" };
  } catch (cause) {
    return {
      ok: false,
      error: cause instanceof Error ? cause.message : "页面快捷键处理失败。"
    };
  }
}

export async function syncPageShortcutRegistrationFromSettings(): Promise<void> {
  const settings = await loadSettings();
  await syncPageShortcutContentScript(settings.enablePageCtrlSShortcut);
}

export async function syncPageShortcutContentScript(
  enabled: boolean,
  dependencies = createChromeRegistrationDependencies()
): Promise<void> {
  if (!dependencies) {
    return;
  }

  const filter = { ids: [PAGE_SHORTCUT_CONTENT_SCRIPT_ID] };
  const registered = await dependencies.getRegisteredContentScripts(filter);

  if (!enabled || !(await dependencies.containsOrigins(PAGE_SHORTCUT_ORIGINS))) {
    if (registered.length > 0) {
      await dependencies.unregisterContentScripts(filter);
    }
    return;
  }

  if (registered.length > 0) {
    return;
  }

  await dependencies.registerContentScripts([
    {
      id: PAGE_SHORTCUT_CONTENT_SCRIPT_ID,
      matches: PAGE_SHORTCUT_ORIGINS,
      js: [PAGE_SHORTCUT_CONTENT_FILE],
      runAt: "document_start",
      allFrames: false
    }
  ]);
}

async function openPopupFromSender(sender: chrome.runtime.MessageSender): Promise<void> {
  if (!chrome.action?.openPopup) {
    throw new Error("当前浏览器不支持从页面快捷键打开 popup。");
  }

  const windowId = sender.tab?.windowId;
  await chrome.action.openPopup(
    typeof windowId === "number" ? { windowId } : undefined
  );
}

async function disablePageShortcutAfterPermissionRemoval(): Promise<void> {
  const settings = await loadSettings();

  if (settings.enablePageCtrlSShortcut) {
    await saveSettings({ ...settings, enablePageCtrlSShortcut: false });
  }

  await syncPageShortcutContentScript(false);
}

function createChromeRegistrationDependencies():
  | PageShortcutRegistrationDependencies
  | undefined {
  if (
    typeof chrome === "undefined" ||
    !chrome.permissions?.contains ||
    !chrome.scripting?.getRegisteredContentScripts ||
    !chrome.scripting?.registerContentScripts ||
    !chrome.scripting?.unregisterContentScripts
  ) {
    return undefined;
  }

  return {
    containsOrigins: (origins) => chrome.permissions.contains({ origins }),
    getRegisteredContentScripts: (filter) =>
      chrome.scripting.getRegisteredContentScripts(filter),
    registerContentScripts: (scripts) => chrome.scripting.registerContentScripts(scripts),
    unregisterContentScripts: (filter) => chrome.scripting.unregisterContentScripts(filter)
  };
}
