import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import backend from "@/client/backend";
import { getClerkDemoIdentity } from "@/client/clerkDemoIdentity";
import { isClerkEnabled } from "@/client/clerkConfig";
import { syncClerkDemoUser } from "@/client/demoBackend";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "faculty";
}

const loadingScreen = (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export default function ProtectedRoute(props: ProtectedRouteProps) {
  if (isClerkEnabled) {
    return <ClerkSyncedProtectedRoute {...props} />;
  }

  return <DemoProtectedRoute {...props} />;
}

function ClerkSyncedProtectedRoute(props: ProtectedRouteProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const identity = getClerkDemoIdentity(user);
    if (!identity) {
      setSyncError('Clerk sign-in succeeded, but no email address was available for the local demo profile.');
      return;
    }

    let cancelled = false;
    setSyncing(true);
    setSyncError(null);

    syncClerkDemoUser(identity).then(({ error }) => {
      if (cancelled) return;

      setSyncError(error?.message ?? null);
      setSyncing(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || syncing) {
    return loadingScreen;
  }

  if (syncError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
        <div className="max-w-md rounded-lg border border-red-400/30 bg-red-400/10 p-6">
          <h1 className="text-lg font-semibold text-red-100">Clerk demo profile unavailable</h1>
          <p className="mt-2 text-sm text-red-50/80">{syncError}</p>
        </div>
      </div>
    );
  }

  return <DemoProtectedRoute {...props} />;
}

function DemoProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [redirect, setRedirect] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user }, error: authError } = await backend.auth.getUser();

        if (authError || !user) {
          setRedirect("/auth/login");
          setLoading(false);
          return;
        }

        if (requiredRole) {
          const { data, error } = await backend
            .from("account_details")
            .select("type")
            .eq("id", user.id)
            .single();

          if (error || !data || data.type !== requiredRole) {
            setRedirect(requiredRole === "admin" ? "/faculty/dashboard" : "/admin/dashboard");
            setLoading(false);
            return;
          }
        }

        setAuthorized(true);
      } catch (err) {
        console.error("Auth check failed", err);
        setRedirect("/auth/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [requiredRole]);

  if (loading) {
    return loadingScreen;
  }

  if (redirect) {
    return <Navigate to={redirect} state={{ from: location }} replace />;
  }

  if (!authorized) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
