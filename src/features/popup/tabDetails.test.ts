import { describe, expect, it } from "vitest";
import {
  classifySavePageKind,
  isMetadataInjectableUrl,
  isPopupSaveableUrl,
  normalizePopupPageDetails,
  normalizeTitle
} from "./tabDetails";

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

  it("allows protected browser pages as bookmarks without metadata injection", () => {
    expect(classifySavePageKind("chrome://extensions/")).toBe("browser-internal");
    expect(isPopupSaveableUrl("chrome://extensions/")).toBe(true);
    expect(isMetadataInjectableUrl("chrome://extensions/")).toBe(false);
    expect(
      normalizePopupPageDetails({
        title: "Extensions",
        url: "chrome://extensions/",
        favIconUrl: undefined
      })
    ).toMatchObject({
      canSave: true,
      pageKind: "browser-internal",
      error: undefined
    });
  });

  it("classifies saveable and injectable URL types separately", () => {
    expect(classifySavePageKind("https://example.com/")).toBe("web");
    expect(isPopupSaveableUrl("https://example.com/")).toBe(true);
    expect(isMetadataInjectableUrl("https://example.com/")).toBe(true);

    expect(classifySavePageKind("edge://settings/")).toBe("browser-internal");
    expect(isPopupSaveableUrl("edge://settings/")).toBe(true);
    expect(isMetadataInjectableUrl("edge://settings/")).toBe(false);

    expect(classifySavePageKind("chrome-extension://abc/options.html")).toBe("extension-page");
    expect(isPopupSaveableUrl("chrome-extension://abc/options.html")).toBe(true);
    expect(isMetadataInjectableUrl("chrome-extension://abc/options.html")).toBe(false);

    expect(classifySavePageKind("file:///C:/Users/example/page.html")).toBe("file");
    expect(isPopupSaveableUrl("file:///C:/Users/example/page.html")).toBe(true);
    expect(isMetadataInjectableUrl("file:///C:/Users/example/page.html")).toBe(false);

    expect(classifySavePageKind("not a url")).toBe("unsupported");
    expect(isPopupSaveableUrl("not a url")).toBe(false);
    expect(isMetadataInjectableUrl("not a url")).toBe(false);
  });
});
