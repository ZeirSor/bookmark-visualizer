import type { QuickSavePageDetails } from "../quick-save";

export interface PopupExtractedPageDetails {
  title?: string;
  url?: string;
  previewImageUrl?: string;
}

export interface PopupPageDetails extends QuickSavePageDetails {
  canSave: boolean;
  domain: string;
  faviconUrl?: string;
  error?: string;
}

export function normalizePopupPageDetails(
  tab: Pick<chrome.tabs.Tab, "title" | "url" | "favIconUrl"> | undefined,
  extracted?: PopupExtractedPageDetails
): PopupPageDetails {
  const url = extracted?.url || tab?.url || "";
  const canSave = isPopupSaveableUrl(url);
  const domain = getHostname(url);
  const title = normalizeTitle(extracted?.title || tab?.title || "", url);
  const faviconUrl = tab?.favIconUrl || undefined;
  const previewImageUrl = extracted?.previewImageUrl || faviconUrl;

  return {
    url,
    title,
    previewImageUrl,
    faviconUrl,
    canSave,
    domain,
    error: canSave ? undefined : "当前页面不支持保存。"
  };
}

export function isPopupSaveableUrl(url?: string): boolean {
  if (!url) {
    return false;
  }

  return url.startsWith("http://") || url.startsWith("https://");
}

export function normalizeTitle(title: string, url: string): string {
  const normalized = title.trim();
  if (normalized) {
    return normalized;
  }

  return getHostname(url) || "Untitled bookmark";
}

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}
