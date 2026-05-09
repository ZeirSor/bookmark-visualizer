export type SavePageKind =
  | "web"
  | "browser-internal"
  | "extension-page"
  | "file"
  | "unsupported";

export function classifySavePageKind(url?: string): SavePageKind {
  if (!url) {
    return "unsupported";
  }

  try {
    const protocol = new URL(url).protocol;
    if (protocol === "http:" || protocol === "https:") {
      return "web";
    }

    if (
      protocol === "chrome:" ||
      protocol === "edge:" ||
      protocol === "brave:" ||
      protocol === "opera:" ||
      protocol === "vivaldi:" ||
      protocol === "about:"
    ) {
      return "browser-internal";
    }

    if (protocol === "chrome-extension:" || protocol === "moz-extension:") {
      return "extension-page";
    }

    if (protocol === "file:") {
      return "file";
    }
  } catch {
    return "unsupported";
  }

  return "unsupported";
}

export function isBookmarkSaveableUrl(url?: string): boolean {
  return classifySavePageKind(url) !== "unsupported";
}

export function isMetadataInjectableUrl(url?: string): boolean {
  return classifySavePageKind(url) === "web";
}
