import type { ReactNode } from "react";
import { openWorkspace } from "../../features/popup";
import { SiteFavicon } from "../../components/SiteFavicon";
import type { FolderOption } from "../../features/bookmarks";
import {
  getFolderCountLabel,
  type PopupRecentBookmark
} from "../../features/popup";
import { ChevronRightIcon, ExternalLinkIcon, FilterIcon, FolderIcon, SearchIcon } from "../components/PopupIcons";

export function ManageTab({
  recentBookmarks,
  recentFolders
}: {
  recentBookmarks: PopupRecentBookmark[];
  recentFolders: FolderOption[];
}) {
  return (
    <section className="manage-tab tab-scroll-area">
      <div className="manager-hero-card" aria-label="管理入口">
        <span className="manager-hero-icon" aria-hidden="true">
          <FolderIcon />
        </span>
        <span className="manager-hero-copy">
          <strong>打开完整管理页</strong>
          <small>在新标签页中浏览、搜索、整理和编辑全部书签。</small>
        </span>
        <button
          type="button"
          className="manager-hero-action"
          aria-label="打开完整管理页"
          title="打开完整管理页"
          onClick={() => void openWorkspace()}
        >
          <ExternalLinkIcon />
        </button>
      </div>

      <div className="manager-search-row" aria-label="管理搜索入口">
        <button type="button" className="manager-search-command" onClick={() => void openWorkspace()}>
          <SearchIcon />
          <span>搜索书签或文件夹...</span>
        </button>
        <button
          type="button"
          className="manager-filter-button"
          title="在完整管理页中筛选"
          onClick={() => void openWorkspace()}
        >
          <FilterIcon />
          <span>筛选</span>
        </button>
      </div>

      <section className="popup-section" aria-labelledby="recent-saved-heading">
        <div className="section-heading">
          <h2 id="recent-saved-heading">最近保存</h2>
          <button type="button" className="text-action" onClick={() => void openWorkspace()}>
            查看全部 <ChevronRightIcon />
          </button>
        </div>
        {recentBookmarks.length === 0 ? (
          <p className="empty-copy">保存网页后，最近保存会显示在这里。</p>
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

      <section className="popup-section" aria-labelledby="recent-folders-heading">
        <h2 id="recent-folders-heading">最近使用文件夹</h2>
        {recentFolders.length === 0 ? (
          <p className="empty-copy">选择过保存位置后，常用文件夹会显示在这里。</p>
        ) : (
          <div className="folder-card-grid">
            {recentFolders.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => void openWorkspace(buildWorkspaceFolderPath(option.id))}
              >
                <FolderIcon />
                <strong>{option.title}</strong>
                <small>{getFolderCountLabel(option)}</small>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="popup-section" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading">快捷操作</h2>
        <div className="manager-action-grid">
          <ManagerActionCard
            icon={<ExternalLinkIcon />}
            title="继续整理"
            description="从完整管理页继续上次整理"
            onClick={() => void openWorkspace()}
          />
          <ManagerActionCard
            icon={<FolderIcon />}
            title="按文件夹浏览"
            description="浏览并管理所有文件夹内容"
            onClick={() => void openWorkspace()}
          />
        </div>
      </section>
    </section>
  );
}

function ManagerActionCard({
  description,
  icon,
  onClick,
  title
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick(): void;
}) {
  return (
    <button type="button" className="manager-action-card" onClick={onClick}>
      <span className="manager-entry-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="manager-entry-copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <ChevronRightIcon className="manager-entry-chevron" />
    </button>
  );
}

function buildWorkspaceFolderPath(folderId: string): string {
  return `index.html?folderId=${encodeURIComponent(folderId)}`;
}
