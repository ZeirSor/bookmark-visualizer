import type { FaviconSize } from "./types";

export function normalizeFaviconPageUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);

    if (!isSupportedFaviconProtocol(parsed)) {
      return undefined;
    }

    parsed.hash = "";
    return parsed.href;
  } catch {
    return undefined;
  }
}

export function getFaviconSiteKey(url: string): string | undefined {
  const normalized = normalizeFaviconPageUrl(url);

  if (!normalized) {
    return undefined;
  }

  const parsed = new URL(normalized);
  const hostname = parsed.hostname.toLocaleLowerCase().replace(/^www\./, "");
  const port = parsed.port ? `:${parsed.port}` : "";

  return `${parsed.protocol}//${hostname}${port}`;
}

export function getFaviconCacheKey(url: string, size: FaviconSize = 32): string | undefined {
  const siteKey = getFaviconSiteKey(url);

  return siteKey ? `${siteKey}|${size}` : undefined;
}

function isSupportedFaviconProtocol(url: URL): boolean {
  return url.protocol === "http:" || url.protocol === "https:";
}
