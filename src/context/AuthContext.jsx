import React, { createContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/auth.service";
import {
  setAccessToken as setApiAccessToken,
  registerLogoutCallback,
  getApiErrorMessage,
} from "../services/api";

export const AuthContext = createContext(null);

const USER_STORAGE_KEY = "trello_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync token to central axios
  const updateToken = useCallback((token) => {
    setAccessToken(token);
    setApiAccessToken(token);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const handleLogoutLocal = useCallback(() => {
    updateToken(null);
    updateUser(null);
  }, [updateToken, updateUser]);

  // Initial session hydration via refresh-token cookie
  useEffect(() => {
    registerLogoutCallback(handleLogoutLocal);

    const initAuth = async () => {
      try {
        const data = await authService.getAccessToken();
        if (data?.accessToken) {
          updateToken(data.accessToken);
        } else {
          handleLogoutLocal();
        }
      } catch {
        handleLogoutLocal();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [handleLogoutLocal, updateToken]);

  const login = async (credentials) => {
    setError(null);
    try {
      const response = await authService.login(credentials);
      if (response?.accessToken) {
        updateToken(response.accessToken);
      }
      if (response?.user) {
        updateUser(response.user);
      }
      return response;
    } catch (err) {
      const message = getApiErrorMessage(err, "Login failed. Please check your credentials.");
      setError(message);
      throw new Error(message);
    }
  };

  const signup = async (userData) => {
    setError(null);
    try {
      const response = await authService.signup(userData);
      if (response?.accessToken) {
        updateToken(response.accessToken);
      }
      if (response?.user) {
        updateUser(response.user);
      }
      return response;
    } catch (err) {
      const message = getApiErrorMessage(err, "Signup failed. Please try again.");
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue clearing local state regardless of server logout error
    } finally {
      handleLogoutLocal();
    }
  };

  const verifyEmail = async (data) => {
    setError(null);
    try {
      const response = await authService.verifyEmail(data);
      if (user) {
        updateUser({ ...user, emailVerified: true });
      }
      return response;
    } catch (err) {
      const message = getApiErrorMessage(err, "Email verification failed.");
      setError(message);
      throw new Error(message);
    }
  };

  const resendOtp = async (data) => {
    setError(null);
    try {
      return await authService.resendOtp(data);
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to resend OTP.");
      setError(message);
      throw new Error(message);
    }
  };

  const forgotPassword = async (data) => {
    setError(null);
    try {
      return await authService.forgotPassword(data);
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to request password reset.");
      setError(message);
      throw new Error(message);
    }
  };

  const verifyForgotPasswordOtp = async (data) => {
    setError(null);
    try {
      return await authService.verifyForgotPasswordOtp(data);
    } catch (err) {
      const message = getApiErrorMessage(err, "Invalid or expired reset code.");
      setError(message);
      throw new Error(message);
    }
  };

  const resetPassword = async (data) => {
    setError(null);
    try {
      return await authService.resetPassword(data);
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to reset password.");
      setError(message);
      throw new Error(message);
    }
  };

  const cancelPendingVerification = async () => {
    handleLogoutLocal();
    try {
      await authService.logout();
    } catch {
      // Ignore
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    accessToken,
    loading,
    error,
    isAuthenticated: !!user && !!accessToken && !!user.emailVerified,
    isPendingVerification: !!user && !user.emailVerified,
    login,
    signup,
    logout,
    verifyEmail,
    resendOtp,
    forgotPassword,
    verifyForgotPasswordOtp,
    resetPassword,
    cancelPendingVerification,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
