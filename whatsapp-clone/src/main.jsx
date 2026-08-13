import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { API_ORIGIN } from "./services/api";

function DBWake() {
  useEffect(() => {
    try {
      const apiOrigin = API_ORIGIN || '';
      const url = `${apiOrigin}/api/health/db`;
      fetch(url).catch(() => {});
    } catch (e) {
      // Swallow
    }
  }, []);
  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <DBWake />
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
