import { describe, expect, it } from "vitest";
import { isPopupSaveableUrl, normalizePopupPageDetails, normalizeTitle } from "./tabDetails";

describe("popup tab details", () => {
  it("uses extracted page details before tab fallbacks", () => {
    expect(
      normalizePopupPageDetails(
        {
          title: "Tab title",
          url: "https://example.com/tab",
          favIconUrl: "https://example.com/favicon.ico"
        },
        {
          title: "Meta title",
          url: "https://example.com/meta",
          previewImageUrl: "https://example.com/og.png"
        }
      )
    ).toMatchObject({
      title: "Meta title",
      url: "https://example.com/meta",
      previewImageUrl: "https://example.com/og.png",
      canSave: true,
      domain: "example.com"
    });
  });

  it("falls back to hostname when title is empty", () => {
    expect(normalizeTitle("", "https://arxiv.org/abs/1706.03762")).toBe("arxiv.org");
  });

  it("keeps favicon metadata separate from extracted preview images", () => {
    expect(
      normalizePopupPageDetails({
        title: "Example",
        url: "https://example.com/",
        favIconUrl: "https://example.com/favicon.ico"
      })
    ).toMatchObject({
      previewImageUrl: "https://example.com/favicon.ico",
      faviconUrl: "https://example.com/favicon.ico"
    });
  });

  it("marks protected browser pages as not saveable", () => {
    expect(isPopupSaveableUrl("chrome://extensions/")).toBe(false);
    expect(
      normalizePopupPageDetails({
        title: "Extensions",
        url: "chrome://extensions/",
        favIconUrl: undefined
      })
    ).toMatchObject({
      canSave: false,
      error: "当前页面不支持保存。"
    });
  });
});
