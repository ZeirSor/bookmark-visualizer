import { describe, expect, it } from "vitest";
import { getFolderDropPosition } from "./folderTreeDrop";

describe("folder tree drop helpers", () => {
  it("maps vertical row zones to before, inside, and after folder drops", () => {
    const bounds = { top: 100, height: 40 };

    expect(getFolderDropPosition(108, bounds)).toBe("before");
    expect(getFolderDropPosition(120, bounds)).toBe("inside");
    expect(getFolderDropPosition(132, bounds)).toBe("after");
  });
});
