import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// HAPUS import "./team-card.css" JIKA ADA

export default function TeamCard({ name, role, type, image, slug }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/team/${slug}`)}
      className="group flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-200 transition-all duration-300"
    >
      {/* PHOTO AREA */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* BADGE TIPE TIM */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[0.65rem] font-bold text-sky-700 uppercase tracking-widest shadow-sm">
          {type}
        </div>
      </div>

      {/* TEXT AREA */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-[1.15rem] font-bold text-slate-900 mb-1 group-hover:text-sky-600 transition-colors">
          {name}
        </h3>
        <p className="text-[0.9rem] font-medium text-slate-500 mb-4 flex-1 leading-snug">
          {role}
        </p>

        <div className="flex items-center gap-1.5 text-[0.85rem] font-semibold text-sky-500 group-hover:text-sky-600 transition-colors mt-auto">
          Lihat Profil <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
}