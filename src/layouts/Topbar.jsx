import React from "react";
import { Kanban, Menu, Search } from "lucide-react";
import { Link } from "react-router-dom";

const initials = (name) => name ? name.slice(0, 2).toUpperCase() : "U";

export const Topbar = ({ user, onOpenMenu }) => (
  <header className="lg:hidden flex h-14 shrink-0 items-center justify-between border-b border-navy-border bg-navy-sidebar px-4">
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={onOpenMenu}
        className="rounded-md p-2 text-text-secondary hover:bg-navy-card hover:text-text-main"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Link to="/dashboard" className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
          <Kanban className="h-4 w-4" />
        </span>
        <span className="text-sm font-extrabold tracking-tight text-text-main">Trellis</span>
      </Link>
    </div>
    <div className="flex items-center gap-2">
      <Search className="hidden h-4 w-4 text-text-muted sm:block" aria-hidden="true" />
      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/15 text-xs font-bold text-primary">
        {initials(user?.name)}
      </span>
    </div>
  </header>
);

export default Topbar;
