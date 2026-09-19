import React from "react";
import { Link } from "react-router-dom";
import { Kanban } from "lucide-react";

export const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 bg-surface-bg selection:bg-primary-light selection:text-primary">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 group mb-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
        >
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:bg-primary-hover group-hover:scale-105 transition-all">
            <Kanban className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl text-text-main tracking-tight">
            Trello
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-text-main">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm text-text-secondary max-w-sm mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs border border-surface-border rounded-2xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
