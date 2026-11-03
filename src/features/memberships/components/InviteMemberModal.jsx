import React, { useState } from "react";
import Modal from "../../../ui/Modal";
import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import ErrorMessage from "../../../ui/ErrorMessage";
import * as membershipApi from "../api/membership.api";
import { getApiErrorMessage } from "../../../api/axios";

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
      const response = await membershipApi.inviteMember({
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
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Organization Member" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        <Input
          label="User Email"
          id="invite-email"
          type="email"
          placeholder="colleague@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
           helperText="The user must already have a registered account."
          required
          autoFocus
        />

        <div>
          <label
            htmlFor="invite-role"
            className="block text-xs font-semibold uppercase tracking-wider text-[#A3B1C5] mb-1.5"
          >
            Role
          </label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[#141E2D] border border-[#29374A] rounded-md text-[#E8EDF5] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
          >
            <option value="MEMBER">MEMBER (Can view boards, issues, and post comments)</option>
            <option value="ADMIN">ADMIN (Full access to manage boards, sections, and members)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#29374A]">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteMemberModal;
