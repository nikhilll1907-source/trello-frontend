import React from "react";
import Modal from "../../../ui/Modal";
import { useBoard } from "../hooks/useBoard";
import { Users } from "lucide-react";

export const ActiveUsersModal = () => {
  const {
    activeUsers,
    wsStatus,
    showActiveUsersModal,
    setShowActiveUsersModal,
  } = useBoard();

  // Ensure unique users list
  const uniqueActiveUsers = React.useMemo(() => {
    const map = new Map();
    (activeUsers || []).forEach((u) => {
      const id = u.id || u._id;
      if (id && !map.has(id)) {
        map.set(id, { id, name: u.name });
      }
    });
    return Array.from(map.values());
  }, [activeUsers]);

  return (
    <Modal
      isOpen={showActiveUsersModal}
      onClose={() => setShowActiveUsersModal(false)}
      title="Active now"
      maxWidth="max-w-sm"
    >
      <div className="space-y-3">
        {wsStatus === "connecting" ? (
          <div className="text-center py-6 text-text-secondary text-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse mx-auto mb-2.5" />
            Connecting to live presence...
          </div>
        ) : wsStatus === "error" || wsStatus === "disconnected" ? (
          <div className="text-center py-6 text-text-secondary text-sm">
            <Users className="w-8 h-8 mx-auto text-text-secondary mb-2" />
            Live presence disconnected.
          </div>
        ) : uniqueActiveUsers.length === 0 ? (
          <div className="text-center py-6 text-text-secondary text-sm">
            <Users className="w-8 h-8 mx-auto text-text-secondary mb-2" />
            No active users online right now.
          </div>
        ) : (
             <ul className="divide-y divide-navy-border border border-navy-border rounded-lg bg-navy-card overflow-hidden">
            {uniqueActiveUsers.map((u) => {
              const initials = u.name ? u.name.slice(0, 2).toUpperCase() : "U";
              return (
                 <li key={u.id} className="flex items-center justify-between px-4 py-3 hover:bg-navy-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold">
                      {initials}
                    </div>
                    <span className="text-sm font-medium text-text-main">
                      {u.name || "Anonymous Member"}
                    </span>
                  </div>
                   <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    <span>online</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default ActiveUsersModal;
