import { useEffect, useMemo, useRef, useState } from "react";
import { FolderCascadeMenu } from "../../../components/FolderCascadeMenu";
import {
  buildFolderCascadeInitialPathIds,
  buildFolderPathHighlightIds,
  canCreateBookmarkInFolder,
  type BookmarkNode,
  type FolderOption
} from "../../../features/bookmarks";
import { FolderIcon } from "../../components/PopupIcons";

const DEFAULT_FOLDER_MENU_CLOSE_DELAY_MS = 220;

export function DefaultFolderMenu({
  defaultCompactPath,
  defaultFolderId,
  defaultPath,
  recentFolders,
  tree,
  updateDefaultFolder
}: {
  defaultCompactPath: string;
  defaultFolderId: string;
  defaultPath: string;
  recentFolders: FolderOption[];
  tree: BookmarkNode[];
  updateDefaultFolder(folderId: string): void;
}) {
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);
  const folderMenuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | undefined>(undefined);
  const initialPathIds = useMemo(
    () => buildFolderCascadeInitialPathIds(tree, defaultFolderId),
    [defaultFolderId, tree]
  );
  const highlightedFolderIds = useMemo(
    () => buildFolderPathHighlightIds(tree, defaultFolderId),
    [defaultFolderId, tree]
  );

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!folderMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (target instanceof Node && folderMenuRef.current?.contains(target)) {
        return;
      }

      closeFolderMenu();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      closeFolderMenu();
    }

    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [folderMenuOpen]);

  return (
    <>
      <div className="default-folder-row">
        <span className="location-folder-icon">
          <FolderIcon />
        </span>
        <span title={defaultPath || undefined}>{defaultCompactPath || "正在读取保存位置"}</span>
        <div
          ref={folderMenuRef}
          className="settings-cascade-host"
          onPointerEnter={keepFolderMenuOpen}
          onPointerLeave={scheduleFolderMenuClose}
        >
          <button
            type="button"
            className="secondary-action small"
            aria-expanded={folderMenuOpen}
            aria-haspopup="menu"
            onClick={openFolderMenu}
            onFocus={openFolderMenu}
          >
            更改
          </button>
          {folderMenuOpen ? (
            <div
              className="settings-cascade-menu"
              role="menu"
              onPointerEnter={keepFolderMenuOpen}
              onPointerLeave={scheduleFolderMenuClose}
            >
              <FolderCascadeMenu
                nodes={tree}
                selectedFolderId={defaultFolderId}
                currentFolderId={defaultFolderId}
                initialActivePathIds={initialPathIds}
                highlightedFolderIds={highlightedFolderIds}
                disabledLabel="不可保存"
                canSelect={canCreateBookmarkInFolder}
                onSelect={(folder) => {
                  updateDefaultFolder(folder.id);
                  closeFolderMenu();
                }}
                portalContainer={folderMenuRef.current ?? undefined}
              />
            </div>
          ) : null}
        </div>
      </div>
      {recentFolders.length > 0 ? (
        <div className="settings-mini-chips" aria-label="最近位置">
          {recentFolders.map((option) => (
            <button key={option.id} type="button" onClick={() => updateDefaultFolder(option.id)}>
              {option.title}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
  }

  function openFolderMenu() {
    clearCloseTimer();
    setFolderMenuOpen(true);
  }

  function closeFolderMenu() {
    clearCloseTimer();
    setFolderMenuOpen(false);
  }

  function keepFolderMenuOpen() {
    clearCloseTimer();
  }

  function scheduleFolderMenuClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(
      closeFolderMenu,
      DEFAULT_FOLDER_MENU_CLOSE_DELAY_MS
    );
  }
}
