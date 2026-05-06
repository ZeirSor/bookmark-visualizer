import { injectQuickSaveDialog, isQuickSaveInjectableUrl } from "../features/quick-save";
import { openWorkspace } from "./openWorkspace";

export function registerCommandHandlers(): void {
  chrome.commands.onCommand.addListener((command, tab) => {
    if (command === "open-quick-save") {
      void openQuickSaveOnCurrentTab(tab);
    }
  });
}

async function openQuickSaveOnCurrentTab(commandTab?: chrome.tabs.Tab): Promise<void> {
  const tab = commandTab?.id ? commandTab : await getCurrentTab();
  if (!tab?.id || !isQuickSaveInjectableUrl(tab.url)) {
    await openWorkspace({ quickSave: "unsupported" }, tab);
    return;
  }

  try {
    await injectQuickSaveDialog(tab.id);
  } catch {
    await openWorkspace({ quickSave: "unsupported" }, tab);
  }
}

async function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}
