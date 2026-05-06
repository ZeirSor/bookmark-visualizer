import { describe, expect, it } from "vitest";
import { mockBookmarkTree } from "../../lib/chrome/mockBookmarks";
import {
  compactFolderPath,
  deriveRecentSavedBookmarks,
  formatPopupFolderPath,
  isLargePreviewImage,
  selectInitialPopupFolderId
} from "./popupViewModels";

describe("popup view models", () => {
  it("compacts long folder paths through the middle", () => {
    expect(compactFolderPath("Root / Bookmarks Bar / AI Platform / Academic / Papers")).toBe(
      "Bookmarks Bar / ... / Papers"
    );
    expect(compactFolderPath("Bookmarks Bar / AI Platform / Academic / Papers")).toBe(
      "Bookmarks Bar / ... / Papers"
    );
    expect(compactFolderPath("Bookmarks Bar / Papers")).toBe("Bookmarks Bar / Papers");
  });

  it("formats popup folder paths without the browser root", () => {
    expect(formatPopupFolderPath("Root / Bookmarks Bar / AI")).toBe("Bookmarks Bar / AI");
    expect(formatPopupFolderPath("书签根目录 / 书签栏 / 论文")).toBe("书签栏 / 论文");
    expect(formatPopupFolderPath("", "选择保存位置")).toBe("选择保存位置");
  });

  it("distinguishes large preview images from favicon fallbacks", () => {
    expect(isLargePreviewImage("https://example.com/og.png", "https://example.com/favicon.ico")).toBe(true);
    expect(isLargePreviewImage("https://example.com/favicon.ico", "https://example.com/favicon.ico")).toBe(false);
    expect(isLargePreviewImage("https://example.com/icons/icon-128.png")).toBe(false);
    expect(isLargePreviewImage(undefined)).toBe(false);
  });

  it("selects recent folders only when remember-last-folder is enabled", () => {
    expect(
      selectInitialPopupFolderId({
        tree: mockBookmarkTree,
        recentFolderIds: ["20"],
        rememberLastFolder: true,
        popupDefaultFolderId: "10",
        fallbackFolderId: "1"
      })
    ).toBe("20");

    expect(
      selectInitialPopupFolderId({
        tree: mockBookmarkTree,
        recentFolderIds: ["20"],
        rememberLastFolder: false,
        popupDefaultFolderId: "10",
        fallbackFolderId: "1"
      })
    ).toBe("10");
  });

  it("derives recent saved bookmarks from native bookmark dates", () => {
    expect(deriveRecentSavedBookmarks(mockBookmarkTree, 2, 1760000300000)).toEqual([
      {
        id: "219",
        title: "Observable",
        url: "https://observablehq.com/",
        domain: "observablehq.com",
        folderPath: "Other Bookmarks",
        savedAtLabel: "1 分钟前"
      },
      {
        id: "218",
        title: "CodePen",
        url: "https://codepen.io/",
        domain: "codepen.io",
        folderPath: "Other Bookmarks",
        savedAtLabel: "1 分钟前"
      }
    ]);
  });
});
