import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../layouts/DashboardLayout";
import BoardHeader from "../components/BoardHeader";
import Section from "../components/Section";
import AddIssueModal from "../components/AddIssueModal";
import IssueDetailModal from "../components/IssueDetailModal";
import ActiveUsersModal from "../components/ActiveUsersModal";
import BoardMenu from "../components/BoardMenu";
import BoardAssistant from "../../ai/components/BoardAssistant";
import Modal from "../../../ui/Modal";
import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import Spinner from "../../../ui/Spinner";
import ErrorMessage from "../../../ui/ErrorMessage";
import EmptyState from "../../../ui/EmptyState";
import ToastContainer from "../../../ui/Toast";
import { useBoard } from "../hooks/useBoard";
import { useAuth } from "../../auth/hooks/useAuth";
import { sameUser } from "../../../config/identity";
import * as orgService from "../../organizations/api/organization.api";
import * as membershipService from "../../memberships/api/membership.api";
import { Plus, ArrowLeft, Layers } from "lucide-react";

export const Board = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    board,
    sections,
    issuesBySection,
    boardLoading,
    loading,
    error,
    toasts,
    removeToast,
    cleanupWebSocket,
    loadBoard,
    addSection,
  } = useBoard();

  const [orgData, setOrgData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Modals state
  const [addSectionModalOpen, setAddSectionModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [sectionModalError, setSectionModalError] = useState(null);

  const [addIssueModalOpen, setAddIssueModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState("");

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issueDetailModalOpen, setIssueDetailModalOpen] = useState(false);

  const [boardMenuOpen, setBoardMenuOpen] = useState(false);

  // Load board data and clean up WebSocket when unmounting board page
  useEffect(() => {
    if (boardId) {
      loadBoard(boardId);
    }
    return () => {
      cleanupWebSocket();
    };
  }, [boardId, loadBoard, cleanupWebSocket]);

  // Fetch organization and verify admin status
  useEffect(() => {
    const fetchOrgDetails = async () => {
      if (!board?.organizationId) return;
      try {
        const [orgRes, membersRes] = await Promise.all([
          orgService.getOrganizationById(board.organizationId),
          membershipService.getOrganizationMembers(board.organizationId),
        ]);
        setOrgData(orgRes.data);

        const currentMember = (membersRes.data || []).find(
          (m) => sameUser(m.userId, user)
        );
        setIsAdmin(currentMember?.status === "ACTIVE" && currentMember?.role === "ADMIN");
      } catch {
        // Non-fatal
      }
    };

    fetchOrgDetails();
  }, [board, user]);

  const handleOpenAddIssue = (sectionId) => {
    setTargetSectionId(sectionId);
    setAddIssueModalOpen(true);
  };

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
    setIssueDetailModalOpen(true);
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) {
      setSectionModalError("Section name is required.");
      return;
    }

    setAddingSection(true);
    setSectionModalError(null);
    try {
      await addSection(newSectionName.trim());
      setNewSectionName("");
      setAddSectionModalOpen(false);
    } catch (err) {
      setSectionModalError(err.message || "Failed to create section.");
    } finally {
      setAddingSection(false);
    }
  };

  const isBoardLoading = boardLoading !== undefined ? boardLoading : loading;

  if (isBoardLoading && !board) {
    return (
      <DashboardLayout fullWidth>
        <div className="flex flex-col items-center justify-center py-28">
          <Spinner size="lg" />
          <p className="text-sm text-text-secondary mt-4 font-medium">
            Loading board...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !board) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <ErrorMessage message={error} />
          <Button
            variant="secondary"
            onClick={() => navigate("/dashboard")}
            icon={ArrowLeft}
          >
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout fullWidth>
      <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden bg-surface-bg">
        {/* Board Top Header */}
        <BoardHeader
          organizationName={orgData?.name}
          organizationId={board?.organizationId}
          isAdmin={isAdmin}
          onOpenAddSection={() => setAddSectionModalOpen(true)}
          onOpenBoardMenu={() => setBoardMenuOpen(true)}
        />

        {/* Board Canvas (Horizontally Scrollable) */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 sm:p-6 custom-scrollbar bg-[#0d1625]">
          {sections.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <EmptyState
                icon={Layers}
                title="No sections yet"
                description={
                  isAdmin
                    ? "Add sections like 'TODO', 'IN PROGRESS', and 'DONE' to start organizing issues."
                    : "This board doesn't have any sections yet. Ask an admin to create sections."
                }
                actionLabel={isAdmin ? "Add First Section" : undefined}
                onAction={isAdmin ? () => setAddSectionModalOpen(true) : undefined}
                className="max-w-md"
              />
            </div>
          ) : (
            <div className="flex items-start gap-5 h-full pb-4">
              {sections.map((section) => (
                <Section
                  key={section._id}
                  section={section}
                  issues={issuesBySection[section._id] || []}
                  isAdmin={isAdmin}
                  onAddIssueClick={handleOpenAddIssue}
                  onIssueClick={handleIssueClick}
                />
              ))}

              {/* Add Section Quick Button at the end of columns (Admin only) */}
              {isAdmin && (
                <div className="w-80 shrink-0">
                  <button
                    onClick={() => setAddSectionModalOpen(true)}
                     className="w-full py-3 px-4 bg-navy-card/60 hover:bg-navy-elevated border border-dashed border-navy-border rounded-lg text-sm font-semibold text-text-secondary hover:text-text-main flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add another section</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Section Modal */}
        <Modal
          isOpen={addSectionModalOpen}
          onClose={() => setAddSectionModalOpen(false)}
          title="Add Section"
          maxWidth="max-w-sm"
        >
          <form onSubmit={handleAddSection} className="space-y-4">
            <ErrorMessage
              message={sectionModalError}
              onDismiss={() => setSectionModalError(null)}
            />

            <Input
              label="Section Name"
              id="section-name"
              placeholder="e.g. Backlog, Review, Done"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              required
              autoFocus
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setAddSectionModalOpen(false)}
                disabled={addingSection}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={addingSection}>
                Add Section
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Issue Modal */}
        <AddIssueModal
          isOpen={addIssueModalOpen}
          onClose={() => setAddIssueModalOpen(false)}
          defaultSectionId={targetSectionId}
        />

        {/* Issue Detail & Comments Modal */}
        <IssueDetailModal
          isOpen={issueDetailModalOpen}
          onClose={() => {
            setIssueDetailModalOpen(false);
            setSelectedIssue(null);
          }}
          issue={selectedIssue}
          isAdmin={isAdmin}
        />

        {/* Active Users Modal */}
        <ActiveUsersModal />

        {/* Board Settings & Delete Menu */}
        <BoardMenu
          isOpen={boardMenuOpen}
          onClose={() => setBoardMenuOpen(false)}
          organizationId={board?.organizationId}
        />

        {/* Real-time presence toasts */}
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        {boardId && (
          <BoardAssistant
            key={`${user?.id || user?._id || "anonymous"}:${boardId}`}
            boardId={boardId}
            boardTitle={
              board?._id?.toString() === boardId ? board.title : undefined
            }
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Board;
