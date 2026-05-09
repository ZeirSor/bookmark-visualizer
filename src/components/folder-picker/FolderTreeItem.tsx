import { ChevronRightIcon, CheckIcon, FolderIcon } from "../../popup/components/PopupIcons";
import type { FolderTreeEntry } from "./FolderTree";

export function FolderTreeItem({
  active,
  entry,
  selected,
  showPath = false,
  onActivate,
  onSelect,
  onToggleExpanded
}: {
  entry: FolderTreeEntry;
  selected: boolean;
  active: boolean;
  showPath?: boolean;
  onActivate(folderId: string): void;
  onSelect(folderId: string): void;
  onToggleExpanded(folderId: string): void;
}) {
  return (
    <div
      className={`folder-tree-item ${selected ? "is-selected" : ""} ${active ? "is-active" : ""} ${
        entry.canSelect ? "" : "is-disabled"
      }`}
      role="treeitem"
      aria-selected={selected}
      aria-expanded={entry.hasChildren ? entry.expanded : undefined}
      onMouseEnter={() => onActivate(entry.id)}
      style={{ paddingLeft: `${10 + entry.depth * 18}px` }}
    >
      <button
        type="button"
        className="folder-tree-disclosure"
        aria-label={entry.expanded ? "收起文件夹" : "展开文件夹"}
        disabled={!entry.hasChildren}
        onClick={(event) => {
          event.stopPropagation();
          onToggleExpanded(entry.id);
        }}
      >
        {entry.hasChildren ? <ChevronRightIcon /> : <span aria-hidden="true" />}
      </button>
      <button
        type="button"
        className="folder-tree-label"
        title={entry.path}
        disabled={!entry.canSelect}
        onClick={() => onSelect(entry.id)}
      >
        <FolderIcon filled={selected} />
        <span className="folder-tree-copy">
          <strong>{entry.title}</strong>
          {showPath ? <small>{entry.path}</small> : null}
        </span>
        {selected ? (
          <span className="folder-tree-current">
            <CheckIcon />
            当前位置
          </span>
        ) : null}
      </button>
    </div>
  );
}
