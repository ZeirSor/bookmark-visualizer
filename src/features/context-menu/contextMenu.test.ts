import { describe, expect, it } from "vitest";
import {
  CASCADE_ROW_BUTTON_CLASS,
  getCascadeButtonClassName,
  getCascadeMenuPlacement,
  getCascadePathOnRowEnter,
  getCascadeRowBehavior,
  getContextMenuPlacement
} from "./index";

describe("context menu placement", () => {
  it("keeps the menu inside the viewport", () => {
    const placement = getContextMenuPlacement(
      { x: 795, y: 595 },
      { width: 800, height: 600 },
      { width: 236, height: 150 }
    );

    expect(placement.x).toBe(552);
    expect(placement.y).toBe(438);
  });

  it("opens submenus to the left near the right edge", () => {
    const placement = getContextMenuPlacement(
      { x: 620, y: 100 },
      { width: 800, height: 600 },
      { width: 236, height: 150 },
      { width: 280, height: 360 }
    );

    expect(placement.submenuDirection).toBe("left");
  });

  it("opens submenus upward near the bottom edge", () => {
    const placement = getContextMenuPlacement(
      { x: 120, y: 500 },
      { width: 800, height: 600 },
      { width: 236, height: 150 },
      { width: 280, height: 360 }
    );

    expect(placement.submenuBlockDirection).toBe("up");
  });

  it("opens submenus down and right when there is enough space", () => {
    const placement = getContextMenuPlacement(
      { x: 120, y: 80 },
      { width: 900, height: 700 },
      { width: 236, height: 150 },
      { width: 280, height: 360 }
    );

    expect(placement.submenuDirection).toBe("right");
    expect(placement.submenuBlockDirection).toBe("down");
  });
});

describe("cascade menu placement", () => {
  it("keeps a submenu connected to the row when opening right", () => {
    const placement = getCascadeMenuPlacement(
      { top: 120, right: 320, bottom: 152, left: 80 },
      { width: 900, height: 700 },
      { width: 260, height: 240 }
    );

    expect(placement.x).toBe(326);
    expect(placement.y).toBe(120);
    expect(placement.needsScroll).toBe(false);
    expect(placement.submenuDirection).toBe("right");
    expect(placement.submenuBlockDirection).toBe("down");
  });

  it("opens left when the right edge has less usable space", () => {
    const placement = getCascadeMenuPlacement(
      { top: 120, right: 780, bottom: 152, left: 540 },
      { width: 800, height: 700 },
      { width: 260, height: 240 }
    );

    expect(placement.submenuDirection).toBe("left");
    expect(placement.x).toBe(274);
  });

  it("opens upward near the bottom edge", () => {
    const placement = getCascadeMenuPlacement(
      { top: 560, right: 320, bottom: 592, left: 80 },
      { width: 900, height: 620 },
      { width: 260, height: 240 }
    );

    expect(placement.submenuBlockDirection).toBe("up");
    expect(placement.y).toBe(352);
  });

  it("scrolls internally when neither vertical direction can fit the full menu", () => {
    const placement = getCascadeMenuPlacement(
      { top: 220, right: 320, bottom: 252, left: 80 },
      { width: 900, height: 360 },
      { width: 260, height: 420 }
    );

    expect(placement.needsScroll).toBe(true);
    expect(placement.maxHeight).toBeLessThan(420);
    expect(placement.maxHeight).toBeGreaterThanOrEqual(140);
  });

  it("clamps fixed cascade coordinates instead of requiring horizontal scroll", () => {
    const placement = getCascadeMenuPlacement(
      { top: 120, right: 486, bottom: 152, left: 226 },
      { width: 500, height: 600 },
      { width: 260, height: 240 }
    );

    expect(placement.x).toBeGreaterThanOrEqual(12);
    expect(placement.x + 260).toBeLessThanOrEqual(488);
  });
});

describe("cascade menu state helpers", () => {
  it("replaces the active branch when entering a sibling folder", () => {
    const firstPath = getCascadePathOnRowEnter([], "folder-1", true);
    const siblingPath = getCascadePathOnRowEnter([], "folder-2", true);

    expect(firstPath).toEqual(["folder-1"]);
    expect(siblingPath).toEqual(["folder-2"]);
  });

  it("preserves ancestors when entering a child folder", () => {
    const childPath = getCascadePathOnRowEnter(["folder-1"], "child-1", true);

    expect(childPath).toEqual(["folder-1", "child-1"]);
  });

  it("clears deeper branches when entering a leaf row", () => {
    const nextPath = getCascadePathOnRowEnter(["folder-1"], "leaf-1", false);

    expect(nextPath).toEqual(["folder-1"]);
  });

  it("allows a disabled current folder to open children without becoming a move target", () => {
    const behavior = getCascadeRowBehavior({
      selectable: false,
      nestedFolderCount: 2,
      canCreateFolder: false
    });

    expect(behavior.hasSubmenu).toBe(true);
    expect(behavior.buttonDisabled).toBe(false);
    expect(behavior.canSelect).toBe(false);
  });

  it("gives cascade buttons their own styling contract outside the context menu panel", () => {
    expect(getCascadeButtonClassName()).toBe(CASCADE_ROW_BUTTON_CLASS);
    expect(getCascadeButtonClassName("move-folder-create")).toBe(
      `${CASCADE_ROW_BUTTON_CLASS} move-folder-create`
    );
  });
});
