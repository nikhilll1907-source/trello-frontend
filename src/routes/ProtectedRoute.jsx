import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../ui/Spinner";

export const ProtectedRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-bg">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-text-secondary mt-3">
          Verifying session...
        </p>
      </div>
    );
  }

  if (user && !user.emailVerified) {
    return (
      <Navigate
        to={`/verify-email?email=${encodeURIComponent(user.email || "")}`}
        replace
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
