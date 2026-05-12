import { forwardRef, useImperativeHandle, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  ChevronRightIcon,
  GlobeIcon,
  ImageIcon,
  MapIcon,
  NewsIcon,
  ReturnIcon,
  SearchIcon,
  VideoIcon
} from "../../components/icons/AppIcons";
import {
  SEARCH_CATEGORIES,
  SEARCH_ENGINES,
  buildSearchUrl,
  createMixedSearchSuggestions,
  type NewTabShortcutViewModel,
  type NewTabSuggestion,
  type SearchCategory
} from "../../features/newtab";
import type { BookmarkNode } from "../../features/bookmarks";

export type SearchPanelHandle = { focus(): void };

export const SearchPanel = forwardRef<SearchPanelHandle, {
  category: SearchCategory;
  engineId: string;
  shortcuts: NewTabShortcutViewModel[];
  tree: BookmarkNode[];
  onCategoryChange(category: SearchCategory): void;
  onEngineChange(engineId: string): void;
  onOpenSuggestion(suggestion: NewTabSuggestion, openInNewTab?: boolean): void;
}>(function SearchPanel({
  category,
  engineId,
  onCategoryChange,
  onEngineChange,
  onOpenSuggestion,
  shortcuts,
  tree
}, ref) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), []);
  const suggestions = useMemo(
    () => createMixedSearchSuggestions({ tree, query, engineId, category, shortcuts }),
    [category, engineId, query, shortcuts, tree]
  );
  const suggestionOpen = query.trim().length > 0 && suggestions.length > 0;
  const activeSuggestion = suggestions[Math.min(activeIndex, suggestions.length - 1)];
  const localSuggestions = suggestions.filter((suggestion) => suggestion.type !== "web-search");
  const webSuggestions = suggestions.filter((suggestion) => suggestion.type === "web-search");
  const currentEngine = SEARCH_ENGINES.find((engine) => engine.id === engineId) ?? SEARCH_ENGINES[0];

  return (
    <section className={`nt-search-hero ${suggestionOpen ? "is-open" : ""}`} aria-label="搜索">
      <div className="nt-search-row">
        <label className="nt-engine-select">
          <span className="nt-sr-only">搜索引擎</span>
          <span className={`nt-engine-avatar is-${currentEngine.id}`} aria-hidden="true">
            {currentEngine.label.slice(0, 1)}
          </span>
          <select value={engineId} onChange={(event) => { onEngineChange(event.target.value); setActiveIndex(0); }}>
            {SEARCH_ENGINES.map((engine) => (
              <option key={engine.id} value={engine.id}>
                {engine.label}
              </option>
            ))}
          </select>
        </label>
        <div className="nt-search-box">
          <SearchIcon className="nt-search-leading-icon" />
          <input
            ref={inputRef}
            aria-label="搜索网页、URL 或本地书签"
            aria-controls={suggestionOpen ? "nt-search-suggestions" : undefined}
            aria-expanded={suggestionOpen}
            autoComplete="off"
            placeholder="搜索网页、URL 或输入关键词"
            role="combobox"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="nt-search-submit"
            aria-label="打开当前搜索"
            onClick={() => {
              const suggestion =
                activeSuggestion ??
                ({
                  id: `web:${query}`,
                  type: "web-search",
                  title: query,
                  url: buildSearchUrl(engineId, category, query),
                  score: 0
                } satisfies NewTabSuggestion);
              onOpenSuggestion(suggestion);
            }}
          >
            <ReturnIcon />
          </button>
        </div>
      </div>

      <div className="nt-category-chips" aria-label="搜索类型">
        {SEARCH_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === category ? "is-active" : undefined}
            onClick={() => { onCategoryChange(item.id); setActiveIndex(0); }}
          >
            <CategoryIcon category={item.id} />
            {item.label}
          </button>
        ))}
      </div>

      {suggestionOpen ? (
        <div
          id="nt-search-suggestions"
          className="nt-suggestion-panel"
          role="listbox"
          aria-label="搜索建议"
        >
          {localSuggestions.length > 0 ? (
            <SuggestionGroup title="本地书签" actionLabel="查看全部">
              {localSuggestions.map(renderSuggestion)}
            </SuggestionGroup>
          ) : null}
          {webSuggestions.length > 0 ? (
            <SuggestionGroup title="网络搜索" actionLabel={`使用 ${currentEngine.label} 搜索`}>
              {webSuggestions.map(renderSuggestion)}
            </SuggestionGroup>
          ) : null}
          <div className="nt-search-overlay-footer" aria-hidden="true">
            <span>↑↓ 选择</span>
            <span>Enter 打开</span>
            <span>Esc 关闭</span>
          </div>
        </div>
      ) : null}
    </section>
  );

  function renderSuggestion(suggestion: NewTabSuggestion) {
    const index = suggestions.findIndex((item) => item.id === suggestion.id);

    return (
      <button
        key={suggestion.id}
        type="button"
        className={index === activeIndex ? "nt-suggestion-item is-active" : "nt-suggestion-item"}
        role="option"
        aria-selected={index === activeIndex}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={(event) => onOpenSuggestion(suggestion, event.ctrlKey || event.metaKey)}
      >
        <span className={`nt-suggestion-kind is-${suggestion.type}`}>{getKindLabel(suggestion)}</span>
        <span className="nt-suggestion-copy">
          <strong>{suggestion.title}</strong>
          {suggestion.subtitle ? <small>{suggestion.subtitle}</small> : null}
        </span>
        {suggestion.tag ? <span className="nt-suggestion-tag">{suggestion.tag}</span> : null}
        {suggestion.folderPath ? <span className="nt-suggestion-path">{suggestion.folderPath}</span> : null}
        <ChevronRightIcon className="nt-suggestion-arrow" />
      </button>
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setQuery("");
      setActiveIndex(0);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const suggestion =
        activeSuggestion ??
        ({
          id: `web:${query}`,
          type: "web-search",
          title: query,
          url: buildSearchUrl(engineId, category, query),
          score: 0
        } satisfies NewTabSuggestion);

      onOpenSuggestion(suggestion, event.ctrlKey || event.metaKey);
    }
  }
});

function SuggestionGroup({
  actionLabel,
  children,
  title
}: {
  actionLabel: string;
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="nt-suggestion-section">
      <div className="nt-suggestion-heading">
        <strong>{title}</strong>
        <span>{actionLabel}</span>
      </div>
      <div className="nt-suggestion-list">{children}</div>
    </div>
  );
}

function CategoryIcon({ category }: { category: SearchCategory }) {
  if (category === "image") {
    return <ImageIcon />;
  }

  if (category === "news") {
    return <NewsIcon />;
  }

  if (category === "video") {
    return <VideoIcon />;
  }

  if (category === "maps") {
    return <MapIcon />;
  }

  return <GlobeIcon />;
}

function getKindLabel(suggestion: NewTabSuggestion): string {
  if (suggestion.type === "bookmark") {
    return "书签";
  }

  if (suggestion.type === "folder") {
    return "文件夹";
  }

  if (suggestion.type === "url") {
    return "URL";
  }

  return "搜索";
}
