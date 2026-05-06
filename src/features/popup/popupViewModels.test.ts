import { describe, expect, it } from "vitest";
import { mockBookmarkTree } from "../../lib/chrome/mockBookmarks";
import {
  compactFolderPath,
  deriveRecentSavedBookmarks,
  selectInitialPopupFolderId
} from "./popupViewModels";

describe("popup view models", () => {
  it("compacts long folder paths through the middle", () => {
    expect(compactFolderPath("Bookmarks Bar / AI Platform / Academic / Papers")).toBe(
      "Bookmarks Bar / ... / Papers"
    );
    expect(compactFolderPath("Bookmarks Bar / Papers")).toBe("Bookmarks Bar / Papers");
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
