import { classifySavePageKind } from "../../domain/page-kind";
import type { PopupPageDetails } from "../popup";
import { extractQuickSavePageDetails } from "../quick-save/pageDetails";

export function extractSaveOverlayPageDetails(
  documentRef: Document = document,
  locationRef: Location = location
): PopupPageDetails {
  const details = extractQuickSavePageDetails(documentRef, locationRef);

  return {
    ...details,
    canSave: true,
    domain: getHostname(details.url),
    faviconUrl: undefined,
    pageKind: classifySavePageKind(details.url),
    sourceUrl: details.url
  };
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
