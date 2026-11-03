import React, { useState } from "react";
import Badge from "../../../ui/Badge";
import Button from "../../../ui/Button";
import ErrorMessage from "../../../ui/ErrorMessage";
import ConfirmModal from "../../../ui/ConfirmModal";
import * as membershipApi from "../api/membership.api";
import { getApiErrorMessage } from "../../../api/axios";
import { User, Shield, Trash2, CheckCircle2 } from "lucide-react";

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
      const res = await membershipApi.updateMembership(membershipId, {
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
      await membershipApi.deleteMembership(memberToRemove._id);
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
      const res = await membershipApi.acceptInvitation(membershipId);
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

      <div className="overflow-hidden border border-[#29374A] rounded-lg bg-[#141E2D]">
        <div className="divide-y divide-[#29374A]">
          {members.map((member) => {
            const isMe = member.userId?._id === currentUserId;
            const isPending = member.status === "PENDING";

            return (
              <div
                key={member._id}
                className="flex items-center justify-between p-4 hover:bg-[#192536]/40 transition-colors"
              >
                {/* Member Details */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#192536] flex items-center justify-center text-[#E8EDF5] border border-[#29374A] font-semibold text-xs">
                    {member.userId?.name
                      ? member.userId.name.slice(0, 2).toUpperCase()
                      : <User className="w-3.5 h-3.5 text-[#A3B1C5]" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#E8EDF5]">
                        {member.userId?.name || "Unknown User"}
                      </span>
                      {isMe && (
                        <span className="text-[10px] bg-[#192536] text-[#A3B1C5] border border-[#29374A] px-1.5 py-0.2 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#A3B1C5] block font-mono mt-0.5">
                      {member.userId?.email || "No email available"}
                    </span>
                  </div>
                </div>

                {/* Role and Status Badges & Controls */}
                <div className="flex items-center gap-2.5">
                  <Badge variant={member.status === "ACTIVE" ? "active" : "pending"}>
                    {member.status}
                  </Badge>

                  {isAdmin && !isMe ? (
                    <select
                      value={member.role}
                      disabled={actionLoading === member._id}
                      onChange={(e) => handleRoleChange(member._id, e.target.value)}
                      className="text-xs font-medium bg-[#141E2D] border border-[#29374A] rounded px-2 py-1 text-[#E8EDF5] focus:outline-none focus:border-primary cursor-pointer"
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
                      size="xs"
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
                      className="p-1.5 text-[#A3B1C5] hover:text-status-error hover:bg-red-500/10 rounded transition-colors cursor-pointer"
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
