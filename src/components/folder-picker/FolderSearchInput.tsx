import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { CloseIcon, SearchIcon } from "../../popup/components/PopupIcons";

export function FolderSearchInput({
  onChange,
  onClear,
  onKeyDown,
  placeholder = "搜索文件夹",
  value
}: {
  value: string;
  placeholder?: string;
  onChange(value: string): void;
  onClear(): void;
  onKeyDown?(event: ReactKeyboardEvent<HTMLInputElement>): void;
}) {
  return (
    <label className="folder-search-input">
      <SearchIcon />
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
      {value ? (
        <button type="button" aria-label="清空搜索" onClick={onClear}>
          <CloseIcon />
        </button>
      ) : null}
    </label>
  );
}
