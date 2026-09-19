import api from "./api";

export const inviteMember = async (data) => {
  const response = await api.post("/memberships/invite", data);
  return response.data;
};

export const getOrganizationMembers = async (organizationId, status) => {
  const query = status ? `?status=${status}` : "";
  const response = await api.get(`/memberships/organizations/${organizationId}/members${query}`);
  return response.data;
};

export const updateMembership = async (membershipId, data) => {
  const response = await api.put(`/memberships/${membershipId}`, data);
  return response.data;
};

export const acceptInvitation = async (membershipId) => {
  const response = await api.put(`/memberships/${membershipId}/accept`);
  return response.data;
};

export const deleteMembership = async (membershipId) => {
  const response = await api.delete(`/memberships/${membershipId}`);
  return response.data;
};
