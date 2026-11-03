import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../../layouts/AuthLayout";
import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import ErrorMessage from "../../../ui/ErrorMessage";
import { useAuth } from "../hooks/useAuth";
import { UserPlus } from "lucide-react";

export const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email || !password) {
      setError("Name, email, and password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // Redirect to verify email page
       navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`, {
         state: { from: location.state?.from },
       });
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create workspace account"
      subtitle="Join your team on Trellis and collaborate with velocity"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        <Input
          label="Full Name"
          id="name"
          placeholder="e.g. Alex Miller"
          value={name}
          onChange={(e) => setName(e.target.value)}
           autoFocus
           required
        />

        <Input
          label="Work Email"
          id="email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Confirm Password"
          id="confirm-password"
          type="password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          size="lg"
          loading={loading}
          icon={UserPlus}
        >
          {loading ? "Creating account..." : "Create Account"}
        </Button>

        <div className="pt-4 border-t border-[#29374A] text-center text-xs text-[#A3B1C5]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
