import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

import { TeamCard, type TeamCardProps } from "@/features/team/components/team-card";
import { cn } from "@/lib/utils";

type TeamPageProps = {
  title: string;
  subtitle: string;
  teams: TeamCardProps[];
  active?: "all" | "expert" | "staff";
};

const tabs = [
  {
    label: "All Team",
    href: "/team",
    value: "all",
  },
  {
    label: "Balale Expert Team",
    href: "/team/expert",
    value: "expert",
  },
  {
    label: "Balale Staff",
    href: "/team/staff",
    value: "staff",
  },
] as const;

export function TeamPage({
  title,
  subtitle,
  teams,
  active = "all",
}: TeamPageProps) {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 py-20">
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(45deg,#0f172a_1px,transparent_1px),linear-gradient(-45deg,#0f172a_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm">
              <span>Our Team</span>
              <ChevronDown className="h-4 w-4" />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
              {title}
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              {subtitle}
            </p>

            <div className="mx-auto mt-8 h-1.5 w-28 rounded-full bg-amber-500" />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            {tabs.map((tab) => {
              const isActive = tab.value === active;

              return (
                <Link
                  key={tab.value}
                  href={tab.href}
                  className={cn(
                    "inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-semibold transition",
                    isActive
                      ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-amber-400 hover:text-amber-700"
                  )}
                >
                  {tab.label}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              );
            })}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((member) => (
              <TeamCard key={`${member.name}-${member.role}`} {...member} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
