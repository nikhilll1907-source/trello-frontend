import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle, Info } from "lucide-react";

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) => {
  const isDanger = variant === "danger";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-9 h-9 rounded-md shrink-0 flex items-center justify-center ${
              isDanger
                ? "bg-red-500/15 text-status-error border border-red-500/30"
                : "bg-primary/15 text-primary border border-primary/30"
            }`}
          >
            {isDanger ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#A3B1C5] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-[#29374A]">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
