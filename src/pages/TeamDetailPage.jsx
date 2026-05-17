import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Users,
} from "lucide-react";

import PublicNavbar from "../components/PublicNavbar";
import {
  getRelatedTeamMembers,
  getTeamByGroupAndSlug,
  getTeamSectionByGroup,
} from "../features/team/data/team.data";

export default function TeamDetailPage() {
  const navigate = useNavigate();
  const { group, slug } = useParams();

  const member = getTeamByGroupAndSlug(group, slug);
  const section = getTeamSectionByGroup(group);
  const relatedMembers = getRelatedTeamMembers(group, slug, 3);

  if (!member) {
    return (
      <main className="flex min-h-screen flex-col bg-[#f7f8fb] font-sans text-slate-900">
        <PublicNavbar />

        <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-500">
            <Users size={28} />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            Anggota tim tidak ditemukan
          </h1>

          <p className="mt-3 max-w-md text-slate-500">
            Data anggota tim yang kamu cari tidak tersedia atau URL-nya tidak
            sesuai.
          </p>

          <button
            type="button"
            onClick={() => navigate("/team")}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 hover:bg-sky-600"
          >
            Kembali ke Halaman Tim
            <ArrowRight size={17} />
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] pb-20 font-sans text-slate-900">
      <PublicNavbar />

      {/* HERO DETAIL */}
      <section className="relative overflow-hidden px-6 pb-14 pt-28 md:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-10 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-sky-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-52 h-[320px] w-[320px] rounded-full bg-indigo-300/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl">
          {/* BREADCRUMB */}
          <div className="mb-7 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
            <Link to="/team" className="transition hover:text-sky-600">
              Team
            </Link>
            <ChevronRight size={15} />
            {section?.href ? (
              <Link to={section.href} className="transition hover:text-sky-600">
                {section.title}
              </Link>
            ) : (
              <span>{member.type}</span>
            )}
            <ChevronRight size={15} />
            <span className="text-slate-900">{member.name}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>

          <div className="grid items-center gap-10 lg:grid-cols-[0.88fr_1.12fr]">
            {/* PHOTO */}
            <div className="relative mx-auto w-full max-w-[460px] lg:mx-0">
              <div className="relative overflow-hidden rounded-[4rem] border border-white bg-slate-100 shadow-2xl shadow-slate-200/80">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-[560px] w-full object-cover transition-transform duration-700 hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />

                <div className="absolute left-6 top-6 rounded-full border border-white/30 bg-white/85 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-sky-700 shadow-sm backdrop-blur-md">
                  {member.type}
                </div>

                <div className="absolute bottom-7 left-7 right-7">
                  {/* <div className="rounded-[2rem] border border-blue-400/40 bg-blue-700/80 p-5 text-white shadow-lg shadow-blue-950/30 backdrop-blur-md"> */}
                  <div className="rounded-[2rem] border border-sky-200/60 bg-[#35A8EF]/95 p-5 text-white shadow-lg shadow-sky-400/40 backdrop-blur-md">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
                      Role
                    </p>
                    <p className="mt-1 text-lg font-bold leading-snug text-white">
                      {member.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-600 shadow-sm backdrop-blur">
                <Sparkles size={16} />
                {member.type} Profile
              </div>

              <h1 className="max-w-4xl text-4xl font-bold leading-[1.06] tracking-tight text-slate-900 md:text-6xl">
                {member.name}
              </h1>

              <p className="mt-5 max-w-2xl text-xl font-semibold leading-relaxed text-sky-600">
                {member.role}
              </p>

              <div className="my-8 h-px w-24 bg-slate-200" />

              <p className="max-w-3xl text-lg leading-8 text-slate-600">
                {member.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/team"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Semua Tim
                </Link>

                {section?.href && (
                  <Link
                    to={section.href}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  >
                    {section.title}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BIO + RESPONSIBILITIES */}
      <section className="px-6 pt-4">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <span className="text-sm font-bold uppercase tracking-[0.22em] text-sky-600">
              Profile Detail
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Tentang {member.name}
            </h2>

            <p className="mt-6 whitespace-pre-line text-base leading-8 text-slate-600">
              {member.bio}
            </p>
          </article>

          <aside className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <span className="text-sm font-bold uppercase tracking-[0.22em] text-sky-600">
              Contribution
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Peran dan Kontribusi
            </h2>

            <div className="mt-7 space-y-4">
              {member.responsibilities?.map((item, index) => (
                <div
                  key={`${member.group}-${member.slug}-responsibility-${index}`}
                  className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-sky-100 hover:bg-sky-50/50"
                >
                  <CheckCircle2
                    size={20}
                    strokeWidth={2}
                    className="mt-[2px] shrink-0 text-sky-500"
                  />
                  <span className="text-sm font-medium leading-relaxed text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* RELATED MEMBERS */}
      {relatedMembers.length > 0 && (
        <section className="px-6 pt-14">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
              <div>
                <span className="text-sm font-bold uppercase tracking-[0.22em] text-sky-600">
                  Related Team
                </span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  Anggota lain di {section?.title || member.type}
                </h2>
              </div>

              {section?.href && (
                <Link
                  to={section.href}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                >
                  Lihat Semua
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {relatedMembers.map((item) => (
                <Link
                  key={`${item.group}-${item.slug}`}
                  to={item.href}
                  className="group overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-500/10"
                >
                  <div className="relative aspect-[1.5/2] overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain object-bottom transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="rounded-full bg-white/90 px-3 py-1.5 text-center text-[0.62rem] font-bold uppercase tracking-[0.18em] text-sky-700 shadow-sm backdrop-blur">
                        {item.type}
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold leading-tight text-slate-900 transition group-hover:text-sky-600">
                      {item.name}
                    </h3>

                    <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                      {item.role}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}