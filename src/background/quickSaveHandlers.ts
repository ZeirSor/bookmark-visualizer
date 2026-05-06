import { bookmarksAdapter } from "../lib/chrome";
import { canCreateBookmarkInFolder, type BookmarkNode } from "../features/bookmarks";
import { saveBookmarkMetadata } from "../features/metadata";
import {
  QUICK_SAVE_CREATE_BOOKMARK,
  QUICK_SAVE_CREATE_FOLDER,
  QUICK_SAVE_GET_INITIAL_STATE,
  type QuickSaveCreatePayload,
  type QuickSaveRequest,
  type QuickSaveResponse,
  filterRecentFolderIds,
  filterWritableRecentFolderIds,
  findQuickSaveDefaultFolder,
  loadQuickSaveUiState,
  normalizeQuickSaveFolderTitle,
  saveQuickSaveRecentFolder
} from "../features/quick-save";

export async function handleQuickSaveMessage(message: unknown): Promise<QuickSaveResponse> {
  if (!hasMessageType(message)) {
    return { ok: false, error: "未知的快捷保存请求。" };
  }

  const quickSaveMessage = message as QuickSaveRequest;
  if (quickSaveMessage.type === QUICK_SAVE_GET_INITIAL_STATE) {
    return getQuickSaveInitialState();
  }

  if (quickSaveMessage.type === QUICK_SAVE_CREATE_BOOKMARK) {
    return createQuickSaveBookmark(quickSaveMessage.payload);
  }

  if (quickSaveMessage.type === QUICK_SAVE_CREATE_FOLDER) {
    return createQuickSaveFolder(
      quickSaveMessage.payload.parentId,
      quickSaveMessage.payload.title
    );
  }

  return { ok: false, error: "未知的快捷保存请求。" };
}

async function getQuickSaveInitialState(): Promise<QuickSaveResponse> {
  const tree = await bookmarksAdapter.getTree();
  const uiState = await loadQuickSaveUiState();
  const recentFolderIds = filterWritableRecentFolderIds(
    tree,
    filterRecentFolderIds(uiState.recentFolderIds, (folderId) => Boolean(folderId))
  );

  return {
    ok: true,
    state: {
      tree,
      defaultFolderId: findQuickSaveDefaultFolder(tree, recentFolderIds)?.id,
      recentFolderIds
    }
  };
}

async function createQuickSaveBookmark(
  rawPayload: QuickSaveCreatePayload
): Promise<QuickSaveResponse> {
  const payload = normalizeCreatePayload(rawPayload);
  const tree = await bookmarksAdapter.getTree();
  const targetFolder = findFolder(tree, payload.parentId);

  if (!canCreateBookmarkInFolder(targetFolder)) {
    return { ok: false, error: "不能保存到这个文件夹。" };
  }

  const created = await bookmarksAdapter.create({
    parentId: payload.parentId,
    title: payload.title,
    url: payload.url
  });

  if (payload.note || payload.previewImageUrl) {
    await saveBookmarkMetadata(created.id, {
      note: payload.note,
      previewImageUrl: payload.previewImageUrl
    });
  }

  await saveQuickSaveRecentFolder(payload.parentId);
  return { ok: true, bookmarkId: created.id };
}

async function createQuickSaveFolder(parentId: string, rawTitle: string): Promise<QuickSaveResponse> {
  const title = normalizeQuickSaveFolderTitle(rawTitle);
  const tree = await bookmarksAdapter.getTree();
  const parentFolder = findFolder(tree, parentId);

  if (!canCreateBookmarkInFolder(parentFolder)) {
    return { ok: false, error: "不能在这个文件夹下新建文件夹。" };
  }

  const folder = await bookmarksAdapter.create({
    parentId,
    title
  });
  const nextTree = await bookmarksAdapter.getTree();

  return {
    ok: true,
    folder,
    state: {
      tree: nextTree,
      defaultFolderId: folder.id,
      recentFolderIds: filterWritableRecentFolderIds(
        nextTree,
        filterRecentFolderIds((await loadQuickSaveUiState()).recentFolderIds, (folderId) =>
          Boolean(folderId)
        )
      )
    }
  };
}

function normalizeCreatePayload(payload: QuickSaveCreatePayload): QuickSaveCreatePayload {
  const title = payload.title.trim() || getTitleFromUrl(payload.url);
  const note = payload.note.trim();
  const previewImageUrl = payload.previewImageUrl?.trim();

  try {
    const url = new URL(payload.url).href;
    return {
      parentId: payload.parentId,
      title,
      url,
      note,
      previewImageUrl
    };
  } catch {
    throw new Error("URL 格式不正确。");
  }
}

function findFolder(nodes: BookmarkNode[], id: string): BookmarkNode | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    const nested = node.children ? findFolder(node.children, id) : undefined;
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function getTitleFromUrl(url: string): string {
  try {
    return new URL(url).hostname || "Untitled bookmark";
  } catch {
    return "Untitled bookmark";
  }
}

function hasMessageType(message: unknown): message is { type: string } {
  return typeof message === "object" && message !== null && "type" in message;
}
