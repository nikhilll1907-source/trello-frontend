import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "../../../api/axios";
import { sendBoardChatMessage } from "../api/ai.api";

const getResponseText = (content) => {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("")
      .trim();
  }

  return "";
};

export const useBoardAssistant = (boardId) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);
  const sendingRef = useRef(false);
  const activeBoardIdRef = useRef(boardId);

  useLayoutEffect(() => {
    activeBoardIdRef.current = boardId;
    requestIdRef.current += 1;
    sendingRef.current = false;

    return () => {
      requestIdRef.current += 1;
    };
  }, [boardId]);

  const sendMessage = useCallback(
    async (value = input) => {
      const message = value.trim();
      if (!message || !boardId || sendingRef.current) {
        return;
      }

      const requestId = ++requestIdRef.current;
      const requestBoardId = boardId;
      sendingRef.current = true;
      setMessages((current) => [
        ...current,
        { id: `${requestId}-user`, role: "user", content: message },
      ]);
      setInput("");
      setError("");
      setLoading(true);

      try {
        const response = await sendBoardChatMessage(requestBoardId, message);
        if (
          requestIdRef.current !== requestId ||
          activeBoardIdRef.current !== requestBoardId
        ) {
          return;
        }

        const reply = getResponseText(response?.data?.message);
        if (!reply) {
          throw new Error("The assistant returned an empty response.");
        }

        setMessages((current) => [
          ...current,
          { id: `${requestId}-assistant`, role: "assistant", content: reply },
        ]);
      } catch (requestError) {
        if (
          requestIdRef.current === requestId &&
          activeBoardIdRef.current === requestBoardId
        ) {
          setError(
            getApiErrorMessage(
              requestError,
              "Could not reach the AI assistant. Please try again."
            )
          );
        }
      } finally {
        if (
          requestIdRef.current === requestId &&
          activeBoardIdRef.current === requestBoardId
        ) {
          sendingRef.current = false;
          setLoading(false);
        }
      }
    },
    [boardId, input]
  );

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    sendMessage,
  };
};
