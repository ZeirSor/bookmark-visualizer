import { openSaveExperience } from "./saveExperienceHandlers";

export function registerCommandHandlers(): void {
  chrome.commands.onCommand.addListener((command, tab) => {
    if (command === "open-quick-save") {
      void openQuickSaveOnCurrentTab(tab);
    }
  });
}

async function openQuickSaveOnCurrentTab(commandTab?: chrome.tabs.Tab): Promise<void> {
  const tab = commandTab?.id ? commandTab : await getCurrentTab();
  await openSaveExperience(tab);
}

async function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}
