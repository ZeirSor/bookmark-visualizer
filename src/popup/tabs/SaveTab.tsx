import type { FormEvent } from "react";
import type { BookmarkNode, FolderOption } from "../../features/bookmarks";
import type { PopupPageDetails } from "../../features/popup";
import { PagePreviewCard } from "../components/PagePreviewCard";
import { SaveLocationPicker } from "../components/SaveLocationPicker";

export function SaveTab({
  createParentFolderId,
  createParentTitle,
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
  searchResults,
  selectedFolderId,
  selectedPath,
  selectedTitle,
  setCreateParentFolderId,
  setCreateOpen,
  setFolderName,
  setNote,
  setPreviewFailed,
  setQuery,
  setSelectedFolderId,
  setTitle,
  title,
  tree,
  showThumbnail
}: {
  createParentFolderId?: string;
  createParentTitle: string;
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
  searchResults: FolderOption[];
  selectedFolderId: string;
  selectedPath: string;
  selectedTitle: string;
  setCreateParentFolderId(value: string | undefined): void;
  setCreateOpen(value: boolean): void;
  setFolderName(value: string): void;
  setNote(value: string): void;
  setPreviewFailed(value: boolean): void;
  setQuery(value: string): void;
  setSelectedFolderId(value: string): void;
  setTitle(value: string): void;
  title: string;
  tree: BookmarkNode[];
  showThumbnail: boolean;
}) {
  const displayPreview = showThumbnail;

  return (
    <form id="popup-save-form" className="save-tab" onSubmit={(event) => void save(event)}>
      <section className={`save-layout ${displayPreview ? "" : "without-preview"}`} aria-label="当前网页">
        {displayPreview ? (
          <aside className="save-preview-column">
            <PagePreviewCard
              details={pageDetails}
              previewFailed={previewFailed}
              setPreviewFailed={setPreviewFailed}
              title={title}
            />
          </aside>
        ) : null}

        <div className="save-editor-column">
          <div className="field-stack compact">
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

          <SaveLocationPicker
            createParentFolderId={createParentFolderId}
            createParentTitle={createParentTitle}
            createFolder={createFolder}
            createOpen={createOpen}
            folderName={folderName}
            loading={loading}
            query={query}
            recentFolders={recentFolders}
            searchResults={searchResults}
            selectedFolderId={selectedFolderId}
            selectedPath={selectedPath}
            selectedTitle={selectedTitle}
            setCreateParentFolderId={setCreateParentFolderId}
            setCreateOpen={setCreateOpen}
            setFolderName={setFolderName}
            setQuery={setQuery}
            setSelectedFolderId={setSelectedFolderId}
            tree={tree}
          />

          <label className="note-field compact">
            <span>备注</span>
            <textarea
              value={note}
              placeholder="添加一点自己的上下文"
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
        </div>
      </section>
    </form>
  );
}
