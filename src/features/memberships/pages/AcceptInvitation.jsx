import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Kanban, LogIn, RefreshCw, UserPlus, Users, XCircle } from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth";
import * as membershipApi from "../api/membership.api";
import { getApiErrorMessage } from "../../../api/axios";
import Button from "../../../ui/Button";
import Spinner from "../../../ui/Spinner";

export const AcceptInvitation = () => {
  const { membershipId } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [orgId, setOrgId] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!membershipId) {
      setStatus("error");
      setMessage("This invitation link is missing its membership ID.");
      return;
    }
    setStatus(isAuthenticated ? "ready" : "unauthenticated");
  }, [authLoading, isAuthenticated, membershipId]);

  const executeAccept = async () => {
    setStatus("processing");
    setMessage("");
    try {
      const response = await membershipApi.acceptInvitation(membershipId);
      const targetOrgId = response.data?.organizationId?._id || response.data?.organizationId;
      setOrgId(targetOrgId || null);
      setMessage(response.message || "You are now a member of this organization.");
      setStatus("success");
      if (targetOrgId) {
        window.setTimeout(() => navigate(`/organizations/${targetOrgId}`, { replace: true }), 1200);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setStatus("unauthenticated");
        setMessage("Your session expired. Sign in again to accept this invitation.");
      } else {
        setStatus("error");
        setMessage(getApiErrorMessage(error, "The invitation could not be accepted. It may have expired or already been used."));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-bg px-4 py-12 text-text-main">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white"><Kanban className="h-5 w-5" /></div>
          <span className="text-lg font-extrabold tracking-tight">Trellis</span>
        </div>
        <div className="surface-card p-7 text-center">
          {status === "loading" || status === "processing" ? (
            <div className="space-y-4 py-6"><Spinner size="lg" /><h2 className="text-base font-bold">{status === "processing" ? "Accepting invitation…" : "Checking invitation…"}</h2><p className="text-xs text-text-secondary">Please wait while we prepare your organization invitation.</p></div>
          ) : status === "ready" ? (
            <div className="space-y-4 py-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary border border-primary/30"><Users className="h-6 w-6" /></div>
              <h2 className="text-lg font-bold">You’re invited</h2>
              <p className="text-sm leading-6 text-text-secondary">Accept this invitation to join the organization and access its boards.</p>
              <Button className="w-full" icon={ArrowRight} onClick={executeAccept}>Accept invitation</Button>
            </div>
          ) : status === "unauthenticated" ? (
            <div className="space-y-4 py-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary border border-primary/30"><Users className="h-6 w-6" /></div>
              <h2 className="text-lg font-bold">Sign in to continue</h2>
              <p className="text-sm leading-6 text-text-secondary">Use the invited email address, then return here to explicitly accept the invitation.</p>
              <div className="space-y-2">
                <Link to="/login" state={{ from: location }} className="block"><Button className="w-full" icon={LogIn}>Sign in</Button></Link>
                <Link to="/signup" state={{ from: location }} className="block"><Button variant="secondary" className="w-full" icon={UserPlus}>Create account</Button></Link>
              </div>
            </div>
          ) : status === "success" ? (
            <div className="space-y-4 py-3"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="h-6 w-6" /></div><h2 className="text-lg font-bold">Invitation accepted</h2><p className="text-sm leading-6 text-text-secondary">{message}</p><Link to={orgId ? `/organizations/${orgId}` : "/dashboard"}><Button className="w-full" icon={ArrowRight}>Open workspace</Button></Link></div>
          ) : (
            <div className="space-y-4 py-3"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-error/15 text-status-error border border-status-error/30"><XCircle className="h-6 w-6" /></div><h2 className="text-lg font-bold">Unable to accept</h2><p className="text-sm leading-6 text-text-secondary">{message}</p><Button variant="secondary" className="w-full" onClick={() => setStatus(isAuthenticated ? "ready" : "unauthenticated")} icon={RefreshCw}>Try again</Button></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;
