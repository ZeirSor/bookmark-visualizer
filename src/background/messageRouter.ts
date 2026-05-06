import { handleQuickSaveMessage } from "./quickSaveHandlers";

export function registerMessageRouter(): void {
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    void handleQuickSaveMessage(message)
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
