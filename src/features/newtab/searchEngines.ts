import type { SearchCategory } from "./types";

export interface SearchEngineDefinition {
  id: string;
  label: string;
  categories: Partial<Record<SearchCategory, string>>;
}

export const SEARCH_CATEGORIES: Array<{ id: SearchCategory; label: string }> = [
  { id: "web", label: "Web" },
  { id: "image", label: "图片" },
  { id: "news", label: "新闻" },
  { id: "video", label: "视频" },
  { id: "maps", label: "地图" }
];

export const SEARCH_ENGINES: SearchEngineDefinition[] = [
  {
    id: "google",
    label: "Google",
    categories: {
      web: "https://www.google.com/search?q={query}",
      image: "https://www.google.com/search?tbm=isch&q={query}",
      news: "https://news.google.com/search?q={query}",
      video: "https://www.google.com/search?tbm=vid&q={query}",
      maps: "https://www.google.com/maps/search/{query}"
    }
  },
  {
    id: "bing",
    label: "Bing",
    categories: {
      web: "https://www.bing.com/search?q={query}",
      image: "https://www.bing.com/images/search?q={query}",
      news: "https://www.bing.com/news/search?q={query}",
      video: "https://www.bing.com/videos/search?q={query}",
      maps: "https://www.bing.com/maps?q={query}"
    }
  },
  {
    id: "duckduckgo",
    label: "DuckDuckGo",
    categories: {
      web: "https://duckduckgo.com/?q={query}",
      image: "https://duckduckgo.com/?q={query}&iax=images&ia=images",
      news: "https://duckduckgo.com/?q={query}&iar=news&ia=news",
      video: "https://duckduckgo.com/?q={query}&iax=videos&ia=videos",
      maps: "https://duckduckgo.com/?q={query}&ia=maps"
    }
  }
];

export function findSearchEngine(engineId: string): SearchEngineDefinition {
  return SEARCH_ENGINES.find((engine) => engine.id === engineId) ?? SEARCH_ENGINES[0];
}

export function normalizeSearchCategory(category: string | undefined): SearchCategory {
  return SEARCH_CATEGORIES.some((item) => item.id === category)
    ? (category as SearchCategory)
    : "web";
}

export function buildSearchUrl(
  engineId: string,
  category: SearchCategory,
  query: string
): string {
  const engine = findSearchEngine(engineId);
  const normalizedCategory = normalizeSearchCategory(category);
  const template = engine.categories[normalizedCategory] ?? engine.categories.web;
  const normalizedQuery = query.trim();

  if (!template) {
    return SEARCH_ENGINES[0].categories.web!.replace(
      "{query}",
      encodeURIComponent(normalizedQuery)
    );
  }

  return template.replace("{query}", encodeURIComponent(normalizedQuery));
}

export function isProbablyUrl(query: string): boolean {
  const value = query.trim();

  if (!value || value.includes(" ")) {
    return false;
  }

  if (/^https?:\/\//i.test(value)) {
    return true;
  }

  return /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)?$/i.test(value);
}

export function normalizeInputUrl(query: string): string {
  const value = query.trim();
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
