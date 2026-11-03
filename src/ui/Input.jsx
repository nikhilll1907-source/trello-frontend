import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const Input = ({
  label,
  id,
  type = "text",
  error,
  helperText,
  className = "",
  containerClassName = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-[#A3B1C5] mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={`w-full px-3 py-2 text-sm bg-[#141E2D] border rounded-md text-[#E8EDF5] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-status-error focus:ring-status-error" : "border-[#29374A]"
          } ${isPassword ? "pr-10" : ""} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A3B1C5] hover:text-[#E8EDF5] focus:outline-none p-1 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-status-error">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-[#A3B1C5]">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
