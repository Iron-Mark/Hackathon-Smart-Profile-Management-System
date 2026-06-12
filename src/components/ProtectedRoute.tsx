import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import supabase from "@/client/supabase";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "faculty";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [redirect, setRedirect] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setRedirect("/auth/login");
          setLoading(false);
          return;
        }

        if (requiredRole) {
          const { data, error } = await supabase
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
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (redirect) {
    return <Navigate to={redirect} state={{ from: location }} replace />;
  }

  if (!authorized) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
