import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { fetchCsrfToken } from "./services/api";
import App from "./App";
import "./index.css";

// Initialize CSRF token and render app
(async () => {
  try {
    await fetchCsrfToken();
    console.log('✅ CSRF token fetched');
  } catch (err) {
    console.warn('⚠️ Failed to fetch CSRF token:', err.message);
  }

  ReactDOM.createRoot(document.getElementById("root")).render(
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
})();

