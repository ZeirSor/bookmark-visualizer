import type { SavePageKind } from "../../domain/page-kind";

export interface BookmarkMetadata {
  note?: string;
  previewImageUrl?: string;
  pageKind?: SavePageKind;
  sourceUrl?: string;
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
