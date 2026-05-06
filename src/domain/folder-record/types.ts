import type { RecordSource } from "../bookmark-record";

export interface FolderRecord {
  id: string;
  browserBookmarkId?: string;
  cloudFolderId?: string;
  title: string;
  parentId?: string;
  index?: number;
  path?: string;
  createdAt: string;
  updatedAt: string;
  source: RecordSource;
}
