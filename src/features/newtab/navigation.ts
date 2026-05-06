export async function openUrl(url: string, options: { newTab?: boolean } = {}): Promise<void> {
  if (typeof chrome !== "undefined" && chrome.tabs) {
    if (options.newTab && chrome.tabs.create) {
      await chrome.tabs.create({ url });
      return;
    }

    if (chrome.tabs.update) {
      await chrome.tabs.update({ url });
      return;
    }
  }

  if (options.newTab) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  window.location.assign(url);
}

export async function openWorkspace(path = "index.html"): Promise<void> {
  const url =
    typeof chrome !== "undefined" && chrome.runtime?.getURL ? chrome.runtime.getURL(path) : path;

  if (typeof chrome !== "undefined" && chrome.tabs?.create) {
    await chrome.tabs.create({ url });
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

export function buildWorkspaceFolderPath(folderId: string): string {
  return `index.html?folderId=${encodeURIComponent(folderId)}`;
}
