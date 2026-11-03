import React from "react";
import Button from "./Button";

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-[#29374A] bg-[#141E2D]/50 ${className}`}
    >
      {Icon && (
        <div className="w-11 h-11 rounded-lg bg-[#192536] border border-[#29374A] flex items-center justify-center text-[#A3B1C5] mb-3">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-[#E8EDF5] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[#A3B1C5] max-w-sm mb-4 leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
