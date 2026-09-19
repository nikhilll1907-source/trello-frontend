import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import OrganizationCard from "../components/organization/OrganizationCard";
import CreateOrganizationModal from "../components/organization/CreateOrganizationModal";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";
import * as orgService from "../services/organization.service";
import * as boardService from "../services/board.service";
import * as membershipService from "../services/membership.service";
import { getApiErrorMessage } from "../services/api";
import { Building2, Plus } from "lucide-react";

export const Dashboard = () => {
  const [organizations, setOrganizations] = useState([]);
  const [orgStats, setOrgStats] = useState({}); // { [orgId]: { boards: count, members: count } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orgService.getOrganizations();
      const orgs = response.data || [];
      setOrganizations(orgs);

      // Fetch board & member counts for each organization
      const stats = {};
      await Promise.all(
        orgs.map(async (org) => {
          try {
            const [boardsRes, membersRes] = await Promise.all([
              boardService.getBoards(org._id),
              membershipService.getOrganizationMembers(org._id),
            ]);
            stats[org._id] = {
              boards: boardsRes.data?.length || 0,
              members: membersRes.data?.length || 0,
            };
          } catch {
            stats[org._id] = { boards: 0, members: 0 };
          }
        })
      );
      setOrgStats(stats);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load organizations."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleOrgCreated = (newOrg) => {
    setOrganizations((prev) => [newOrg, ...prev]);
    setOrgStats((prev) => ({
      ...prev,
      [newOrg._id]: { boards: 0, members: 1 },
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-border">
          <div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              My Organizations
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Select an organization to manage your team boards, tasks, and members.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            icon={Plus}
          >
            Create Organization
          </Button>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="text-sm text-text-secondary mt-4">
              Loading organizations...
            </p>
          </div>
        ) : organizations.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="You don't have any organizations yet"
            description="Create your first organization to collaborate with your team, organize boards, and track project tasks."
            actionLabel="Create Organization"
            onAction={() => setCreateModalOpen(true)}
            className="my-10"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <OrganizationCard
                key={org._id}
                organization={org}
                boardCount={orgStats[org._id]?.boards || 0}
                memberCount={orgStats[org._id]?.members || 0}
              />
            ))}
          </div>
        )}

        {/* Create Organization Modal */}
        <CreateOrganizationModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleOrgCreated}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
