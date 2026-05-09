import { useEffect, useRef, type FormEvent } from "react";
import type { BookmarkNode, FolderOption } from "../../bookmarks";
import {
  compactFolderPath,
  formatPopupFolderPath,
  type PopupPageDetails
} from "../../popup";
import { PagePreviewCard } from "../../../popup/components/PagePreviewCard";
import { FolderPathSelector } from "../components/FolderPathSelector";

export function SaveOverlayTab({
  createFolder,
  createOpen,
  createParentTitle,
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
  setCreateOpen,
  setCreateParentFolderId,
  setFolderName,
  setNote,
  setPreviewFailed,
  setSelectedFolderId,
  setTitle,
  showThumbnail,
  title,
  tree,
  onManageLocations
}: {
  createFolder(): Promise<void>;
  createOpen: boolean;
  createParentTitle: string;
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
  setCreateOpen(value: boolean): void;
  setCreateParentFolderId(value: string | undefined): void;
  setFolderName(value: string): void;
  setNote(value: string): void;
  setPreviewFailed(value: boolean): void;
  setSelectedFolderId(value: string): void;
  setTitle(value: string): void;
  showThumbnail: boolean;
  title: string;
  tree: BookmarkNode[];
  onManageLocations(): void;
}) {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const focusedRef = useRef(false);
  const displayPreview = showThumbnail;
  const noteLength = note.length;
  const isRestricted = pageDetails?.pageKind && pageDetails.pageKind !== "web";

  useEffect(() => {
    if (focusedRef.current || loading) {
      return;
    }

    focusedRef.current = true;
    window.setTimeout(() => titleInputRef.current?.focus(), 0);
  }, [loading]);

  return (
    <form id="save-overlay-form" className="save-tab save-overlay-save-tab" onSubmit={(event) => void save(event)}>
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
              <input
                ref={titleInputRef}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
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

          <label className="note-field compact">
            <span className="note-label-row">
              <span>备注</span>
              <small>{noteLength}/200</small>
            </span>
            <textarea
              value={note}
              placeholder="添加一点自己的上下文"
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          {isRestricted ? (
            <div className="save-info-banner" role="note">
              <span aria-hidden="true">i</span>
              <p>这是浏览器内部页面，可以保存为书签引用，之后可从书签中直接访问。</p>
            </div>
          ) : null}

          <section className="location-panel save-overlay-location-panel" aria-label="保存位置">
            <div className="location-heading">保存位置</div>
            <FolderPathSelector
              compactPath={compactFolderPath(selectedPath)}
              create={{
                open: createOpen,
                creating: creatingFolder,
                folderName,
                parentTitle: createParentTitle,
                onOpen: () => {
                  setCreateParentFolderId(undefined);
                  setFolderName("");
                  setCreateOpen(true);
                },
                onCancel: () => {
                  setCreateOpen(false);
                  setCreateParentFolderId(undefined);
                  setFolderName("");
                },
                onCreate: createFolder,
                onFolderNameChange: setFolderName
              }}
              fullPath={formatPopupFolderPath(selectedPath, "")}
              loading={loading}
              recentFolders={recentFolders}
              selectedFolderId={selectedFolderId}
              selectedTitle={selectedTitle}
              title="当前保存到"
              tree={tree}
              onManage={onManageLocations}
              onSelect={setSelectedFolderId}
            />
          </section>
        </div>
      </section>
    </form>
  );
}
