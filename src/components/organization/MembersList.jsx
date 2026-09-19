import React, { useState } from "react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import * as membershipService from "../../services/membership.service";
import { getApiErrorMessage } from "../../services/api";
import { User, Shield, Trash2, CheckCircle2 } from "lucide-react";

import ConfirmModal from "../common/ConfirmModal";

export const MembersList = ({
  members = [],
  currentUserId,
  isAdmin = false,
  onMemberUpdated,
  onMemberRemoved,
}) => {
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);

  const handleRoleChange = async (membershipId, newRole) => {
    setActionLoading(membershipId);
    setError(null);
    try {
      const res = await membershipService.updateMembership(membershipId, {
        role: newRole,
      });
      onMemberUpdated(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update member role."));
    } finally {
      setActionLoading(null);
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    setActionLoading(memberToRemove._id);
    setError(null);
    try {
      await membershipService.deleteMembership(memberToRemove._id);
      onMemberRemoved(memberToRemove._id);
      setMemberToRemove(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to remove member."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptInvite = async (membershipId) => {
    setActionLoading(membershipId);
    setError(null);
    try {
      const res = await membershipService.acceptInvitation(membershipId);
      onMemberUpdated(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to accept invitation."));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      <div className="overflow-hidden border border-surface-border rounded-xl bg-white">
        <div className="divide-y divide-surface-border">
          {members.map((member) => {
            const isMe = member.userId?._id === currentUserId;
            const isPending = member.status === "PENDING";

            return (
              <div
                key={member._id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
              >
                {/* Member Details */}
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-text-secondary border border-surface-border font-semibold text-xs">
                    {member.userId?.name
                      ? member.userId.name.slice(0, 2).toUpperCase()
                      : <User className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-main">
                        {member.userId?.name || "Unknown User"}
                      </span>
                      {isMe && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-text-secondary block">
                      {member.userId?.email || "No email available"}
                    </span>
                  </div>
                </div>

                {/* Role and Status Badges & Controls */}
                <div className="flex items-center gap-3">
                  <Badge variant={member.status === "ACTIVE" ? "active" : "pending"}>
                    {member.status}
                  </Badge>

                  {isAdmin && !isMe ? (
                    <select
                      value={member.role}
                      disabled={actionLoading === member._id}
                      onChange={(e) => handleRoleChange(member._id, e.target.value)}
                      className="text-xs font-medium bg-white border border-surface-border rounded-md px-2.5 py-1 text-text-main focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      <option value="MEMBER">MEMBER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : (
                    <Badge variant={member.role === "ADMIN" ? "admin" : "member"}>
                      {member.role === "ADMIN" && <Shield className="w-3 h-3 mr-1 inline" />}
                      {member.role}
                    </Badge>
                  )}

                  {/* Accept invite button if it's for current user and pending */}
                  {isMe && isPending && (
                    <Button
                      size="sm"
                      variant="primary"
                      loading={actionLoading === member._id}
                      onClick={() => handleAcceptInvite(member._id)}
                      icon={CheckCircle2}
                    >
                      Accept
                    </Button>
                  )}

                  {/* Remove Button for Admin */}
                  {isAdmin && (
                    <button
                      onClick={() => setMemberToRemove(member)}
                      disabled={actionLoading === member._id}
                      className="p-1.5 text-text-secondary hover:text-status-error hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Remove Member Confirmation Modal */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={confirmRemoveMember}
        title="Remove Organization Member"
        message={`Are you sure you want to remove ${memberToRemove?.userId?.name || "this member"} from the organization? They will immediately lose access to all organization boards.`}
        confirmText="Remove Member"
        variant="danger"
        loading={actionLoading === memberToRemove?._id}
      />
    </div>
  );
};

export default MembersList;
