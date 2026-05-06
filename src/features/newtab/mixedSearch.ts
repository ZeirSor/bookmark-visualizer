import { buildFolderPathMap, flattenFolders, getDisplayTitle, type BookmarkNode } from "../bookmarks";
import { searchBookmarks } from "../search";
import { buildSearchUrl, isProbablyUrl, normalizeInputUrl } from "./searchEngines";
import type { NewTabShortcutViewModel, NewTabSuggestion, SearchCategory } from "./types";

const MAX_BOOKMARK_SUGGESTIONS = 6;
const MAX_FOLDER_SUGGESTIONS = 3;

export function createMixedSearchSuggestions(input: {
  tree: BookmarkNode[];
  query: string;
  engineId: string;
  category: SearchCategory;
  shortcuts?: NewTabShortcutViewModel[];
}): NewTabSuggestion[] {
  const query = input.query.trim();

  if (!query) {
    return [];
  }

  const suggestions: NewTabSuggestion[] = [];

  if (isProbablyUrl(query)) {
    const url = normalizeInputUrl(query);
    suggestions.push({
      id: `url:${url}`,
      type: "url",
      title: url,
      subtitle: "直接打开 URL",
      url,
      score: 120
    });
  }

  const shortcutUrls = new Set(
    input.shortcuts
      ?.filter((shortcut) => matches(shortcut.title, query) || matches(shortcut.url, query))
      .map((shortcut) => shortcut.url)
  );
  const bookmarkResults = searchBookmarks(input.tree, query).slice(0, MAX_BOOKMARK_SUGGESTIONS);

  suggestions.push(
    ...bookmarkResults.map<NewTabSuggestion>((result) => ({
      id: `bookmark:${result.bookmark.id}`,
      type: "bookmark",
      title: getDisplayTitle(result.bookmark),
      subtitle: result.folderPath,
      url: result.bookmark.url,
      bookmarkId: result.bookmark.id,
      folderPath: result.folderPath,
      tag: shortcutUrls.has(result.bookmark.url ?? "") ? "固定" : "本地书签",
      score: result.score + (shortcutUrls.has(result.bookmark.url ?? "") ? 15 : 0)
    }))
  );

  const pathMap = buildFolderPathMap(input.tree);
  const folderSuggestions = flattenFolders(input.tree)
    .filter((folder) => matches(folder.title, query) || matches(folder.path, query))
    .slice(0, MAX_FOLDER_SUGGESTIONS)
    .map<NewTabSuggestion>((folder, index) => ({
      id: `folder:${folder.id}`,
      type: "folder",
      title: folder.title,
      subtitle: pathMap.get(folder.id) ?? folder.path,
      folderId: folder.id,
      tag: "文件夹",
      score: 75 - index
    }));

  suggestions.push(...folderSuggestions);

  suggestions.push(
    {
      id: `web:${input.category}:${query}`,
      type: "web-search",
      title: `用 ${getEngineLabel(input.engineId)} 搜索 ${query}`,
      subtitle: getCategoryLabel(input.category),
      url: buildSearchUrl(input.engineId, input.category, query),
      category: input.category,
      tag: "网络搜索",
      score: 10
    },
    {
      id: `web:web:${query}`,
      type: "web-search",
      title: `搜索网页：${query}`,
      subtitle: "Web",
      url: buildSearchUrl(input.engineId, "web", query),
      category: "web",
      tag: "网络搜索",
      score: 8
    }
  );

  return dedupeSuggestions(suggestions)
    .sort((left, right) => right.score - left.score)
    .slice(0, 12);
}

function matches(value: string | undefined, query: string): boolean {
  return Boolean(value?.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
}

function dedupeSuggestions(suggestions: NewTabSuggestion[]): NewTabSuggestion[] {
  const seen = new Set<string>();

  return suggestions.filter((suggestion) => {
    const key = suggestion.url ?? suggestion.folderId ?? suggestion.id;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function getEngineLabel(engineId: string): string {
  if (engineId === "bing") {
    return "Bing";
  }

  if (engineId === "duckduckgo") {
    return "DuckDuckGo";
  }

  return "Google";
}

function getCategoryLabel(category: SearchCategory): string {
  const labels: Record<SearchCategory, string> = {
    web: "Web",
    image: "图片",
    news: "新闻",
    video: "视频",
    maps: "地图"
  };

  return labels[category];
}
