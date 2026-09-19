import api from "./api";

export const createBoard = async (data) => {
  const response = await api.post("/boards", data);
  return response.data;
};

export const getBoards = async (organizationId) => {
  const response = await api.get(`/boards/organization/${organizationId}`);
  return response.data;
};

export const getBoardById = async (boardId) => {
  const response = await api.get(`/boards/${boardId}`);
  return response.data;
};

export const updateBoard = async (boardId, data) => {
  const response = await api.put(`/boards/${boardId}`, data);
  return response.data;
};

export const deleteBoard = async (boardId) => {
  const response = await api.delete(`/boards/${boardId}`);
  return response.data;
};
