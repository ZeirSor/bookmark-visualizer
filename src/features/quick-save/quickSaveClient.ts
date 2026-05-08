import type { QuickSaveResponse } from "./types";

export function sendQuickSaveMessage(message: unknown): Promise<QuickSaveResponse> {
  return chrome.runtime.sendMessage(message) as Promise<QuickSaveResponse>;
}
