import { CloseIcon, SearchIcon } from "./icons/AppIcons";

interface SearchBarProps {
  value: string;
  onChange(value: string): void;
  onClear?(): void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "搜索标题或 URL"
}: SearchBarProps) {
  const canClear = value.trim().length > 0 && onClear;

  return (
    <div className="search-bar">
      <SearchIcon className="search-icon" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="搜索书签标题或 URL"
      />
      {canClear ? (
        <button
          className="search-clear-button"
          type="button"
          aria-label="清除搜索"
          onClick={(event) => {
            event.preventDefault();
            onClear();
          }}
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
}
