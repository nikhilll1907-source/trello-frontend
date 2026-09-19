import React from "react";

export const Badge = ({
  children,
  variant = "default",
  size = "sm",
  className = "",
}) => {
  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    admin: "bg-indigo-50 text-indigo-700 border-indigo-200 font-medium",
    member: "bg-slate-100 text-slate-600 border-slate-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const sizeStyles = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
