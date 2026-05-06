import type {
  BookmarkActivity,
  BookmarkRecord,
  ExternalMapping,
  FolderRecord,
  TagRecord
} from "../../domain";

export const BOOKMARK_VISUALIZER_EXPORT_SCHEMA_VERSION = 1;
export const BOOKMARK_VISUALIZER_EXPORT_APP = "Bookmark Visualizer";

export type ImportSource = "json" | "csv" | "html";

export interface VersionedBookmarkExport {
  schemaVersion: 1;
  exportedAt: string;
  app: typeof BOOKMARK_VISUALIZER_EXPORT_APP;
  folders: FolderRecord[];
  bookmarks: BookmarkRecord[];
  tags: TagRecord[];
  metadata: unknown[];
  activities: BookmarkActivity[];
  externalMappings: ExternalMapping[];
}

export interface ImportConflict {
  type: "duplicate-url" | "existing-url" | "unsupported-schema";
  message: string;
  recordId?: string;
  url?: string;
}

export interface InvalidImportRecord {
  row: number;
  reason: string;
  value?: unknown;
}

export interface ImportPlan {
  source: ImportSource;
  foldersToCreate: FolderRecord[];
  bookmarksToCreate: BookmarkRecord[];
  bookmarksToUpdate: BookmarkRecord[];
  conflicts: ImportConflict[];
  warnings: string[];
  invalidRecords: InvalidImportRecord[];
}

export interface ImportPlanContext {
  existingBookmarks?: BookmarkRecord[];
  existingFolders?: FolderRecord[];
  now?: string;
}

export function createEmptyImportPlan(source: ImportSource): ImportPlan {
  return {
    source,
    foldersToCreate: [],
    bookmarksToCreate: [],
    bookmarksToUpdate: [],
    conflicts: [],
    warnings: [],
    invalidRecords: []
  };
}
