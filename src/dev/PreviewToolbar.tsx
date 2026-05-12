import type { DevTarget, DevWorkbenchState } from "./devState";

interface ViewportOption {
  key: DevWorkbenchState["viewport"];
  label: string;
}

const POPUP_VIEWPORTS: ViewportOption[] = [
  { key: "popup", label: "390×620" }
];

const PAGE_VIEWPORTS: ViewportOption[] = [
  { key: "auto", label: "自适应" },
  { key: "desktop", label: "1440" },
  { key: "laptop", label: "1280" },
  { key: "tablet", label: "1024" }
];

function getPreviewUrl(target: DevTarget): string {
  switch (target) {
    case "popup":
      return "/popup.html?devPreview=1";
    case "management":
      return "/index.html?debugTarget=management&devPreview=1";
    case "newtab":
      return "/newtab.html?devPreview=1";
  }
}

export function PreviewToolbar({
  target,
  viewport,
  onViewportChange,
  onReload
}: {
  target: DevTarget;
  viewport: DevWorkbenchState["viewport"];
  onViewportChange(v: DevWorkbenchState["viewport"]): void;
  onReload(): void;
}) {
  const options = target === "popup" ? POPUP_VIEWPORTS : PAGE_VIEWPORTS;

  return (
    <div className="dev-preview-toolbar">
      <span className="dev-toolbar-label">预览</span>

      <div className="dev-viewport-btns">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={`dev-viewport-btn ${viewport === opt.key ? "is-active" : ""}`}
            onClick={() => onViewportChange(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="dev-toolbar-actions">
        <button type="button" className="dev-toolbar-btn" onClick={onReload}>
          ↺ 刷新
        </button>
        <a
          className="dev-toolbar-btn"
          href={getPreviewUrl(target)}
          target="_blank"
          rel="noreferrer"
        >
          ↗ 独立打开
        </a>
      </div>
    </div>
  );
}
