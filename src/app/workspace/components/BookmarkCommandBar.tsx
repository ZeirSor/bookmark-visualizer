import { ExternalLinkIcon } from "../../../components/icons/AppIcons";
import {
  ChevronDownIcon,
  FilterIcon,
  SortIcon
} from "../../../components/icons/ManagerIcons";

interface BookmarkCommandBarProps {
  sortLabel: string;
  filterLabel: string;
  selectionMode: boolean;
  onEnterSelectionMode(): void;
}

export function BookmarkCommandBar({
  sortLabel,
  filterLabel,
  selectionMode,
  onEnterSelectionMode
}: BookmarkCommandBarProps) {
  return (
    <div className="bookmark-command-bar" aria-label="书签管理命令">
      <div className="command-group">
        <button className="command-button" type="button" disabled title="排序功能即将支持">
          <SortIcon />
          排序：{sortLabel}
          <ChevronDownIcon />
        </button>
        <button className="command-button" type="button" disabled title="筛选功能即将支持">
          <FilterIcon />
          筛选：{filterLabel}
          <ChevronDownIcon />
        </button>
        <button className="command-chip" type="button" disabled title="备注筛选即将支持">
          有备注
        </button>
        <button className="command-chip" type="button" disabled title="未读筛选即将支持">
          未读
        </button>
        <button className="command-chip" type="button" disabled title="收藏筛选即将支持">
          收藏
        </button>
      </div>
      <div className="command-group command-group-trailing">
        <button className="command-icon-button" type="button" disabled title="打开方式设置即将支持">
          <ExternalLinkIcon />
          <span className="visually-hidden">打开方式设置</span>
        </button>
        <button
          className={`command-button ${selectionMode ? "is-active" : ""}`}
          type="button"
          onClick={onEnterSelectionMode}
        >
          批量操作
          <ChevronDownIcon />
        </button>
      </div>
    </div>
  );
}
