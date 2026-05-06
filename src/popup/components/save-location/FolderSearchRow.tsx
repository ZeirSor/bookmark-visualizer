import { CloseIcon, FolderPlusIcon, SearchIcon } from "../PopupIcons";

export function FolderSearchRow({
  createOpen,
  query,
  onClearQuery,
  onFocusSearch,
  onQueryChange,
  onToggleCreate
}: {
  createOpen: boolean;
  query: string;
  onClearQuery(): void;
  onFocusSearch(): void;
  onQueryChange(value: string): void;
  onToggleCreate(): void;
}) {
  return (
    <div className="folder-search-row">
      <div className="folder-search">
        <SearchIcon />
        <input
          aria-label="搜索文件夹"
          value={query}
          placeholder="搜索文件夹..."
          onFocus={onFocusSearch}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Escape" || !query.trim()) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            onClearQuery();
          }}
        />
        {query ? (
          <button
            type="button"
            className="folder-search-clear"
            aria-label="清空搜索"
            title="清空搜索"
            onClick={onClearQuery}
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>
      <button
        type="button"
        className={`icon-button compact location-create-button ${createOpen ? "is-active" : ""}`}
        aria-label={createOpen ? "关闭新建文件夹" : "新建文件夹"}
        title={createOpen ? "关闭新建文件夹" : "新建文件夹"}
        onClick={onToggleCreate}
      >
        <FolderPlusIcon />
      </button>
    </div>
  );
}
