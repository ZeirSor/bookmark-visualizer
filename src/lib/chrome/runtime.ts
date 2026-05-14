export function hasChromeApi<K extends keyof typeof chrome>(apiName: K): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome[apiName]);
}

export function canUseChromeBookmarks(): boolean {
  return hasChromeApi("bookmarks") && typeof chrome.bookmarks.getTree === "function";
}

export function isViteDevHttpPage(): boolean {
  return (
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    (window.location.protocol === "http:" || window.location.protocol === "https:")
  );
}

export function isExtensionPage(): boolean {
  return (
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime?.id) &&
    window.location.protocol === "chrome-extension:"
  );
}
