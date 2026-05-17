import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import PublicNavbar from "../../../components/PublicNavbar";
import TeamCard from "./TeamCard";

const tabs = [
  { label: "Semua Tim", href: "/team", value: "all" },
  { label: "Founding Team", href: "/team/founders", value: "founders" },
  { label: "Core Development Team", href: "/team/core", value: "core" },
  { label: "Expert & Advisor Team", href: "/team/experts", value: "experts" },
];

const CARDS_PER_ROW = 6;

function chunkArray(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

export default function TeamSectionPage({
  title,
  subtitle,
  teams = [],
  active = "all",
}) {
  const teamRows = chunkArray(teams, CARDS_PER_ROW);

  return (
    <main className="min-h-screen bg-[#f7f8fb] pb-20 font-sans text-slate-900">
      <PublicNavbar />

      <section className="relative overflow-hidden bg-[#f7f8fb] px-6 pb-10 pt-32 text-center">
        <div className="pointer-events-none absolute left-1/2 top-10 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-sky-300/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <span className="mb-5 inline-block rounded-full border border-sky-100 bg-white/80 px-4 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-sky-600 shadow-sm backdrop-blur">
            Tim Posturely
          </span>

          <h1 className="mb-5 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            {title}
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-500 md:text-lg">
            {subtitle}
          </p>
        </div>
      </section>

      <section className="px-4 pt-6 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {tabs.map((tab) => {
              const isActive = tab.value === active;

              return (
                <Link
                  key={tab.value}
                  to={tab.href}
                  className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[0.9rem] font-semibold transition-all ${
                    isActive
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  }`}
                >
                  {tab.label}
                  {isActive && <ChevronRight size={16} />}
                </Link>
              );
            })}
          </div>

          {teams.length > 0 ? (
            <>
              {/* DESKTOP: accordion row, card geser bukan menutupi */}
              <div className="hidden space-y-6 md:block">
                {teamRows.map((row, rowIndex) => (
                  <div
                    key={`team-row-${rowIndex}`}
                    className="flex flex-nowrap justify-center gap-4 overflow-visible"
                  >
                    {row.map((member) => (
                      <TeamCard
                        key={`${member.group}-${member.slug}`}
                        {...member}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* MOBILE */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:hidden">
                {teams.map((member) => (
                  <TeamCard
                    key={`mobile-${member.group}-${member.slug}`}
                    {...member}
                    mobile
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                Data tim belum tersedia
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Belum ada anggota yang ditampilkan pada kategori ini.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}