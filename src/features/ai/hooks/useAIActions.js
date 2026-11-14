import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../api/axios";
import {
  approveAIAction,
  getPendingAIActions,
  rejectAIAction,
} from "../api/aiAction.api";

export const useAIActions = (boardId) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [processingType, setProcessingType] = useState(null);

  const refresh = useCallback(
    async ({ showLoading = true } = {}) => {
      if (!boardId) {
        setActions([]);
        setError("");
        return [];
      }

      setLoading(showLoading);
      setError("");

      try {
        const response = await getPendingAIActions(boardId);
        const nextActions = Array.isArray(response?.data) ? response.data : [];
        setActions(nextActions);
        return nextActions;
      } catch (requestError) {
        const message = getApiErrorMessage(
          requestError,
          "Could not load AI actions. Please try again."
        );
        setError(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [boardId]
  );

  useEffect(() => {
    if (!boardId) {
      setActions([]);
      setError("");
      setLoading(false);
      return;
    }

    refresh({ showLoading: true });
  }, [boardId, refresh]);

  const approveAction = useCallback(
    async (actionId) => {
      if (!boardId || !actionId || processingId) {
        return false;
      }

      setProcessingId(actionId);
      setProcessingType("approve");
      setError("");

      try {
        const response = await approveAIAction(boardId, actionId);
        const approvedAction = response?.data?.action;
        if (response?.success === false) {
          if (approvedAction) {
            setActions((current) =>
              current.map((action) =>
                action._id === actionId ? approvedAction : action
              )
            );
          }
          await refresh({ showLoading: false });
          throw new Error(response.message || "Could not execute this AI action.");
        }

        setActions((current) =>
          current.filter((action) => action._id !== actionId)
        );
        await refresh({ showLoading: false });
        return true;
      } catch (requestError) {
        const message = getApiErrorMessage(
          requestError,
          "Could not approve this AI action. Please try again."
        );
        setError(message);
        return false;
      } finally {
        setProcessingId(null);
        setProcessingType(null);
      }
    },
    [boardId, processingId, refresh]
  );

  const rejectAction = useCallback(
    async (actionId) => {
      if (!boardId || !actionId || processingId) {
        return false;
      }

      setProcessingId(actionId);
      setProcessingType("reject");
      setError("");

      try {
        await rejectAIAction(boardId, actionId);
        setActions((current) =>
          current.filter((action) => action._id !== actionId)
        );
        await refresh({ showLoading: false });
        return true;
      } catch (requestError) {
        const message = getApiErrorMessage(
          requestError,
          "Could not reject this AI action. Please try again."
        );
        setError(message);
        return false;
      } finally {
        setProcessingId(null);
        setProcessingType(null);
      }
    },
    [boardId, processingId, refresh]
  );

  return {
    actions,
    loading,
    error,
    processingId,
    processingType,
    refresh,
    approveAction,
    rejectAction,
  };
};
