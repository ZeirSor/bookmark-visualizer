import {
  ChevronRightIcon,
  CloseIcon,
  ExternalLinkIcon,
  FolderIcon,
  GridIcon,
  PinIcon,
  PlusIcon,
  RecentIcon,
  SettingsIcon,
  StarIcon,
  UploadIcon
} from "../../components/icons/AppIcons";
import { SiteFavicon } from "../../components/SiteFavicon";
import type { CSSProperties } from "react";
import type {
  NewTabActivityItem,
  NewTabFeaturedBookmarkViewModel,
  NewTabFolderCardViewModel,
  NewTabShortcutViewModel
} from "../../features/newtab";

export function PinnedShortcutGrid({
  shortcuts,
  shortcutsPerRow,
  onAdd,
  onHide,
  onOpen
}: {
  shortcuts: NewTabShortcutViewModel[];
  shortcutsPerRow: number;
  onAdd(): void;
  onHide(shortcut: NewTabShortcutViewModel): void;
  onOpen(shortcut: NewTabShortcutViewModel, openInNewTab?: boolean): void;
}) {
  return (
    <section className="nt-panel nt-shortcut-panel">
      <div className="nt-section-heading compact">
        <div>
          <h2><PinIcon /> 快速访问</h2>
        </div>
        <button type="button" className="nt-ghost-button" onClick={onAdd}>
          编辑
        </button>
      </div>
      <div
        className="nt-shortcut-grid"
        style={{ "--nt-shortcut-cols": shortcutsPerRow } as CSSProperties}
      >
        {shortcuts.map((shortcut) => (
          <article key={shortcut.id} className="nt-shortcut-tile">
            <button
              type="button"
              className="nt-shortcut-main"
              onClick={(event) => onOpen(shortcut, event.ctrlKey || event.metaKey)}
            >
              <SiteFavicon
                url={shortcut.url}
                title={shortcut.title}
                size={32}
                className="nt-shortcut-icon-wrap"
                fallback={shortcut.icon}
              />
              <span>{shortcut.title}</span>
            </button>
            <button
              type="button"
              className="nt-tile-dismiss"
              aria-label={`隐藏 ${shortcut.title}`}
              title="隐藏"
              onClick={() => onHide(shortcut)}
            >
              <CloseIcon />
            </button>
          </article>
        ))}
        <button type="button" className="nt-shortcut-tile nt-add-shortcut" onClick={onAdd}>
          <span className="nt-shortcut-main">
            <span className="nt-shortcut-icon-wrap">
              <PlusIcon />
            </span>
            <span>添加网站</span>
          </span>
        </button>
      </div>
    </section>
  );
}

export function BookmarkGroupStrip({
  activeFolderId,
  folders,
  onOpenFolder,
  onSelectFolder
}: {
  activeFolderId?: string;
  folders: NewTabFolderCardViewModel[];
  onOpenFolder(folderId: string): void;
  onSelectFolder(folderId: string): void;
}) {
  return (
    <section className="nt-panel nt-folder-panel">
      <div className="nt-section-heading compact">
        <div>
          <h2>书签分组</h2>
        </div>
      </div>
      {folders.length > 0 ? (
        <div className="nt-folder-strip">
          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              className={`nt-folder-chip is-${folder.color} ${
                activeFolderId === folder.id ? "is-active" : ""
              }`}
              onClick={() => onSelectFolder(folder.id)}
              onDoubleClick={() => onOpenFolder(folder.id)}
            >
              <span className="nt-folder-icon">
                <FolderIcon />
              </span>
              <span className="nt-folder-main">
                <strong>{folder.title}</strong>
                <small>{folder.description}</small>
              </span>
              <span className="nt-folder-count">{folder.bookmarkCount}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="nt-empty-text">还没有可展示的书签分组。</p>
      )}
    </section>
  );
}

