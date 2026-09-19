import React, { useState } from "react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import * as membershipService from "../../services/membership.service";
import { getApiErrorMessage } from "../../services/api";

export const InviteMemberModal = ({
  isOpen,
  onClose,
  organizationId,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await membershipService.inviteMember({
        organizationId,
        email: email.trim(),
        role,
      });
      setEmail("");
      setRole("MEMBER");
      onSuccess(response.data);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to invite member."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        <Input
          label="User Email"
          id="invite-email"
          type="email"
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          helperText="The user must already have registered an account on Trello."
          required
          autoFocus
        />

        <div>
          <label
            htmlFor="invite-role"
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
          >
            Role
          </label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-surface-border rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="MEMBER">MEMBER (Can view boards, tasks, and post comments)</option>
            <option value="ADMIN">ADMIN (Full access to manage boards, sections, and members)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteMemberModal;
