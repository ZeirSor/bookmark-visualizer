import { describe, expect, it } from "vitest";
import { selectionReducer, type SelectionState } from "./useSelectionState";

describe("selectionReducer", () => {
  it("enters selection mode without selecting an item", () => {
    const next = selectionReducer(emptyState(), { type: "enter" });

    expect(next.selectionMode).toBe(true);
    expect([...next.selectedIds]).toEqual([]);
  });

  it("toggles an unselected id on", () => {
    const next = selectionReducer(emptyState(), { type: "toggle", id: "a" });

    expect(next.selectionMode).toBe(true);
    expect([...next.selectedIds]).toEqual(["a"]);
  });

  it("toggles a selected id off and keeps explicit empty mode active", () => {
    const next = selectionReducer(
      { selectionMode: true, selectedIds: new Set(["a"]) },
      { type: "toggle", id: "a" }
    );

    expect(next.selectionMode).toBe(true);
    expect([...next.selectedIds]).toEqual([]);
  });

  it("clears selected ids and exits selection mode", () => {
    const next = selectionReducer(
      { selectionMode: true, selectedIds: new Set(["a", "b"]) },
      { type: "clear" }
    );

    expect(next.selectionMode).toBe(false);
    expect(next.selectedIds.size).toBe(0);
  });

  it("deduplicates replace ids", () => {
    const next = selectionReducer(emptyState(), { type: "replace", ids: ["a", "a", "b"] });

    expect(next.selectionMode).toBe(true);
    expect([...next.selectedIds]).toEqual(["a", "b"]);
  });

  it("exits selection mode when the final selected id is deselected", () => {
    const next = selectionReducer(
      { selectionMode: true, selectedIds: new Set(["a"]) },
      { type: "deselect", id: "a" }
    );

    expect(next.selectionMode).toBe(false);
    expect(next.selectedIds.size).toBe(0);
  });
});

function emptyState(): SelectionState {
  return {
    selectionMode: false,
    selectedIds: new Set()
  };
}
