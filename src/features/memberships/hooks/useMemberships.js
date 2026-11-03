import { useCallback, useState } from "react";
import * as membershipApi from "../api/membership.api";
import { getApiErrorMessage } from "../../../api/axios";

export const useMemberships = (organizationId) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMembers = useCallback(async () => {
    if (!organizationId) return [];
    setLoading(true);
    setError(null);
    try {
      const response = await membershipApi.getOrganizationMembers(organizationId);
      const data = response.data || [];
      setMembers(data);
      return data;
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Failed to load members.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  return { members, setMembers, loading, error, setError, loadMembers };
};

export default useMemberships;
