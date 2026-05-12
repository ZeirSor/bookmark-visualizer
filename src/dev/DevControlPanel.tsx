import {
  BEHAVIOR_SCENARIO_LABELS,
  BOOKMARK_SCENARIO_LABELS,
  CURRENT_TAB_LABELS
} from "./devScenarios";
import type {
  BehaviorScenario,
  BookmarkScenario,
  CurrentTabScenario,
  DevTarget,
  DevWorkbenchState
} from "./devState";
import { devLocalStorage } from "./devStorage";

// Popup-only tab scenarios
const POPUP_TAB_SCENARIOS: CurrentTabScenario[] = [
  "normal",
  "github",
  "arxivPdf",
  "youtube",
  "longTitle",
  "noTitle",
  "noFavicon",
  "unsupportedChromeUrl"
];

const BOOKMARK_SCENARIOS: BookmarkScenario[] = [
  "default",
  "empty",
  "large",
  "deep",
  "longText",
  "duplicateFolders",
  "missingFavicons"
];

const BEHAVIOR_SCENARIOS: BehaviorScenario[] = [
  "normal",
  "saveFailure",
  "bookmarkReadFailure",
  "storageReadFailure",
  "permissionMissing",
  "delay500",
  "delay1500"
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="dev-control-section">
      <div className="dev-control-section-title">{title}</div>
      <div className="dev-control-group">{children}</div>
    </div>
  );
}

function Option<T extends string>({
  label,
  value,
  active,
  onSelect
}: {
  label: string;
  value: T;
  active: boolean;
  onSelect(value: T): void;
}) {
  return (
    <button
      type="button"
      className={`dev-control-option ${active ? "is-active" : ""}`}
      onClick={() => onSelect(value)}
    >
      {label}
    </button>
  );
}

export function DevControlPanel({
  target,
  state,
  onChange,
  onReset
}: {
  target: DevTarget;
  state: DevWorkbenchState;
  onChange(patch: Partial<DevWorkbenchState>): void;
  onReset(): void;
}) {
  function handleReset() {
    devLocalStorage.clear();
    onReset();
  }

  return (
    <>
      <div className="dev-controls-header">
        <span className="dev-controls-title">场景控制</span>
        <a className="dev-back-link" href="/">← 返回</a>
      </div>

      <div className="dev-controls-body">
        {/* Popup-only: current tab scenario */}
        {target === "popup" && (
          <Section title="当前页面">
            {POPUP_TAB_SCENARIOS.map((s) => (
              <Option
                key={s}
                label={CURRENT_TAB_LABELS[s]}
                value={s}
                active={state.currentTabScenario === s}
                onSelect={(v) => onChange({ currentTabScenario: v })}
              />
            ))}
          </Section>
        )}

        {/* Bookmark tree scenario (all targets) */}
        <Section title="书签树">
          {BOOKMARK_SCENARIOS.map((s) => (
            <Option
              key={s}
              label={BOOKMARK_SCENARIO_LABELS[s]}
              value={s}
              active={state.bookmarkScenario === s}
              onSelect={(v) => onChange({ bookmarkScenario: v })}
            />
          ))}
        </Section>

        {/* Behavior scenario (all targets) */}
        <Section title="行为场景">
          {BEHAVIOR_SCENARIOS.map((s) => (
            <Option
              key={s}
              label={BEHAVIOR_SCENARIO_LABELS[s]}
              value={s}
              active={state.behaviorScenario === s}
              onSelect={(v) => onChange({ behaviorScenario: v })}
            />
          ))}
        </Section>
      </div>

      <div className="dev-controls-footer">
        <button type="button" className="dev-reset-btn" onClick={handleReset}>
          重置所有 Mock 数据
        </button>
      </div>
    </>
  );
}
