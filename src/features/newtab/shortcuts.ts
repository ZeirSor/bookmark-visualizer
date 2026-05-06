import { flattenBookmarks, getDisplayTitle, type BookmarkNode } from "../bookmarks";
import type {
  NewTabShortcut,
  NewTabShortcutViewModel,
  NewTabState,
  NewTabUsageItem,
  ShortcutIconViewModel
} from "./types";

const DEFAULT_SHORTCUTS: Array<Pick<NewTabShortcut, "title" | "url" | "source">> = [
  { title: "YouTube", url: "https://www.youtube.com/", source: "generated" },
  { title: "ChatGPT", url: "https://chatgpt.com/", source: "generated" },
  { title: "Gmail", url: "https://mail.google.com/", source: "generated" },
  { title: "GitHub", url: "https://github.com/", source: "generated" },
  { title: "Notion", url: "https://www.notion.so/", source: "generated" },
  { title: "Google Scholar", url: "https://scholar.google.com/", source: "generated" },
  { title: "arXiv", url: "https://arxiv.org/", source: "generated" },
  { title: "Bing", url: "https://www.bing.com/", source: "generated" }
];

const BRAND_LABELS = new Map([
  ["youtube.com", "YT"],
  ["chatgpt.com", "AI"],
  ["mail.google.com", "GM"],
  ["github.com", "GH"],
  ["notion.so", "NO"],
  ["scholar.google.com", "GS"],
  ["arxiv.org", "AX"],
  ["bing.com", "BI"]
]);

export function deriveShortcutViewModels(input: {
  tree: BookmarkNode[];
  state: NewTabState;
  usageStats?: NewTabUsageItem[];
  limit?: number;
}): NewTabShortcutViewModel[] {
  const limit = input.limit ?? 24;
  const hiddenUrls = new Set(input.state.hiddenShortcutUrls);
  const pinned = input.state.pinnedShortcuts;
  const generated = buildGeneratedShortcuts(input.tree, input.usageStats ?? [], hiddenUrls);
  const shortcuts = [...pinned, ...generated.filter((item) => !pinned.some((p) => p.url === item.url))]
    .filter((shortcut) => !hiddenUrls.has(shortcut.url))
    .slice(0, limit);

  return shortcuts.map((shortcut) => ({
    id: shortcut.id,
    title: shortcut.title,
    url: shortcut.url,
    source: shortcut.source,
    bookmarkId: shortcut.bookmarkId,
    icon: buildShortcutIcon(shortcut),
    removable: true
  }));
}

export function buildShortcutIcon(shortcut: Pick<NewTabShortcut, "title" | "url" | "iconUrl">): ShortcutIconViewModel {
  if (shortcut.iconUrl) {
    return { kind: "image", value: shortcut.iconUrl };
  }

  const host = getHostname(shortcut.url);
  const brand = BRAND_LABELS.get(host);

  if (brand) {
    return { kind: "brand", value: brand, background: getColorForText(host) };
  }

  return {
    kind: "letter",
    value: (shortcut.title.trim()[0] || host[0] || "?").toLocaleUpperCase(),
    background: getColorForText(shortcut.url)
  };
}

function buildGeneratedShortcuts(
  tree: BookmarkNode[],
  usageStats: NewTabUsageItem[],
  hiddenUrls: Set<string>
): NewTabShortcut[] {
  const now = Date.now();
  const usageShortcuts = usageStats.slice(0, 12).map<NewTabShortcut>((item) => ({
    id: `usage:${item.url}`,
    title: item.title,
    url: item.url,
    source: "generated",
    bookmarkId: item.bookmarkId,
    createdAt: item.lastOpenedAt,
    updatedAt: item.lastOpenedAt
  }));
  const bookmarkShortcuts = flattenBookmarks(tree)
    .slice()
    .sort((left, right) => (right.dateAdded ?? 0) - (left.dateAdded ?? 0))
    .slice(0, 12)
    .flatMap<NewTabShortcut>((bookmark) =>
      bookmark.url
        ? [
            {
              id: `bookmark:${bookmark.id}`,
              title: getDisplayTitle(bookmark),
              url: bookmark.url,
              source: "generated",
              bookmarkId: bookmark.id,
              createdAt: bookmark.dateAdded ?? now,
              updatedAt: bookmark.dateAdded ?? now
            }
          ]
        : []
    );
  const defaults = DEFAULT_SHORTCUTS.map<NewTabShortcut>((shortcut) => ({
    ...shortcut,
    id: `default:${shortcut.url}`,
    createdAt: now,
    updatedAt: now
  }));
  const seen = new Set<string>();

  return [...usageShortcuts, ...bookmarkShortcuts, ...defaults].filter((shortcut) => {
    if (hiddenUrls.has(shortcut.url) || seen.has(shortcut.url)) {
      return false;
    }

    seen.add(shortcut.url);
    return true;
  });
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getColorForText(value: string): string {
  const colors = ["#4f46e5", "#2563eb", "#0f766e", "#b45309", "#7c3aed", "#0f172a"];
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) % colors.length;
  }

  return colors[Math.abs(hash) % colors.length];
}
