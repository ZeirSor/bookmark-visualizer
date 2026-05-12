export function isViteDevHttpPage(): boolean {
  return (
    import.meta.env.DEV &&
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
