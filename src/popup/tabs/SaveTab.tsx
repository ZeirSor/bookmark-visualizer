import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { FolderCascadeMenu } from "../../components/FolderCascadeMenu";
import {
  buildFolderCascadeInitialPathIds,
  buildFolderPathHighlightIds,
  canCreateBookmarkInFolder,
  type BookmarkNode,
  type FolderOption
} from "../../features/bookmarks";
import { openWorkspace, type PopupPageDetails } from "../../features/popup";
import { CheckIcon, ChevronRightIcon, FolderIcon, FolderPlusIcon, SearchIcon } from "../components/PopupIcons";

const LOCATION_MENU_CLOSE_DELAY_MS = 220;

export function SaveTab({
  createFolder,
  createOpen,
  folderName,
  loading,
  note,
  pageDetails,
  previewFailed,
  query,
  recentFolders,
  save,
  saving,
  searchResults,
  selectedCompactPath,
  selectedFolderId,
  selectedPath,
  selectedTitle,
  setCreateOpen,
  setFolderName,
  setNote,
  setPreviewFailed,
  setQuery,
  setSelectedFolderId,
  setTitle,
  status,
  title,
  tree,
  showThumbnail
}: {
  createFolder(): Promise<void>;
  createOpen: boolean;
  folderName: string;
  loading: boolean;
  note: string;
  pageDetails?: PopupPageDetails;
  previewFailed: boolean;
  query: string;
  recentFolders: FolderOption[];
  save(event?: FormEvent<HTMLFormElement>): Promise<void>;
  saving: boolean;
  searchResults: FolderOption[];
  selectedCompactPath: string;
  selectedFolderId: string;
  selectedPath: string;
  selectedTitle: string;
  setCreateOpen(value: boolean): void;
  setFolderName(value: string): void;
  setNote(value: string): void;
  setPreviewFailed(value: boolean): void;
  setQuery(value: string): void;
  setSelectedFolderId(value: string): void;
  setTitle(value: string): void;
  status: string;
  title: string;
  tree: BookmarkNode[];
  showThumbnail: boolean;
}) {
  const canSave = Boolean(pageDetails?.canSave && selectedFolderId);
  const previewUrl = pageDetails?.previewImageUrl;
  const displayPreview = showThumbnail;
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const locationMenuRef = useRef<HTMLDivElement>(null);
  const closeLocationTimerRef = useRef<number | undefined>(undefined);
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
    <form className="save-tab" onSubmit={(event) => void save(event)}>
      <div className="save-scroll-area">
        <section className={`page-grid ${displayPreview ? "" : "without-preview"}`} aria-label="当前网页">
          {displayPreview ? (
            <div className="page-preview">
              {previewUrl && !previewFailed ? (
                <img src={previewUrl} alt="" onError={() => setPreviewFailed(true)} />
              ) : (
                <span>{pageDetails?.domain || "No preview"}</span>
              )}
            </div>
          ) : null}
          <div className="field-stack">
            <label>
              <span>标题</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label>
              <span>URL</span>
              <input
                className="url-input"
                value={pageDetails?.url ?? ""}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
          </div>
        </section>

        <label className="note-field">
          <span>备注</span>
          <textarea
            value={note}
            placeholder="添加一点自己的上下文"
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        <section className="location-panel" aria-label="保存位置">
          <div className="location-heading">保存位置</div>
          <div className="location-path-row">
            <span className="location-folder-icon">
              <FolderIcon />
            </span>
            <span className="path-display" title={selectedPath || undefined}>
              {selectedCompactPath || "正在读取保存位置"}
            </span>
            <div
              ref={locationMenuRef}
              className="location-cascade-host"
              onPointerEnter={keepLocationMenuOpen}
              onPointerLeave={scheduleLocationMenuClose}
            >
              <button
                type="button"
                className="icon-button compact location-cascade-trigger"
                aria-label="选择保存位置"
                aria-expanded={locationMenuOpen}
                aria-haspopup="menu"
                title="选择保存位置"
                onClick={openLocationMenu}
                onFocus={openLocationMenu}
                onPointerEnter={openLocationMenu}
              >
                <ChevronRightIcon />
              </button>
              {locationMenuOpen ? (
                <div
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
                  }}
                >
                  <FolderIcon />
                  <span>
                    <strong>{option.title}</strong>
                    <small>{option.path}</small>
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
                  <button key={option.id} type="button" onClick={() => setSelectedFolderId(option.id)}>
                    <FolderIcon />
                    {option.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="popup-footer">
        <div className={`status-line ${pageDetails?.canSave === false ? "is-error" : ""}`} aria-live="polite">
          {status ? (
            status
          ) : (
            <>
              <CheckIcon />
              <span>快捷键：Ctrl+Shift+S</span>
            </>
          )}
        </div>
        <div className="footer-actions">
          <button type="button" className="secondary-action" onClick={() => window.close()}>
            取消
          </button>
          <button type="submit" className="primary-action" disabled={saving || !canSave}>
            {saving ? "保存中..." : selectedTitle ? `保存到 ${selectedTitle}` : "保存"}
          </button>
        </div>
      </footer>
    </form>
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
