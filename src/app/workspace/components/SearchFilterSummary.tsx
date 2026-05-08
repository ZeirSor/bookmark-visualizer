import { CloseIcon } from "../../../components/icons/AppIcons";
import { RefreshIcon } from "../../../components/icons/ManagerIcons";

interface SearchFilterSummaryProps {
  query: string;
  resultCount: number;
  onClearQuery(): void;
  onRefresh(): void;
}

export function SearchFilterSummary({
  query,
  resultCount,
  onClearQuery,
  onRefresh
}: SearchFilterSummaryProps) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return null;
  }

  return (
    <div className="search-filter-summary" aria-label="筛选摘要">
      <strong>筛选结果 {resultCount} 个</strong>
      <span className="filter-chip">
        {trimmedQuery}
        <button type="button" aria-label={`清除搜索 ${trimmedQuery}`} onClick={onClearQuery}>
          <CloseIcon />
        </button>
      </span>
      <button className="link-button" type="button" onClick={onClearQuery}>
        清除筛选
      </button>
      <button className="summary-icon-button" type="button" aria-label="刷新书签数据" onClick={onRefresh}>
        <RefreshIcon />
      </button>
    </div>
  );
}
