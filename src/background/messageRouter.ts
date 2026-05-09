import { handleQuickSaveMessage } from "./quickSaveHandlers";
import {
  handlePageShortcutMessage,
  isPageShortcutRequest
} from "./pageShortcutHandlers";

export function registerMessageRouter(): void {
  chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
    const handler = isPageShortcutRequest(message)
      ? handlePageShortcutMessage(message, sender)
      : handleQuickSaveMessage(message);

    void handler
      .then(sendResponse)
      .catch((cause) => {
        sendResponse({ ok: false, error: getErrorMessage(cause, "快捷保存失败。") });
      });

    return true;
  });
}

function getErrorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}
