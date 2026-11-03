import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../../../layouts/AuthLayout";
import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import ErrorMessage from "../../../ui/ErrorMessage";
import { useAuth } from "../hooks/useAuth";
import { LogIn } from "lucide-react";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login({ email: email.trim(), password });
       const destination = location.state?.from || "/dashboard";
       navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.message || "Failed to log in";
      setError(msg);
      if (msg.toLowerCase().includes("verify your email")) {
        // Redirect to verify email page with email prefilled
        setTimeout(() => {
         navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`, {
           state: { from: location.state?.from },
         });
        }, 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your workspace credentials to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        <Input
          label="Work Email"
          id="email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center text-[#A3B1C5] cursor-pointer">
            <input
              id="remember-me"
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-[#29374A] bg-[#0A101B] text-primary focus:ring-primary focus:ring-offset-[#0B1220]"
            />
            <span className="ml-2">Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            className="text-primary hover:text-primary-hover font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          size="lg"
          loading={loading}
          icon={LogIn}
        >
          {loading ? "Signing in..." : "Sign in to Workspace"}
        </Button>

        <div className="pt-4 border-t border-[#29374A] text-center text-xs text-[#A3B1C5]">
          Don't have an account yet?{" "}
          <Link
            to="/signup"
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Create account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
