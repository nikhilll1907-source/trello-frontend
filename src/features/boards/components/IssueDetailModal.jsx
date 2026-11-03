import React, { useState, useEffect } from "react";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";
import ErrorMessage from "../../../ui/ErrorMessage";
import Spinner from "../../../ui/Spinner";
import { useBoard } from "../hooks/useBoard";
import { useAuth } from "../../auth/hooks/useAuth";
import ConfirmModal from "../../../ui/ConfirmModal";
import { useComments } from "../../comments/hooks/useComments";
import CommentComposer from "../../comments/components/CommentComposer";
import {
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  User,
  Calendar,
  Layers,
} from "lucide-react";

export const IssueDetailModal = ({ isOpen, onClose, issue, isAdmin = false }) => {
  const { user } = useAuth();
  const { sections, membersMap, editIssue, removeIssue } = useBoard();
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    loadComments,
    addComment,
    updateComment,
    removeComment,
    setError: setCommentsError,
  } = useComments();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [updatingIssue, setUpdatingIssue] = useState(false);
  const [deletingIssue, setDeletingIssue] = useState(false);
  const [deleteIssueModalOpen, setDeleteIssueModalOpen] = useState(false);

  // Comments state
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deletingComment, setDeletingComment] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (issue) {
      setTitle(issue.title || "");
      setDescription(issue.description || "");
      setSectionId(issue.sectionId || "");
      setIsEditingContent(false);
      setError(null);
      loadComments(issue._id);
    }
  }, [issue, loadComments]);

  if (!issue) return null;

  const creator = membersMap[issue.createdBy];
  const creatorName = creator?.name || "Team Member";
  const formattedDate = issue.createdAt
    ? new Date(issue.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const handleUpdateIssue = async (e) => {
    e?.preventDefault();
    if (!title.trim()) {
      setError("Title cannot be empty.");
      return;
    }

    setUpdatingIssue(true);
    setError(null);
    try {
      await editIssue(issue._id, {
        title: title.trim(),
        description: description.trim(),
        sectionId,
      });
      setIsEditingContent(false);
    } catch (err) {
      setError(err.message || "Failed to update issue.");
    } finally {
      setUpdatingIssue(false);
    }
  };

  const handleSectionChange = async (newSecId) => {
    setSectionId(newSecId);
    try {
      await editIssue(issue._id, {
        title,
        description,
        sectionId: newSecId,
      });
    } catch (err) {
      setError(err.message || "Failed to move section.");
      setSectionId(issue.sectionId);
    }
  };

  const confirmDeleteIssue = async () => {
    setDeletingIssue(true);
    setError(null);
    try {
      await removeIssue(issue._id, issue.sectionId);
      setDeleteIssueModalOpen(false);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to delete issue.");
      setDeletingIssue(false);
      setDeleteIssueModalOpen(false);
    }
  };

  // Comment Handlers
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSendingComment(true);
    setError(null);
    try {
      await addComment({
        content: newComment.trim(),
        issueId: issue._id,
      });
      setNewComment("");
    } catch (err) {
      setError(err.message || "Failed to post comment.");
    } finally {
      setSendingComment(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editCommentText.trim()) return;
    try {
      await updateComment(commentId, {
        content: editCommentText.trim(),
      });
      setEditingCommentId(null);
      setEditCommentText("");
    } catch (err) {
      setError(err.message || "Failed to update comment.");
    }
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    setDeletingComment(true);
    try {
      await removeComment(commentToDelete._id);
      setCommentToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete comment.");
    } finally {
      setDeletingComment(false);
    }
  };

  return (
    <>
      <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Details"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <ErrorMessage
          message={error || commentsError}
          onDismiss={() => {
            setError(null);
            setCommentsError(null);
          }}
        />

        {/* Issue Main Section */}
        <div className="space-y-4">
          {/* Header row: Title / Edit */}
          <div className="flex items-start justify-between gap-4">
            {isEditingContent ? (
              <div className="w-full space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                   className="input-dark text-base font-semibold"
                  placeholder="Issue title"
                />
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                   className="input-dark resize-none"
                  placeholder="Issue description..."
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setTitle(issue.title);
                      setDescription(issue.description);
                      setIsEditingContent(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    loading={updatingIssue}
                    onClick={handleUpdateIssue}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-text-main leading-tight">
                    {issue.title}
                  </h2>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditingContent(true)}
                      className="text-xs font-medium text-text-secondary hover:text-primary flex items-center gap-1 p-1 hover:bg-navy-elevated rounded cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
                {issue.description ? (
                  <p className="text-sm text-text-secondary mt-2 whitespace-pre-wrap leading-relaxed">
                    {issue.description}
                  </p>
                ) : (
                   <p className="text-sm text-text-muted italic mt-2">
                    No description provided.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Metadata Row: Section, Creator, Date, Delete */}
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-navy-elevated border border-navy-border rounded-md text-xs">
            {/* Section Switcher */}
            <div>
              <span className="text-text-secondary font-medium block mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Section
              </span>
              {isAdmin ? (
                <select
                  value={sectionId}
                  onChange={(e) => handleSectionChange(e.target.value)}
                   className="w-full bg-navy-card border border-navy-border rounded px-2 py-1 text-text-main font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {sections.map((sec) => (
                    <option key={sec._id} value={sec._id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-semibold text-text-main">
                  {sections.find((s) => s._id === sectionId)?.name || "Default"}
                </span>
              )}
            </div>

            {/* Creator */}
            <div>
              <span className="text-text-secondary font-medium block mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Created By
              </span>
              <span className="font-semibold text-text-main truncate block">
                {creatorName}
              </span>
            </div>

            {/* Created Date & Delete */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-text-secondary font-medium block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Created Date
                </span>
                <span className="font-medium text-text-main">{formattedDate}</span>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setDeleteIssueModalOpen(true)}
                  disabled={deletingIssue}
                     className="text-status-error hover:bg-status-error/10 p-1.5 rounded transition-colors cursor-pointer self-end"
                  title="Delete issue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-surface-border pt-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-text-main">
            <MessageSquare className="w-4 h-4" />
            <span>Comments ({comments.length})</span>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {commentsLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : comments.length === 0 ? (
               <p className="text-xs text-text-muted italic py-2">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => {
                const author = membersMap[comment.userId];
                const authorName = author?.name || (comment.userId === user?.id ? user.name : "Member");
                const isAuthor =
                  user &&
                  (comment.userId === user.id ||
                    comment.userId === user._id ||
                    comment.userId?._id === user.id);
                const canDelete = isAuthor || isAdmin;

                const commentDate = comment.createdAt
                  ? new Date(comment.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                      day: "numeric",
                    })
                  : "";

                return (
                  <div
                    key={comment._id}
                     className="p-3 bg-navy-card border border-navy-border rounded-md text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center font-bold text-[10px] text-primary">
                          {authorName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-text-main">
                          {authorName}
                        </span>
                         <span className="text-[11px] text-text-muted">
                          {commentDate}
                        </span>
                      </div>

                      {/* Comment Actions */}
                      <div className="flex items-center gap-1">
                        {isAuthor && editingCommentId !== comment._id && (
                          <button
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditCommentText(comment.content);
                            }}
                            className="p-1 text-text-muted hover:text-text-main rounded cursor-pointer"
                            title="Edit comment"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setCommentToDelete(comment)}
                            className="p-1 text-text-muted hover:text-status-error rounded cursor-pointer"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Comment Content */}
                    {editingCommentId === comment._id ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                           className="flex-1 input-dark py-1 text-xs border-primary"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditComment(comment._id);
                            if (e.key === "Escape") setEditingCommentId(null);
                          }}
                        />
                        <button
                          onClick={() => handleEditComment(comment._id)}
                          className="text-primary hover:text-primary-hover p-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="text-text-secondary hover:text-text-main p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-text-main whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Add Comment Input Form */}
          <CommentComposer
            value={newComment}
            onChange={setNewComment}
            onSubmit={handleAddComment}
            loading={sendingComment}
          />
        </div>
      </div>
    </Modal>

    {/* Delete Issue Confirmation Modal */}
    <ConfirmModal
      isOpen={deleteIssueModalOpen}
      onClose={() => setDeleteIssueModalOpen(false)}
      onConfirm={confirmDeleteIssue}
      title="Delete Issue"
      message={`Are you sure you want to delete "${issue?.title}"? All comments associated with this issue will be permanently deleted.`}
      confirmText="Delete Issue"
      variant="danger"
      loading={deletingIssue}
    />

    {/* Delete Comment Confirmation Modal */}
    <ConfirmModal
      isOpen={!!commentToDelete}
      onClose={() => setCommentToDelete(null)}
      onConfirm={confirmDeleteComment}
      title="Delete Comment"
      message="Are you sure you want to delete this comment? This action cannot be undone."
      confirmText="Delete Comment"
      variant="danger"
      loading={deletingComment}
    />
    </>
  );
};

export default IssueDetailModal;
