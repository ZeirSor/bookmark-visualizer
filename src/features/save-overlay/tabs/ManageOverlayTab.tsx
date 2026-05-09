import { SiteFavicon } from "../../../components/SiteFavicon";
import type { FolderOption } from "../../bookmarks";
import {
  getFolderCountLabel,
  type PopupRecentBookmark
} from "../../popup";
import type { SaveOverlayExtensionPage } from "../types";
import {
  ChevronRightIcon,
  ExternalLinkIcon,
  FolderIcon,
  SearchIcon
} from "../../../popup/components/PopupIcons";

export function ManageOverlayTab({
  recentBookmarks,
  recentFolders,
  onOpenWorkspace
}: {
  recentBookmarks: PopupRecentBookmark[];
  recentFolders: FolderOption[];
  onOpenWorkspace(path?: SaveOverlayExtensionPage): Promise<void>;
}) {
  return (
    <section className="manage-tab tab-scroll-area">
      <button
        type="button"
        className="workspace-card manager-hero-card"
        onClick={() => void onOpenWorkspace()}
      >
        <span>
          <strong>打开完整管理页</strong>
          <small>浏览全部书签、搜索、整理和管理</small>
        </span>
        <ExternalLinkIcon />
      </button>

      <button
        type="button"
        className="manager-search-row"
        onClick={() => void onOpenWorkspace()}
      >
        <SearchIcon />
        <span>搜索书签或文件夹</span>
        <ChevronRightIcon />
      </button>

      <section className="popup-section" aria-labelledby="overlay-recent-saved-heading">
        <h2 id="overlay-recent-saved-heading">最近保存</h2>
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
                <SiteFavicon
                  url={bookmark.url}
                  title={bookmark.title}
                  size={32}
                  className="recent-bookmark-favicon"
                  fallback={bookmark.domain.slice(0, 1).toUpperCase()}
                />
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

      <section className="popup-section" aria-labelledby="overlay-recent-folders-heading">
        <h2 id="overlay-recent-folders-heading">最近使用文件夹</h2>
        {recentFolders.length === 0 ? (
          <p className="empty-copy">暂无最近使用文件夹</p>
        ) : (
          <div className="folder-summary-chips">
            {recentFolders.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => void onOpenWorkspace(buildWorkspaceFolderPath(option.id))}
              >
                <FolderIcon />
                {getFolderCountLabel(option)}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="manager-action-grid" aria-label="快捷操作">
        <button type="button" onClick={() => void onOpenWorkspace()}>
          <ExternalLinkIcon />
          <span>
            <strong>继续整理</strong>
            <small>进入完整工作台</small>
          </span>
        </button>
        <button type="button" onClick={() => void onOpenWorkspace()}>
          <FolderIcon />
          <span>
            <strong>按文件夹浏览</strong>
            <small>使用左侧书签树</small>
          </span>
        </button>
      </section>
    </section>
  );
}

function buildWorkspaceFolderPath(folderId: string): SaveOverlayExtensionPage {
  return `index.html?folderId=${encodeURIComponent(folderId)}`;
}
