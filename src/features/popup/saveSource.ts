export interface SaveSourceParams {
  sourceTabId?: number;
  sourceWindowId?: number;
  sourceUrl?: string;
  sourceTitle?: string;
  sourceFaviconUrl?: string;
}

export type SaveSourceTabDetails = Pick<chrome.tabs.Tab, "id" | "title" | "url" | "favIconUrl"> & {
  windowId?: number;
};

export function parseSaveSourceParams(search: string): SaveSourceParams {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);

  return {
    sourceTabId: parsePositiveInteger(params.get("sourceTabId")),
    sourceWindowId: parsePositiveInteger(params.get("sourceWindowId")),
    sourceUrl: params.get("sourceUrl") ?? undefined,
    sourceTitle: params.get("sourceTitle") ?? undefined,
    sourceFaviconUrl: params.get("sourceFaviconUrl") ?? undefined
  };
}

export async function resolveSaveSourceTab(
  params?: SaveSourceParams
): Promise<SaveSourceTabDetails | undefined> {
  if (!params) {
    return undefined;
  }

  if (params.sourceTabId && typeof chrome !== "undefined" && chrome.tabs?.get) {
    try {
      return await chrome.tabs.get(params.sourceTabId);
    } catch {
      // Fall back to query params below when the source tab no longer exists.
    }
  }

  if (!params.sourceUrl && !params.sourceTitle && !params.sourceFaviconUrl) {
    return undefined;
  }

  return {
    id: params.sourceTabId,
    windowId: params.sourceWindowId,
    url: params.sourceUrl,
    title: params.sourceTitle,
    favIconUrl: params.sourceFaviconUrl
  };
}

function parsePositiveInteger(value: string | null): number | undefined {
  if (!value || !/^\d+$/.test(value)) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}
