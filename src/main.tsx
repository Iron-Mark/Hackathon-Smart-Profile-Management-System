import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { validateEnv } from "./lib/env";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { toast } from "sonner";

validateEnv();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ErrorBoundary>
        <NetworkListener />
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);

function NetworkListener() {
  useEffect(() => {
    const handleOffline = () => {
      toast.error("Offline Mode - Operating from Cache", { duration: Infinity, id: 'offline-toast' });
    };
    const handleOnline = () => {
      toast.dismiss('offline-toast');
      toast.success("Back Online - Syncing connected");
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null;
}
