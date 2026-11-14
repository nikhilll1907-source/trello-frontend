import { useCallback, useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "../../../api/axios";
import {
  getBoardConversation,
  sendBoardChatMessage,
} from "../api/ai.api";

const getResponseText = (content) => {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("");
  }

  return "";
};

const normalizeHistory = (messages) =>
  (Array.isArray(messages) ? messages : []).flatMap((message, index) => {
    if (
      (message?.role !== "user" && message?.role !== "assistant") ||
      typeof message?.content !== "string" &&
        !Array.isArray(message?.content)
    ) {
      return [];
    }

    const content = getResponseText(message.content);
    if (!content.trim()) {
      return [];
    }

    return [
      {
        id: `history-${index}-${message.role}`,
        role: message.role,
        content,
      },
    ];
  });

export const useBoardAssistant = (boardId, onProposalCreated) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [error, setError] = useState("");
  const [failedMessage, setFailedMessage] = useState(null);
  const historyRequestRef = useRef(null);
  const historyRequestIdRef = useRef(0);
  const chatRequestIdRef = useRef(0);
  const sendingRef = useRef(false);
  const chatAbortRef = useRef(null);

  useEffect(() => {
    return () => {
      historyRequestIdRef.current += 1;
      chatRequestIdRef.current += 1;
      historyRequestRef.current?.controller.abort();
      chatAbortRef.current?.abort();
    };
  }, []);

  const loadHistory = useCallback(async () => {
    if (!boardId || historyLoaded || historyRequestRef.current) {
      return;
    }

    const requestId = ++historyRequestIdRef.current;
    const controller = new AbortController();
    historyRequestRef.current = { controller, requestId };
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await getBoardConversation(boardId, {
        signal: controller.signal,
      });
      if (
        controller.signal.aborted ||
        historyRequestIdRef.current !== requestId
      ) {
        return;
      }

      setMessages(normalizeHistory(response?.messages));
      setHistoryLoaded(true);
    } catch (requestError) {
      if (
        !controller.signal.aborted &&
        historyRequestIdRef.current === requestId
      ) {
        setHistoryError(
          getApiErrorMessage(
            requestError,
            "Could not load this board's conversation. Please try again."
          )
        );
      }
    } finally {
      if (historyRequestIdRef.current === requestId) {
        historyRequestRef.current = null;
        setHistoryLoading(false);
      }
    }
  }, [boardId, historyLoaded]);

  const sendMessage = useCallback(
    async (value = input, { retry = false } = {}) => {
      const message = value.trim();
      if (
        !message ||
        !boardId ||
        sendingRef.current ||
        historyLoading ||
        !historyLoaded ||
        historyError ||
        (failedMessage && !retry)
      ) {
        return;
      }

      const requestId = ++chatRequestIdRef.current;
      const controller = new AbortController();
      const requestBoardId = boardId;
      const messageId = retry ? failedMessage.id : `user-${requestId}`;
      sendingRef.current = true;
      chatAbortRef.current = controller;

      if (!retry) {
        setMessages((current) => [
          ...current,
          { id: messageId, role: "user", content: message },
        ]);
        setInput("");
      }

      setError("");
      setLoading(true);

      try {
        const response = await sendBoardChatMessage(
          requestBoardId,
          message,
          { signal: controller.signal }
        );
        if (
          controller.signal.aborted ||
          chatRequestIdRef.current !== requestId
        ) {
          return;
        }

        if (response?.data?.proposalCreated === true) {
          onProposalCreated?.();
        }

        const reply = getResponseText(response?.data?.message);
        if (!reply.trim()) {
          throw new Error("The assistant returned an empty response.");
        }

        setMessages((current) => [
          ...current,
          { id: `assistant-${requestId}`, role: "assistant", content: reply },
        ]);
        setFailedMessage(null);
      } catch (requestError) {
        if (
          !controller.signal.aborted &&
          chatRequestIdRef.current === requestId
        ) {
          setFailedMessage({ id: messageId, content: message });
          setError(
            getApiErrorMessage(
              requestError,
              "Could not reach the AI assistant. Please try again."
            )
          );
        }
      } finally {
        if (chatRequestIdRef.current === requestId) {
          sendingRef.current = false;
          chatAbortRef.current = null;
          setLoading(false);
        }
      }
    },
    [
      boardId,
      failedMessage,
      historyError,
      historyLoaded,
      historyLoading,
      input,
      onProposalCreated,
    ]
  );

  const retryHistory = useCallback(() => {
    return loadHistory();
  }, [loadHistory]);

  const retryMessage = useCallback(() => {
    if (failedMessage) {
      return sendMessage(failedMessage.content, { retry: true });
    }
  }, [failedMessage, sendMessage]);

  return {
    messages,
    input,
    setInput,
    loading,
    historyLoading,
    historyLoaded,
    historyError,
    error,
    failedMessage,
    loadHistory,
    sendMessage,
    retryHistory,
    retryMessage,
  };
};
