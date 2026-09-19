import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

// Pages
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import Organization from "../pages/Organization";
import Board from "../pages/Board";
import AcceptInvitation from "../pages/AcceptInvitation";

// Not found
import Button from "../components/common/Button";
import { Kanban, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-surface-bg px-4 text-center">
    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mb-4">
      <Kanban className="w-7 h-7" />
    </div>
    <h1 className="text-4xl font-extrabold text-text-main">404</h1>
    <h2 className="text-lg font-semibold text-text-main mt-2">Page Not Found</h2>
    <p className="text-sm text-text-secondary max-w-sm mt-1 mb-6">
      The page you are looking for doesn't exist or has been moved.
    </p>
    <Link to="/dashboard">
      <Button variant="primary" icon={ArrowLeft}>
        Back to Safety
      </Button>
    </Link>
  </div>
);

export const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          loading ? (
            <div className="min-h-screen flex items-center justify-center bg-surface-bg">
              <span className="text-sm text-text-secondary">Loading...</span>
            </div>
          ) : isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public / Auth Routes */}
      <Route
        path="/login"
        element={
          !loading && isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/signup"
        element={
          !loading && isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Signup />
          )
        }
      />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/invitations/accept/:membershipId"
        element={<AcceptInvitation />}
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/organizations/:organizationId"
          element={<Organization />}
        />
        <Route path="/boards/:boardId" element={<Board />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
