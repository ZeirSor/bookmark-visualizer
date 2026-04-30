interface SearchBarProps {
  value: string;
  onChange(value: string): void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="search-bar">
      <span className="search-icon" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜索标题或 URL"
        aria-label="搜索书签标题或 URL"
      />
    </label>
  );
}
