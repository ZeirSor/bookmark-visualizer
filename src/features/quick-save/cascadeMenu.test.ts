import { describe, expect, it } from "vitest";
import {
  QUICK_SAVE_CASCADE_ROW_BUTTON_CLASS,
  getQuickSaveCascadeButtonClassName,
  getQuickSaveCascadeMenuPlacement,
  getQuickSaveCascadePathOnRowEnter,
  getQuickSaveCascadeRowBehavior
} from "./cascadeMenu";

describe("quick-save cascade menu placement", () => {
  it("keeps fixed submenu coordinates inside the viewport", () => {
    const placement = getQuickSaveCascadeMenuPlacement(
      { top: 120, right: 486, bottom: 152, left: 226 },
      { width: 500, height: 600 },
      { width: 260, height: 240 }
    );

    expect(placement.x).toBeGreaterThanOrEqual(12);
    expect(placement.x + 260).toBeLessThanOrEqual(488);
  });

  it("scrolls internally when the menu cannot fit vertically", () => {
    const placement = getQuickSaveCascadeMenuPlacement(
      { top: 220, right: 320, bottom: 252, left: 80 },
      { width: 900, height: 360 },
      { width: 260, height: 420 }
    );

    expect(placement.needsScroll).toBe(true);
    expect(placement.maxHeight).toBeLessThan(420);
    expect(placement.maxHeight).toBeGreaterThanOrEqual(140);
  });
});

describe("quick-save cascade state helpers", () => {
  it("replaces sibling branches and preserves child ancestry", () => {
    expect(getQuickSaveCascadePathOnRowEnter([], "folder-1", true)).toEqual(["folder-1"]);
    expect(getQuickSaveCascadePathOnRowEnter([], "folder-2", true)).toEqual(["folder-2"]);
    expect(getQuickSaveCascadePathOnRowEnter(["folder-2"], "child-1", true)).toEqual([
      "folder-2",
      "child-1"
    ]);
  });

  it("keeps disabled folders expandable when they have children", () => {
    const behavior = getQuickSaveCascadeRowBehavior({
      selectable: false,
      nestedFolderCount: 2,
      canCreateFolder: false
    });

    expect(behavior.hasSubmenu).toBe(true);
    expect(behavior.buttonDisabled).toBe(false);
    expect(behavior.canSelect).toBe(false);
  });

  it("gives portal-style rows their own button class", () => {
    expect(getQuickSaveCascadeButtonClassName()).toBe(QUICK_SAVE_CASCADE_ROW_BUTTON_CLASS);
    expect(getQuickSaveCascadeButtonClassName("move-folder-create")).toBe(
      `${QUICK_SAVE_CASCADE_ROW_BUTTON_CLASS} move-folder-create`
    );
  });
});
