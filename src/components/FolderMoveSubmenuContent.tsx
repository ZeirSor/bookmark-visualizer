import { FolderCascadeMenu } from "./FolderCascadeMenu";
import {
  filterFolderOptions,
  flattenFolders,
  type BookmarkNode,
  type FolderOption
} from "../features/bookmarks";
import {
  canMoveBookmarkToFolder,
  type DraggedBookmarkSnapshot
} from "../features/drag-drop";

interface FolderMoveSubmenuContentProps {
  nodes: BookmarkNode[];
  recentFolders: FolderOption[];
  snapshot: DraggedBookmarkSnapshot;
  query: string;
  onQueryChange(query: string): void;
  onRequestCloseMenu(): void;
  onMove(folder: BookmarkNode): void;
  onCreateFolder(parentFolder: BookmarkNode): void;
  onCascadeEnter(): void;
  onCascadeLeave(): void;
}

export function FolderMoveSubmenuContent({
  nodes,
  recentFolders,
  snapshot,
  query,
  onQueryChange,
  onRequestCloseMenu,
  onMove,
  onCreateFolder,
  onCascadeEnter,
  onCascadeLeave
}: FolderMoveSubmenuContentProps) {
  const normalizedQuery = query.trim();
  const searching = normalizedQuery.length > 0;
  const searchableFolders = flattenFolders(nodes);
  const searchResults = searching
    ? filterFolderOptions(searchableFolders, normalizedQuery).filter((option) =>
        canMoveBookmarkToFolder(snapshot, option.node)
      )
    : [];

  return (
    <div className="move-submenu-content">
      <MoveSubmenuSearchInput
        value={query}
        onChange={onQueryChange}
        onRequestCloseMenu={onRequestCloseMenu}
      />

      {searching ? (
        <MoveFolderSearchResults results={searchResults} onMove={onMove} />
      ) : (
        <>
          <RecentMoveFolders
            recentFolders={recentFolders}
            snapshot={snapshot}
            onMove={onMove}
          />

          <div className="move-menu-divider" />

          <section className="move-menu-section" aria-label="所有文件夹">
            <div className="move-menu-section-label">所有文件夹</div>
            <FolderCascadeMenu
              nodes={nodes}
              currentFolderId={snapshot.parentId}
              disabledLabel="不可移动"
              onSelect={onMove}
              canSelect={(folder) => canMoveBookmarkToFolder(snapshot, folder)}
              onCreateFolder={onCreateFolder}
              onCascadeEnter={onCascadeEnter}
              onCascadeLeave={onCascadeLeave}
            />
          </section>
        </>
      )}
    </div>
  );
}

function MoveSubmenuSearchInput({
  value,
  onChange,
  onRequestCloseMenu
}: {
  value: string;
  onChange(value: string): void;
  onRequestCloseMenu(): void;
}) {
  return (
    <label className="move-submenu-search-wrap" onClick={(event) => event.stopPropagation()}>
      <span className="move-search-glyph" aria-hidden="true" />
      <input
        className="move-submenu-search"
        type="search"
        value={value}
        placeholder="搜索文件夹..."
        aria-label="搜索移动目标文件夹"
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          event.stopPropagation();

          if (event.key !== "Escape") {
            return;
          }

          event.preventDefault();
          if (value.trim()) {
            onChange("");
            return;
          }

          onRequestCloseMenu();
        }}
      />
    </label>
  );
}

function MoveFolderSearchResults({
  results,
  onMove
}: {
  results: FolderOption[];
  onMove(folder: BookmarkNode): void;
}) {
  return (
    <section className="move-menu-section" aria-label="搜索结果">
      <div className="move-menu-section-label">搜索结果</div>
      {results.length === 0 ? (
        <div className="move-menu-empty">没有匹配的文件夹</div>
      ) : (
        <div className="move-menu-list">
          {results.map((option) => (
            <MoveFolderOptionRow key={option.id} option={option} onMove={onMove} />
          ))}
        </div>
      )}
    </section>
  );
}

function RecentMoveFolders({
  recentFolders,
  snapshot,
  onMove
}: {
  recentFolders: FolderOption[];
  snapshot: DraggedBookmarkSnapshot;
  onMove(folder: BookmarkNode): void;
}) {
  const usableRecentFolders = recentFolders
    .filter((option) => canMoveBookmarkToFolder(snapshot, option.node))
    .slice(0, 3);

  if (usableRecentFolders.length === 0) {
    return null;
  }

  return (
    <section className="move-menu-section" aria-label="最近使用文件夹">
      <div className="move-menu-section-label">最近使用</div>
      <div className="move-menu-list">
        {usableRecentFolders.map((option) => (
          <MoveFolderOptionRow key={option.id} option={option} onMove={onMove} recent />
        ))}
      </div>
    </section>
  );
}

function MoveFolderOptionRow({
  option,
  onMove,
  recent = false
}: {
  option: FolderOption;
  onMove(folder: BookmarkNode): void;
  recent?: boolean;
}) {
  return (
    <button
      className={`move-folder-button move-folder-option-row ${recent ? "move-recent-folder-row" : ""}`}
      type="button"
      role="menuitem"
      onClick={() => onMove(option.node)}
    >
      <span className={recent ? "recent-folder-glyph" : "folder-glyph"} aria-hidden="true" />
      <span className="move-folder-label">
        <span>{option.title}</span>
        <small>{option.path}</small>
      </span>
    </button>
  );
}
