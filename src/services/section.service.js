import api from "./api";

export const createSection = async (data) => {
  const response = await api.post("/sections", data);
  return response.data;
};

export const getBoardSections = async (boardId) => {
  const response = await api.get(`/sections/board/${boardId}`);
  return response.data;
};

export const getSection = async (sectionId) => {
  const response = await api.get(`/sections/${sectionId}`);
  return response.data;
};

export const updateSection = async (sectionId, data) => {
  const response = await api.patch(`/sections/${sectionId}`, data);
  return response.data;
};

export const deleteSection = async (sectionId) => {
  const response = await api.delete(`/sections/${sectionId}`);
  return response.data;
};
