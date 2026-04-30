import { describe, expect, it } from "vitest";
import { collectFolderIds } from "./bookmarkTree";
import type { BookmarkNode } from "./types";

describe("bookmark tree helpers", () => {
  it("collects every folder id across nested levels", () => {
    const tree: BookmarkNode[] = [
      {
        id: "0",
        title: "",
        syncing: false,
        children: [
          {
            id: "1",
            parentId: "0",
            index: 0,
            title: "Bookmarks Bar",
            syncing: false,
            children: [
              {
                id: "10",
                parentId: "1",
                index: 0,
                title: "Design",
                syncing: false,
                children: [
                  {
                    id: "100",
                    parentId: "10",
                    index: 0,
                    title: "Nested",
                    syncing: false,
                    children: []
                  }
                ]
              },
              {
                id: "11",
                parentId: "1",
                index: 1,
                title: "Bookmark",
                syncing: false,
                url: "https://example.com"
              }
            ]
          }
        ]
      }
    ];

    expect(collectFolderIds(tree)).toEqual(["0", "1", "10", "100"]);
  });
});
