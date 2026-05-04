export type BookmarkNode = chrome.bookmarks.BookmarkTreeNode;

export interface FolderOption {
  id: string;
  title: string;
  path: string;
  node: BookmarkNode;
}

export interface FolderBreadcrumbItem {
  id: string;
  title: string;
  node: BookmarkNode;
}
