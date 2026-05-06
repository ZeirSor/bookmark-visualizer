import { Fragment, type DragEvent, type MouseEvent as ReactMouseEvent } from "react";
import { BookmarkCard } from "../../components/BookmarkCard";
import type { BookmarkNode } from "../../features/bookmarks";
import {
  createDraggedBookmarkSnapshot,
  type BookmarkDropIntent
} from "../../features/drag-drop";
import type { ExtensionMetadataState } from "../../features/metadata";
import { EmptyState, NewBookmarkDraftCard } from "./WorkspaceComponents";
import type { NewBookmarkDraftState } from "./types";

export function WorkspaceContent({
  activeBookmarkDropIntent,
  canCreateBookmarkHere,
  displayedBookmarks,
  error,
  handleBookmarkCardDragLeave,
  handleBookmarkCardDragOver,
  handleBookmarkContextMenu,
  handleBookmarkDragEnd,
  handleCreateBookmark,
  handleDropBookmarkOnCard,
  handleSaveNote,
  handleSaveTitle,
  handleSaveUrl,
  highlightedBookmarkId,
  highlightPulseId,
  inlineEditRequest,
  isSearching,
  loading,
  metadata,
  newBookmarkDraft,
  openBookmark,
  openNewBookmarkDraftAtEnd,
  searchResults,
  selectedBookmarks,
  selectedFolder,
  selectedFolderId,
  setDraggedBookmark,
  setNewBookmarkDraft
}: {
  activeBookmarkDropIntent?: BookmarkDropIntent;
  canCreateBookmarkHere: boolean;
  displayedBookmarks: Array<{ bookmark: BookmarkNode; folderPath?: string }>;
  error?: string;
  handleBookmarkCardDragLeave(bookmark: BookmarkNode, event: DragEvent<HTMLElement>): void;
  handleBookmarkCardDragOver(bookmark: BookmarkNode, event: DragEvent<HTMLElement>): void;
  handleBookmarkContextMenu(bookmark: BookmarkNode, event: ReactMouseEvent<HTMLElement>): void;
  handleBookmarkDragEnd(): void;
  handleCreateBookmark(state: NewBookmarkDraftState): Promise<void>;
  handleDropBookmarkOnCard(bookmark: BookmarkNode, event: DragEvent<HTMLElement>): Promise<void>;
  handleSaveNote(bookmark: BookmarkNode, note: string): Promise<void>;
  handleSaveTitle(bookmark: BookmarkNode, title: string): Promise<void>;
  handleSaveUrl(bookmark: BookmarkNode, url: string): Promise<void>;
  highlightedBookmarkId?: string;
  highlightPulseId?: string;
  inlineEditRequest?: { bookmarkId: string; requestId: number };
  isSearching: boolean;
  loading: boolean;
  metadata: ExtensionMetadataState;
  newBookmarkDraft?: NewBookmarkDraftState;
  openBookmark(bookmark: BookmarkNode): void;
  openNewBookmarkDraftAtEnd(folder: BookmarkNode): void;
  searchResults: unknown[];
  selectedBookmarks: BookmarkNode[];
  selectedFolder?: BookmarkNode;
  selectedFolderId?: string;
  setDraggedBookmark(snapshot: ReturnType<typeof createDraggedBookmarkSnapshot>): void;
  setNewBookmarkDraft(state: NewBookmarkDraftState | undefined): void;
}) {
  if (loading) {
    return <EmptyState title="正在加载书签" body="如果在 Vite dev 环境中运行，会自动使用 mock 数据。" />;
  }

  if (error) {
    return <EmptyState title="读取失败" body="请确认扩展 manifest 声明了 bookmarks 权限。" />;
  }

  if (isSearching) {
    if (searchResults.length === 0) {
      return <EmptyState title="没有找到匹配项" body="试试输入书签标题、域名或 URL 片段。" />;
    }

    return renderCards(displayedBookmarks);
  }

  if (
    selectedBookmarks.length === 0 &&
    (!newBookmarkDraft || newBookmarkDraft.parentId !== selectedFolderId)
  ) {
    return (
      <EmptyState
        title="当前文件夹没有直接书签"
        body="子文件夹中的书签会在搜索中出现。"
        action={
          canCreateBookmarkHere && selectedFolder
            ? {
                label: "新建书签",
                onClick: () => openNewBookmarkDraftAtEnd(selectedFolder)
              }
            : undefined
        }
      />
    );
  }

  return renderCards(displayedBookmarks);

  function renderCards(items: Array<{ bookmark: BookmarkNode; folderPath?: string }>) {
    const shouldShowDraft =
      Boolean(newBookmarkDraft) && !isSearching && newBookmarkDraft?.parentId === selectedFolderId;
    const draftIndex = shouldShowDraft ? Math.max(0, newBookmarkDraft?.index ?? 0) : -1;

    return (
      <div className="card-grid">
        {shouldShowDraft && draftIndex === 0 ? renderNewBookmarkDraft() : null}
        {items.map(({ bookmark, folderPath }, index) => {
          const activeDropPosition =
            activeBookmarkDropIntent?.targetBookmark.id === bookmark.id
              ? activeBookmarkDropIntent.position
              : undefined;

          return (
            <Fragment key={bookmark.id}>
              <div className="bookmark-card-slot" data-drop-position={activeDropPosition}>
                <BookmarkCard
                  bookmark={bookmark}
                  folderPath={folderPath}
                  note={metadata.bookmarkMetadata[bookmark.id]?.note}
                  highlighted={highlightedBookmarkId === bookmark.id}
                  highlightPulse={highlightPulseId === bookmark.id}
                  editRequestId={
                    inlineEditRequest?.bookmarkId === bookmark.id
                      ? inlineEditRequest.requestId
                      : undefined
                  }
                  onDragStart={(dragged) => setDraggedBookmark(createDraggedBookmarkSnapshot(dragged))}
                  onDragEnd={handleBookmarkDragEnd}
                  onDragOverBookmark={handleBookmarkCardDragOver}
                  onDragLeaveBookmark={handleBookmarkCardDragLeave}
                  onDropOnBookmark={handleDropBookmarkOnCard}
                  onOpen={openBookmark}
                  onSaveTitle={handleSaveTitle}
                  onSaveUrl={handleSaveUrl}
                  onSaveNote={handleSaveNote}
                  onContextMenu={handleBookmarkContextMenu}
                />
              </div>
              {shouldShowDraft && draftIndex === index + 1 ? renderNewBookmarkDraft() : null}
            </Fragment>
          );
        })}
        {shouldShowDraft && draftIndex > items.length ? renderNewBookmarkDraft() : null}
      </div>
    );
  }

  function renderNewBookmarkDraft() {
    if (!newBookmarkDraft) {
      return null;
    }

    return (
      <NewBookmarkDraftCard
        key="new-bookmark-draft"
        state={newBookmarkDraft}
        onChange={setNewBookmarkDraft}
        onCancel={() => setNewBookmarkDraft(undefined)}
        onSubmit={handleCreateBookmark}
      />
    );
  }
}
