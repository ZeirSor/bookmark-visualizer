import { describe, expect, it } from "vitest";
import { getContextMenuPlacement } from "./index";

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
      280
    );

    expect(placement.submenuDirection).toBe("left");
  });
});
