import React, { createContext, useCallback, useState } from "react";
import * as commentApi from "../api/comment.api";
import { getApiErrorMessage } from "../../../api/axios";

export const CommentsContext = createContext(null);

export const CommentsProvider = ({ children }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadComments = useCallback(async (issueId) => {
    if (!issueId) return;
    setLoading(true);
    setError(null);
    setComments([]);
    try {
      const response = await commentApi.getIssueComments(issueId);
      setComments(response.data || []);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Unable to load comments.");
      setError(message);
      setComments([]);
    } finally {
      setLoading(false);
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
