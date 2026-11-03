import React from "react";

export const ToastContainer = ({ toasts = [], onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => onDismiss?.(toast.id)}
          className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 bg-[#141E2D]/95 backdrop-blur-md border border-[#29374A] rounded-md shadow-xl text-xs font-medium text-[#E8EDF5] cursor-pointer hover:border-primary/50 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200"
          role="status"
        >
          <span className="text-sm shrink-0 select-none">{toast.icon}</span>
          <span className="flex-1 leading-snug">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
