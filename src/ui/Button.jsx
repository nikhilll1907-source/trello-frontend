import React from "react";
import Spinner from "./Spinner";

export const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  onClick,
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B1220] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]";

  const sizeStyles = {
    xs: "px-2.5 py-1 text-xs gap-1.5 h-7",
    sm: "px-3 py-1.5 text-xs gap-1.5 h-8",
    md: "px-3.5 py-2 text-sm gap-2 h-9",
    lg: "px-4 py-2.5 text-sm gap-2 h-10",
  };

  const variantStyles = {
    primary:
      "bg-primary hover:bg-primary-hover text-white focus:ring-primary shadow-xs",
    secondary:
      "bg-[#192536] hover:bg-[#1E2D42] text-[#E8EDF5] border border-[#29374A] focus:ring-[#29374A]",
    danger:
      "bg-status-error hover:bg-red-600 text-white focus:ring-status-error",
    ghost:
      "bg-transparent hover:bg-[#192536] text-[#A3B1C5] hover:text-[#E8EDF5] focus:ring-[#29374A]",
    link:
      "bg-transparent text-primary hover:underline p-0 focus:ring-0 active:scale-100",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" color={variant === "primary" || variant === "danger" ? "white" : "primary"} />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
