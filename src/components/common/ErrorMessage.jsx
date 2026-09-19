import React from "react";
import { AlertCircle, X } from "lucide-react";

export const ErrorMessage = ({ message, onDismiss, className = "" }) => {
  if (!message) return null;

  return (
    <div
      className={`flex items-start justify-between p-3.5 bg-red-50 border border-red-200 text-status-error rounded-lg text-sm ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 text-status-error" />
        <span className="leading-snug">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-status-error hover:opacity-80 p-0.5 ml-2 cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
