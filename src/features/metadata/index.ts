export interface BookmarkMetadata {
  note?: string;
  summary?: string;
  summarySource?: "manual" | "meta-description" | "ai";
  updatedAt?: number;
}

export interface ExtensionMetadataState {
  metadataVersion: 1;
  bookmarkMetadata: Record<string, BookmarkMetadata>;
}

export * from "./metadataService";
export * from "./useMetadata";
