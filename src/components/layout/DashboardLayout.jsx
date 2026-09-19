import React from "react";
import Navbar from "./Navbar";

export const DashboardLayout = ({ children, fullWidth = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <Navbar />
      <main className={`flex-1 ${fullWidth ? "w-full" : "max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8"}`}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
