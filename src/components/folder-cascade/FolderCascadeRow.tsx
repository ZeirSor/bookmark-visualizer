import { useLayoutEffect, useRef, type FocusEvent, type PointerEvent } from "react";
import {
  getDisplayTitle,
  isFolder,
  type BookmarkNode
} from "../../features/bookmarks";
import {
  getCascadeButtonClassName,
  getCascadeRowBehavior
} from "../../features/context-menu";
import { FolderLineIcon } from "../icons/MenuActionIcons";

export function FolderCascadeRow({
  folder,
  parentPath,
  activePath,
  highlightedFolderIdSet,
  selectedFolderId,
  currentFolderId,
  disabledLabel,
  onSelect,
  canSelect,
  onOpenFolder,
  canCreateFolder,
  onRowEnter,
  onRegisterAnchor
}: {
  folder: BookmarkNode;
  parentPath: string[];
  activePath: string[];
  highlightedFolderIdSet: Set<string>;
  selectedFolderId?: string;
  currentFolderId?: string;
  disabledLabel?: string;
  onSelect(folder: BookmarkNode): void;
  canSelect(folder: BookmarkNode): boolean;
  onOpenFolder?(folder: BookmarkNode): void;
  canCreateFolder: boolean;
  onRowEnter(parentPath: string[], folder: BookmarkNode, hasSubmenu: boolean, element: HTMLElement): void;
  onRegisterAnchor(folderId: string, element: HTMLElement): void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const selectable = canSelect(folder);
  const nestedFolders = folder.children?.filter(isFolder) ?? [];
  const behavior = getCascadeRowBehavior({
    selectable,
    nestedFolderCount: nestedFolders.length,
    canCreateFolder
  });
  const isCurrentFolder = currentFolderId === folder.id;
  const isSelected = selectedFolderId === folder.id;
  const isHighlighted = highlightedFolderIdSet.has(folder.id);
  const title = getDisplayTitle(folder);
  const rowNote = isCurrentFolder
    ? "当前位置"
    : !behavior.canSelect && disabledLabel
      ? disabledLabel
      : undefined;
  const hasTrailing = Boolean(rowNote) || behavior.hasSubmenu;

  useLayoutEffect(() => {
    const element = rowRef.current;

    if (element && activePath.includes(folder.id)) {
      onRegisterAnchor(folder.id, element);
    }
  }, [activePath, folder.id, onRegisterAnchor]);

  function handleEnter(event: PointerEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) {
    onRowEnter(parentPath, folder, behavior.hasSubmenu, event.currentTarget);
  }

  return (
    <div
      ref={rowRef}
      className={`move-folder-row ${behavior.hasSubmenu ? "has-children" : ""} ${
        isCurrentFolder ? "is-current-parent" : ""
      } ${isSelected ? "is-selected" : ""} ${isHighlighted ? "is-path-highlighted" : ""}`}
      onPointerEnter={handleEnter}
      onFocus={handleEnter}
    >
      <button
        className={getCascadeButtonClassName()}
        type="button"
        aria-disabled={!behavior.canSelect}
        disabled={behavior.buttonDisabled}
        title={title}
        onClick={() => {
          if (behavior.canSelect) {
            onSelect(folder);
          }
        }}
        onDoubleClick={() => {
          if (behavior.hasSubmenu) {
            onOpenFolder?.(folder);
          }
        }}
      >
        <span className="menu-action-icon-slot" aria-hidden="true">
          <FolderLineIcon />
        </span>
        <span className="menu-action-label">{title}</span>
        {hasTrailing ? (
          <span className="move-folder-row-trailing">
            {rowNote ? <span className="move-menu-note">{rowNote}</span> : null}
            {behavior.hasSubmenu ? <span className="menu-chevron" aria-hidden="true" /> : null}
          </span>
        ) : null}
      </button>
    </div>
  );
}
