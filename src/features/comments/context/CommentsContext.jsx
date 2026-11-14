import React, { createContext, useCallback, useRef, useState } from "react";
import * as commentApi from "../api/comment.api";
import { getApiErrorMessage } from "../../../api/axios";

export const CommentsContext = createContext(null);

export const CommentsProvider = ({ children }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIssueId, setActiveIssueId] = useState(null);
  const requestIdRef = useRef(0);

  const loadComments = useCallback(async (issueId) => {
    const requestId = ++requestIdRef.current;
    if (!issueId) {
      setActiveIssueId(null);
      setComments([]);
      setLoading(false);
      setError(null);
      return true;
    }

    setActiveIssueId(issueId);
    setLoading(true);
    setError(null);
    setComments([]);
    try {
      const response = await commentApi.getIssueComments(issueId);
      if (requestId !== requestIdRef.current) return false;
      setComments(response.data || []);
      return true;
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return false;
      const message = getApiErrorMessage(requestError, "Unable to load comments.");
      setError(message);
      setComments([]);
      return false;
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const addComment = async (data) => {
    try {
      const response = await commentApi.createComment(data);
      setComments((current) => [...current, response.data]);
      return response.data;
    } catch (requestError) {
      throw new Error(getApiErrorMessage(requestError, "Failed to post comment."));
    }
  };

  const updateComment = async (commentId, data) => {
    try {
      const response = await commentApi.updateComment(commentId, data);
      setComments((current) => current.map((comment) =>
        comment._id === commentId ? response.data : comment
      ));
      return response.data;
    } catch (requestError) {
      throw new Error(getApiErrorMessage(requestError, "Failed to update comment."));
    }
  };

  const removeComment = async (commentId) => {
    try {
      await commentApi.deleteComment(commentId);
      setComments((current) => current.filter((comment) => comment._id !== commentId));
    } catch (requestError) {
      throw new Error(getApiErrorMessage(requestError, "Failed to delete comment."));
    }
  };

  return (
    <CommentsContext.Provider value={{
      comments,
      activeIssueId,
      loading,
      error,
      loadComments,
      addComment,
      updateComment,
      removeComment,
      setError,
    }}>
      {children}
    </CommentsContext.Provider>
  );
};

export default CommentsContext;
