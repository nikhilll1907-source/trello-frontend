import React from "react";
import { MessageSquare, User } from "lucide-react";
import { useBoard } from "../../hooks/useBoard";

export const IssueCard = ({ issue, commentCount = 0, onClick }) => {
  const { membersMap } = useBoard();
  const creator = membersMap[issue.createdBy];
  const creatorName = creator?.name || "Team Member";

  return (
    <div
      onClick={() => onClick(issue)}
      className="group bg-white rounded-lg p-3.5 border border-surface-border shadow-2xs hover:shadow-sm hover:border-primary/50 transition-all cursor-pointer select-none"
    >
      <h4 className="text-sm font-medium text-text-main group-hover:text-primary transition-colors leading-snug">
        {issue.title}
      </h4>

      {issue.description && (
        <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
          {issue.description}
        </p>
      )}

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-text-secondary">
        <div className="flex items-center gap-1.5" title={`Created by ${creatorName}`}>
          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-text-secondary border border-surface-border">
            {creatorName ? creatorName.slice(0, 2).toUpperCase() : <User className="w-3 h-3" />}
          </div>
          <span className="truncate max-w-[110px]">{creatorName}</span>
        </div>

        {commentCount > 0 && (
          <div
            className="flex items-center gap-1 text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded text-[11px]"
            title={`${commentCount} comments`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>{commentCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;
