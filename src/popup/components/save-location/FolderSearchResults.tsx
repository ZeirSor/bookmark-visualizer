import { rankFolderOption, type FolderOption } from "../../../features/bookmarks";
import { formatPopupFolderPath } from "../../../features/popup";
import { FolderIcon } from "../PopupIcons";

export function FolderSearchResults({
  query,
  searchResults,
  selectedFolderId,
  onSelect
}: {
  query: string;
  searchResults: FolderOption[];
  selectedFolderId: string;
  onSelect(folderId: string): void;
}) {
  return (
    <div className="folder-results" aria-label="文件夹搜索结果">
      {searchResults.length === 0 ? <p>没有匹配的文件夹</p> : null}
      {searchResults.map((option, index) => (
        <button
          key={option.id}
          type="button"
          className={option.id === selectedFolderId ? "is-selected" : ""}
          onClick={() => onSelect(option.id)}
        >
          <FolderIcon />
          <span className="folder-result-main">
            <strong>{option.title}</strong>
            <small>{formatPopupFolderPath(option.path, option.path)}</small>
          </span>
          {index === 0 && rankFolderOption(option, query) <= 2 ? (
            <span className="result-badge">最佳匹配</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
