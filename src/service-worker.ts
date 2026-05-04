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
  normalizeQuickSaveFolderTitle
} from "./features/quick-save";

chrome.action.onClicked.addListener(() => {
  void openWorkspace();
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open-quick-save") {
    void openQuickSaveOnCurrentTab();
  }
});

chrome.runtime.onMessage.addListener((message: QuickSaveRequest, _sender, sendResponse) => {
  void handleQuickSaveMessage(message)
    .then(sendResponse)
    .catch((cause) => {
      sendResponse({ ok: false, error: getErrorMessage(cause, "快捷保存失败。") });
    });

  return true;
});

async function openWorkspace(query = "") {
  await chrome.tabs.create({
    url: chrome.runtime.getURL(`index.html${query}`)
  });
}

async function openQuickSaveOnCurrentTab() {
  const tab = await getCurrentTab();
  if (!tab?.id || !isInjectableUrl(tab.url)) {
    await openWorkspace("?quickSave=unsupported");
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["quick-save-content.js"]
    });
  } catch {
    await openWorkspace("?quickSave=unsupported");
  }
}

async function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}

async function handleQuickSaveMessage(message: QuickSaveRequest): Promise<QuickSaveResponse> {
  if (message.type === QUICK_SAVE_GET_INITIAL_STATE) {
    const tree = await bookmarksAdapter.getTree();
    return {
      ok: true,
      state: {
        tree,
        defaultFolderId: findFirstWritableFolder(tree)?.id
      }
    };
  }

  if (message.type === QUICK_SAVE_CREATE_BOOKMARK) {
    const payload = normalizeCreatePayload(message.payload);
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

    return { ok: true, bookmarkId: created.id };
  }

  if (message.type === QUICK_SAVE_CREATE_FOLDER) {
    const title = normalizeQuickSaveFolderTitle(message.payload.title);
    const tree = await bookmarksAdapter.getTree();
    const parentFolder = findFolder(tree, message.payload.parentId);

    if (!canCreateBookmarkInFolder(parentFolder)) {
      return { ok: false, error: "不能在这个文件夹下新建文件夹。" };
    }

    const folder = await bookmarksAdapter.create({
      parentId: message.payload.parentId,
      title
    });
    const nextTree = await bookmarksAdapter.getTree();

    return {
      ok: true,
      folder,
      state: {
        tree: nextTree,
        defaultFolderId: folder.id
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

function isInjectableUrl(url?: string): boolean {
  if (!url) {
    return false;
  }

  return url.startsWith("http://") || url.startsWith("https://");
}

function findFirstWritableFolder(nodes: BookmarkNode[]): BookmarkNode | undefined {
  for (const node of nodes) {
    if (canCreateBookmarkInFolder(node)) {
      return node;
    }

    const nested = node.children ? findFirstWritableFolder(node.children) : undefined;
    if (nested) {
      return nested;
    }
  }

  return undefined;
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

export {};
