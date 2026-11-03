import React from "react";
import { MessageSquare, User, Circle } from "lucide-react";
import { useBoard } from "../hooks/useBoard";

export const IssueCard = ({ issue, commentCount = 0, onClick }) => {
  const { membersMap } = useBoard();
  const creator = membersMap[issue.createdBy];
  const creatorName = creator?.name || "Team Member";

  return (
    <div
      onClick={() => onClick(issue)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick(issue);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open issue ${issue.title}`}
      className="group bg-navy-elevated rounded-md p-3.5 border border-navy-border hover:border-primary/50 hover:bg-navy-hover transition-all cursor-pointer select-none"
    >
       <div className="mb-2 flex items-start gap-2"><Circle className="mt-1 h-2.5 w-2.5 shrink-0 fill-primary text-primary" /><h4 className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors leading-snug">
         {issue.title}
       </h4></div>

      {issue.description && (
         <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed pl-4">
          {issue.description}
        </p>
      )}

       <div className="mt-3 pt-2.5 border-t border-navy-border flex items-center justify-between text-xs text-text-secondary">
        <div className="flex items-center gap-1.5" title={`Created by ${creatorName}`}>
           <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary border border-primary/20">
            {creatorName ? creatorName.slice(0, 2).toUpperCase() : <User className="w-3 h-3" />}
          </div>
          <span className="truncate max-w-[110px]">{creatorName}</span>
        </div>

        {commentCount > 0 && (
          <div
             className="flex items-center gap-1 text-text-secondary bg-navy-card px-1.5 py-0.5 rounded text-[11px]"
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
