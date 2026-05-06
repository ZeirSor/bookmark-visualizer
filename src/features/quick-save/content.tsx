import { createRoot } from "react-dom/client";
import { extractQuickSavePageDetails } from "./pageDetails";
import { QuickSaveDialog } from "./QuickSaveDialog";
import { createQuickSaveStyle } from "./contentStyle";

declare global {
  interface Window {
    __bookmarkVisualizerQuickSaveOpen__?: () => void;
    __bookmarkVisualizerQuickSaveClose__?: () => void;
  }
}

const HOST_ID = "bookmark-visualizer-quick-save";

if (window.__bookmarkVisualizerQuickSaveOpen__) {
  window.__bookmarkVisualizerQuickSaveOpen__();
} else {
  window.__bookmarkVisualizerQuickSaveOpen__ = openQuickSave;
  openQuickSave();
}

function openQuickSave() {
  window.__bookmarkVisualizerQuickSaveClose__?.();
  document.getElementById(HOST_ID)?.remove();

  const host = document.createElement("div");
  host.id = HOST_ID;
  document.documentElement.append(host);

  const shadowRoot = host.attachShadow({ mode: "open" });
  shadowRoot.append(createQuickSaveStyle());

  const appRoot = document.createElement("div");
  shadowRoot.append(appRoot);

  const pageDetails = extractQuickSavePageDetails();
  const root = createRoot(appRoot);
  let closed = false;

  function close() {
    if (closed) {
      return;
    }

    closed = true;
    root.unmount();
    host.remove();

    if (!document.getElementById(HOST_ID)) {
      delete window.__bookmarkVisualizerQuickSaveOpen__;
      delete window.__bookmarkVisualizerQuickSaveClose__;
    }
  }

  window.__bookmarkVisualizerQuickSaveClose__ = close;
  root.render(<QuickSaveDialog pageDetails={pageDetails} shadowRoot={shadowRoot} onClose={close} />);
}

export {};