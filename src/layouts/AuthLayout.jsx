import React from "react";
import { Kanban, CheckCircle2, Zap, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#0B1220] text-[#E8EDF5]">
      {/* Left Showcase Panel (Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 bg-[#0A101B] border-r border-[#29374A] p-12 flex-col justify-between relative overflow-hidden">
        {/* Top Brand */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-white shadow-xs group-hover:bg-primary-hover transition-colors">
              <Kanban className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#E8EDF5]">
              Trellis
            </span>
          </Link>
        </div>

        {/* Center Marketing Content */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto py-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/15 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Real-time SaaS Workspace</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#E8EDF5] tracking-tight leading-tight">
              Manage projects, collaborate in real time, and scale with velocity.
            </h1>
            <p className="text-sm text-[#A3B1C5] leading-relaxed">
              Experience an information-dense, dark workspace engineered for modern product and engineering teams.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-[#E8EDF5]">
              <div className="w-5 h-5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Live active-user presence via native WebSockets</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#E8EDF5]">
              <div className="w-5 h-5 rounded bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Custom Kanban columns, detailed issue cards, and issue discussions</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#E8EDF5]">
              <div className="w-5 h-5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span>Multi-tenant organizations, invitations, and role-based permissions</span>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-[#64748B]">
          © {new Date().getFullYear()} Trellis Workspace.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-6 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white shadow-xs">
            <Kanban className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-[#E8EDF5]">
            Trellis Workspace
          </span>
        </div>

        <div className="w-full max-w-md bg-[#141E2D] border border-[#29374A] rounded-lg p-6 sm:p-8 shadow-2xl">
          <div className="mb-6 space-y-1 text-left">
            <h2 className="text-xl font-bold tracking-tight text-[#E8EDF5]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#A3B1C5] leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
