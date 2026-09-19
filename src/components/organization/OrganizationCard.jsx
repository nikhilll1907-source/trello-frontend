import React from "react";
import { Link } from "react-router-dom";
import { Users, Layout, ArrowRight } from "lucide-react";

export const OrganizationCard = ({ organization, boardCount = 0, memberCount = 0 }) => {
  return (
    <Link
      to={`/organizations/${organization._id}`}
      className="group block bg-white rounded-xl border border-surface-border p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-main group-hover:text-primary transition-colors">
            {organization.name}
          </h3>
          <p className="text-sm text-text-secondary mt-1 line-clamp-2 min-h-[40px]">
            {organization.description || "No description provided."}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between text-xs text-text-secondary">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5" title="Members">
            <Users className="w-3.5 h-3.5" />
            <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Boards">
            <Layout className="w-3.5 h-3.5" />
            <span>{boardCount} {boardCount === 1 ? "board" : "boards"}</span>
          </div>
        </div>

        <div className="flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform">
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </div>
      </div>
    </Link>
  );
};

export default OrganizationCard;
