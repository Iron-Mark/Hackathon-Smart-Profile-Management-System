import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NetworkListener } from "./components/NetworkListener";
import { WebVitalsPanel } from "./components/WebVitalsPanel";
import { ClerkProviderBoundary } from "./components/ClerkProviderBoundary";
import { validateEnv } from "./lib/env";
import { ThemeProvider } from "next-themes";

validateEnv();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProviderBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ErrorBoundary>
          <NetworkListener />
          <App />
          <WebVitalsPanel />
        </ErrorBoundary>
      </ThemeProvider>
    </ClerkProviderBoundary>
  </React.StrictMode>
);
