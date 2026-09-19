import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import MembersList from "../components/organization/MembersList";
import InviteMemberModal from "../components/organization/InviteMemberModal";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";
import { useAuth } from "../hooks/useAuth";
import * as orgService from "../services/organization.service";
import * as boardService from "../services/board.service";
import * as membershipService from "../services/membership.service";
import { getApiErrorMessage } from "../services/api";
import ConfirmModal from "../components/common/ConfirmModal";
import {
  Layout,
  Users,
  Settings,
  Plus,
  ArrowLeft,
  Trash2,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export const Organization = () => {
  const { organizationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("boards"); // "boards" | "members" | "settings"
  const [organization, setOrganization] = useState(null);
  const [boards, setBoards] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modals state
  const [createBoardModalOpen, setCreateBoardModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");
  const [creatingBoard, setCreatingBoard] = useState(false);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deleteOrgModalOpen, setDeleteOrgModalOpen] = useState(false);

  // Settings state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [updatingOrg, setUpdatingOrg] = useState(false);
  const [deletingOrg, setDeletingOrg] = useState(false);

  const currentUserId = user?.id || user?._id;

  // Determine if current user is admin in this organization
  const currentMembership = members.find(
    (m) => m.userId?._id === currentUserId || m.userId === currentUserId
  );
  const isAdmin = currentMembership?.role === "ADMIN";

  const fetchOrganizationData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgRes, boardsRes, membersRes] = await Promise.all([
        orgService.getOrganizationById(organizationId),
        boardService.getBoards(organizationId),
        membershipService.getOrganizationMembers(organizationId),
      ]);

      const orgData = orgRes.data;
      setOrganization(orgData);
      setEditName(orgData.name || "");
      setEditDesc(orgData.description || "");

      setBoards(boardsRes.data || []);
      setMembers(membersRes.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load organization data."));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchOrganizationData();
  }, [fetchOrganizationData]);

  // Board creation handler
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    setCreatingBoard(true);
    setError(null);
    try {
      const res = await boardService.createBoard({
        title: newBoardTitle.trim(),
        description: newBoardDesc.trim(),
        organizationId,
      });
      setBoards((prev) => [res.data, ...prev]);
      setNewBoardTitle("");
      setNewBoardDesc("");
      setCreateBoardModalOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create board."));
    } finally {
      setCreatingBoard(false);
    }
  };

  // Organization settings handlers
  const handleUpdateOrg = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setUpdatingOrg(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await orgService.updateOrganization(organizationId, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setOrganization(res.data);
      setSuccessMessage("Organization updated successfully.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update organization."));
    } finally {
      setUpdatingOrg(false);
    }
  };

  const confirmDeleteOrg = async () => {
    setDeletingOrg(true);
    setError(null);
    try {
      await orgService.deleteOrganization(organizationId);
      navigate("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete organization."));
      setDeletingOrg(false);
      setDeleteOrgModalOpen(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <Spinner size="lg" />
          <p className="text-sm text-text-secondary mt-4">
            Loading organization...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !organization) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          <ErrorMessage message={error} />
          <Button variant="secondary" onClick={() => navigate("/dashboard")} icon={ArrowLeft}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Link & Org Header */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-main mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Organizations</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
            <div>
              <h1 className="text-2xl font-bold text-text-main tracking-tight">
                {organization?.name}
              </h1>
              {organization?.description && (
                <p className="text-sm text-text-secondary mt-1 max-w-2xl">
                  {organization.description}
                </p>
              )}
            </div>

            {/* Quick Action Button based on tab */}
            <div className="flex items-center gap-3">
              {activeTab === "boards" && isAdmin && (
                <Button
                  variant="primary"
                  onClick={() => setCreateBoardModalOpen(true)}
                  icon={Plus}
                >
                  Create Board
                </Button>
              )}
              {activeTab === "members" && isAdmin && (
                <Button
                  variant="primary"
                  onClick={() => setInviteModalOpen(true)}
                  icon={Plus}
                >
                  Invite Member
                </Button>
              )}
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-status-success rounded-xl text-sm animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-surface-border">
          <button
            onClick={() => setActiveTab("boards")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === "boards"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-main"
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Boards ({boards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === "members"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-main"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Members ({members.length})</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-main"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          )}
        </div>

        {/* Tab 1: Boards */}
        {activeTab === "boards" && (
          <div>
            {boards.length === 0 ? (
              <EmptyState
                icon={Layout}
                title="No boards yet"
                description="Boards help you track tasks, manage workflows, and collaborate with your organization in real time."
                actionLabel={isAdmin ? "Create Board" : undefined}
                onAction={isAdmin ? () => setCreateBoardModalOpen(true) : undefined}
                className="my-8"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {boards.map((board) => (
                  <Link
                    key={board._id}
                    to={`/boards/${board._id}`}
                    className="group bg-white border border-surface-border rounded-xl p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-base font-semibold text-text-main group-hover:text-primary transition-colors">
                        {board.title}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">
                        {board.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(board.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                        Open Board →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Members */}
        {activeTab === "members" && (
          <MembersList
            members={members}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onMemberUpdated={(updated) =>
              setMembers((prev) =>
                prev.map((m) => (m._id === updated._id ? updated : m))
              )
            }
            onMemberRemoved={(removedId) =>
              setMembers((prev) => prev.filter((m) => m._id !== removedId))
            }
          />
        )}

        {/* Tab 3: Settings (Admin only) */}
        {activeTab === "settings" && isAdmin && (
          <div className="max-w-2xl bg-white border border-surface-border rounded-xl p-6 space-y-6">
            <form onSubmit={handleUpdateOrg} className="space-y-4">
              <h3 className="text-base font-semibold text-text-main">
                General Settings
              </h3>

              <Input
                label="Organization Name"
                id="edit-org-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />

              <div>
                <label
                  htmlFor="edit-org-desc"
                  className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="edit-org-desc"
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-surface-border rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" loading={updatingOrg}>
                  Save Changes
                </Button>
              </div>
            </form>

            <div className="pt-6 border-t border-surface-border">
              <h4 className="text-sm font-semibold text-status-error mb-1">
                Danger Zone
              </h4>
              <p className="text-xs text-text-secondary mb-4">
                Deleting this organization will immediately and permanently delete all
                its boards, sections, tasks, and comments.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteOrgModalOpen(true)}
                loading={deletingOrg}
                icon={Trash2}
              >
                Delete Organization
              </Button>
            </div>
          </div>
        )}

        {/* Delete Organization Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteOrgModalOpen}
          onClose={() => setDeleteOrgModalOpen(false)}
          onConfirm={confirmDeleteOrg}
          title="Delete Organization"
          message={`Are you sure you want to delete "${organization?.name}"? All boards, sections, issues, and comments will be permanently erased. This action cannot be undone.`}
          confirmText="Delete Organization"
          variant="danger"
          loading={deletingOrg}
        />

        {/* Create Board Modal */}
        <Modal
          isOpen={createBoardModalOpen}
          onClose={() => setCreateBoardModalOpen(false)}
          title="Create New Board"
        >
          <form onSubmit={handleCreateBoard} className="space-y-4">
            <Input
              label="Board Title"
              id="board-title"
              placeholder="e.g. Frontend Development, Sprint 4"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              required
              autoFocus
            />

            <div>
              <label
                htmlFor="board-desc"
                className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                Description (Optional)
              </label>
              <textarea
                id="board-desc"
                rows={3}
                placeholder="What is this board for?"
                value={newBoardDesc}
                onChange={(e) => setNewBoardDesc(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-surface-border rounded-lg text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
              <Button
                variant="secondary"
                onClick={() => setCreateBoardModalOpen(false)}
                disabled={creatingBoard}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={creatingBoard}>
                Create Board
              </Button>
            </div>
          </form>
        </Modal>

        {/* Invite Member Modal */}
        <InviteMemberModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          organizationId={organizationId}
          onSuccess={(newMember) => setMembers((prev) => [newMember, ...prev])}
        />
      </div>
    </DashboardLayout>
  );
};

export default Organization;
