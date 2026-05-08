import { useState } from "react";
import { ChevronRightIcon, FolderIcon } from "../../../components/icons/AppIcons";
import type { BookmarkNode } from "../../../features/bookmarks";
import { getDisplayTitle } from "../../../features/bookmarks";
import { getFolderStats } from "../selectors/workspaceSelectors";

interface FolderStripProps {
  folders: BookmarkNode[];
  onSelectFolder(folderId: string): void;
}

const COLLAPSED_FOLDER_COUNT = 6;

export function FolderStrip({ folders, onSelectFolder }: FolderStripProps) {
  const [expanded, setExpanded] = useState(false);

  if (folders.length === 0) {
    return null;
  }

  const visibleFolders = expanded ? folders : folders.slice(0, COLLAPSED_FOLDER_COUNT);
  const hiddenCount = Math.max(0, folders.length - visibleFolders.length);

  return (
    <section className="folder-strip" aria-label="子文件夹">
      <div className="folder-strip-heading">
        <h3>子文件夹</h3>
        {hiddenCount > 0 ? (
          <button type="button" onClick={() => setExpanded(true)}>
            查看全部
            <ChevronRightIcon />
          </button>
        ) : null}
      </div>
      <div className="folder-strip-list">
        {visibleFolders.map((folder) => {
          const stats = getFolderStats(folder);

          return (
            <button key={folder.id} className="folder-strip-item" type="button" onClick={() => onSelectFolder(folder.id)}>
              <span className="folder-strip-icon">
                <FolderIcon />
              </span>
              <span className="folder-strip-copy">
                <strong>{getDisplayTitle(folder)}</strong>
                <small>{stats.bookmarkCount} 个书签</small>
              </span>
              <ChevronRightIcon className="folder-strip-arrow" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
