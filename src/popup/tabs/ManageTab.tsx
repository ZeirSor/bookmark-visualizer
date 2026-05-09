import { openWorkspace } from "../../features/popup";
import type { FolderOption } from "../../features/bookmarks";
import {
  getFolderCountLabel,
  type PopupRecentBookmark
} from "../../features/popup";
import { ExternalLinkIcon, FolderIcon } from "../components/PopupIcons";

export function ManageTab({
  recentBookmarks,
  recentFolders
}: {
  recentBookmarks: PopupRecentBookmark[];
  recentFolders: FolderOption[];
}) {
  return (
    <section className="manage-tab tab-scroll-area">
      <button type="button" className="workspace-card" onClick={() => void openWorkspace()}>
        <span>
          <strong>打开完整管理页</strong>
          <small>浏览全部书签、搜索、整理和管理</small>
        </span>
        <ExternalLinkIcon />
      </button>

      <section className="popup-section" aria-labelledby="recent-saved-heading">
        <h2 id="recent-saved-heading">最近保存</h2>
        {recentBookmarks.length === 0 ? (
          <p className="empty-copy">暂无最近保存</p>
        ) : (
          <div className="recent-bookmark-list">
            {recentBookmarks.map((bookmark) => (
              <button
                key={bookmark.id}
                type="button"
                onClick={() => window.open(bookmark.url, "_blank", "noopener,noreferrer")}
              >
                <span className="favicon-fallback">{bookmark.domain.slice(0, 1).toUpperCase()}</span>
                <span className="recent-bookmark-main">
                  <strong>{bookmark.title}</strong>
                  <small>
                    {bookmark.domain}
                    {bookmark.folderPath ? ` / ${bookmark.folderPath}` : ""}
                  </small>
                </span>
                <time>{bookmark.savedAtLabel}</time>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="popup-section" aria-labelledby="recent-folders-heading">
        <h2 id="recent-folders-heading">最近使用文件夹</h2>
        {recentFolders.length === 0 ? (
          <p className="empty-copy">暂无最近使用文件夹</p>
        ) : (
          <div className="folder-summary-chips">
            {recentFolders.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => void openWorkspace(buildWorkspaceFolderPath(option.id))}
              >
                <FolderIcon />
                {getFolderCountLabel(option)}
              </button>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function buildWorkspaceFolderPath(folderId: string): string {
  return `index.html?folderId=${encodeURIComponent(folderId)}`;
}
