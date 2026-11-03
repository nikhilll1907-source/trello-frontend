import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Kanban,
  LogOut,
  Building2,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isCurrent = (path) => location.pathname === path;

  return (
    <header className="bg-navy-sidebar border-b border-navy-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary-hover transition-colors">
                <Kanban className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-text-main tracking-tight">
                Trellis
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isCurrent("/dashboard")
                    ? "text-primary bg-primary-light"
                    : "text-text-secondary hover:text-text-main hover:bg-navy-card"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Organizations</span>
                </div>
              </Link>
            </nav>
          </div>

          {/* User Profile & Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 pr-2 border-r border-surface-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-medium text-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-text-main leading-none">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-text-secondary leading-tight mt-0.5">
                  {user?.email}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-status-error hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-text-secondary hover:text-text-main hover:bg-navy-card"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-border px-4 pt-3 pb-4 bg-navy-sidebar space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-surface-border">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-sm font-medium text-text-main">{user?.name}</p>
              <p className="text-xs text-text-secondary">{user?.email}</p>
            </div>
          </div>

          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-main rounded-md hover:bg-navy-card"
          >
            <Building2 className="w-4 h-4 text-text-secondary" />
            <span>Organizations</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-status-error rounded-md hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
