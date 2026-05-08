import { useCallback, useMemo, useReducer } from "react";

export interface SelectionState {
  selectedIds: Set<string>;
  selectionMode: boolean;
}

export type SelectionAction =
  | { type: "enter" }
  | { type: "clear" }
  | { type: "select"; id: string }
  | { type: "deselect"; id: string }
  | { type: "toggle"; id: string }
  | { type: "replace"; ids: string[] };

const initialSelectionState: SelectionState = {
  selectedIds: new Set(),
  selectionMode: false
};

export function selectionReducer(
  state: SelectionState,
  action: SelectionAction
): SelectionState {
  switch (action.type) {
    case "enter":
      return state.selectionMode ? state : { ...state, selectionMode: true };

    case "clear":
      if (!state.selectionMode && state.selectedIds.size === 0) {
        return state;
      }

      return initialSelectionState;

    case "select": {
      if (state.selectedIds.has(action.id)) {
        return state.selectionMode ? state : { ...state, selectionMode: true };
      }

      return {
        selectionMode: true,
        selectedIds: new Set([...state.selectedIds, action.id])
      };
    }

    case "deselect": {
      if (!state.selectedIds.has(action.id)) {
        return state;
      }

      const nextIds = new Set(state.selectedIds);
      nextIds.delete(action.id);

      return {
        selectionMode: state.selectionMode && nextIds.size > 0,
        selectedIds: nextIds
      };
    }

    case "toggle": {
      const nextIds = new Set(state.selectedIds);

      if (nextIds.has(action.id)) {
        nextIds.delete(action.id);
      } else {
        nextIds.add(action.id);
      }

      return {
        selectionMode: nextIds.size > 0 || state.selectionMode,
        selectedIds: nextIds
      };
    }

    case "replace": {
      const nextIds = new Set(action.ids);

      return {
        selectionMode: nextIds.size > 0,
        selectedIds: nextIds
      };
    }
  }
}

export function useSelectionState() {
  const [state, dispatch] = useReducer(selectionReducer, initialSelectionState);

  const enter = useCallback(() => dispatch({ type: "enter" }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const select = useCallback((id: string) => dispatch({ type: "select", id }), []);
  const deselect = useCallback((id: string) => dispatch({ type: "deselect", id }), []);
  const toggle = useCallback((id: string) => dispatch({ type: "toggle", id }), []);
  const replace = useCallback((ids: string[]) => dispatch({ type: "replace", ids }), []);

  return useMemo(
    () => ({
      selectedIds: state.selectedIds,
      selectedCount: state.selectedIds.size,
      selectionMode: state.selectionMode,
      enter,
      clear,
      select,
      deselect,
      toggle,
      replace
    }),
    [clear, deselect, enter, replace, select, state.selectedIds, state.selectionMode, toggle]
  );
}
