import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as orgService from "../features/organizations/api/organization.api";
import { Kanban, Building2, Layout, Users, LogOut, Search, ChevronDown, X, Command } from "lucide-react";

export const Sidebar = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Detect current organization ID from route: /organizations/:id or /boards/:id
  const isDashboard = location.pathname === "/dashboard";
  const orgMatch = location.pathname.match(/\/organizations\/([a-zA-Z0-9]+)/);
  const currentOrgId = orgMatch ? orgMatch[1] : null;

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await orgService.getOrganizations();
        setOrganizations(res.data || []);
      } catch {
        // Non-critical
      }
    };
    fetchOrgs();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const currentOrg = organizations.find((o) => o._id === currentOrgId);

  return (
    <aside className="w-64 h-full bg-navy-sidebar border-r border-navy-border flex flex-col justify-between text-text-main select-none">
      {/* Top Header & Navigation */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Bar */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-navy-border">
          <Link
            to="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white group-hover:bg-primary-hover transition-colors">
              <Kanban className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-text-main leading-none">
                Trellis
              </span>
              <span className="text-[10px] text-text-muted font-semibold tracking-[0.14em] uppercase mt-0.5">
                Project space
              </span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-text-secondary hover:text-text-main rounded hover:bg-navy-elevated"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Organization Switcher Dropdown */}
        <div className="p-3 border-b border-navy-border relative">
          <label className="eyebrow block mb-1.5 px-1">
            Workspace
          </label>
          <button
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            className="w-full px-2.5 py-2 bg-navy-card hover:bg-navy-elevated border border-navy-border rounded-md flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
               <div className="w-5 h-5 rounded bg-primary/15 text-primary border border-primary/30 flex items-center justify-center text-[10px] font-bold">
                {currentOrg?.name ? currentOrg.name.slice(0, 1).toUpperCase() : "O"}
              </div>
              <span className="text-xs font-semibold text-text-main truncate">
                {currentOrg?.name || "All Organizations"}
              </span>
            </div>
             <ChevronDown className="w-3.5 h-3.5 text-text-secondary shrink-0" />
          </button>

          {/* Dropdown Menu */}
          {orgDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setOrgDropdownOpen(false)}
              />
               <div className="absolute left-3 right-3 top-full mt-1 bg-navy-card border border-navy-border rounded-md shadow-2xl py-1 z-30 max-h-56 overflow-y-auto custom-scrollbar">
                <Link
                  to="/dashboard"
                  onClick={() => {
                    setOrgDropdownOpen(false);
                    onCloseMobile?.();
                  }}
                   className={`flex items-center gap-2 px-3 py-2 text-xs hover:bg-navy-elevated transition-colors ${
                    isDashboard ? "text-primary font-semibold" : "text-[#E8EDF5]"
                  }`}
                >
                   <Building2 className="w-3.5 h-3.5 text-text-secondary" />
                  <span>All Organizations</span>
                </Link>

                 <div className="my-1 border-t border-navy-border" />

                {organizations.map((org) => (
                  <Link
                    key={org._id}
                    to={`/organizations/${org._id}`}
                    onClick={() => {
                      setOrgDropdownOpen(false);
                      onCloseMobile?.();
                    }}
                     className={`flex items-center justify-between px-3 py-2 text-xs hover:bg-navy-elevated transition-colors ${
                      currentOrgId === org._id
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-[#E8EDF5]"
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    {currentOrgId === org._id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Search Shortcut */}
        <div className="px-3 pt-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search or jump to..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                const query = searchQuery.trim().toLowerCase();
                if (!query) return;
                const match = organizations.find((org) => org.name?.toLowerCase().includes(query));
                if (match) {
                  navigate(`/organizations/${match._id}`);
                  setSearchQuery("");
                  onCloseMobile?.();
                }
              }}
              className="w-full bg-navy-card border border-navy-border rounded-md pl-8 pr-7 py-2 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
            />
            <span className="text-[10px] text-text-muted border border-navy-border rounded px-1 absolute right-2 top-1/2 -translate-y-1/2">
              <Command className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>

        {/* Main Navigation Links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          <div className="eyebrow px-2.5 py-1">
            Navigation
          </div>

          <Link
            to="/dashboard"
            onClick={onCloseMobile}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
              isDashboard
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-main hover:bg-navy-card"
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Organizations</span>
          </Link>

          {currentOrgId && (
            <>
               <div className="eyebrow px-2.5 pt-4 pb-1">
                Workspace: {currentOrg?.name || "Active"}
              </div>

              <Link
                to={`/organizations/${currentOrgId}`}
                onClick={onCloseMobile}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                  location.pathname === `/organizations/${currentOrgId}`
                     ? "bg-navy-elevated text-text-main border border-navy-border"
                     : "text-text-secondary hover:text-text-main hover:bg-navy-card"
                }`}
              >
                <Layout className="w-4 h-4 shrink-0" />
                <span>Boards</span>
              </Link>

              <Link
                to={`/organizations/${currentOrgId}`}
                onClick={onCloseMobile}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium text-text-secondary hover:text-text-main hover:bg-navy-card transition-colors"
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Members & Roles</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Profile & Footer */}
      <div className="p-3 border-t border-navy-border bg-navy-sidebar">
        <div className="flex items-center justify-between p-2 rounded-md bg-navy-card border border-navy-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col min-w-0">
               <span className="text-xs font-semibold text-text-main truncate leading-tight">
                {user?.name || "Account"}
              </span>
               <span className="text-[10px] text-text-secondary truncate leading-tight">
                {user?.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
             className="p-1.5 text-text-secondary hover:text-status-error hover:bg-navy-elevated rounded transition-colors cursor-pointer shrink-0"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
