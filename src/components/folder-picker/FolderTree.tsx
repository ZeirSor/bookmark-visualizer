import {
  canCreateBookmarkInFolder,
  getDisplayTitle,
  isFolder,
  type BookmarkNode
} from "../../features/bookmarks";
import { FolderTreeItem } from "./FolderTreeItem";

export interface FolderTreeEntry {
  id: string;
  title: string;
  path: string;
  node: BookmarkNode;
  parentId?: string;
  depth: number;
  canSelect: boolean;
  hasChildren: boolean;
  expanded: boolean;
}

export function FolderTree({
  activeFolderId,
  entries,
  selectedFolderId,
  showPath = false,
  onActivate,
  onSelect,
  onToggleExpanded
}: {
  entries: FolderTreeEntry[];
  selectedFolderId: string;
  activeFolderId?: string;
  showPath?: boolean;
  onActivate(folderId: string): void;
  onSelect(folderId: string): void;
  onToggleExpanded(folderId: string): void;
}) {
  if (entries.length === 0) {
    return <p className="inline-picker-empty">当前没有可用文件夹</p>;
  }

  return (
    <div className="folder-tree" role="tree" aria-label="文件夹树">
      {entries.map((entry) => (
        <FolderTreeItem
          key={entry.id}
          active={activeFolderId === entry.id}
          entry={entry}
          selected={selectedFolderId === entry.id}
          showPath={showPath}
          onActivate={onActivate}
          onSelect={onSelect}
          onToggleExpanded={onToggleExpanded}
        />
      ))}
    </div>
  );
}

export function buildVisibleFolderEntries(
  nodes: BookmarkNode[],
  expandedIds: Set<string>,
  parentPath = "",
  depth = 0
): FolderTreeEntry[] {
  return nodes.flatMap((node) => {
    if (!isFolder(node)) {
      return [];
    }

    const includeCurrent = Boolean(node.parentId);
    const title = includeCurrent ? getDisplayTitle(node) : "Root";
    const path = parentPath ? `${parentPath} / ${title}` : title;
    const childFolders = node.children?.filter(isFolder) ?? [];
    const entry: FolderTreeEntry | undefined = includeCurrent
      ? {
          id: node.id,
          title,
          path,
          node,
          parentId: node.parentId,
          depth,
          canSelect: canCreateBookmarkInFolder(node),
          hasChildren: childFolders.length > 0,
          expanded: expandedIds.has(node.id)
        }
      : undefined;
    const shouldDescend = !includeCurrent || expandedIds.has(node.id);
    const children = shouldDescend
      ? buildVisibleFolderEntries(childFolders, expandedIds, path, includeCurrent ? depth + 1 : depth)
      : [];

    return entry ? [entry, ...children] : children;
  });
}
