import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as membershipService from "../services/membership.service";
import { getApiErrorMessage } from "../services/api";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import {
  Kanban,
  CheckCircle2,
  XCircle,
  Users,
  LogIn,
  UserPlus,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export const AcceptInvitation = () => {
  const { membershipId } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error" | "unauthenticated"
  const [message, setMessage] = useState("");
  const [orgId, setOrgId] = useState(null);

  const hasCalledApiRef = useRef(false);

  const executeAccept = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const res = await membershipService.acceptInvitation(membershipId);
      setStatus("success");
      setMessage(res.message || "Invitation accepted successfully!");

      const targetOrgId =
        res.data?.organizationId?._id || res.data?.organizationId;
      if (targetOrgId) {
        setOrgId(targetOrgId);
        setTimeout(() => {
          navigate(`/organizations/${targetOrgId}`);
        }, 2000);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setStatus("unauthenticated");
        setMessage(
          "You must be signed in to accept this invitation. Please sign in or create an account."
        );
      } else if (err.response?.status === 403) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Please verify your email before accepting this invitation."
        );
      } else {
        setStatus("error");
        setMessage(
          getApiErrorMessage(
            err,
            "Failed to accept invitation. The invitation may have expired or already been accepted."
          )
        );
      }
    }
  };

  useEffect(() => {
    // Wait until authentication initialization completes
    if (authLoading) return;

    if (!membershipId) {
      setStatus("error");
      setMessage("Invalid invitation link. Membership ID is missing.");
      return;
    }

    // Prevent duplicate API calls on mount
    if (hasCalledApiRef.current) return;
    hasCalledApiRef.current = true;

    executeAccept();
  }, [authLoading, membershipId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/30">
            <Kanban className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-main">
            Trello Clone
          </span>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl border border-surface-border p-8 shadow-xs text-center">
          {status === "loading" && (
            <div className="py-6 space-y-4">
              <div className="flex justify-center">
                <Spinner size="lg" />
              </div>
              <h2 className="text-xl font-bold text-text-main">
                Accepting Invitation...
              </h2>
              <p className="text-sm text-text-secondary max-w-xs mx-auto">
                Please wait while we process your organization invitation.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-status-success mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-text-main">
                Invitation Accepted!
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {message || "You have successfully joined the organization."}
              </p>
              <p className="text-xs text-text-secondary/70">
                Redirecting you to the organization...
              </p>

              <div className="pt-3">
                <Link to={orgId ? `/organizations/${orgId}` : "/dashboard"}>
                  <Button variant="primary" className="w-full" icon={ArrowRight}>
                    Go to Organization
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === "unauthenticated" && (
            <div className="py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-indigo-100 text-primary mx-auto flex items-center justify-center shadow-xs">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-text-main">
                Sign In Required
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                You've been invited to join an organization on Trello Clone.
                Please sign in with the invited email address to accept.
              </p>

              <div className="space-y-2.5 pt-3">
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="block w-full"
                >
                  <Button variant="primary" className="w-full" icon={LogIn}>
                    Sign In to Accept
                  </Button>
                </Link>
                <Link
                  to="/signup"
                  state={{ from: location }}
                  className="block w-full"
                >
                  <Button variant="secondary" className="w-full" icon={UserPlus}>
                    Create an Account
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-100 text-status-error mx-auto flex items-center justify-center shadow-xs">
                <XCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-text-main">
                Unable to Accept
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {message}
              </p>

              <div className="space-y-2.5 pt-3">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={executeAccept}
                  icon={RefreshCw}
                >
                  Try Again
                </Button>
                <Link to="/dashboard" className="block w-full">
                  <Button variant="primary" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;
