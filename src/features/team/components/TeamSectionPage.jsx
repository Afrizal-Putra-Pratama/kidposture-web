import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import PublicNavbar from "../../../components/PublicNavbar";
import TeamCard from "./TeamCard";

// HAPUS PANGGILAN CSS INI:
// import "./team-page.css";

const tabs = [
  { label: "Semua Tim", href: "/team", value: "all" },
  { label: "Expert Team", href: "/team/expert", value: "expert" },
  { label: "Staff Mahasiswa", href: "/team/staff", value: "staff" },
];

export default function TeamSectionPage({ title, subtitle, teams, active = "all" }) {
  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <PublicNavbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 px-6 bg-white border-b border-slate-200 overflow-hidden text-center">
        {/* Accent Background */}
        <div className="absolute w-[300px] h-[300px] rounded-full bg-sky-400/10 blur-3xl -top-32 left-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-block px-3.5 py-1 bg-sky-50 text-sky-600 border border-sky-100 rounded-full text-[0.75rem] font-bold tracking-widest uppercase mb-4 shadow-sm">
            Tim Posturely
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-[1rem] md:text-[1.1rem] text-slate-500 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="px-6 pt-12">
        <div className="max-w-6xl mx-auto">
          
          {/* TABS NAVIGATION */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {tabs.map((tab) => {
              const isActive = tab.value === active;
              return (
                <Link
                  key={tab.value}
                  to={tab.href}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[0.9rem] font-medium transition-all ${
                    isActive 
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/20" 
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                  {isActive && <ChevronRight size={16} />}
                </Link>
              );
            })}
          </div>

          {/* GRID KARTU TIM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {teams.map((member) => (
              <TeamCard key={`${member.name}-${member.role}`} {...member} />
            ))}
          </div>

        </div>
      </section>
    </main>
  );
}