import { bookmarksAdapter } from "./lib/chrome";
import { canCreateBookmarkInFolder, type BookmarkNode } from "./features/bookmarks";
import { saveBookmarkMetadata } from "./features/metadata";
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
  injectQuickSaveDialog,
  isQuickSaveInjectableUrl,
  loadQuickSaveUiState,
  normalizeQuickSaveFolderTitle,
  saveQuickSaveRecentFolder
} from "./features/quick-save";

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "open-quick-save") {
    void openQuickSaveOnCurrentTab(tab);
  }
});

chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  void handleQuickSaveMessage(message)
    .then(sendResponse)
    .catch((cause) => {
      sendResponse({ ok: false, error: getErrorMessage(cause, "快捷保存失败。") });
    });

  return true;
});

async function openWorkspace(params: Record<string, string> = {}, sourceTab?: chrome.tabs.Tab) {
  const workspaceParams = new URLSearchParams(params);
  if (sourceTab?.id && isQuickSaveInjectableUrl(sourceTab.url)) {
    workspaceParams.set("sourceTabId", String(sourceTab.id));
    workspaceParams.set("sourceUrl", sourceTab.url ?? "");
  }

  const query = workspaceParams.toString();
  await chrome.tabs.create({
    url: chrome.runtime.getURL(`index.html${query ? `?${query}` : ""}`)
  });
}

async function openQuickSaveOnCurrentTab(commandTab?: chrome.tabs.Tab) {
  const tab = commandTab?.id ? commandTab : await getCurrentTab();
  if (!tab?.id || !isQuickSaveInjectableUrl(tab.url)) {
    await openWorkspace({ quickSave: "unsupported" }, tab);
    return;
  }

  try {
    await injectQuickSaveDialog(tab.id);
  } catch {
    await openWorkspace({ quickSave: "unsupported" }, tab);
  }
}

async function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}

async function handleQuickSaveMessage(message: unknown): Promise<QuickSaveResponse> {
  if (!hasMessageType(message)) {
    return { ok: false, error: "未知的快捷保存请求。" };
  }

  const quickSaveMessage = message as QuickSaveRequest;
  if (quickSaveMessage.type === QUICK_SAVE_GET_INITIAL_STATE) {
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

  if (quickSaveMessage.type === QUICK_SAVE_CREATE_BOOKMARK) {
    const payload = normalizeCreatePayload(quickSaveMessage.payload);
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

  if (quickSaveMessage.type === QUICK_SAVE_CREATE_FOLDER) {
    const title = normalizeQuickSaveFolderTitle(quickSaveMessage.payload.title);
    const tree = await bookmarksAdapter.getTree();
    const parentFolder = findFolder(tree, quickSaveMessage.payload.parentId);

    if (!canCreateBookmarkInFolder(parentFolder)) {
      return { ok: false, error: "不能在这个文件夹下新建文件夹。" };
    }

    const folder = await bookmarksAdapter.create({
      parentId: quickSaveMessage.payload.parentId,
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

  return { ok: false, error: "未知的快捷保存请求。" };
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

function getErrorMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}

function hasMessageType(message: unknown): message is { type: string } {
  return typeof message === "object" && message !== null && "type" in message;
}

export {};
