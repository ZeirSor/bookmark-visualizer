import { describe, expect, it } from "vitest";
import { isCompactLocationPickerViewport } from "../../popup/components/save-location/locationPickerViewport";
import { getPopupCascadeRootPlacement } from "./popupCascadePlacement";

describe("popup cascade placement", () => {
  it("positions the root menu left enough to reserve submenu runway", () => {
    const placement = getPopupCascadeRootPlacement(
      { top: 120, right: 690, bottom: 168, left: 310 },
      { width: 780, height: 600 },
      {
        rootWidth: 224,
        columnWidth: 224,
        preferredColumns: 3
      }
    );

    expect(placement.x).toBe(84);
    expect(placement.y).toBe(176);
    expect(placement.maxHeight).toBe(330);
  });

  it("keeps the menu inside the popup viewport near the left edge", () => {
    const placement = getPopupCascadeRootPlacement(
      { top: 80, right: 140, bottom: 126, left: 12 },
      { width: 780, height: 600 },
      {
        rootWidth: 224,
        columnWidth: 224,
        preferredColumns: 3
      }
    );

    expect(placement.x).toBe(12);
    expect(placement.y).toBe(134);
  });

  it("switches the save location picker to dialog mode in constrained viewports", () => {
    expect(isCompactLocationPickerViewport({ width: 960, height: 680 })).toBe(false);
    expect(isCompactLocationPickerViewport({ width: 840, height: 680 })).toBe(true);
    expect(isCompactLocationPickerViewport({ width: 960, height: 560 })).toBe(true);
  });
});
