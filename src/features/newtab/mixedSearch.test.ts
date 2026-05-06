import { describe, expect, it } from "vitest";
import { mockBookmarkTree } from "../../lib/chrome/mockBookmarks";
import { createMixedSearchSuggestions } from "./mixedSearch";

describe("mixedSearch", () => {
  it("combines local bookmarks and web search suggestions", () => {
    const suggestions = createMixedSearchSuggestions({
      tree: mockBookmarkTree,
      query: "chatgpt",
      engineId: "google",
      category: "web"
    });

    expect(suggestions.some((suggestion) => suggestion.type === "bookmark")).toBe(true);
    expect(suggestions.some((suggestion) => suggestion.type === "web-search")).toBe(true);
    expect(suggestions.find((suggestion) => suggestion.type === "bookmark")?.score).toBeGreaterThan(
      suggestions.find((suggestion) => suggestion.type === "web-search")?.score ?? 0
    );
  });

  it("adds a direct URL suggestion before network search", () => {
    const suggestions = createMixedSearchSuggestions({
      tree: mockBookmarkTree,
      query: "example.com",
      engineId: "google",
      category: "web"
    });

    expect(suggestions[0]).toMatchObject({
      type: "url",
      url: "https://example.com"
    });
  });

  it("returns no suggestions for empty query", () => {
    expect(
      createMixedSearchSuggestions({
        tree: mockBookmarkTree,
        query: "   ",
        engineId: "google",
        category: "web"
      })
    ).toEqual([]);
  });
});
