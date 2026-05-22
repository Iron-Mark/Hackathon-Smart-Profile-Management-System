import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 text-center p-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6 max-w-md">
            An unexpected error occurred in the application. Please try reloading the page or contact support if the issue persists.
          </p>
          <Button onClick={() => window.location.reload()} variant="default">
            Reload Page
          </Button>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-6 p-4 bg-gray-200 rounded text-left text-sm text-red-600 overflow-auto max-w-2xl w-full">
              {this.state.error?.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
