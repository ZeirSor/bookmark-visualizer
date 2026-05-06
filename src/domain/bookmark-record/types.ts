export type RecordSource = "browser" | "import" | "manual" | "notion" | "cloud";

export type SyncStatus = "local-only" | "synced" | "pending" | "conflict";

export interface BookmarkRecord {
  id: string;
  browserBookmarkId?: string;
  cloudBookmarkId?: string;
  type: "bookmark";
  title: string;
  url: string;
  folderId?: string;
  folderPath?: string;
  note?: string;
  description?: string;
  previewImageUrl?: string;
  tagIds: string[];
  dateAdded?: string;
  createdAt: string;
  updatedAt: string;
  lastOperatedAt?: string;
  lastVisitedAt?: string;
  source: RecordSource;
  syncStatus?: SyncStatus;
}

export interface BookmarkRecordMetadataInput {
  note?: string;
  previewImageUrl?: string;
  summary?: string;
  updatedAt?: number;
}
