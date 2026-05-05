import { describe, expect, it } from "vitest";
import {
  getQuickSaveHostname,
  getQuickSaveOriginPattern,
  getWorkspaceSource,
  isCtrlSShortcut,
  isQuickSaveInjectableUrl,
  normalizeGrantedQuickSaveOrigin
} from "./shortcutAccess";

describe("quick-save shortcut access", () => {
  it("normalizes http and https URLs to origin match patterns", () => {
    expect(getQuickSaveOriginPattern("https://www.youtube.com/watch?v=_VaEjGnHgOI")).toBe(
      "https://www.youtube.com/*"
    );
    expect(getQuickSaveOriginPattern("http://localhost:5173/demo")).toBe("http://localhost/*");
  });

  it("rejects non-page URLs for site shortcut access", () => {
    expect(getQuickSaveOriginPattern("chrome://extensions/")).toBeUndefined();
    expect(getQuickSaveOriginPattern("file:///tmp/demo.html")).toBeUndefined();
    expect(isQuickSaveInjectableUrl("https://example.com/")).toBe(true);
    expect(isQuickSaveInjectableUrl("chrome://extensions/")).toBe(false);
  });

  it("parses workspace source query params", () => {
    expect(
      getWorkspaceSource(
        "?sourceTabId=123&sourceUrl=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dabc"
      )
    ).toEqual({
      tabId: 123,
      url: "https://www.youtube.com/watch?v=abc"
    });
  });

  it("detects Ctrl+S command conflicts", () => {
    expect(isCtrlSShortcut("Ctrl+S")).toBe(true);
    expect(isCtrlSShortcut("Ctrl + S")).toBe(true);
    expect(isCtrlSShortcut("Command+S")).toBe(true);
    expect(isCtrlSShortcut("Ctrl+Shift+S")).toBe(false);
  });

  it("returns display hostnames", () => {
    expect(getQuickSaveHostname("https://www.youtube.com/watch?v=abc")).toBe("www.youtube.com");
  });

  it("normalizes granted origins and drops non-page permissions", () => {
    expect(normalizeGrantedQuickSaveOrigin("https://www.youtube.com/*")).toBe(
      "https://www.youtube.com/*"
    );
    expect(normalizeGrantedQuickSaveOrigin("https://www.youtube.com/watch?v=abc")).toBe(
      "https://www.youtube.com/*"
    );
    expect(normalizeGrantedQuickSaveOrigin("chrome://extensions/*")).toBeUndefined();
  });
});
