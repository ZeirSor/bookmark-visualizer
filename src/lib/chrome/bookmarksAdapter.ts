import { getScenarioBookmarkTree } from "../../dev/devScenarios";
import { loadDevState } from "../../dev/devState";
import { mockBookmarkTree, setMockBookmarkTree } from "./mockBookmarks";
import { hasChromeApi, isViteDevHttpPage } from "./runtime";

let devTreeInitialized = false;

export interface BookmarkMoveDestination {
  parentId: string;
  index?: number;
}

export interface BookmarkUpdateChanges {
  title?: string;
  url?: string;
}

export interface BookmarkCreateDetails {
  parentId: string;
  index?: number;
  title: string;
  url?: string;
}

export interface BookmarksAdapter {
  getTree(): Promise<chrome.bookmarks.BookmarkTreeNode[]>;
  create(details: BookmarkCreateDetails): Promise<chrome.bookmarks.BookmarkTreeNode>;
  move(
    id: string,
    destination: BookmarkMoveDestination
  ): Promise<chrome.bookmarks.BookmarkTreeNode>;
  update(
    id: string,
    changes: BookmarkUpdateChanges
  ): Promise<chrome.bookmarks.BookmarkTreeNode>;
  remove(id: string): Promise<void>;
}

export const bookmarksAdapter: BookmarksAdapter = {
  async getTree() {
    if (hasChromeApi("bookmarks") && chrome.bookmarks.getTree) {
      return chrome.bookmarks.getTree();
    }

    if (isViteDevHttpPage() && !devTreeInitialized) {
      const { bookmarkScenario } = loadDevState();
      setMockBookmarkTree(getScenarioBookmarkTree(bookmarkScenario));
      devTreeInitialized = true;
    }

    return structuredClone(mockBookmarkTree);
  },

  async create(details) {
    if (hasChromeApi("bookmarks") && chrome.bookmarks.create) {
      return chrome.bookmarks.create(details);
    }

    return createMockBookmark(details);
  },

  async move(id, destination) {
    if (hasChromeApi("bookmarks") && chrome.bookmarks.move) {
      return chrome.bookmarks.move(id, destination);
    }

    return moveMockBookmark(id, destination);
  },

  async update(id, changes) {
    if (hasChromeApi("bookmarks") && chrome.bookmarks.update) {
      return chrome.bookmarks.update(id, changes);
    }

    return updateMockBookmark(id, changes);
  },

  async remove(id) {
    if (hasChromeApi("bookmarks") && chrome.bookmarks.remove) {
      await chrome.bookmarks.remove(id);
      return;
    }

    removeMockBookmark(id);
  }
};

function createMockBookmark(details: BookmarkCreateDetails): chrome.bookmarks.BookmarkTreeNode {
  const targetFolder = findMockNode(mockBookmarkTree, details.parentId);

  if (!targetFolder || !Array.isArray(targetFolder.children)) {
    throw new Error("Target folder was not found.");
  }

  const nextBookmark: chrome.bookmarks.BookmarkTreeNode = {
    id: getNextMockId(mockBookmarkTree),
    parentId: details.parentId,
    index: 0,
    title: details.title,
    syncing: false,
    dateAdded: Date.now()
  };

  if (details.url) {
    nextBookmark.url = details.url;
  } else {
    nextBookmark.children = [];
    nextBookmark.dateGroupModified = Date.now();
  }

  const nextIndex =
    typeof details.index === "number"
      ? Math.max(0, Math.min(details.index, targetFolder.children.length))
      : targetFolder.children.length;

  targetFolder.children.splice(nextIndex, 0, nextBookmark);
  reindex(targetFolder.children);

  return structuredClone(nextBookmark);
}

function moveMockBookmark(
  id: string,
  destination: BookmarkMoveDestination
): chrome.bookmarks.BookmarkTreeNode {
  const source = detachMockNode(mockBookmarkTree, id);
  const targetFolder = findMockNode(mockBookmarkTree, destination.parentId);

  if (!source) {
    throw new Error(`Bookmark ${id} was not found.`);
  }

  if (!targetFolder || !Array.isArray(targetFolder.children)) {
    throw new Error("Target folder was not found.");
  }

  const sameParent = source.parentId === destination.parentId;
  const requestedIndex =
    typeof destination.index === "number" ? destination.index : targetFolder.children.length;
  const adjustedIndex =
    sameParent && typeof source.index === "number" && source.index < requestedIndex
      ? requestedIndex - 1
      : requestedIndex;

  source.parentId = destination.parentId;
  const nextIndex = Math.max(0, Math.min(adjustedIndex, targetFolder.children.length));

  targetFolder.children.splice(nextIndex, 0, source);
  reindex(targetFolder.children);

  return structuredClone(source);
}

function updateMockBookmark(
  id: string,
  changes: BookmarkUpdateChanges
): chrome.bookmarks.BookmarkTreeNode {
  const node = findMockNode(mockBookmarkTree, id);

  if (!node) {
    throw new Error(`Bookmark ${id} was not found.`);
  }

  if (typeof changes.title === "string") {
    node.title = changes.title;
  }

  if (typeof changes.url === "string") {
    node.url = changes.url;
  }

  return structuredClone(node);
}

function removeMockBookmark(id: string) {
  const removed = detachMockNode(mockBookmarkTree, id);

  if (!removed) {
    throw new Error(`Bookmark ${id} was not found.`);
  }

  if (removed.children) {
    throw new Error("Folder deletion is not supported by this adapter path.");
  }
}

function detachMockNode(
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  id: string
): chrome.bookmarks.BookmarkTreeNode | undefined {
  for (const node of nodes) {
    if (!node.children) {
      continue;
    }

    const index = node.children.findIndex((child) => child.id === id);
    if (index >= 0) {
      const [removed] = node.children.splice(index, 1);
      reindex(node.children);
      return removed;
    }

    const nested = detachMockNode(node.children, id);
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

function findMockNode(
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  id?: string
): chrome.bookmarks.BookmarkTreeNode | undefined {
  if (!id) {
    return undefined;
  }

  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    const match = node.children ? findMockNode(node.children, id) : undefined;
    if (match) {
      return match;
    }
  }

  return undefined;
}

function getNextMockId(nodes: chrome.bookmarks.BookmarkTreeNode[]): string {
  let maxId = 0;

  function walk(node: chrome.bookmarks.BookmarkTreeNode) {
    const numericId = Number(node.id);
    if (Number.isFinite(numericId)) {
      maxId = Math.max(maxId, numericId);
    }

    node.children?.forEach(walk);
  }

  nodes.forEach(walk);
  return String(maxId + 1);
}

function reindex(nodes: chrome.bookmarks.BookmarkTreeNode[]) {
  nodes.forEach((node, index) => {
    node.index = index;
  });
}
