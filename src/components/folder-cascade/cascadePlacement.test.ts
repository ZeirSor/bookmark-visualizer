import { describe, expect, it } from "vitest";
import {
  estimateLayerSize,
  getFloatingLayerStyle,
  rectToAnchor
} from "./cascadePlacement";
import type { BookmarkNode } from "../../features/bookmarks";

describe("folder cascade placement helpers", () => {
  it("estimates floating layer height from nested rows and create action", () => {
    const folder: BookmarkNode = {
      id: "folder",
      parentId: "root",
      title: "Folder",
      syncing: false,
      children: [
        { id: "child", parentId: "folder", title: "Child", syncing: false, children: [] }
      ]
    };

    expect(estimateLayerSize(folder, true, 260)).toEqual({
      width: 260,
      height: 180
    });
  });

  it("converts DOMRect-like anchors and placement styles without mutating layout data", () => {
    const anchor = rectToAnchor({
      top: 10,
      right: 200,
      bottom: 44,
      left: 20
    } as DOMRect);

    expect(anchor).toEqual({ top: 10, right: 200, bottom: 44, left: 20 });
    expect(
      getFloatingLayerStyle(
        {
          x: 24,
          y: 48,
          maxHeight: 320,
          needsScroll: true,
          submenuDirection: "right",
          submenuBlockDirection: "down"
        },
        40
      )
    ).toMatchObject({ left: 24, top: 48, maxHeight: 320, overflowY: "auto", zIndex: 40 });
  });
});
