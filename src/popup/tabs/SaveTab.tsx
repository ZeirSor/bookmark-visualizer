import type { FormEvent } from "react";
import type { FolderOption } from "../../features/bookmarks";
import { openWorkspace, type PopupPageDetails } from "../../features/popup";
import { CheckIcon, ChevronRightIcon, FolderIcon, FolderPlusIcon, SearchIcon } from "../components/PopupIcons";

export function SaveTab({
  autoClose,
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
  selectedFolderId,
  selectedPath,
  selectedTitle,
  setAutoClose,
  setCreateOpen,
  setFolderName,
  setNote,
  setPreviewFailed,
  setQuery,
  setSelectedFolderId,
  setTitle,
  status,
  title
}: {
  autoClose: boolean;
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
  selectedFolderId: string;
  selectedPath: string;
  selectedTitle: string;
  setAutoClose(value: boolean): void;
  setCreateOpen(value: boolean): void;
  setFolderName(value: string): void;
  setNote(value: string): void;
  setPreviewFailed(value: boolean): void;
  setQuery(value: string): void;
  setSelectedFolderId(value: string): void;
  setTitle(value: string): void;
  status: string;
  title: string;
}) {
  const canSave = Boolean(pageDetails?.canSave && selectedFolderId);
  const previewUrl = pageDetails?.previewImageUrl;

  return (
    <form className="save-tab" onSubmit={(event) => void save(event)}>
      <section className="page-grid" aria-label="当前网页">
        <div className="page-preview">
          {previewUrl && !previewFailed ? (
            <img src={previewUrl} alt="" onError={() => setPreviewFailed(true)} />
          ) : (
            <span>{pageDetails?.domain || "No preview"}</span>
          )}
        </div>
        <div className="field-stack">
          <label>
            <span>标题</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            <span>URL</span>
            <input value={pageDetails?.url ?? ""} readOnly onFocus={(event) => event.currentTarget.select()} />
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
        <div className="location-path-row">
          <span>
            <FolderIcon />
          </span>
          <button type="button" className="path-button" onClick={() => void openWorkspace()}>
            {selectedPath || "正在读取保存位置"}
          </button>
          <button
            type="button"
            className="icon-button compact"
            aria-label="打开完整管理页"
            title="打开完整管理页"
            onClick={() => void openWorkspace()}
          >
            <ChevronRightIcon />
          </button>
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

      <label className="auto-close-row">
        <input
          type="checkbox"
          checked={autoClose}
          onChange={(event) => setAutoClose(event.target.checked)}
        />
        保存后自动关闭浮窗
      </label>

      <footer className="popup-footer">
        <div className={`status-line ${pageDetails?.canSave === false ? "is-error" : ""}`} aria-live="polite">
          {status ? (
            status
          ) : (
            <>
              <CheckIcon />
              <span>点击扩展图标保存当前页</span>
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
}

