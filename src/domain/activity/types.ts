export type BookmarkActivityType =
  | "created"
  | "updated"
  | "moved"
  | "tagged"
  | "untagged"
  | "exported"
  | "imported"
  | "synced";

export interface BookmarkActivity {
  id: string;
  bookmarkId: string;
  type: BookmarkActivityType;
  createdAt: string;
  payload?: Record<string, unknown>;
}
