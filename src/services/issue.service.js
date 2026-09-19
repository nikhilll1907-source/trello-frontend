import api from "./api";

export const createIssue = async (data) => {
  const response = await api.post("/issues", data);
  return response.data;
};

export const getSectionIssues = async (sectionId) => {
  const response = await api.get(`/issues/section/${sectionId}`);
  return response.data;
};

export const getIssue = async (issueId) => {
  const response = await api.get(`/issues/${issueId}`);
  return response.data;
};

export const updateIssue = async (issueId, data) => {
  const response = await api.patch(`/issues/${issueId}`, data);
  return response.data;
};

export const deleteIssue = async (issueId) => {
  const response = await api.delete(`/issues/${issueId}`);
  return response.data;
};
