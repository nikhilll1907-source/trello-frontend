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
      className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-white/10 bg-navy-elevated/50 ${className}`}
    >
      {Icon && (
        <div className="w-11 h-11 rounded-lg bg-navy-hover border border-white/10 flex items-center justify-center text-text-secondary mb-3">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-text-main mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-text-secondary max-w-sm mb-4 leading-relaxed">{description}</p>
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
