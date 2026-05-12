import { useState } from "react";
import { DevControlPanel } from "./DevControlPanel";
import { PreviewFrame } from "./PreviewFrame";
import { PreviewToolbar } from "./PreviewToolbar";
import { loadDevState, resetDevState, saveDevState } from "./devState";
import type { DevTarget, DevWorkbenchState } from "./devState";
import "./styles.css";

export function DevWorkbench({ target }: { target: DevTarget }) {
  const [state, setState] = useState<DevWorkbenchState>(() => ({
    ...loadDevState(),
    target
  }));
  const [reloadToken, setReloadToken] = useState(0);

  function handleChange(patch: Partial<DevWorkbenchState>) {
    const next = saveDevState({ ...patch, target });
    setState(next);
    // Reload the iframe so it picks up the new scenario from localStorage
    setReloadToken((t) => t + 1);
  }

  function handleReset() {
    const next = resetDevState();
    setState({ ...next, target });
    setReloadToken((t) => t + 1);
  }

  function handleReload() {
    setReloadToken((t) => t + 1);
  }

  function handleViewportChange(viewport: DevWorkbenchState["viewport"]) {
    setState((s) => ({ ...s, viewport }));
  }

  return (
    <div className="dev-workbench">
      <aside className="dev-controls">
        <DevControlPanel
          target={target}
          state={state}
          onChange={handleChange}
          onReset={handleReset}
        />
      </aside>

      <section className="dev-preview-shell">
        <PreviewToolbar
          target={target}
          viewport={state.viewport}
          onViewportChange={handleViewportChange}
          onReload={handleReload}
        />
        <PreviewFrame
          target={target}
          viewport={state.viewport}
          reloadToken={reloadToken}
        />
      </section>
    </div>
  );
}