export function FeaturedBookmarkRow({
  bookmarks,
  onOpen
}: {
  bookmarks: NewTabFeaturedBookmarkViewModel[];
  onOpen(bookmark: NewTabFeaturedBookmarkViewModel, openInNewTab?: boolean): void;
}) {
  return (
    <section className="nt-panel nt-featured-panel">
      <div className="nt-section-heading compact">
        <div>
          <h2>精选书签</h2>
        </div>
      </div>
      {bookmarks.length > 0 ? (
        <div className="nt-featured-row">
          {bookmarks.map((bookmark) => (
            <button
              key={bookmark.id}
              type="button"
              onClick={(event) => onOpen(bookmark, event.ctrlKey || event.metaKey)}
            >
              <SiteFavicon url={bookmark.url} title={bookmark.title} size={32} className="nt-row-favicon" />
              <span>
                <strong>{bookmark.title}</strong>
                <small>{getHostname(bookmark.url) || bookmark.folderPath}</small>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="nt-empty-text">选择一个包含直接书签的分组后，这里会显示入口。</p>
      )}
    </section>
  );
}

export function FolderPreviewPanel({
  folder,
  bookmarks,
  onOpen,
  onOpenFolder
}: {
  folder?: NewTabFolderCardViewModel;
  bookmarks: NewTabFeaturedBookmarkViewModel[];
  onOpen(bookmark: NewTabFeaturedBookmarkViewModel, openInNewTab?: boolean): void;
  onOpenFolder(folderId: string): void;
}) {
  if (!folder) {
    return null;
  }

  return (
    <section className="nt-panel nt-folder-preview-panel">
      <div className="nt-section-heading compact">
        <div>
          <h2>{folder.title} 文件夹预览</h2>
          <p>共 {folder.bookmarkCount} 个书签</p>
        </div>
        <button type="button" className="nt-ghost-button" onClick={() => onOpenFolder(folder.id)}>
          查看全部 <ChevronRightIcon />
        </button>
      </div>
      {bookmarks.length > 0 ? (
        <div className="nt-preview-grid">
          {bookmarks.slice(0, 4).map((bookmark) => (
            <article key={bookmark.id} className="nt-preview-card">
              <button type="button" onClick={(event) => onOpen(bookmark, event.ctrlKey || event.metaKey)}>
                <SiteFavicon url={bookmark.url} title={bookmark.title} size={32} className="nt-row-favicon" />
                <span>
                  <strong>{bookmark.title}</strong>
                  <small>{getHostname(bookmark.url)}</small>
                </span>
              </button>
              <p>{bookmark.folderPath || folder.path}</p>
              <div className="nt-preview-meta">
                <span>{folder.title}</span>
                <StarIcon />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="nt-empty-text">这个分组还没有可直接打开的书签。</p>
      )}
    </section>
  );
}

export function RecentActivityPanel({
  activities,
  onOpen
}: {
  activities: NewTabActivityItem[];
  onOpen(activity: NewTabActivityItem, openInNewTab?: boolean): void;
}) {
  return (
    <section className="nt-side-panel">
      <div className="nt-section-heading compact">
        <div>
          <h2>最近活动</h2>
        </div>
        <button type="button" className="nt-panel-link">
          全部活动 <ChevronRightIcon />
        </button>
      </div>
      {activities.length > 0 ? (
        <div className="nt-activity-list">
          {activities.map((activity) => (
            <button
              key={activity.id}
              type="button"
              disabled={!activity.url}
              onClick={(event) => onOpen(activity, event.ctrlKey || event.metaKey)}
            >
              {activity.url ? (
                <SiteFavicon url={activity.url} title={activity.title} size={32} className="nt-row-favicon" />
              ) : (
                <span className="nt-row-favicon">
                  <RecentIcon />
                </span>
              )}
              <span>
                <strong>{activity.title}</strong>
                <small>{activity.url ? getHostname(activity.url) : formatActivity(activity)}</small>
              </span>
              <time>{formatRelativeTime(activity.createdAt)}</time>
            </button>
          ))}
        </div>
      ) : (
        <p className="nt-empty-text">打开书签或快捷方式后，这里会显示最近活动。</p>
      )}
    </section>
  );
}

export function QuickActionsPanel({
  onCustomize,
  onImport,
  onManage,
  onNewBookmark
}: {
  onCustomize(): void;
  onImport(): void;
  onManage(): void;
  onNewBookmark(): void;
}) {
  return (
    <section className="nt-side-panel">
      <div className="nt-section-heading compact">
        <div>
          <h2>快捷操作</h2>
        </div>
      </div>
      <div className="nt-action-list">
        <button type="button" onClick={onManage}>
          <ExternalLinkIcon /> 打开管理页
        </button>
        <button type="button" onClick={onNewBookmark}>
          <PlusIcon /> 新建书签
        </button>
        <button type="button" onClick={onImport}>
          <UploadIcon /> 导入 HTML
        </button>
        <button type="button" onClick={onCustomize}>
          <GridIcon /> 自定义布局
        </button>
      </div>
    </section>
  );
}

export function StorageUsageMiniCard() {
  return (
    <section className="nt-side-panel nt-storage-card">
      <div className="nt-section-heading compact">
        <div>
          <h2>存储使用</h2>
          <p>设置、活动和快捷方式保存在本地。</p>
        </div>
      </div>
      <div className="nt-storage-track" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}

function formatActivity(activity: NewTabActivityItem): string {
  const labels: Record<NewTabActivityItem["type"], string> = {
    visited: "已访问",
    saved: "已保存",
    pinned: "已固定",
    created: "已创建",
    imported: "已导入"
  };

  return labels[activity.type];
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function formatRelativeTime(timestamp: number): string {
  const deltaSeconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));

  if (deltaSeconds < 60) {
    return "刚刚";
  }

  const minutes = Math.round(deltaSeconds / 60);

  if (minutes < 60) {
    return `${minutes} 分钟前`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours} 小时前`;
  }

  return `${Math.round(hours / 24)} 天前`;
}
