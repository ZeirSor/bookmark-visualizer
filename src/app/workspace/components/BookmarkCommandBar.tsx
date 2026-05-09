import { ExternalLinkIcon } from "../../../components/icons/AppIcons";
import {
  ChevronDownIcon,
  FilterIcon,
  SortIcon
} from "../../../components/icons/ManagerIcons";
import type { WorkspaceFilters, WorkspaceSortMode } from "../types";

interface BookmarkCommandBarProps {
  defaultSortLabel: string;
  filterLabel: string;
  filters: WorkspaceFilters;
  sortMode: WorkspaceSortMode;
  selectionMode: boolean;
  onSortModeChange(sortMode: WorkspaceSortMode): void;
  onToggleHasNoteFilter(): void;
  onEnterSelectionMode(): void;
}

export function BookmarkCommandBar({
  defaultSortLabel,
  filterLabel,
  filters,
  sortMode,
  selectionMode,
  onSortModeChange,
  onToggleHasNoteFilter,
  onEnterSelectionMode
}: BookmarkCommandBarProps) {
  return (
    <div className="bookmark-command-bar" aria-label="书签管理命令">
      <div className="command-group">
        <label className="command-select-control">
          <SortIcon />
          <span>排序</span>
          <select
            aria-label="排序方式"
            value={sortMode}
            onChange={(event) => onSortModeChange(event.target.value as WorkspaceSortMode)}
          >
            <option value="default">{defaultSortLabel}</option>
            <option value="title-asc">标题 A-Z</option>
            <option value="date-newest">最新添加</option>
            <option value="date-oldest">最早添加</option>
          </select>
          <ChevronDownIcon />
        </label>
        <button className="command-button" type="button" disabled title="更多筛选即将支持">
          <FilterIcon />
          筛选：{filterLabel}
          <ChevronDownIcon />
        </button>
        <button
          className={`command-chip ${filters.hasNote ? "is-active" : ""}`}
          type="button"
          aria-pressed={filters.hasNote}
          onClick={onToggleHasNoteFilter}
        >
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
