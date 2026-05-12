import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./styles/tokens.css";
import "./app/styles.css";

const DevLauncher = lazy(() =>
  import("./dev/DevLauncher").then((m) => ({ default: m.DevLauncher }))
);
const DevWorkbench = lazy(() =>
  import("./dev/DevWorkbench").then((m) => ({ default: m.DevWorkbench }))
);

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element #root was not found.");
}

const params = new URLSearchParams(window.location.search);
const devTarget = params.get("devTarget");
const debugTarget = params.get("debugTarget");

const isHttpDev =
  import.meta.env.DEV &&
  (window.location.protocol === "http:" || window.location.protocol === "https:");

const isValidDevTarget =
  devTarget === "popup" || devTarget === "management" || devTarget === "newtab";

const shouldRenderDevWorkbench = isHttpDev && isValidDevTarget;
const shouldRenderDevLauncher = isHttpDev && !shouldRenderDevWorkbench && debugTarget !== "management";

createRoot(root).render(
  <StrictMode>
    {shouldRenderDevWorkbench ? (
      <Suspense>
        <DevWorkbench target={devTarget as "popup" | "management" | "newtab"} />
      </Suspense>
    ) : shouldRenderDevLauncher ? (
      <Suspense>
        <DevLauncher />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
);
