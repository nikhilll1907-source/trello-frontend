import React, { useState } from "react";
import Modal from "../../../ui/Modal";
import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import ErrorMessage from "../../../ui/ErrorMessage";
import * as orgService from "../api/organization.api";
import { getApiErrorMessage } from "../../../api/axios";

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
             className="input-dark resize-none"
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
