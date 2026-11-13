import api from "../../../api/axios";

export const getPendingAIActions = async (boardId, config = {}) => {
  const response = await api.get(
    `/ai/boards/${encodeURIComponent(boardId)}/actions/pending`,
    config
  );

  return response.data;
};

export const approveAIAction = async (boardId, actionId, config = {}) => {
  const response = await api.post(
    `/ai/boards/${encodeURIComponent(boardId)}/actions/${encodeURIComponent(actionId)}/approve`,
    {},
    config
  );

  return response.data;
};

export const rejectAIAction = async (boardId, actionId, config = {}) => {
  const response = await api.post(
    `/ai/boards/${encodeURIComponent(boardId)}/actions/${encodeURIComponent(actionId)}/reject`,
    {},
    config
  );

  return response.data;
};
