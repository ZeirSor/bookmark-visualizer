export type DevTarget = "popup" | "management" | "newtab";

export type BookmarkScenario =
  | "default"
  | "empty"
  | "large"
  | "deep"
  | "longText"
  | "duplicateFolders"
  | "missingFavicons";

export type CurrentTabScenario =
  | "normal"
  | "github"
  | "arxivPdf"
  | "youtube"
  | "longTitle"
  | "noTitle"
  | "noFavicon"
  | "unsupportedChromeUrl";

export type BehaviorScenario =
  | "normal"
  | "saveFailure"
  | "bookmarkReadFailure"
  | "storageReadFailure"
  | "permissionMissing"
  | "delay500"
  | "delay1500";

export interface DevWorkbenchState {
  target: DevTarget;
  bookmarkScenario: BookmarkScenario;
  currentTabScenario: CurrentTabScenario;
  behaviorScenario: BehaviorScenario;
  viewport: "auto" | "popup" | "desktop" | "laptop" | "tablet";
}

const DEV_STATE_KEY = "bookmark-dev-workbench-state";

const defaultDevState: DevWorkbenchState = {
  target: "popup",
  bookmarkScenario: "default",
  currentTabScenario: "normal",
  behaviorScenario: "normal",
  viewport: "auto"
};

export function loadDevState(): DevWorkbenchState {
  try {
    const raw = localStorage.getItem(DEV_STATE_KEY);
    if (raw) {
      return { ...defaultDevState, ...(JSON.parse(raw) as Partial<DevWorkbenchState>) };
    }
  } catch {
    // ignore parse errors
  }
  return { ...defaultDevState };
}

export function saveDevState(patch: Partial<DevWorkbenchState>): DevWorkbenchState {
  const next = { ...loadDevState(), ...patch };
  localStorage.setItem(DEV_STATE_KEY, JSON.stringify(next));
  return next;
}

export function resetDevState(): DevWorkbenchState {
  localStorage.removeItem(DEV_STATE_KEY);
  return { ...defaultDevState };
}
