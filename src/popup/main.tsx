import { createRoot } from "react-dom/client";
import { PopupApp } from "./PopupApp";
import "../styles/tokens.css";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<PopupApp />);
