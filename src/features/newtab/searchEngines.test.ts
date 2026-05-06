import { describe, expect, it } from "vitest";
import { buildSearchUrl, findSearchEngine, isProbablyUrl, normalizeInputUrl } from "./searchEngines";

describe("new tab search engines", () => {
  it("builds encoded category URLs", () => {
    expect(buildSearchUrl("google", "web", "prompt test")).toBe(
      "https://www.google.com/search?q=prompt%20test"
    );
    expect(buildSearchUrl("google", "image", "猫")).toBe(
      "https://www.google.com/search?tbm=isch&q=%E7%8C%AB"
    );
    expect(buildSearchUrl("bing", "news", "ai")).toBe(
      "https://www.bing.com/news/search?q=ai"
    );
    expect(buildSearchUrl("duckduckgo", "video", "demo")).toBe(
      "https://duckduckgo.com/?q=demo&iax=videos&ia=videos"
    );
    expect(buildSearchUrl("google", "maps", "Shanghai")).toBe(
      "https://www.google.com/maps/search/Shanghai"
    );
  });

  it("falls back to Google and Web for unknown values", () => {
    expect(findSearchEngine("missing").id).toBe("google");
    expect(buildSearchUrl("missing", "missing" as never, "test")).toBe(
      "https://www.google.com/search?q=test"
    );
  });

  it("recognizes direct URL input", () => {
    expect(isProbablyUrl("example.com")).toBe(true);
    expect(normalizeInputUrl("example.com")).toBe("https://example.com");
    expect(isProbablyUrl("prompt test")).toBe(false);
  });
});
