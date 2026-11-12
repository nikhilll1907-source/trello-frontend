import api from "../../../api/axios";

export const sendBoardChatMessage = async (boardId, message, config = {}) => {
  const response = await api.post(
    `/ai/boards/${encodeURIComponent(boardId)}/chat`,
    { message },
    config
  );
  return response.data;
};

export const getBoardConversation = async (boardId, config = {}) => {
  const response = await api.get(
    `/ai/boards/${encodeURIComponent(boardId)}/conversation`,
    config
  );
  return response.data;
};
