import { createRoot } from "react-dom/client";
import { SaveWindowApp } from "./SaveWindowApp";
import "../styles/tokens.css";
import "../popup/styles.css";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<SaveWindowApp />);
