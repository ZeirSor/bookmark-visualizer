import { useEffect, useRef } from "react";
import { FolderCascadeMenu } from "../../components/FolderCascadeMenu";
import {
  CheckIcon,
  CloseIcon,
  FolderIcon,
  RecentIcon,
  SearchIcon
} from "../../components/icons/AppIcons";
import { canCreateBookmarkInFolder } from "../bookmarks";
import { CreateFolderAction } from "./components/CreateFolderAction";
import { FolderBreadcrumb } from "./components/FolderBreadcrumb";
import { trapFocus } from "./focusTrap";
import { useQuickSaveFolderBrowser } from "./hooks/useQuickSaveFolderBrowser";
import { useQuickSaveFormState } from "./hooks/useQuickSaveFormState";
import { useQuickSaveInitialState } from "./hooks/useQuickSaveInitialState";
import type { QuickSavePageDetails } from "./types";

export function QuickSaveDialog({
  pageDetails,
  shadowRoot,
  onClose
}: {
  pageDetails: QuickSavePageDetails;
  shadowRoot: ShadowRoot;
  onClose(): void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const cascadePortalRef = useRef<HTMLDivElement>(null);
  const folderBrowser = useQuickSaveFolderBrowser({
    setStatus: (message) => initialState.setStatus(message)
  });
  const formState = useQuickSaveFormState({
    pageDetails,
    selectedFolderId: folderBrowser.selectedFolderId,
    selectedFolderTitle: folderBrowser.selectedFolderTitle,
    setStatus: (message) => initialState.setStatus(message),
    onClose
  });
  const initialState = useQuickSaveInitialState({
    onApplyInitialState: folderBrowser.applyInitialState,
    onReady: () => window.setTimeout(() => formState.titleInputRef.current?.focus(), 0)
  });

  useEffect(() => {
    function handleKeyDown(rawEvent: Event) {
      const event = rawEvent as KeyboardEvent;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && (event.key.toLocaleLowerCase() === "s" || event.key === "Enter")) {
        event.preventDefault();
        void formState.save();
        return;
      }

      if (event.key === "Tab") {
        trapFocus(event, shadowRoot);
      }
    }

    shadowRoot.addEventListener("keydown", handleKeyDown);
    return () => shadowRoot.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="quick-save-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        ref={dialogRef}
        className="quick-save-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-save-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="quick-save-header">
          <h2 id="quick-save-title">保存当前网页</h2>
          <button className="secondary-button" type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <form className="quick-save-form" onSubmit={formState.handleSubmit}>
          <section className="page-details-grid" aria-label="网页信息">
            <div className="preview-image">
              {pageDetails.previewImageUrl && !formState.previewFailed ? (
                <img
                  src={pageDetails.previewImageUrl}
                  alt=""
                  onError={() => formState.setPreviewFailed(true)}
                />
              ) : (
                <span>无预览图</span>
              )}
            </div>

            <div className="detail-fields">
              <label>
                <span>标题</span>
                <input
                  ref={formState.titleInputRef}
                  value={formState.title}
                  onChange={(event) => formState.setTitle(event.target.value)}
                />
              </label>
              <label>
                <span>URL</span>
                <input value={pageDetails.url} readOnly onFocus={(event) => event.currentTarget.select()} />
              </label>
              <label>
                <span>备注</span>
                <textarea
                  value={formState.note}
                  rows={3}
                  placeholder="添加一点自己的上下文"
                  onChange={(event) => formState.setNote(event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="save-location-panel" aria-label="保存位置">
            <div className="location-heading">
              <h3>保存位置</h3>
              <p>
                当前保存到：
                <span>{folderBrowser.selectedPath || "请选择文件夹"}</span>
              </p>
            </div>

            <div className="location-grid">
              <section className="location-search" aria-label="搜索保存位置">
                <label className="search-box">
                  <SearchIcon />
                  <input
                    value={folderBrowser.query}
                    placeholder="搜索文件夹"
                    onChange={(event) => folderBrowser.setQuery(event.target.value)}
                  />
                  {folderBrowser.query ? (
                    <button type="button" aria-label="清空搜索" onClick={() => folderBrowser.setQuery("")}>
                      <CloseIcon />
                    </button>
                  ) : null}
                </label>

                <div className="search-results">
                  {folderBrowser.query ? <h4>搜索结果（{folderBrowser.searchResults.length}）</h4> : <h4>搜索结果</h4>}
                  {folderBrowser.query && folderBrowser.searchResults.length === 0 ? (
                    <p className="empty-text">没有匹配的文件夹</p>
                  ) : null}
                  {folderBrowser.searchResults.map((option) => (
                    <button
                      key={option.id}
                      className={`folder-result ${
                        folderBrowser.selectedFolderId === option.id ? "is-selected" : ""
                      }`}
                      type="button"
                      onClick={() => folderBrowser.selectFolder(option.node, true)}
                    >
                      <FolderIcon filled={folderBrowser.selectedFolderId === option.id} />
                      <span>
                        <strong>{option.title}</strong>
                        <small>{option.path}</small>
                      </span>
                      {folderBrowser.selectedFolderId === option.id ? <CheckIcon /> : null}
                    </button>
                  ))}
                </div>

                <div className="recent-folders">
                  <h4>最近使用</h4>
                  {folderBrowser.recentFolders.length === 0 ? (
                    <p className="empty-text">保存成功后会显示最近位置</p>
                  ) : (
                    <div>
                      {folderBrowser.recentFolders.map((option, index) => (
                        <button key={option.id} type="button" onClick={() => folderBrowser.selectFolder(option.node, true)}>
                          {index === 0 ? <RecentIcon /> : <FolderIcon />}
                          <span>{option.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="folder-browser" aria-label="浏览文件夹">
                <div className="browser-heading">
                  <h4>浏览文件夹</h4>
                  {folderBrowser.browsingFolder && canCreateBookmarkInFolder(folderBrowser.browsingFolder) ? (
                    <CreateFolderAction
                      parentFolder={folderBrowser.browsingFolder}
                      onCreate={folderBrowser.createFolder}
                    />
                  ) : null}
                </div>

                <FolderBreadcrumb
                  items={folderBrowser.browsingBreadcrumbItems}
                  onSelect={(folder) => folderBrowser.setBrowsingFolderId(folder.id)}
                />

                <div className="browse-list" ref={cascadePortalRef}>
                  {initialState.loading ? <p className="empty-text">正在读取文件夹...</p> : null}
                  {!initialState.loading && folderBrowser.browsingChildren.length === 0 ? (
                    <p className="empty-text">当前层级没有子文件夹</p>
                  ) : null}
                  {folderBrowser.browsingChildren.length > 0 ? (
                    <FolderCascadeMenu
                      nodes={folderBrowser.browsingChildren}
                      selectedFolderId={folderBrowser.selectedFolderId}
                      disabledLabel="不可保存"
                      onSelect={(folder) => folderBrowser.selectFolder(folder)}
                      onOpenFolder={folderBrowser.openFolder}
                      canSelect={canCreateBookmarkInFolder}
                      onCreateFolder={(parentFolder) => folderBrowser.setBrowsingFolderId(parentFolder.id)}
                      renderCreateAction={(parentFolder) => (
                        <CreateFolderAction
                          parentFolder={parentFolder}
                          onCreate={folderBrowser.createFolder}
                          inCascade
                        />
                      )}
                      portalContainer={cascadePortalRef.current ?? shadowRoot}
                    />
                  ) : null}
                </div>
              </section>
            </div>
          </section>

          <p className="status" aria-live="polite">
            {initialState.status || "\u00A0"}
          </p>

          <footer className="quick-save-footer">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="primary-button"
              type="submit"
              disabled={formState.saving || !folderBrowser.selectedFolderId}
            >
              {formState.saving
                ? "保存中..."
                : folderBrowser.selectedFolderTitle
                  ? `保存到 ${folderBrowser.selectedFolderTitle}`
                  : "保存"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
