import type { MouseEvent as ReactMouseEvent } from "react";
import { PlusIcon, StarIcon } from "../../../components/icons/AppIcons";
import { MoreIcon } from "../../../components/icons/ManagerIcons";

interface FolderHeaderProps {
  title: string;
  bookmarkCount: number;
  folderCount: number;
  updatedLabel?: string;
  isSearching: boolean;
  resultCount: number;
  canCreateBookmark: boolean;
  onCreateBookmark(): void;
  onOpenMore?(event: ReactMouseEvent<HTMLButtonElement>): void;
}

export function FolderHeader({
  title,
  bookmarkCount,
  folderCount,
  updatedLabel,
  isSearching,
  resultCount,
  canCreateBookmark,
  onCreateBookmark,
  onOpenMore
}: FolderHeaderProps) {
  const metaLabel = isSearching
    ? `匹配 ${resultCount} 个书签`
    : `${bookmarkCount} 个书签 · ${folderCount} 个子文件夹${
        updatedLabel ? ` · ${updatedLabel}` : ""
      }`;

  return (
    <section className="folder-header" aria-label={isSearching ? "搜索结果概览" : "当前文件夹概览"}>
      <div className="folder-header-copy">
        <div className="folder-title-row">
          <h2>{isSearching ? "搜索结果" : title}</h2>
          {!isSearching ? (
            <button
              className="folder-icon-button"
              type="button"
              disabled
              aria-label="收藏文件夹功能即将支持"
              title="收藏文件夹功能即将支持"
            >
              <StarIcon />
            </button>
          ) : null}
          {!isSearching && onOpenMore ? (
            <button
              className="folder-icon-button"
              type="button"
              aria-label="打开文件夹操作菜单"
              title="更多文件夹操作"
              onClick={onOpenMore}
            >
              <MoreIcon />
            </button>
          ) : null}
        </div>
        <p>{metaLabel}</p>
      </div>
      {canCreateBookmark ? (
        <button className="section-action-button" type="button" onClick={onCreateBookmark}>
          <PlusIcon />
          新建书签
        </button>
      ) : null}
    </section>
  );
}
