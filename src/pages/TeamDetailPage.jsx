import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import PublicNavbar from "../components/PublicNavbar";
import { getTeamBySlug } from "../features/team/data/team.data";

// HAPUS IMPORT CSS INI:
// import "../features/team/components/team-detail.css";

export default function TeamDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const member = getTeamBySlug(slug);

  if (!member) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <PublicNavbar />

        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Anggota tim tidak ditemukan</h1>
          <p className="text-slate-500 mb-8 max-w-md">Data anggota tim yang kamu cari tidak tersedia atau mungkin URL-nya salah.</p>

          <button 
            type="button" 
            onClick={() => navigate("/team")}
            className="px-6 py-3 rounded-full bg-sky-500 text-white font-medium hover:bg-sky-600 hover:-translate-y-0.5 shadow-lg shadow-sky-500/30 transition-all"
          >
            Kembali ke Halaman Tim
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <PublicNavbar />

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-16 px-6 bg-white border-b border-slate-200 overflow-hidden">
        {/* Accents */}
        <div className="absolute w-[300px] h-[300px] rounded-full bg-sky-400/10 blur-3xl -top-32 -left-20 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-[0.9rem] font-medium text-slate-500 hover:text-sky-600 transition-colors mb-10 focus:outline-none"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Kembali
          </button>

          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-10 lg:gap-16 items-start">
            
            {/* PHOTO CARD */}
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-200 bg-white group">
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-5 left-5 px-3.5 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[0.7rem] font-bold text-sky-700 tracking-widest uppercase shadow-sm">
                {member.type}
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex flex-col pt-2 md:pt-6">
              <span className="text-[0.8rem] font-bold tracking-widest text-sky-600 uppercase mb-3">
                {member.type} Profile
              </span>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-4">
                {member.name}
              </h1>

              <p className="text-lg md:text-xl font-medium text-slate-500 mb-6">
                {member.role}
              </p>

              <div className="h-px w-16 bg-slate-200 mb-6" />

              <p className="text-[1rem] text-slate-600 leading-relaxed mb-8">
                {member.bio}
              </p>

              <div className="flex flex-wrap gap-3 mt-auto">
                <button 
                  type="button" 
                  onClick={() => navigate("/team")}
                  className="px-5 py-2.5 rounded-full bg-slate-100 text-slate-700 text-[0.9rem] font-medium hover:bg-slate-200 hover:text-slate-900 transition-colors focus:outline-none"
                >
                  Semua Tim
                </button>

                <button 
                  type="button" 
                  onClick={() => navigate("/team/staff")}
                  className="px-5 py-2.5 rounded-full bg-slate-100 text-slate-700 text-[0.9rem] font-medium hover:bg-slate-200 hover:text-slate-900 transition-colors focus:outline-none"
                >
                  Student Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESPONSIBILITIES SECTION */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-200 shadow-lg shadow-slate-900/5">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Peran dan Kontribusi</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {member.responsibilities?.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 size={20} strokeWidth={2} className="text-sky-500 shrink-0 mt-[3px]" />
                  <span className="text-[0.95rem] text-slate-700 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}