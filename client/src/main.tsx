// Desabilitar HMR do Vite
import "../vite-env.d.ts";

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Forçar desabilitamento do HMR
if (typeof window !== 'undefined') {
  window.__VITE_HMR_DISABLE__ = true;
  window.__VITE_HMR_PORT__ = 0;
  window.__VITE_HMR_HOST__ = null;
  window.__VITE_HMR_ENABLED__ = false;
}

createRoot(document.getElementById("root")!).render(<App />);
