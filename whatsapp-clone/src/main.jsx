import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { API_ORIGIN } from "./services/api";

function DBWake() {
  useEffect(() => {
    // Trigger the backend DB health/wake endpoint once per page load.
    // The request is fire-and-forget and won't block the app render.
    try {
      const apiOrigin = API_ORIGIN || '';
      const url = `${apiOrigin}/api/health/db`;
      // Fire and forget; do not await or throw on failure.
      fetch(url).catch(() => {});
    } catch (e) {
      // Swallow any synchronous errors to avoid crashing the app.
    }
  }, []);
  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <DBWake />
      <App />
    </AuthProvider>
  </React.StrictMode>
);
