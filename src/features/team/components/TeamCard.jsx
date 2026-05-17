import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function TeamCard({
  name,
  role,
  type,
  image,
  href,
  group,
  slug,
  mobile = false,
}) {
  const navigate = useNavigate();

  const profileHref = href || `/team/${group}/${slug}`;

  return (
    <article
      onClick={() => navigate(profileHref)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(profileHref);
        }
      }}
      className={`
        group relative flex h-[440px] cursor-pointer overflow-hidden
        rounded-[3.5rem] border border-white/70 bg-slate-100 shadow-sm
        transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
        hover:-translate-y-2 hover:border-sky-100 hover:shadow-2xl hover:shadow-sky-500/15
        focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2

        ${
          mobile
            ? "w-full"
            : "w-[145px] shrink-0 hover:w-[410px] lg:w-[150px] lg:hover:w-[420px]"
        }
      `}
    >
      {/* IMAGE */}
      <img
        src={image}
        alt={name}
        className="
          absolute inset-0 h-full w-full object-cover
          transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
          group-hover:scale-105
        "
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />

      {/* BADGE */}
      <div
        className="
          absolute left-5 top-5 max-w-[75%] rounded-full border border-white/25
          bg-white/80 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em]
          text-sky-700 shadow-sm backdrop-blur-md
          translate-y-2 opacity-0 transition-all duration-500
          group-hover:translate-y-0 group-hover:opacity-100
        "
      >
        {type}
      </div>

      {/* HOVER CONTENT */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white">
        <div className="w-[330px] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <h3
            className="
              translate-y-8 text-xl font-bold leading-tight tracking-tight opacity-0 drop-shadow
              transition-all duration-500
              group-hover:translate-y-0 group-hover:text-3xl group-hover:opacity-100
            "
          >
            {name}
          </h3>

          <p
            className="
              mt-2 translate-y-8 text-sm font-medium leading-snug text-white/85 opacity-0
              transition-all delay-75 duration-500
              group-hover:translate-y-0 group-hover:opacity-100
            "
          >
            {role}
          </p>

          <div
            className="
              mt-5 inline-flex translate-y-8 items-center gap-2 rounded-full bg-white/90 px-4 py-2
              text-sm font-bold text-sky-700 opacity-0 shadow-sm backdrop-blur
              transition-all delay-100 duration-500
              group-hover:translate-y-0 group-hover:opacity-100
            "
          >
            Lihat Profil <ArrowRight size={16} />
          </div>
        </div>
      </div>

      {/* CLOSED STATE NAME */}
      <div
        className="
          pointer-events-none absolute bottom-7 left-1/2 z-10
          -translate-x-1/2 text-center transition-all duration-500
          group-hover:translate-y-6 group-hover:opacity-0
        "
      >
        <p className="max-w-[120px] truncate text-sm font-bold text-white drop-shadow">
          {name}
        </p>
      </div>
    </article>
  );
}