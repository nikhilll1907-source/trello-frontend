import axios from "axios";
import { API_URL } from "../config/env";

let currentAccessToken = null;
let logoutCallback = null;

export const setAccessToken = (token) => {
  currentAccessToken = token;
};

export const getAccessToken = () => {
  return currentAccessToken;
};

export const registerLogoutCallback = (cb) => {
  logoutCallback = cb;
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    if (currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop on auth endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/access-token") ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/signup");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.get(`${API_URL}/auth/access-token`, {
          withCredentials: true,
        });

        const newAccessToken = refreshResponse.data.accessToken;
        setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        if (logoutCallback) {
          logoutCallback();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error, defaultMessage = "An unexpected error occurred. Please try again.") => {
  if (!error) return defaultMessage;
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (error.response?.status === 404) {
    return "Requested resource was not found.";
  }
  if (error.response?.status === 409) {
    return "Conflict detected. The item may already exist.";
  }
  if (error.response?.status >= 500) {
    return "Internal server error. Please try again later.";
  }
  if (error.message === "Network Error") {
    return "Cannot connect to server. Please check your internet or server connection.";
  }
  return error.message || defaultMessage;
};

export default api;
