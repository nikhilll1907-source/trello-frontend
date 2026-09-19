import React, { useState } from "react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import * as orgService from "../../services/organization.service";
import { getApiErrorMessage } from "../../services/api";

export const CreateOrganizationModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Organization name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await orgService.createOrganization({
        name: name.trim(),
        description: description.trim(),
      });
      setName("");
      setDescription("");
      onSuccess(response.data);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create organization."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Organization">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        <Input
          label="Organization Name"
          id="org-name"
          placeholder="e.g. Acme Corp, Engineering Team"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <div>
          <label
            htmlFor="org-desc"
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
          >
            Description (Optional)
          </label>
          <textarea
            id="org-desc"
            rows={3}
            className="w-full px-3.5 py-2 text-sm bg-white border border-surface-border rounded-lg text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Brief description of this organization..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Create Organization
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateOrganizationModal;
