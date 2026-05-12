import { useEffect, useRef } from "react";
import type { DevTarget, DevWorkbenchState } from "./devState";

interface ViewportSize {
  width: number;
  height: number;
}

function getViewportSize(
  target: DevTarget,
  viewport: DevWorkbenchState["viewport"]
): ViewportSize | null {
  if (target === "popup") return { width: 390, height: 620 };
  switch (viewport) {
    case "desktop": return { width: 1440, height: 900 };
    case "laptop":  return { width: 1280, height: 800 };
    case "tablet":  return { width: 1024, height: 768 };
    default:        return null; // auto/full
  }
}

function getSrc(target: DevTarget): string {
  switch (target) {
    case "popup":      return "/popup.html?devPreview=1";
    case "management": return "/index.html?debugTarget=management&devPreview=1";
    case "newtab":     return "/newtab.html?devPreview=1";
  }
}

export function PreviewFrame({
  reloadToken,
  target,
  viewport
}: {
  reloadToken: number;
  target: DevTarget;
  viewport: DevWorkbenchState["viewport"];
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const size = getViewportSize(target, viewport);
  const src = getSrc(target);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = src;
    }
  }, [reloadToken, src]);

  if (!size) {
    return (
      <div className="dev-preview-stage">
        <div className="dev-preview-frame-wrap is-fullwidth">
          <iframe ref={iframeRef} src={src} title="preview" />
        </div>
      </div>
    );
  }

  return (
    <div className="dev-preview-stage">
      <div style={{ position: "relative" }}>
        <span className="dev-preview-label">
          {size.width} × {size.height}
        </span>
        <div
          className="dev-preview-frame-wrap"
          style={{ width: size.width, height: size.height }}
        >
          <iframe ref={iframeRef} src={src} title="preview" />
        </div>
      </div>
    </div>
  );
}
