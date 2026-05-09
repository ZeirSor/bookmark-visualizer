import { CloseIcon } from "../../../components/icons/AppIcons";
import { RefreshIcon } from "../../../components/icons/ManagerIcons";
import type { WorkspaceFilters, WorkspaceSearchScope } from "../types";

interface SearchFilterSummaryProps {
  query: string;
  filters: WorkspaceFilters;
  resultCount: number;
  searchScope: WorkspaceSearchScope;
  onClearQuery(): void;
  onClearFilters(): void;
  onClearHasNoteFilter(): void;
  onRefresh(): void;
  onSearchScopeChange(scope: WorkspaceSearchScope): void;
}

export function SearchFilterSummary({
  query,
  filters,
  resultCount,
  searchScope,
  onClearQuery,
  onClearFilters,
  onClearHasNoteFilter,
  onRefresh,
  onSearchScopeChange
}: SearchFilterSummaryProps) {
  const trimmedQuery = query.trim();
  const hasActiveFilters = filters.hasNote;

  if (!trimmedQuery && !hasActiveFilters) {
    return null;
  }

  return (
    <div className="search-filter-summary" aria-label="筛选摘要">
      <strong>结果 {resultCount} 个</strong>
      {trimmedQuery ? (
        <span className="filter-chip">
          {trimmedQuery}
          <button type="button" aria-label={`清除搜索 ${trimmedQuery}`} onClick={onClearQuery}>
            <CloseIcon />
          </button>
        </span>
      ) : null}
      {filters.hasNote ? (
        <span className="filter-chip">
          有备注
          <button type="button" aria-label="清除有备注筛选" onClick={onClearHasNoteFilter}>
            <CloseIcon />
          </button>
        </span>
      ) : null}
      {trimmedQuery ? (
        <div className="summary-scope-switch" aria-label="搜索范围">
          <button
            className={searchScope === "all" ? "is-active" : ""}
            type="button"
            aria-pressed={searchScope === "all"}
            onClick={() => onSearchScopeChange("all")}
          >
            全部书签
          </button>
          <button
            className={searchScope === "current-folder" ? "is-active" : ""}
            type="button"
            aria-pressed={searchScope === "current-folder"}
            onClick={() => onSearchScopeChange("current-folder")}
          >
            当前文件夹
          </button>
        </div>
      ) : null}
      <button className="link-button" type="button" onClick={onClearFilters}>
        清除筛选
      </button>
      <button className="summary-icon-button" type="button" aria-label="刷新书签数据" onClick={onRefresh}>
        <RefreshIcon />
      </button>
    </div>
  );
}
