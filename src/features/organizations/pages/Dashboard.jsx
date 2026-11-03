import React, { useMemo, useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import OrganizationCard from "../components/OrganizationCard";
import CreateOrganizationModal from "../components/CreateOrganizationModal";
import { OrganizationProvider, useOrganizationContext } from "../context/OrganizationContext";
import Button from "../../../ui/Button";
import { CardSkeleton } from "../../../ui/Skeleton";
import ErrorMessage from "../../../ui/ErrorMessage";
import EmptyState from "../../../ui/EmptyState";
import { Building2, Plus, Search, RefreshCw } from "lucide-react";

const DashboardContent = () => {
  const { organizations, orgStats, loading, error, setError, fetchOrganizations, addOrganization } = useOrganizationContext();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const filteredOrganizations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return organizations;
    return organizations.filter((organization) =>
      `${organization.name} ${organization.description || ""}`.toLowerCase().includes(query)
    );
  }, [organizations, searchQuery]);

  return (
    <DashboardLayout>
      <div className="space-y-7">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-border">
          <div>
            <p className="eyebrow text-primary">Workspace overview</p>
            <h1 className="page-title mt-2">Your organizations</h1>
            <p className="text-sm text-text-secondary mt-2">
              Keep projects, people, and progress in one focused place.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            icon={Plus}
          >
            New organization
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              aria-label="Search organizations"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search organizations"
              className="input-dark pl-9"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={fetchOrganizations} icon={RefreshCw}>
            Refresh
          </Button>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => <CardSkeleton key={item} />)}
          </div>
        ) : organizations.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="You don't have any organizations yet"
            description="Create your first organization to collaborate with your team, organize boards, and track issues."
            actionLabel="Create Organization"
            onAction={() => setCreateModalOpen(true)}
            className="my-10 min-h-[260px]"
          />
        ) : filteredOrganizations.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching organizations"
            description="Try a different name or description search."
            actionLabel="Clear search"
            onAction={() => setSearchQuery("")}
            className="my-10 min-h-[220px]"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => (
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
          onSuccess={addOrganization}
        />
      </div>
    </DashboardLayout>
  );
};

export const Dashboard = () => (
  <OrganizationProvider>
    <DashboardContent />
  </OrganizationProvider>
);

export default Dashboard;
