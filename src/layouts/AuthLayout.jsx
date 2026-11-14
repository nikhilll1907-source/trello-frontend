import React from "react";
import {
  Kanban,
  MessageSquareText,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const productFeatures = [
  {
    icon: PanelsTopLeft,
    title: "Project boards",
    description: "Organize issues into sections that fit your workflow.",
  },
  {
    icon: MessageSquareText,
    title: "Team discussions",
    description: "Keep conversations alongside the issues they relate to.",
  },
  {
    icon: Sparkles,
    title: "AI board assistance",
    description: "Explore board details and review proposed changes.",
  },
  {
    icon: UsersRound,
    title: "Workspace collaboration",
    description: "Bring teammates together with organization roles.",
  },
];

export const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="relative grid min-h-screen grid-cols-1 overflow-hidden bg-[#0B1220] text-[#E8EDF5] lg:grid-cols-12">
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden border-r border-[#29374A] bg-[#0A101B] p-10 lg:col-span-6 lg:flex xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"
        />

        <Link to="/" className="relative z-10 inline-flex w-fit items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <Kanban className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-[#E8EDF5]">
            Trellis <span className="font-medium text-[#A3B1C5]">Workspace</span>
          </span>
        </Link>

        <div className="relative z-10 my-auto max-w-xl py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            One workspace for your team
          </div>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-[#E8EDF5] xl:text-5xl">
            Bring your projects together. Get more done.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#A3B1C5]">
            Plan projects, organize tasks, collaborate with your team, and keep
            everything moving forward from one workspace.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {productFeatures.map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-[#29374A]/80 bg-[#141E2D]/75 p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <FeatureIcon className="h-4 w-4" />
                  </div>
                  <h2 className="mt-3 text-sm font-semibold text-[#E8EDF5]">
                    {feature.title}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#A3B1C5]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-[#64748B]">
          <ShieldCheck className="h-4 w-4" />
          A shared space for organized, collaborative work.
        </div>
      </section>

      <main className="relative col-span-1 flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-8 lg:col-span-6 lg:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(38,117,245,0.08),transparent_55%)] lg:hidden"
        />

        <Link
          to="/"
          className="relative mb-8 inline-flex items-center gap-2.5 lg:hidden"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <Kanban className="h-4 w-4" />
          </span>
          <span className="text-base font-bold tracking-tight text-[#E8EDF5]">
            Trellis <span className="font-medium text-[#A3B1C5]">Workspace</span>
          </span>
        </Link>

        <section className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#29374A] bg-[#141E2D]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] sm:p-8">
          <div className="mb-7 space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-[#E8EDF5]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm leading-relaxed text-[#A3B1C5]">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </section>
      </main>
    </div>
  );
};

export default AuthLayout;
