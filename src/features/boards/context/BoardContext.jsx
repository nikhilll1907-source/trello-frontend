import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import * as boardService from "../api/board.api";
import * as sectionService from "../api/section.api";
import * as issueService from "../api/issue.api";
import * as membershipService from "../../memberships/api/membership.api";
import { createBoardWebSocket } from "../api/websocket";
import { getApiErrorMessage } from "../../../api/axios";
import { useAuth } from "../../auth/hooks/useAuth";
import { sameIdentity } from "../../../config/identity";

export const BoardContext = createContext(null);

export const BoardProvider = ({ children }) => {
  const { accessToken, user } = useAuth();
  const [board, setBoard] = useState(null);
  const [sections, setSections] = useState([]);
  const [issuesBySection, setIssuesBySection] = useState({});
  const [activeUsers, setActiveUsers] = useState([]);
  const [membersMap, setMembersMap] = useState({});
  const [boardLoading, setBoardLoading] = useState(false);
  const [, setLoading] = useState(false);
  const [wsStatus, setWsStatus] = useState("idle"); // "idle" | "connecting" | "connected" | "disconnected" | "error"
  const [error, setError] = useState(null);
  const [showActiveUsersModal, setShowActiveUsersModal] = useState(false);

  const wsRef = useRef(null);
  const requestIdRef = useRef(0);
  const [toasts, setToasts] = useState([]);
  const recentJoinToastsRef = useRef({});
  const recentLeaveToastsRef = useRef({});

  const removeToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  const deduplicateUsers = useCallback((users) => {
    const seen = new Set();
    const unique = [];
    (users || []).forEach((u) => {
      const id = u?.id || u?._id;
      if (id && !seen.has(id)) {
        seen.add(id);
        unique.push({ id, name: u.name || "Member" });
      }
    });
    return unique;
  }, []);

  // Clean up WebSocket on unmount or navigation away
  const cleanupWebSocket = useCallback(() => {
    requestIdRef.current++;
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    setActiveUsers([]);
    setWsStatus("idle");
  }, []);

  // Background non-blocking WebSocket connection
  const connectWebSocket = useCallback(
    (boardId, reqId) => {
      if (!accessToken) return;
      if (reqId && reqId !== requestIdRef.current) return;

      try {
        setWsStatus("connecting");
        const ws = createBoardWebSocket();
        wsRef.current = ws;

        const currentUserId = user?.id || user?._id;

        ws.connect({
          token: accessToken,
          boardId: boardId,
          callbacks: {
            onAuthSuccess: () => {
              // Authenticated, will receive ACTIVE_USERS next
            },
            onAuthError: (err) => {
              console.warn("WebSocket auth error:", err);
              setWsStatus("error");
            },
            onActiveUsers: (users) => {
              setWsStatus("connected");
              setActiveUsers(deduplicateUsers(users));
            },
            onUserJoined: (joinedUser) => {
              const joinedId = joinedUser?.id || joinedUser?._id;
              if (!joinedId) return;

              // Update active users list with unique entry
              setActiveUsers((prev) => {
                if (prev.some((u) => (u.id || u._id) === joinedId)) return prev;
                return [
                  ...prev,
                  { id: joinedId, name: joinedUser.name || "Member" },
                ];
              });

              // Do not show join notification for current user
               if (sameIdentity(joinedId, currentUserId)) return;

              // Prevent duplicate toast if already shown recently
              const now = Date.now();
              if (
                recentJoinToastsRef.current[joinedId] &&
                now - recentJoinToastsRef.current[joinedId] < 3000
              ) {
                return;
              }
              recentJoinToastsRef.current[joinedId] = now;

              const toastId = `${Date.now()}-${Math.random()}`;
              const displayName = joinedUser.name || "A user";
              setToasts((prev) => [
                ...prev,
                {
                  id: toastId,
                  type: "USER_JOINED",
                  message: `${displayName} joined the board`,
                  icon: "🟢",
                },
              ]);

              setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== toastId));
              }, 3500);
            },
            onUserLeft: (leftUser) => {
              const leftId = leftUser?.id || leftUser?._id;
              if (!leftId) return;

              // Remove user from active users list
              setActiveUsers((prev) =>
                prev.filter((u) => (u.id || u._id) !== leftId)
              );

              // Do not show leave notification for current user
               if (sameIdentity(leftId, currentUserId)) return;

              // Prevent duplicate toast if already shown recently
              const now = Date.now();
              if (
                recentLeaveToastsRef.current[leftId] &&
                now - recentLeaveToastsRef.current[leftId] < 3000
              ) {
                return;
              }
              recentLeaveToastsRef.current[leftId] = now;

              const toastId = `${Date.now()}-${Math.random()}`;
              const displayName = leftUser.name || "A user";
              setToasts((prev) => [
                ...prev,
                {
                  id: toastId,
                  type: "USER_LEFT",
                  message: `${displayName} left the board`,
                  icon: "⚪",
                },
              ]);

              setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== toastId));
              }, 3500);
            },
            onError: (err) => {
              console.warn("WebSocket error:", err);
              setWsStatus("error");
            },
            onClose: () => {
              setWsStatus("disconnected");
            },
          },
        });
      } catch (err) {
        console.warn("Failed to connect WebSocket:", err);
        setWsStatus("error");
      }
    },
    [accessToken, user, deduplicateUsers]
  );

  const loadBoard = useCallback(
    async (boardId) => {
      const currentRequestId = ++requestIdRef.current;
      setBoardLoading(true);
      setLoading(true);
      setError(null);

      // Close previous socket without incrementing requestIdRef
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
      setActiveUsers([]);
      setWsStatus("idle");

      try {
        // 1. Fetch Board
        const boardRes = await boardService.getBoardById(boardId);
        if (currentRequestId !== requestIdRef.current) return;
        const currentBoard = boardRes.data;
        setBoard(currentBoard);

        // 2. Fetch Board Sections
        const sectionsRes = await sectionService.getBoardSections(boardId);
        if (currentRequestId !== requestIdRef.current) return;
        const fetchedSections = sectionsRes.data || [];
        setSections(fetchedSections);

        // 3. Fetch issues for all sections in parallel
        const issuesMap = {};
        await Promise.all(
          fetchedSections.map(async (sec) => {
            try {
              const issuesRes = await issueService.getSectionIssues(sec._id);
              issuesMap[sec._id] = issuesRes.data || [];
            } catch {
              issuesMap[sec._id] = [];
            }
          })
        );
        if (currentRequestId !== requestIdRef.current) return;
        setIssuesBySection(issuesMap);

        // Board REST data is fully loaded - render immediately!
        setBoardLoading(false);
        setLoading(false);

        // 4. Fetch organization members (non-blocking)
        try {
          const membersRes = await membershipService.getOrganizationMembers(
            currentBoard.organizationId
          );
          const members = membersRes.data || [];
          const mapping = {};
          members.forEach((m) => {
            if (m.userId && m.userId._id) {
              mapping[m.userId._id] = m.userId;
            }
          });
          if (user) {
            mapping[user.id || user._id] = user;
          }
          if (currentRequestId === requestIdRef.current) {
            setMembersMap(mapping);
          }
        } catch {
          // Non-critical, continue
        }

        // 5. Connect WebSocket in background (secondary feature, non-blocking)
        connectWebSocket(currentBoard._id, currentRequestId);
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          const msg = getApiErrorMessage(err, "Failed to load board.");
          setError(msg);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setBoardLoading(false);
          setLoading(false);
        }
      }
    },
    [user, connectWebSocket]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupWebSocket();
    };
  }, [cleanupWebSocket]);

  // Section actions
  const addSection = async (name) => {
    if (!board) return;
    try {
      const res = await sectionService.createSection({
        boardId: board._id,
        name: name.trim(),
      });
      const newSection = res.data;
      setSections((prev) => [...prev, newSection]);
      setIssuesBySection((prev) => ({ ...prev, [newSection._id]: [] }));
      return newSection;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Failed to create section."));
    }
  };

  const editSection = async (sectionId, name) => {
    try {
      const res = await sectionService.updateSection(sectionId, { name: name.trim() });
      const updatedSection = res.data;
      setSections((prev) =>
        prev.map((s) => (s._id === sectionId ? updatedSection : s))
      );
      return updatedSection;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Failed to update section."));
    }
  };

  const removeSection = async (sectionId) => {
    try {
      await sectionService.deleteSection(sectionId);
      setSections((prev) => prev.filter((s) => s._id !== sectionId));
      setIssuesBySection((prev) => {
        const copy = { ...prev };
        delete copy[sectionId];
        return copy;
      });
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Failed to delete section."));
    }
  };

  // Issue actions
  const addIssue = async ({ title, description, sectionId }) => {
    if (!board) return;
    try {
      const res = await issueService.createIssue({
        title: title.trim(),
        description: description?.trim() || "",
        boardId: board._id,
        sectionId,
      });
      const newIssue = res.data;
      setIssuesBySection((prev) => ({
        ...prev,
        [sectionId]: [...(prev[sectionId] || []), newIssue],
      }));
      return newIssue;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Failed to create issue."));
    }
  };

  const editIssue = async (issueId, { title, description, sectionId: newSectionId }) => {
    try {
      const res = await issueService.updateIssue(issueId, {
        title,
        description,
        sectionId: newSectionId,
      });
      const updatedIssue = res.data;

      setIssuesBySection((prev) => {
        const copy = { ...prev };
        // Find and update or move between sections
        let oldSectionId = null;
        Object.keys(copy).forEach((secId) => {
          if (copy[secId]?.some((i) => i._id === issueId)) {
            oldSectionId = secId;
          }
        });

        if (oldSectionId && newSectionId && oldSectionId !== newSectionId) {
          // Moved section
          copy[oldSectionId] = copy[oldSectionId].filter((i) => i._id !== issueId);
          copy[newSectionId] = [...(copy[newSectionId] || []), updatedIssue];
        } else if (oldSectionId) {
          // Same section update
          copy[oldSectionId] = copy[oldSectionId].map((i) =>
            i._id === issueId ? updatedIssue : i
          );
        }

        return copy;
      });

      return updatedIssue;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Failed to update issue."));
    }
  };

  const removeIssue = async (issueId, sectionId) => {
    try {
      await issueService.deleteIssue(issueId);
      setIssuesBySection((prev) => ({
        ...prev,
        [sectionId]: (prev[sectionId] || []).filter((i) => i._id !== issueId),
      }));
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Failed to delete issue."));
    }
  };

  const editBoard = async (data) => {
    if (!board) return;
    try {
      const res = await boardService.updateBoard(board._id, data);
      setBoard(res.data);
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Failed to update board."));
    }
  };

  const value = {
    board,
    sections,
    issuesBySection,
    activeUsers,
    membersMap,
    boardLoading,
    loading: boardLoading,
    wsStatus,
    error,
    showActiveUsersModal,
    setShowActiveUsersModal,
    toasts,
    removeToast,
    cleanupWebSocket,
    loadBoard,
    addSection,
    editSection,
    removeSection,
    addIssue,
    editIssue,
    removeIssue,
    editBoard,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};

export default BoardContext;
