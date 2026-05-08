import { getDisplayTitle, isBookmark, isFolder, type BookmarkNode } from "../../../features/bookmarks";

export interface FolderStats {
  bookmarkCount: number;
  folderCount: number;
  updatedAt?: number;
}

export function getDirectFolders(folder?: BookmarkNode): BookmarkNode[] {
  return folder?.children?.filter(isFolder) ?? [];
}

export function getFolderStats(folder?: BookmarkNode): FolderStats {
  const children = folder?.children ?? [];

  return {
    bookmarkCount: children.filter(isBookmark).length,
    folderCount: children.filter(isFolder).length,
    updatedAt: folder?.dateGroupModified ?? folder?.dateAdded
  };
}

export function getFolderDisplayLabel(folder?: BookmarkNode): string {
  return folder ? getDisplayTitle(folder) : "选择一个文件夹";
}
