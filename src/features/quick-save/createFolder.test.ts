import { describe, expect, it } from "vitest";
import { normalizeQuickSaveFolderTitle } from "./createFolder";

describe("quick-save folder creation", () => {
  it("trims valid folder names", () => {
    expect(normalizeQuickSaveFolderTitle("  Research  ")).toBe("Research");
  });

  it("rejects empty folder names", () => {
    expect(() => normalizeQuickSaveFolderTitle("   ")).toThrow("文件夹名称不能为空。");
  });
});
