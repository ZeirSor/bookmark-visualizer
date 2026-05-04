import type { QuickSavePageDetails } from "./types";

export function extractQuickSavePageDetails(
  documentRef: Document = document,
  locationRef: Location = location
): QuickSavePageDetails {
  const url = locationRef.href;
  const title =
    getMetaContent(documentRef, 'meta[property="og:title"]') ||
    getMetaContent(documentRef, 'meta[name="twitter:title"]') ||
    documentRef.title ||
    getHostname(url);
  const previewImageUrl =
    absolutizeUrl(
      getMetaContent(documentRef, 'meta[property="og:image"]') ||
        getMetaContent(documentRef, 'meta[name="twitter:image"]') ||
        getFaviconHref(documentRef) ||
        getFirstImageSrc(documentRef),
      url
    ) || undefined;

  return {
    url,
    title: title.trim() || getHostname(url),
    previewImageUrl
  };
}

function getMetaContent(documentRef: Document, selector: string): string {
  return documentRef.querySelector<HTMLMetaElement>(selector)?.content?.trim() ?? "";
}

function getFaviconHref(documentRef: Document): string {
  return (
    documentRef.querySelector<HTMLLinkElement>('link[rel~="icon"]')?.href?.trim() ||
    documentRef.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]')?.href?.trim() ||
    ""
  );
}

function getFirstImageSrc(documentRef: Document): string {
  const images = Array.from(documentRef.images);
  const image = images.find((candidate) => {
    const width = candidate.naturalWidth || candidate.width;
    const height = candidate.naturalHeight || candidate.height;
    return Boolean(candidate.currentSrc || candidate.src) && width >= 80 && height >= 80;
  });

  return image?.currentSrc || image?.src || "";
}

function absolutizeUrl(value: string, baseUrl: string): string {
  if (!value) {
    return "";
  }

  try {
    return new URL(value, baseUrl).href;
  } catch {
    return "";
  }
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname || "Untitled bookmark";
  } catch {
    return "Untitled bookmark";
  }
}
