import React from "react";
import { AlertCircle, X } from "lucide-react";

export const ErrorMessage = ({ message, onDismiss, className = "" }) => {
  if (!message) return null;

  return (
    <div
      className={`flex items-start justify-between p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md text-xs ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
        <span className="leading-snug">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-red-400 hover:text-red-300 p-0.5 ml-2 cursor-pointer transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
