import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RefreshCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useBoard } from "../../boards/hooks/useBoard";
import { getApiErrorMessage } from "../../../api/axios";
import { useComments } from "../../comments/hooks/useComments";
import { useAIActions } from "../hooks/useAIActions";
import Badge from "../../../ui/Badge";
import Button from "../../../ui/Button";
import ConfirmModal from "../../../ui/ConfirmModal";
import EmptyState from "../../../ui/EmptyState";
import ToastContainer from "../../../ui/Toast";

const ACTION_LABELS = {
  CREATE_ISSUE: "Create Issue",
  UPDATE_ISSUE: "Update Issue",
  DELETE_ISSUE: "Delete Issue",
  MOVE_ISSUE: "Move Issue",
  CREATE_SECTION: "Create Section",
  UPDATE_SECTION: "Update Section",
  DELETE_SECTION: "Delete Section",
  CREATE_COMMENT: "Add Comment",
  UPDATE_COMMENT: "Update Comment",
  DELETE_COMMENT: "Delete Comment",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  EXECUTING: "Executing",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  FAILED: "Failed",
};

const STATUS_VARIANTS = {
  PENDING: "pending",
  EXECUTING: "default",
  COMPLETED: "active",
  REJECTED: "error",
  EXPIRED: "default",
  FAILED: "error",
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const readableText = (value, fallback = "Unknown") => {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
};

const getActionTitle = (action) => {
  const args = action?.arguments || {};
  const type = action?.actionType;

  switch (type) {
    case "CREATE_ISSUE":
      return `Create "${readableText(args.title, "issue")}"`;
    case "UPDATE_ISSUE":
      return `Update "${readableText(args.title, "issue")}"`;
    case "DELETE_ISSUE":
      return `Delete "${readableText(args.title, "this issue")}"`;
    case "MOVE_ISSUE":
      return `Move "${readableText(args.title, "this issue")}"`;
    case "CREATE_SECTION":
      return `Create section "${readableText(args.name, "new section")}"`;
    case "UPDATE_SECTION":
      return `Rename section "${readableText(args.name, "selected section")}"`;
    case "DELETE_SECTION":
      return `Delete section "${readableText(args.name, "this section")}"`;
    case "CREATE_COMMENT":
      return `Add comment to "${readableText(args.issueTitle, "this issue")}"`;
    case "UPDATE_COMMENT":
      return `Update comment on "${readableText(args.issueTitle, "this issue")}"`;
    case "DELETE_COMMENT":
      return `Delete comment on "${readableText(args.issueTitle, "this issue")}"`;
    default:
      return ACTION_LABELS[type] || "AI Action";
  }
};

const getActionDescription = (action) => {
  const args = action?.arguments || {};
  const type = action?.actionType;

  switch (type) {
    case "CREATE_ISSUE":
      return `Create a new issue titled "${readableText(args.title, "Untitled issue")}" in the selected section.`;
    case "UPDATE_ISSUE": {
      const parts = [];
      if (args.title) parts.push(`title to "${args.title}"`);
      if (args.description !== undefined) parts.push("description");
      return `Update the issue${parts.length ? ` ${parts.join(" and ")}` : ""}.`;
    }
    case "DELETE_ISSUE":
      return "Delete this issue from the current board. This is a destructive action.";
    case "MOVE_ISSUE":
      return "Move the issue to a different section in the board.";
    case "CREATE_SECTION":
      return `Create a new section named "${readableText(args.name, "new section")}".`;
    case "UPDATE_SECTION":
      return `Rename the section to "${readableText(args.name, "updated section name")}".`;
    case "DELETE_SECTION":
      return "Delete this section from the current board. This is a destructive action.";
    case "CREATE_COMMENT":
      return `Add a comment to the selected issue: "${readableText(args.content, "new comment")}".`;
    case "UPDATE_COMMENT":
      return `Update the selected comment with new content.`;
    case "DELETE_COMMENT":
      return "Delete this comment. This is a destructive action.";
    default:
      return "Review this proposed board change before approving it.";
  }
};

const isDestructiveAction = (actionType) =>
  ["DELETE_ISSUE", "DELETE_SECTION", "DELETE_COMMENT"].includes(actionType);

export const AIActionsPanel = ({ boardId }) => {
  const { sections, issuesBySection, refreshBoardData } = useBoard();
  const { comments, activeIssueId, loadComments } = useComments();
  const {
    actions,
    loading,
    error,
    processingId,
    processingType,
    refresh,
    approveAction,
    rejectAction,
  } = useAIActions(boardId);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toasts, setToasts] = useState([]);

  const flattenedIssues = useMemo(
    () => Object.values(issuesBySection || {}).flat(),
    [issuesBySection]
  );

  const pushToast = (message, type = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    const icon = type === "error" ? "⚠️" : "✅";
    setToasts((current) => [...current, { id, message, icon }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  };

  const getIssueById = (issueId) =>
    flattenedIssues.find((issue) => issue?._id === issueId);

  const getSectionById = (sectionId) =>
    sections.find((section) => section?._id === sectionId);

  const refreshAfterApproval = async (action) => {
    if (action.actionType.endsWith("_COMMENT")) {
      const args = action.arguments || {};
      const matchingComment = comments.find(
        (comment) => String(comment._id) === String(args.commentId)
      );
      const commentIssueId =
        action.actionType === "CREATE_COMMENT"
          ? args.issueId
          : matchingComment?.issueId?._id || matchingComment?.issueId;

      if (
        activeIssueId &&
        commentIssueId &&
        String(activeIssueId) === String(commentIssueId)
      ) {
        const didRefresh = await loadComments(activeIssueId);
        if (!didRefresh) {
          throw new Error("The comment changed, but its latest data could not be loaded.");
        }
      }
      return;
    }

    await refreshBoardData(boardId);
  };

  const notifyApproved = async (action) => {
    try {
      await refreshAfterApproval(action);
      pushToast("AI action approved and applied.");
    } catch (requestError) {
      pushToast(
        `Action approved, but refresh failed: ${getApiErrorMessage(
          requestError,
          "latest board data could not be loaded."
        )}`,
        "error"
      );
    }
  };

  const summarizeAction = (action) => {
    const type = action?.actionType;
    const args = action?.arguments || {};

    if (type === "CREATE_ISSUE") {
      const section = getSectionById(args.sectionId);
      return {
        title: getActionTitle(action),
        description: `Create a new issue called "${readableText(args.title, "Untitled issue")}" in ${section?.name || "the selected section"}.`,
        details: [
          section ? `Section: ${section.name}` : "Section: selected section",
          args.description ? `Description: ${args.description}` : "Description: not provided",
        ],
      };
    }

    if (type === "UPDATE_ISSUE") {
      const issue = getIssueById(args.issueId);
      return {
        title: getActionTitle(action),
        description: `Update the issue "${issue?.title || "selected issue"}" with the requested edits.`,
        details: [
          issue ? `Issue: ${issue.title}` : "Issue: selected issue",
          args.title ? `Title: ${args.title}` : "Title: unchanged",
          args.description !== undefined ? `Description: ${args.description || "cleared"}` : "Description: unchanged",
        ],
      };
    }

    if (type === "DELETE_ISSUE") {
      const issue = getIssueById(args.issueId);
      return {
        title: getActionTitle(action),
        description: `Delete the issue "${issue?.title || "selected issue"}" from this board.`,
        details: [
          issue ? `Issue: ${issue.title}` : "Issue: selected issue",
          "This action is destructive and requires approval.",
        ],
      };
    }

    if (type === "MOVE_ISSUE") {
      const issue = getIssueById(args.issueId);
      const destinationSection = getSectionById(args.destinationSectionId);
      return {
        title: getActionTitle(action),
        description: `Move "${issue?.title || "selected issue"}" to ${destinationSection?.name || "the chosen section"}.`,
        details: [
          issue ? `Issue: ${issue.title}` : "Issue: selected issue",
          destinationSection ? `Destination: ${destinationSection.name}` : "Destination: selected section",
        ],
      };
    }

    if (type === "CREATE_SECTION") {
      return {
        title: getActionTitle(action),
        description: `Create a new section called "${readableText(args.name, "new section")}".`,
        details: [`Section name: ${readableText(args.name, "new section")}`],
      };
    }

    if (type === "UPDATE_SECTION") {
      const section = getSectionById(args.sectionId);
      return {
        title: getActionTitle(action),
        description: `Rename "${section?.name || "selected section"}" to "${readableText(args.name, "updated section name")}".`,
        details: [
          section ? `Section: ${section.name}` : "Section: selected section",
          `New name: ${readableText(args.name, "updated section name")}`,
        ],
      };
    }

    if (type === "DELETE_SECTION") {
      const section = getSectionById(args.sectionId);
      return {
        title: getActionTitle(action),
        description: `Delete the section "${section?.name || "selected section"}" from this board.`,
        details: [
          section ? `Section: ${section.name}` : "Section: selected section",
          "This action is destructive and requires approval.",
        ],
      };
    }

    if (type === "CREATE_COMMENT") {
      const issue = getIssueById(args.issueId);
      return {
        title: getActionTitle(action),
        description: `Add a comment to "${issue?.title || "selected issue"}".`,
        details: [
          issue ? `Issue: ${issue.title}` : "Issue: selected issue",
          `Comment: ${readableText(args.content, "new comment")}`,
        ],
      };
    }

    if (type === "UPDATE_COMMENT") {
      return {
        title: getActionTitle(action),
        description: "Update the selected comment with new content.",
        details: [
          `Comment: ${readableText(args.content, "updated content")}`,
        ],
      };
    }

    if (type === "DELETE_COMMENT") {
      return {
        title: getActionTitle(action),
        description: "Delete the selected comment from this issue.",
        details: [
          "This action is destructive and requires approval.",
        ],
      };
    }

    return {
      title: ACTION_LABELS[type] || "AI Action",
      description: getActionDescription(action),
      details: [],
    };
  };

  const handleApprove = async (action) => {
    if (!action?._id) return;

    if (isDestructiveAction(action.actionType)) {
      setConfirmAction(action);
      return;
    }

    const didApprove = await approveAction(action._id);
    if (didApprove) {
      await notifyApproved(action);
    }
  };

  const handleConfirmApprove = async () => {
    if (!confirmAction?._id) return;

    const didApprove = await approveAction(confirmAction._id);
    if (didApprove) {
      await notifyApproved(confirmAction);
    }
    setConfirmAction(null);
  };

  const handleReject = async (action) => {
    if (!action?._id) return;

    const didReject = await rejectAction(action._id);
    if (didReject) {
      pushToast("AI action rejected.");
    }
  };

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-navy-border bg-navy-card px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="min-w-0 flex-1 basis-[200px]">
              <h3 className="text-sm font-bold text-text-main">AI Actions</h3>
              <p className="mt-1 break-words text-xs leading-relaxed text-text-secondary">
                Review changes suggested by your AI assistant before they are applied.
              </p>
            </div>
            <div
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200"
              aria-live="polite"
              aria-label={`${actions.length} pending AI actions`}
            >
              {loading ? (
                <LoaderCircle className="h-3 w-3 animate-spin" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              )}
              {actions.length} pending
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-xl border border-navy-border bg-navy-card p-4"
                >
                  <div className="mb-3 h-3 w-20 rounded bg-[#243247]" />
                  <div className="mb-2 h-4 w-40 rounded bg-[#243247]" />
                  <div className="h-3 w-full rounded bg-[#243247]" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => refresh({ showLoading: true })}
                className="mt-2 inline-flex items-center gap-1.5 font-semibold text-red-100 hover:text-white"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Retry loading actions
              </button>
            </div>
          )}

          {!loading && !error && actions.length === 0 && (
            <EmptyState
              icon={Sparkles}
              title="No pending actions"
              description="Your AI assistant has not proposed any board changes yet."
              className="h-full min-h-[220px]"
            />
          )}

          {!loading && !error && actions.length > 0 && (
            <div className="space-y-3">
              {actions.map((action) => {
                const summary = summarizeAction(action);
                const isPending = action.status === "PENDING";
                const isProcessing = processingId === action._id;
                const status = STATUS_LABELS[action.status] || action.status;
                const variant = STATUS_VARIANTS[action.status] || "default";

                return (
                  <article
                    key={action._id}
                    className="min-w-0 rounded-xl border border-navy-border bg-navy-card p-4 shadow-sm shadow-black/10 transition-colors hover:border-navy-border/80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                          {ACTION_LABELS[action.actionType] || action.actionType}
                        </p>
                        <h4 className="mt-1 break-words text-base font-semibold text-text-main">
                          {summary.title}
                        </h4>
                      </div>
                      <Badge variant={variant} size="sm">
                        {status}
                      </Badge>
                    </div>

                    <p className="mt-3 break-words text-sm text-text-secondary">
                      {summary.description}
                    </p>

                    <div className="mt-3 space-y-1.5 text-xs text-text-secondary">
                      {summary.details.map((detail) => (
                        <div key={detail} className="flex min-w-0 gap-2">
                          <span className="text-text-muted">•</span>
                          <span className="min-w-0 break-words">{detail}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-2 text-[11px] text-text-muted sm:grid-cols-2">
                      <div className="flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>Created: {formatDate(action.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Expires: {formatDate(action.expiresAt)}</span>
                      </div>
                    </div>

                    {isPending && (
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handleReject(action)}
                        >
                          {isProcessing && processingType === "reject" ? (
                            <span className="inline-flex items-center gap-1.5">
                              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              Rejecting...
                            </span>
                          ) : (
                            "Reject"
                          )}
                        </Button>
                        <Button
                          variant={isDestructiveAction(action.actionType) ? "danger" : "primary"}
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handleApprove(action)}
                        >
                          {isProcessing && processingType === "approve" ? (
                            <span className="inline-flex items-center gap-1.5">
                              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              Approving...
                            </span>
                          ) : (
                            "Approve"
                          )}
                        </Button>
                      </div>
                    )}

                    {!isPending && (
                      <div className="mt-4 flex items-center gap-1.5 text-[11px] text-text-muted">
                        {action.status === "COMPLETED" && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                        {action.status === "REJECTED" && (
                          <XCircle className="h-3.5 w-3.5 text-red-400" />
                        )}
                        {action.status === "FAILED" && (
                          <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                        )}
                        {action.status === "EXECUTING" && (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin text-primary" />
                        )}
                        {action.status === "EXPIRED" && (
                          <Clock3 className="h-3.5 w-3.5 text-amber-400" />
                        )}
                        <span>
                          {action.status === "COMPLETED" && "Action was completed."}
                          {action.status === "REJECTED" && "Action was rejected."}
                          {action.status === "FAILED" && "Action failed during execution."}
                          {action.status === "EXECUTING" && "Action is currently processing."}
                          {action.status === "EXPIRED" && "Action expired before approval."}
                        </span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmApprove}
        title="Confirm deletion"
        message={
          confirmAction
            ? `Are you sure you want to approve the deletion of ${
                confirmAction.arguments?.issueTitle ||
                confirmAction.arguments?.title ||
                confirmAction.arguments?.name ||
                "this item"
              }? This action may not be reversible.`
            : "Are you sure you want to approve this destructive action?"
        }
        confirmText="Confirm and Approve"
        cancelText="Cancel"
        variant="danger"
        loading={processingId === confirmAction?._id}
      />

      <ToastContainer toasts={toasts} onDismiss={(toastId) => setToasts((current) => current.filter((toast) => toast.id !== toastId))} />
    </>
  );
};

export default AIActionsPanel;
