export async function openWorkspace(
  params: Record<string, string> = {},
  sourceTab?: chrome.tabs.Tab
): Promise<void> {
  const workspaceParams = new URLSearchParams(params);
  if (sourceTab?.id && isHttpPageUrl(sourceTab.url)) {
    workspaceParams.set("sourceTabId", String(sourceTab.id));
    workspaceParams.set("sourceUrl", sourceTab.url ?? "");
  }

  const query = workspaceParams.toString();
  await chrome.tabs.create({
    url: chrome.runtime.getURL(`index.html${query ? `?${query}` : ""}`)
  });
}

function isHttpPageUrl(url?: string): boolean {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
