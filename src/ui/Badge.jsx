import React from "react";

export const Badge = ({
  children,
  variant = "default",
  size = "sm",
  className = "",
}) => {
  const variantStyles = {
    default: "bg-navy-elevated text-text-secondary border-white/10",
    admin: "bg-[rgba(16,185,129,0.12)] text-emerald-400 border-transparent font-medium",
    member: "bg-navy-elevated text-text-secondary border-white/10",
    active: "bg-[rgba(16,185,129,0.12)] text-emerald-400 border-transparent",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    error: "bg-red-500/15 text-red-400 border-red-500/30",
  };

  const sizeStyles = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md tabular-nums ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
