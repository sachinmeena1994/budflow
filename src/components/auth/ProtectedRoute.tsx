import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import React from "react";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { inProgress, accounts } = useMsal();
  const msalReady = inProgress === InteractionStatus.None;

  // WAIT CONDITIONS:
  // 1) Auth context still loading
  // 2) MSAL not ready
  // 3) MSAL is ready AND there ARE accounts, but app hasn't hydrated user yet (isAuthenticated=false)
  const shouldWait =
    isLoading ||
    !msalReady ||
    (msalReady && accounts.length > 0 && !isAuthenticated);

  if (shouldWait) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
