import api from "./api";

export const createComment = async (data) => {
  // Ensure userId is not sent in the body (backend rejects if userId is present in body)
  const { content, issueId } = data;
  const response = await api.post("/comments", { content, issueId });
  return response.data;
};

export const getIssueComments = async (issueId) => {
  const response = await api.get(`/comments/issue/${issueId}`);
  return response.data;
};

export const getComment = async (commentId) => {
  const response = await api.get(`/comments/${commentId}`);
  return response.data;
};

export const updateComment = async (commentId, data) => {
  const response = await api.patch(`/comments/${commentId}`, { content: data.content });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};
