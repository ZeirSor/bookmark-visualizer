import type { FolderOption } from "../../../features/bookmarks";
import { ChevronRightIcon, FolderIcon } from "../PopupIcons";

const DEFAULT_RECENT_LIMIT = 3;
const EXPANDED_RECENT_LIMIT = 7;

export function RecentFolderChips({
  loading,
  recentExpanded,
  recentFolders,
  onManage,
  onSelect,
  onToggleExpanded
}: {
  loading: boolean;
  recentExpanded: boolean;
  recentFolders: FolderOption[];
  onManage(): void;
  onSelect(folderId: string): void;
  onToggleExpanded(): void;
}) {
  const visibleRecentFolders = recentExpanded
    ? recentFolders.slice(0, EXPANDED_RECENT_LIMIT)
    : recentFolders.slice(0, DEFAULT_RECENT_LIMIT);

  return (
    <div className="recent-row">
      <div className="recent-heading-row">
        <strong>最近使用</strong>
        <button type="button" className="text-action" onClick={onManage}>
          管理位置
        </button>
      </div>
      {recentFolders.length === 0 ? (
        <p>{loading ? "正在读取文件夹..." : "保存成功后会显示最近位置"}</p>
      ) : (
        <div className={`recent-chips ${recentExpanded ? "is-expanded" : ""}`}>
          {visibleRecentFolders.map((option) => (
            <button key={option.id} type="button" onClick={() => onSelect(option.id)}>
              <FolderIcon />
              <span>{option.title}</span>
            </button>
          ))}
          {recentFolders.length > DEFAULT_RECENT_LIMIT ? (
            <button
              type="button"
              className="recent-expand-button"
              aria-label={recentExpanded ? "收起最近使用位置" : "展开最近使用位置"}
              aria-expanded={recentExpanded}
              title={recentExpanded ? "收起" : "展开"}
              onClick={onToggleExpanded}
            >
              <ChevronRightIcon />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
