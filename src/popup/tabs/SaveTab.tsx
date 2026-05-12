import type { FormEvent } from "react";
import { Input, Textarea } from "../../design-system";
import type { BookmarkNode, FolderOption } from "../../features/bookmarks";
import type { PopupPageDetails } from "../../features/popup";
import { PagePreviewCard } from "../components/PagePreviewCard";
import { SaveLocationPicker } from "../components/SaveLocationPicker";

export function SaveTab({
  createParentFolderId,
  createParentTitle,
  createFolder,
  createOpen,
  creatingFolder,
  folderName,
  loading,
  note,
  pageDetails,
  previewFailed,
  recentFolders,
  save,
  selectedFolderId,
  selectedPath,
  selectedTitle,
  setCreateParentFolderId,
  setCreateOpen,
  setFolderName,
  setNote,
  setPreviewFailed,
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
  creatingFolder: boolean;
  folderName: string;
  loading: boolean;
  note: string;
  pageDetails?: PopupPageDetails;
  previewFailed: boolean;
  recentFolders: FolderOption[];
  save(event?: FormEvent<HTMLFormElement>): Promise<void>;
  selectedFolderId: string;
  selectedPath: string;
  selectedTitle: string;
  setCreateParentFolderId(value: string | undefined): void;
  setCreateOpen(value: boolean): void;
  setFolderName(value: string): void;
  setNote(value: string): void;
  setPreviewFailed(value: boolean): void;
  setSelectedFolderId(value: string): void;
  setTitle(value: string): void;
  title: string;
  tree: BookmarkNode[];
  showThumbnail: boolean;
}) {
  const displayPreview = showThumbnail;
  const noteLength = note.length;
  const isBrowserInternal = pageDetails?.pageKind === "browser-internal";

  return (
    <form id="popup-save-form" className="save-tab" onSubmit={(event) => void save(event)}>
      <section className={`save-layout ${displayPreview ? "" : "without-preview"}`} aria-label="当前网页">
        {displayPreview ? (
          <aside className="save-preview-column">
            <PagePreviewCard
              details={pageDetails}
              loading={loading}
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
              <Input fullWidth required value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label>
              <span>URL</span>
              <Input
                className="url-input"
                fullWidth
                value={pageDetails?.url ?? ""}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
          </div>

          <label className="note-field compact">
            <span className="note-label-row">
              <span>备注</span>
              <small>{noteLength}/200</small>
            </span>
            <Textarea
              fullWidth
              maxLength={200}
              resize="none"
              value={note}
              placeholder="添加一点自己的上下文"
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          {isBrowserInternal ? (
            <div className="save-info-banner" role="note">
              <span aria-hidden="true">i</span>
              <p>这是浏览器内部页面，可以保存为书签或引用，之后可从书签中直接访问。</p>
            </div>
          ) : null}

          <SaveLocationPicker
            createParentFolderId={createParentFolderId}
            createParentTitle={createParentTitle}
            createFolder={createFolder}
            createOpen={createOpen}
            creatingFolder={creatingFolder}
            folderName={folderName}
            loading={loading}
            recentFolders={recentFolders}
            selectedFolderId={selectedFolderId}
            selectedPath={selectedPath}
            selectedTitle={selectedTitle}
            setCreateParentFolderId={setCreateParentFolderId}
            setCreateOpen={setCreateOpen}
            setFolderName={setFolderName}
            setSelectedFolderId={setSelectedFolderId}
            tree={tree}
          />
        </div>
      </section>
    </form>
  );
}
