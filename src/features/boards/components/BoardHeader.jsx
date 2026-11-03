import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Plus, MoreHorizontal } from "lucide-react";
import Button from "../../../ui/Button";
import { useBoard } from "../hooks/useBoard";

export const BoardHeader = ({
  organizationName,
  organizationId,
  isAdmin = false,
  onOpenAddSection,
  onOpenBoardMenu,
}) => {
  const { board, activeUsers, wsStatus, setShowActiveUsersModal } = useBoard();

  const uniqueCount = React.useMemo(() => {
    return new Set((activeUsers || []).map((u) => u.id || u._id)).size;
  }, [activeUsers]);

  return (
    <div className="bg-navy-bg border-b border-navy-border px-4 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Breadcrumb & Title */}
        <div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium mb-2">
            <Link
              to="/dashboard"
              className="hover:text-text-main transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              to={`/organizations/${organizationId}`}
              className="hover:text-text-main transition-colors"
            >
              {organizationName || "Organization"}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-main">{board?.title || "Board"}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
              {board?.title || "Loading board..."}
            </h1>
            {board?.description && (
              <span className="hidden md:inline-block text-xs text-text-secondary border-l border-surface-border pl-3 max-w-md truncate">
                {board.description}
              </span>
            )}
          </div>
        </div>

        {/* Right: Active Users, Add Section, Board Menu */}
        <div className="flex items-center gap-3">
          {/* Active Users Button */}
          <button
            onClick={() => setShowActiveUsersModal(true)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
              wsStatus === "connected"
                 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15"
                : wsStatus === "connecting"
                 ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/15"
                 : "bg-navy-card border-navy-border text-text-secondary hover:bg-navy-elevated"
            }`}
            title="View active users on this board"
          >
            <span className="flex -space-x-1.5">
              {(activeUsers || []).slice(0, 3).map((activeUser) => (
                <span key={activeUser.id} className="flex h-5 w-5 items-center justify-center rounded-full border border-navy-bg bg-primary/20 text-[9px] font-bold text-primary" title={activeUser.name}>
                  {activeUser.name?.slice(0, 1).toUpperCase()}
                </span>
              ))}
            </span>
            {wsStatus === "connected" ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{uniqueCount} active</span>
              </>
            ) : wsStatus === "connecting" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>{uniqueCount > 0 ? `${uniqueCount} active` : "Offline"}</span>
              </>
            )}
          </button>

          {/* Add Section Button (Admin only) */}
          {isAdmin && (
            <Button
              size="sm"
              variant="primary"
              onClick={onOpenAddSection}
              icon={Plus}
            >
              Add Section
            </Button>
          )}

          {/* Board Menu Button (Admin only) */}
          {isAdmin && (
            <button
              onClick={onOpenBoardMenu}
               className="p-1.5 text-text-secondary hover:text-text-main hover:bg-navy-elevated rounded-md transition-colors cursor-pointer"
              title="Board settings"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardHeader;
