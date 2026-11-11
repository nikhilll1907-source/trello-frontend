import api from "../../../api/axios";

export const sendBoardChatMessage = async (boardId, message) => {
  const response = await api.post(
    `/ai/boards/${encodeURIComponent(boardId)}/chat`,
    { message }
  );
  return response.data;
};
