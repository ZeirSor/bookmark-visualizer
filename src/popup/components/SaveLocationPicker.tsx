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
import { FolderSearchResults } from "./save-location/FolderSearchResults";
import { FolderSearchRow } from "./save-location/FolderSearchRow";
import { InlineCreateFolderRow } from "./save-location/InlineCreateFolderRow";
import { LocationPathRow } from "./save-location/LocationPathRow";
import { RecentFolderChips } from "./save-location/RecentFolderChips";

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
  const [recentExpanded, setRecentExpanded] = useState(false);
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
        <LocationPathRow
          displayPath={displayPath}
          fullPathTitle={formatPopupFolderPath(selectedPath, "")}
          locationMenuOpen={locationMenuOpen}
          onToggleMenu={() => (locationMenuOpen ? closeLocationMenu() : openLocationMenu())}
        />
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
                selectFolder(folder.id);
              }}
              onCascadeEnter={keepLocationMenuOpen}
              onCascadeLeave={scheduleLocationMenuClose}
              portalContainer={locationMenuRef.current ?? undefined}
            />
          </div>
        ) : null}
      </div>

      <FolderSearchRow
        createOpen={createOpen}
        query={query}
        onClearQuery={() => setQuery("")}
        onFocusSearch={closeLocationMenu}
        onQueryChange={(value) => {
          setQuery(value);
          setCreateOpen(false);
          closeLocationMenu();
        }}
        onToggleCreate={() => {
          setQuery("");
          closeLocationMenu();
          setCreateOpen(!createOpen);
        }}
      />

      {query ? (
        <FolderSearchResults
          searchResults={searchResults}
          selectedFolderId={selectedFolderId}
          onSelect={selectFolder}
        />
      ) : null}

      {createOpen ? (
        <InlineCreateFolderRow
          folderName={folderName}
          selectedTitle={selectedTitle}
          onCancel={cancelCreateFolder}
          onCreate={createFolder}
          onFolderNameChange={setFolderName}
        />
      ) : null}

      <RecentFolderChips
        loading={loading}
        recentExpanded={recentExpanded}
        recentFolders={recentFolders}
        onManage={() => void openWorkspace()}
        onSelect={selectFolder}
        onToggleExpanded={() => setRecentExpanded((current) => !current)}
      />
    </section>
  );

  function selectFolder(folderId: string) {
    setSelectedFolderId(folderId);
    setQuery("");
    setCreateOpen(false);
    closeLocationMenu();
  }

  function cancelCreateFolder() {
    setFolderName("");
    setCreateOpen(false);
  }

  function clearLocationMenuCloseTimer() {
    if (closeLocationTimerRef.current) {
      window.clearTimeout(closeLocationTimerRef.current);
      closeLocationTimerRef.current = undefined;
    }
  }

  function openLocationMenu() {
    clearLocationMenuCloseTimer();
    setCreateOpen(false);
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
