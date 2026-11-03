import api from "../../../api/axios";

export const createOrganization = async (data) => {
  const response = await api.post("/organizations", data);
  return response.data;
};

export const getOrganizations = async () => {
  const response = await api.get("/organizations");
  return response.data;
};

export const getOrganizationById = async (organizationId) => {
  const response = await api.get(`/organizations/${organizationId}`);
  return response.data;
};

export const updateOrganization = async (organizationId, data) => {
  const response = await api.put(`/organizations/${organizationId}`, data);
  return response.data;
};

export const deleteOrganization = async (organizationId) => {
  const response = await api.delete(`/organizations/${organizationId}`);
  return response.data;
};
