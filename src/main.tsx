import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppWithErrorBoundary from "./AppWithErrorBoundary.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import "./i18n";
import { initSentry } from "./lib/sentry";
import { ErrorBoundaryEnhanced } from "./components/ErrorBoundaryEnhanced";

// Initialize Sentry
initSentry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundaryEnhanced>
      <BrowserRouter>
        <AuthProvider>
          <SubscriptionProvider>
            <AppWithErrorBoundary />
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundaryEnhanced>
  </StrictMode>
);
