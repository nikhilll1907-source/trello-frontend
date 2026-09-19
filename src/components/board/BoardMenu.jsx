import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import { useBoard } from "../../hooks/useBoard";
import * as boardService from "../../services/board.service";
import { getApiErrorMessage } from "../../services/api";
import { Trash2 } from "lucide-react";

import ConfirmModal from "../common/ConfirmModal";

export const BoardMenu = ({ isOpen, onClose, organizationId }) => {
  const { board, editBoard } = useBoard();
  const navigate = useNavigate();

  const [title, setTitle] = useState(board?.title || "");
  const [description, setDescription] = useState(board?.description || "");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // Sync state when board changes
  React.useEffect(() => {
    if (board) {
      setTitle(board.title || "");
      setDescription(board.description || "");
    }
  }, [board]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Board title is required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await editBoard({
        title: title.trim(),
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update board.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteBoard = async () => {
    setDeleteLoading(true);
    setError(null);
    try {
      await boardService.deleteBoard(board._id);
      navigate(`/organizations/${organizationId}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete board."));
      setDeleteLoading(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Board Settings">
        <div className="space-y-6">
          <form onSubmit={handleUpdate} className="space-y-4">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />

            <Input
              label="Board Title"
              id="edit-board-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div>
              <label
                htmlFor="edit-board-desc"
                className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                Description
              </label>
              <textarea
                id="edit-board-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-surface-border rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading}>
                Save Changes
              </Button>
            </div>
          </form>

          <div className="pt-5 border-t border-surface-border">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-status-error mb-2">
              Danger Zone
            </h4>
            <p className="text-xs text-text-secondary mb-3">
              Deleting this board will remove all associated sections, issues, and comments.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              loading={deleteLoading}
              icon={Trash2}
            >
              Delete Board
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Board Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteBoard}
        title="Delete Board"
        message={`Are you sure you want to delete "${board?.title}"? All sections, issues, and comments on this board will be permanently deleted.`}
        confirmText="Delete Board"
        variant="danger"
        loading={deleteLoading}
      />
    </>
  );
};

export default BoardMenu;
