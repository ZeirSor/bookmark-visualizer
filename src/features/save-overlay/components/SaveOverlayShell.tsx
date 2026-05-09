import type { ReactNode } from "react";
import type { SaveOverlayTabId } from "../hooks/useSaveOverlayBootstrap";
import { SaveOverlayHeader } from "./SaveOverlayHeader";
import { SaveOverlayTabs } from "./SaveOverlayTabs";

export function SaveOverlayShell({
  activeTab,
  children,
  footer,
  onChangeTab,
  onClose
}: {
  activeTab: SaveOverlayTabId;
  children: ReactNode;
  footer?: ReactNode;
  onChangeTab(tab: SaveOverlayTabId): void;
  onClose(): void;
}) {
  return (
    <div
      className="save-overlay-layer"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <main
        className="popup-shell save-window-shell save-overlay-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-overlay-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <SaveOverlayHeader onClose={onClose} />
        <SaveOverlayTabs activeTab={activeTab} onChangeTab={onChangeTab} />
        <section className="popup-content save-overlay-content" role="tabpanel">
          {children}
        </section>
        {footer}
      </main>
    </div>
  );
}
