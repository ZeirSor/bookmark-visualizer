import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NewTabApp } from "./NewTabApp";
import "../styles/tokens.css";
import "./styles.css";

const root = document.getElementById("newtab-root");

if (!root) {
  throw new Error("Root element #newtab-root was not found.");
}

createRoot(root).render(
  <StrictMode>
    <NewTabApp />
  </StrictMode>
);
