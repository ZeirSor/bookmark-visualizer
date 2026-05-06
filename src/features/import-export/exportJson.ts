import type {
  BookmarkActivity,
  BookmarkRecord,
  ExternalMapping,
  FolderRecord,
  TagRecord
} from "../../domain";
import {
  BOOKMARK_VISUALIZER_EXPORT_APP,
  BOOKMARK_VISUALIZER_EXPORT_SCHEMA_VERSION,
  type VersionedBookmarkExport
} from "./schema";

export interface BuildJsonExportInput {
  folders: FolderRecord[];
  bookmarks: BookmarkRecord[];
  tags?: TagRecord[];
  activities?: BookmarkActivity[];
  externalMappings?: ExternalMapping[];
  metadata?: unknown[];
  exportedAt?: string;
}

export function buildVersionedJsonExport(input: BuildJsonExportInput): VersionedBookmarkExport {
  return {
    schemaVersion: BOOKMARK_VISUALIZER_EXPORT_SCHEMA_VERSION,
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    app: BOOKMARK_VISUALIZER_EXPORT_APP,
    folders: input.folders,
    bookmarks: input.bookmarks,
    tags: input.tags ?? [],
    metadata: input.metadata ?? [],
    activities: input.activities ?? [],
    externalMappings: input.externalMappings ?? []
  };
}

export function stringifyVersionedJsonExport(input: BuildJsonExportInput): string {
  return `${JSON.stringify(buildVersionedJsonExport(input), null, 2)}\n`;
}
