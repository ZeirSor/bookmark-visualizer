export interface BookmarkTableRow {
  id: string;
  title: string;
  url: string;
  folderPath: string;
  note?: string;
  tags: string[];
  previewImageUrl?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  lastOperatedAt?: string;
}
