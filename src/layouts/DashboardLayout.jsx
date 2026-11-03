import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../hooks/useAuth";
import Topbar from "./Topbar";

export const DashboardLayout = ({ children, fullWidth = false }) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-[#0B1220] text-[#E8EDF5] overflow-hidden">
      {/* Desktop Sidebar (Persistent) */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#000000]/75 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative z-10 w-64 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar onCloseMobile={() => setMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar user={user} onOpenMenu={() => setMobileDrawerOpen(true)} />

        {/* Workspace Content Canvas */}
        <main
            className={`flex-1 overflow-y-auto custom-scrollbar bg-navy-bg ${
            fullWidth ? "p-0" : "max-w-[1440px] mx-auto w-full p-4 sm:p-6 lg:p-8"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
