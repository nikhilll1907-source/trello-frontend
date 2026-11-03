import React, { useState } from "react";
import { Plus, MoreVertical, Trash2, Edit2, Check, X } from "lucide-react";
import IssueCard from "./IssueCard";
import ConfirmModal from "../../../ui/ConfirmModal";
import { useBoard } from "../hooks/useBoard";

export const Section = ({
  section,
  issues = [],
  isAdmin = false,
  onAddIssueClick,
  onIssueClick,
}) => {
  const { editSection, removeSection } = useBoard();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(section.name);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveTitle = async () => {
    if (!titleValue.trim() || titleValue.trim() === section.name) {
      setIsEditingTitle(false);
      setTitleValue(section.name);
      return;
    }

    setLoading(true);
    try {
      await editSection(section._id, titleValue.trim());
      setIsEditingTitle(false);
    } catch {
      setTitleValue(section.name);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteSection = async () => {
    setDeleting(true);
    try {
      await removeSection(section._id);
      setDeleteModalOpen(false);
    } catch {
      // Error handled
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-[300px] sm:w-80 shrink-0 bg-navy-card border border-navy-border rounded-lg flex flex-col max-h-[calc(100vh-170px)]">
      {/* Section Header */}
      <div className="p-3 pb-2 flex items-center justify-between gap-2 border-b border-navy-border">
        {isEditingTitle ? (
          <div className="flex items-center gap-1.5 flex-1">
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              disabled={loading}
              className="w-full text-xs font-semibold uppercase tracking-wider bg-navy-elevated text-text-main px-2 py-1 border border-primary rounded focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") {
                  setIsEditingTitle(false);
                  setTitleValue(section.name);
                }
              }}
            />
            <button
              onClick={handleSaveTitle}
              className="text-primary hover:text-primary-hover p-1"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsEditingTitle(false);
                setTitleValue(section.name);
              }}
              className="text-text-secondary hover:text-text-main p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-text-secondary truncate">
              {section.name}
            </h3>
            <span className="text-[11px] font-semibold text-text-secondary bg-navy-elevated px-1.5 py-0.5 rounded">
              {issues.length}
            </span>
          </div>
        )}

        {/* Section Options (Admin only) */}
        {isAdmin && !isEditingTitle && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 text-text-muted hover:text-text-main hover:bg-navy-elevated rounded transition-colors cursor-pointer"
              title="Section options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-navy-elevated border border-navy-border rounded-md shadow-lg py-1 z-20">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setIsEditingTitle(true);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-text-main hover:bg-navy-hover flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-text-secondary" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setDeleteModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-status-error hover:bg-status-error/10 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-status-error" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Issues List Container */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 custom-scrollbar min-h-[50px]">
        {issues.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-muted border border-dashed border-navy-border rounded-md">
              No issues in this section
          </div>
        ) : (
          issues.map((issue) => (
            <IssueCard
              key={issue._id}
              issue={issue}
              onClick={onIssueClick}
            />
          ))
        )}
      </div>

      {/* Add Issue Button (Admin only) */}
      {isAdmin && (
        <div className="p-2 pt-1 border-t border-navy-border">
          <button
            onClick={() => onAddIssueClick(section._id)}
            className="w-full py-1.5 px-3 rounded-md text-xs font-medium text-text-secondary hover:text-text-main hover:bg-navy-elevated flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add issue</span>
          </button>
        </div>
      )}

      {/* Delete Section Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteSection}
        title="Delete Section"
        message={`Are you sure you want to delete section "${section.name}"? All issues inside will be permanently deleted.`}
        confirmText="Delete Section"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Section;
