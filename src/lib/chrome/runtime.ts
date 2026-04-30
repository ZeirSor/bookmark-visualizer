export function hasChromeApi<K extends keyof typeof chrome>(apiName: K): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome[apiName]);
}

export function canUseChromeBookmarks(): boolean {
  return hasChromeApi("bookmarks") && typeof chrome.bookmarks.getTree === "function";
}
