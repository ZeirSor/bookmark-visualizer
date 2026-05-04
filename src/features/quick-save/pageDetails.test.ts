import { describe, expect, it } from "vitest";
import { extractQuickSavePageDetails } from "./pageDetails";

describe("quick-save page details", () => {
  it("prefers social metadata title and image before document fallbacks", () => {
    const documentRef = createDocumentDouble({
      title: "Document title",
      metas: {
        'meta[property="og:title"]': "OG title",
        'meta[property="og:image"]': "/cover.png"
      },
      images: [{ src: "https://example.com/body.png", width: 200, height: 120 }]
    });
    const locationRef = { href: "https://example.com/article" } as Location;

    expect(extractQuickSavePageDetails(documentRef, locationRef)).toEqual({
      url: "https://example.com/article",
      title: "OG title",
      previewImageUrl: "https://example.com/cover.png"
    });
  });

  it("falls back to document title and first usable image", () => {
    const documentRef = createDocumentDouble({
      title: "Document title",
      metas: {},
      images: [{ src: "/body.png", width: 200, height: 120 }]
    });
    const locationRef = { href: "https://example.com/article" } as Location;

    expect(extractQuickSavePageDetails(documentRef, locationRef)).toEqual({
      url: "https://example.com/article",
      title: "Document title",
      previewImageUrl: "https://example.com/body.png"
    });
  });
});

function createDocumentDouble({
  title,
  metas,
  images
}: {
  title: string;
  metas: Record<string, string>;
  images: Array<{ src: string; width: number; height: number }>;
}): Document {
  return {
    title,
    images: images.map((image) => ({
      src: image.src,
      currentSrc: "",
      width: image.width,
      height: image.height,
      naturalWidth: image.width,
      naturalHeight: image.height
    })),
    querySelector(selector: string) {
      if (selector.startsWith("meta")) {
        const content = metas[selector];
        return content ? { content } : null;
      }

      return null;
    }
  } as unknown as Document;
}
