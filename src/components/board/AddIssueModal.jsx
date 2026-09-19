import React, { useState } from "react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import { useBoard } from "../../hooks/useBoard";

export const AddIssueModal = ({ isOpen, onClose, defaultSectionId }) => {
  const { sections, addIssue } = useBoard();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sectionId, setSectionId] = useState(defaultSectionId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync sectionId when defaultSectionId changes
  React.useEffect(() => {
    if (defaultSectionId) {
      setSectionId(defaultSectionId);
    } else if (sections.length > 0) {
      setSectionId(sections[0]._id);
    }
  }, [defaultSectionId, sections]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Issue title is required.");
      return;
    }

    if (!sectionId) {
      setError("Please select a section for this issue.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addIssue({
        title: title.trim(),
        description: description.trim(),
        sectionId,
      });
      setTitle("");
      setDescription("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create issue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Issue">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        <Input
          label="Title"
          id="new-issue-title"
          placeholder="e.g. Implement OAuth login"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div>
          <label
            htmlFor="new-issue-desc"
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
          >
            Description
          </label>
          <textarea
            id="new-issue-desc"
            rows={3}
            placeholder="Add a more detailed description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-surface-border rounded-lg text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="new-issue-section"
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
          >
            Section
          </label>
          <select
            id="new-issue-section"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-surface-border rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            {sections.map((sec) => (
              <option key={sec._id} value={sec._id}>
                {sec.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Create Issue
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddIssueModal;
