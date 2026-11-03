import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../../layouts/AuthLayout";
import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import ErrorMessage from "../../../ui/ErrorMessage";
import OtpInput from "../../../ui/OtpInput";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeft, KeyRound } from "lucide-react";

export const ForgotPassword = () => {
  const { forgotPassword, verifyForgotPasswordOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await forgotPassword({ email: email.trim() });
      setInfo("Password reset OTP has been sent to your email.");
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyForgotPasswordOtp({ email: email.trim(), otp: otp.trim() });
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? "Reset password" : "Enter verification code"}
      subtitle={
        step === 1
          ? "Enter your work email and we will send a 6-digit reset code"
          : `We've sent a 6-digit code to ${email}`
      }
    >
      <div className="space-y-4">
        {info && (
          <div className="p-3 bg-primary/15 border border-primary/30 text-primary text-xs rounded-md font-medium">
            {info}
          </div>
        )}

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <Input
              label="Work Email"
              id="forgot-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              size="lg"
              loading={loading}
              icon={KeyRound}
            >
              {loading ? "Sending code..." : "Send Reset Code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#A3B1C5] text-center">
                6-Digit Reset Code
              </label>
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
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setError(null);
              }}
              className="w-full text-center text-xs text-[#A3B1C5] hover:text-[#E8EDF5] cursor-pointer"
            >
              Try with a different email
            </button>
          </form>
        )}

        <div className="pt-3 border-t border-[#29374A] text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
