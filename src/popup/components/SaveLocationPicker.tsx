import { useEffect, useMemo, useRef, useState } from "react";
import { FolderCascadeMenu } from "../../components/FolderCascadeMenu";
import {
  buildFolderCascadeInitialPathIds,
  buildFolderPathHighlightIds,
  canCreateBookmarkInFolder,
  type BookmarkNode,
  type FolderOption
} from "../../features/bookmarks";
import { formatPopupFolderPath, openWorkspace } from "../../features/popup";
import { ChevronRightIcon, FolderIcon, FolderPlusIcon, SearchIcon } from "./PopupIcons";

const LOCATION_MENU_CLOSE_DELAY_MS = 220;

export function SaveLocationPicker({
  createFolder,
  createOpen,
  folderName,
  loading,
  query,
  recentFolders,
  searchResults,
  selectedCompactPath,
  selectedFolderId,
  selectedPath,
  selectedTitle,
  setCreateOpen,
  setFolderName,
  setQuery,
  setSelectedFolderId,
  tree
}: {
  createFolder(): Promise<void>;
  createOpen: boolean;
  folderName: string;
  loading: boolean;
  query: string;
  recentFolders: FolderOption[];
  searchResults: FolderOption[];
  selectedCompactPath: string;
  selectedFolderId: string;
  selectedPath: string;
  selectedTitle: string;
  setCreateOpen(value: boolean): void;
  setFolderName(value: string): void;
  setQuery(value: string): void;
  setSelectedFolderId(value: string): void;
  tree: BookmarkNode[];
}) {
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const locationMenuRef = useRef<HTMLDivElement>(null);
  const closeLocationTimerRef = useRef<number | undefined>(undefined);
  const displayPath = selectedCompactPath || formatPopupFolderPath(selectedPath);
  const cascadeInitialPathIds = useMemo(
    () => buildFolderCascadeInitialPathIds(tree, selectedFolderId),
    [selectedFolderId, tree]
  );
  const highlightedFolderIds = useMemo(
    () => buildFolderPathHighlightIds(tree, selectedFolderId),
    [selectedFolderId, tree]
  );

  useEffect(() => {
    return () => clearLocationMenuCloseTimer();
  }, []);

  useEffect(() => {
    if (!locationMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (target instanceof Node && locationMenuRef.current?.contains(target)) {
        return;
      }

      closeLocationMenu();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      closeLocationMenu();
    }

    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [locationMenuOpen]);

  return (
    <section className="location-panel" aria-label="保存位置">
      <div className="location-heading">保存位置</div>
      <div
        ref={locationMenuRef}
        className="location-picker-shell"
        onPointerEnter={keepLocationMenuOpen}
        onPointerLeave={scheduleLocationMenuClose}
      >
        <button
          type="button"
          className="location-path-row"
          aria-controls="save-location-picker"
          aria-expanded={locationMenuOpen}
          aria-haspopup="menu"
          title={formatPopupFolderPath(selectedPath, "") || undefined}
          onClick={() => (locationMenuOpen ? closeLocationMenu() : openLocationMenu())}
          onFocus={openLocationMenu}
        >
          <span className="location-folder-icon">
            <FolderIcon />
          </span>
          <span className="path-display">{displayPath}</span>
          <span className="current-badge">当前位置</span>
          <ChevronRightIcon />
        </button>
        {locationMenuOpen ? (
          <div
            id="save-location-picker"
            className="location-cascade-menu"
            role="menu"
            onPointerEnter={keepLocationMenuOpen}
            onPointerLeave={scheduleLocationMenuClose}
          >
            <FolderCascadeMenu
              nodes={tree}
              selectedFolderId={selectedFolderId}
              currentFolderId={selectedFolderId}
              initialActivePathIds={cascadeInitialPathIds}
              highlightedFolderIds={highlightedFolderIds}
              disabledLabel="不可保存"
              canSelect={canCreateBookmarkInFolder}
              onSelect={(folder) => {
                setSelectedFolderId(folder.id);
                setQuery("");
                closeLocationMenu();
              }}
              portalContainer={locationMenuRef.current ?? undefined}
            />
          </div>
        ) : null}
      </div>

      <div className="folder-search-row">
        <label className="folder-search">
          <SearchIcon />
          <input
            value={query}
            placeholder="搜索文件夹..."
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="icon-button compact"
          aria-label="新建文件夹"
          title="新建文件夹"
          onClick={() => setCreateOpen(!createOpen)}
        >
          <FolderPlusIcon />
        </button>
      </div>

      {query ? (
        <div className="folder-results" aria-label="文件夹搜索结果">
          {searchResults.length === 0 ? <p>没有匹配的文件夹</p> : null}
          {searchResults.map((option) => (
            <button
              key={option.id}
              type="button"
              className={option.id === selectedFolderId ? "is-selected" : ""}
              onClick={() => {
                setSelectedFolderId(option.id);
                setQuery("");
                closeLocationMenu();
              }}
            >
              <FolderIcon />
              <span>
                <strong>{option.title}</strong>
                <small>{formatPopupFolderPath(option.path, option.path)}</small>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {createOpen ? (
        <div className="create-folder-row">
          <input
            value={folderName}
            placeholder={`新建在 ${selectedTitle || "当前文件夹"}`}
            onChange={(event) => setFolderName(event.target.value)}
          />
          <button type="button" onClick={() => void createFolder()}>
            新建
          </button>
        </div>
      ) : null}

      <div className="recent-row">
        <div>
          <strong>最近使用</strong>
          <button type="button" onClick={() => void openWorkspace()}>
            管理位置
          </button>
        </div>
        {recentFolders.length === 0 ? (
          <p>{loading ? "正在读取文件夹..." : "保存成功后会显示最近位置"}</p>
        ) : (
          <div className="recent-chips">
            {recentFolders.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedFolderId(option.id);
                  setQuery("");
                  closeLocationMenu();
                }}
              >
                <FolderIcon />
                {option.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  function clearLocationMenuCloseTimer() {
    if (closeLocationTimerRef.current) {
      window.clearTimeout(closeLocationTimerRef.current);
      closeLocationTimerRef.current = undefined;
    }
  }

  function openLocationMenu() {
    clearLocationMenuCloseTimer();
    setLocationMenuOpen(true);
  }

  function closeLocationMenu() {
    clearLocationMenuCloseTimer();
    setLocationMenuOpen(false);
  }

  function keepLocationMenuOpen() {
    clearLocationMenuCloseTimer();
  }

  function scheduleLocationMenuClose() {
    clearLocationMenuCloseTimer();
    closeLocationTimerRef.current = window.setTimeout(
      closeLocationMenu,
      LOCATION_MENU_CLOSE_DELAY_MS
    );
  }
}
