import React from "react";
import { Link } from "react-router-dom";
import { Users, Layout, ArrowRight } from "lucide-react";

export const OrganizationCard = ({ organization, boardCount = 0, memberCount = 0 }) => {
  return (
    <Link
      to={`/organizations/${organization._id}`}
      className="group block surface-card p-5 hover:border-primary/50 hover:bg-navy-hover transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-primary/12 text-primary border border-primary/20 font-bold">
            {organization.name?.slice(0, 1).toUpperCase()}
          </div>
          <h3 className="text-base font-bold text-text-main group-hover:text-primary transition-colors">
            {organization.name}
          </h3>
          <p className="text-xs leading-6 text-text-secondary mt-1 line-clamp-2 min-h-[48px]">
            {organization.description || "No description provided."}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-navy-border flex items-center justify-between text-xs text-text-secondary">
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
