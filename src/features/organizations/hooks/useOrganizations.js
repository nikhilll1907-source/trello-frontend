import { useState, useEffect, useCallback } from "react";
import * as orgApi from "../api/organization.api";
import * as boardService from "../../boards/api/board.api";
import * as membershipApi from "../../memberships/api/membership.api";
import { getApiErrorMessage } from "../../../api/axios";

export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [orgStats, setOrgStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orgApi.getOrganizations();
      const orgs = response.data || [];
      setOrganizations(orgs);

      // Fetch board & member counts for each organization
      const stats = {};
      await Promise.all(
        orgs.map(async (org) => {
          try {
            const [boardsRes, membersRes] = await Promise.all([
              boardService.getBoards(org._id),
              membershipApi.getOrganizationMembers(org._id),
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

  const addOrganization = (newOrg) => {
    setOrganizations((prev) => [newOrg, ...prev]);
    setOrgStats((prev) => ({
      ...prev,
      [newOrg._id]: { boards: 0, members: 1 },
    }));
  };

  return {
    organizations,
    orgStats,
    loading,
    error,
    setError,
    fetchOrganizations,
    addOrganization,
  };
};

export default useOrganizations;
