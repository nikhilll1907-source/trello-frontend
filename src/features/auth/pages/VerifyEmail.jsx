import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../../layouts/AuthLayout";
import OtpInput from "../../../ui/OtpInput";
import Button from "../../../ui/Button";
import ErrorMessage from "../../../ui/ErrorMessage";
import { useAuth } from "../hooks/useAuth";
import { MailCheck, CheckCircle2, RefreshCw, ArrowLeft, Mail } from "lucide-react";

export const VerifyEmail = () => {
  const { user, verifyEmail, resendOtp, cancelPendingVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const emailParam = searchParams.get("email") || user?.email || "";
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    if (!email && user?.email) {
      setEmail(user.email);
    }
  }, [user, email]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const maskEmail = (str) => {
    if (!str || !str.includes("@")) return str || "your email";
    const [name, domain] = str.split("@");
    if (name.length <= 2) {
      return `${name[0]}***@${domain}`;
    }
    const visiblePrefix = name.slice(0, 3);
    return `${visiblePrefix}***@${domain}`;
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!email || otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await verifyEmail({ email: email.trim(), otp: otp.trim() });
      setSuccessMessage("Email verified successfully! Redirecting to dashboard...");
      setTimeout(() => {
         navigate(location.state?.from || "/dashboard", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email address is missing.");
      return;
    }

    setResending(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await resendOtp({ email: email.trim() });
      setSuccessMessage("A new verification code has been sent.");
      setResendCooldown(60);
      setOtp("");
    } catch (err) {
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleUseDifferentEmail = async () => {
    await cancelPendingVerification();
    setOtp("");
    setError(null);
    setSuccessMessage(null);
    navigate("/signup", { replace: true });
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit verification code to activate your account"
    >
      <div className="space-y-5">
        {successMessage && (
          <div className="flex items-center gap-2.5 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-md text-xs font-medium animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {/* Email Display Card */}
        <div className="bg-[#0A101B] border border-[#29374A] rounded-md p-3.5 text-center">
          <div className="w-9 h-9 rounded-md bg-primary/15 text-primary border border-primary/30 flex items-center justify-center mx-auto mb-2">
            <Mail className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider">
            Verification code sent to
          </p>
          <p className="text-xs font-bold text-[#E8EDF5] mt-0.5 font-mono">
            {maskEmail(email)}
          </p>

          <div className="mt-2.5 pt-2.5 border-t border-[#29374A] flex items-center justify-center gap-1.5 text-xs">
            <span className="text-[#A3B1C5]">Wrong email?</span>
            <button
              type="button"
              onClick={handleUseDifferentEmail}
              className="font-semibold text-primary hover:text-primary-hover hover:underline cursor-pointer"
            >
              Use a different email
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold uppercase tracking-wider text-[#A3B1C5] text-[10px]">
                6-Digit Verification Code
              </label>
              <span className="text-[#64748B] font-mono text-[11px]">
                {otp.length}/6 digits
              </span>
            </div>

            <OtpInput
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (error) setError(null);
              }}
              length={6}
              disabled={loading}
              error={!!error}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            size="lg"
            disabled={otp.length !== 6 || loading}
            loading={loading}
            icon={MailCheck}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        {/* Resend Section */}
        <div className="pt-2 border-t border-[#29374A] text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#A3B1C5]">
            <span>Didn't receive code?</span>
            {resendCooldown > 0 ? (
              <span className="font-medium text-[#A3B1C5]">
                Resend in <span className="font-mono font-semibold text-[#E8EDF5]">{resendCooldown}s</span>
              </span>
            ) : (
              <button
                type="button"
                disabled={resending}
                onClick={handleResend}
                className="font-semibold text-primary hover:text-primary-hover hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {resending && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Resend code</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Action */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A3B1C5] hover:text-[#E8EDF5] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
