import React from "react";

export const Badge = ({
  children,
  variant = "default",
  size = "sm",
  className = "",
}) => {
  const variantStyles = {
    default: "bg-[#192536] text-[#A3B1C5] border-[#29374A]",
    admin: "bg-primary/15 text-[#60A5FA] border-primary/30 font-medium",
    member: "bg-[#192536] text-[#A3B1C5] border-[#29374A]",
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
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
      className={`inline-flex items-center font-medium border rounded-md ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
