import { createRoot } from "react-dom/client";
import { SaveOverlayApp } from "./SaveOverlayApp";
import { createSaveOverlayStyle } from "./contentStyle";
import { extractSaveOverlayPageDetails } from "./pageDetails";

declare global {
  interface Window {
    __bookmarkVisualizerSaveOverlayOpen__?: () => void;
    __bookmarkVisualizerSaveOverlayClose__?: () => void;
  }
}

const HOST_ID = "bookmark-visualizer-save-overlay";

if (window.__bookmarkVisualizerSaveOverlayOpen__) {
  window.__bookmarkVisualizerSaveOverlayOpen__();
} else {
  window.__bookmarkVisualizerSaveOverlayOpen__ = openSaveOverlay;
  openSaveOverlay();
}

function openSaveOverlay() {
  window.__bookmarkVisualizerSaveOverlayClose__?.();
  document.getElementById(HOST_ID)?.remove();

  const host = document.createElement("div");
  host.id = HOST_ID;
  document.documentElement.append(host);

  const shadowRoot = host.attachShadow({ mode: "open" });
  shadowRoot.append(createSaveOverlayStyle());

  const appRoot = document.createElement("div");
  appRoot.id = "root";
  shadowRoot.append(appRoot);

  const pageDetails = extractSaveOverlayPageDetails();
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
      delete window.__bookmarkVisualizerSaveOverlayOpen__;
      delete window.__bookmarkVisualizerSaveOverlayClose__;
    }
  }

  window.__bookmarkVisualizerSaveOverlayClose__ = close;
  root.render(<SaveOverlayApp pageDetails={pageDetails} shadowRoot={shadowRoot} onClose={close} />);
}

export {};
