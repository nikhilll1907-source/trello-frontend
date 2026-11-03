import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Layout, MoreHorizontal } from "lucide-react";
import EmptyState from "../../../ui/EmptyState";

export const BoardList = ({ boards = [], isAdmin, onCreate, onEdit }) => {
  if (boards.length === 0) {
    return (
      <EmptyState
        icon={Layout}
        title="No boards yet"
        description="Boards help you organize issues, manage workflows, and collaborate with your organization."
        actionLabel={isAdmin ? "Create board" : undefined}
        onAction={isAdmin ? onCreate : undefined}
        className="my-8"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <Link
          key={board._id}
          to={`/boards/${board._id}`}
          className="group relative flex flex-col justify-between rounded-lg border border-navy-border bg-navy-card p-5 transition hover:border-primary/40 hover:bg-navy-hover"
        >
          {isAdmin && (
            <button
              type="button"
              aria-label={`Manage ${board.title}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onEdit(board);
              }}
              className="absolute right-3 top-3 rounded-md p-1.5 text-text-muted opacity-0 transition group-hover:opacity-100 hover:bg-navy-elevated hover:text-text-main"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          )}
          <div>
            <h3 className="text-base font-bold text-text-main transition-colors group-hover:text-primary">
              {board.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-6 text-text-secondary">
              {board.description || "No description provided."}
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-navy-border pt-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {board.createdAt ? new Date(board.createdAt).toLocaleDateString() : "—"}
            </span>
            <span className="font-semibold text-primary">Open board →</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default BoardList;
