import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildFolderPathHighlightIds,
  type BookmarkNode,
  type FolderOption
} from "../../features/bookmarks";
import { formatPopupFolderPath, openWorkspace } from "../../features/popup";
import { FolderSearchResults } from "./save-location/FolderSearchResults";
import { FolderSearchRow } from "./save-location/FolderSearchRow";
import { InlineCreateFolderRow } from "./save-location/InlineCreateFolderRow";
import { LocationCascadeOverlay } from "./save-location/LocationCascadeOverlay";
import { LocationPathRow } from "./save-location/LocationPathRow";
import { RecentFolderChips } from "./save-location/RecentFolderChips";

const LOCATION_MENU_CLOSE_DELAY_MS = 220;

export function SaveLocationPicker({
  createParentFolderId,
  createParentTitle,
  createFolder,
  createOpen,
  creatingFolder,
  folderName,
  loading,
  query,
  recentFolders,
  searchResults,
  selectedFolderId,
  selectedPath,
  selectedTitle,
  setCreateParentFolderId,
  setCreateOpen,
  setFolderName,
  setQuery,
  setSelectedFolderId,
  tree
}: {
  createParentFolderId?: string;
  createParentTitle: string;
  createFolder(): Promise<void>;
  createOpen: boolean;
  creatingFolder: boolean;
  folderName: string;
  loading: boolean;
  query: string;
  recentFolders: FolderOption[];
  searchResults: FolderOption[];
  selectedFolderId: string;
  selectedPath: string;
  selectedTitle: string;
  setCreateParentFolderId(value: string | undefined): void;
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
  const displayPath = formatPopupFolderPath(selectedPath);
  const highlightedFolderIds = useMemo(
    () => buildFolderPathHighlightIds(tree, selectedFolderId),
    [selectedFolderId, tree]
  );

  useEffect(() => {
    return () => clearLocationMenuCloseTimer();
  }, []);

  return (
    <section className="location-panel" aria-label="保存位置">
      <div className="location-heading">保存位置</div>
      <div
        ref={locationMenuRef}
        className="location-picker-shell"
      >
        <LocationPathRow
          displayPath={displayPath}
          fullPathTitle={formatPopupFolderPath(selectedPath, "")}
          locationMenuOpen={locationMenuOpen}
          onToggleMenu={() => (locationMenuOpen ? closeLocationMenu() : openLocationMenu())}
        />
        {locationMenuOpen ? (
          <LocationCascadeOverlay
            anchorElement={locationMenuRef.current}
            currentFolderId={selectedFolderId}
            highlightedFolderIds={highlightedFolderIds}
            selectedFolderId={selectedFolderId}
            tree={tree}
            onCascadeEnter={keepLocationMenuOpen}
            onCascadeLeave={scheduleLocationMenuClose}
            onCreateFolder={(parentFolder) => {
              startCreateFolder(parentFolder.id);
            }}
            onRequestClose={closeLocationMenu}
            onSelect={(folder) => {
              selectFolder(folder.id);
            }}
          />
        ) : null}
      </div>

      <FolderSearchRow
        createOpen={createOpen}
        query={query}
        onClearQuery={() => setQuery("")}
        onFocusSearch={() => {
          closeLocationMenu();
          setCreateOpen(false);
          setCreateParentFolderId(undefined);
        }}
        onQueryChange={(value) => {
          setQuery(value);
          setCreateOpen(false);
          setCreateParentFolderId(undefined);
          closeLocationMenu();
        }}
        onToggleCreate={() => {
          setQuery("");
          setFolderName("");
          closeLocationMenu();
          setCreateParentFolderId(undefined);
          setCreateOpen(!createOpen);
        }}
      />

      {query ? (
        <FolderSearchResults
          query={query}
          searchResults={searchResults}
          selectedFolderId={selectedFolderId}
          onSelect={selectFolder}
        />
      ) : null}

      {createOpen ? (
        <InlineCreateFolderRow
          creating={creatingFolder}
          folderName={folderName}
          selectedTitle={createParentFolderId ? createParentTitle : selectedTitle}
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
    setCreateParentFolderId(undefined);
    closeLocationMenu();
  }

  function cancelCreateFolder() {
    setFolderName("");
    setCreateOpen(false);
    setCreateParentFolderId(undefined);
  }

  function startCreateFolder(parentFolderId: string) {
    setCreateParentFolderId(parentFolderId);
    setFolderName("");
    setQuery("");
    setCreateOpen(true);
    closeLocationMenu();
  }

  function clearLocationMenuCloseTimer() {
    if (closeLocationTimerRef.current) {
      window.clearTimeout(closeLocationTimerRef.current);
      closeLocationTimerRef.current = undefined;
    }
  }

  function openLocationMenu() {
    clearLocationMenuCloseTimer();
    setQuery("");
    setCreateOpen(false);
    setCreateParentFolderId(undefined);
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
