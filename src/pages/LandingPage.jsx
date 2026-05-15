import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BookOpen,
  ArrowRight,
  MapPin,
  ChevronRight,
  HeartHandshake,
  CheckCircle2,
  Menu,
  X,
  Search,
  Map,
  Sparkles,
} from "lucide-react";

import api from "../utils/axios";

function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, ...options }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
}

export default function LandingPage() {
  const navigate = useNavigate();

  const [physios, setPhysios] = useState([]);
  const [articles, setArticles] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchPhysio, setSearchPhysio] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");

  const [featureRef, featureInView] = useInView();
  const [howRef, howInView] = useInView();
  const [physioRef, physioInView] = useInView();
  const [articleRef, articleInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  const howSteps = [
    {
      title: "Foto postur anak",
      text: "Ambil foto postur anak dari berbagai sudut sesuai dengan panduan visual di aplikasi.",
    },
    {
      title: "Analisis oleh AI",
      text: "Kecerdasan buatan kami akan langsung memetakan sudut dan mendeteksi asimetri tubuh.",
    },
    {
      title: "Hasil & Ringkasan",
      text: "Dapatkan skor postur, kategori risiko, dan ringkasan kondisi yang mudah dipahami.",
    },
    {
      title: "Tindakan Lanjutan",
      text: "Gunakan hasil tersebut untuk berlatih di rumah atau rujukan ke fisioterapis ahli.",
    },
  ];

  const features = [
    {
      icon: <Activity size={24} strokeWidth={1.5} />,
      color: "text-blue-800",
      bg: "bg-blue-50",
      border: "border-blue-200",
      title: "Deteksi AI Instan",
      desc: "Unggah foto anak dan biarkan AI menganalisis sudut simetri tubuh dalam hitungan detik. Mudah dan akurat.",
    },
    {
      icon: <HeartHandshake size={24} strokeWidth={1.5} />,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      title: "Terhubung Ahli",
      desc: "Kirim hasil screening langsung ke fisioterapis anak terverifikasi di kota Anda untuk penanganan lebih lanjut.",
    },
    {
      icon: <BookOpen size={24} strokeWidth={1.5} />,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      title: "Edukasi Terpandu",
      desc: "Dapatkan artikel dan panduan latihan fisik yang aman untuk mengoreksi postur anak sedini mungkin.",
    },
  ];

  const fallbackPhysios = [
    {
      id: "demo-physio-1",
      name: "Arif Kurniawan, SST. FT, Ftr.",
      city: "Surakarta",
      specialty: "Pediatrik dan Neurodevelopmental",
      is_verified: true,
      consultation_fee: 10000,
    },
    {
      id: "demo-physio-2",
      name: "Fisio Anak A",
      city: "Pontianak",
      specialty: "Fisioterapi Anak",
      is_verified: true,
      consultation_fee: null,
    },
    {
      id: "demo-physio-3",
      name: "Taqiyyah Nurul 'Azzah",
      city: "Surakarta",
      specialty: "Fisioterapi Anak",
      is_verified: true,
      consultation_fee: 100000,
    },
  ];

  const fallbackArticles = [
    {
      id: "demo-article-1",
      slug: "mengenalkan-pentingnya-menjaga-postur-tubuh-anak",
      title: "Mengenalkan Pentingnya Menjaga Postur Tubuh pada Anak",
      excerpt:
        "Menjaga postur tubuh harus dilakukan sejak belia. Kebiasaan buruk seperti bermain gawai terlalu lama dapat memengaruhi postur anak.",
      category: { name: "Pentingnya Postur Tubuh" },
    },
    {
      id: "demo-article-2",
      slug: "prosedur-pemeriksaan-postur-anak",
      title: "Prosedur Pemeriksaan CT Scan",
      excerpt:
        "Pemeriksaan dapat membantu memahami kondisi tubuh dan menentukan langkah pencegahan yang tepat.",
      category: { name: "Latihan Postur" },
    },
    {
      id: "demo-article-3",
      slug: "kebiasaan-penyebab-radang-sendi",
      title: "5 Kebiasaan Penyebab Radang Sendi yang Perlu Diwaspadai",
      excerpt:
        "Kebiasaan sehari-hari dapat memengaruhi kesehatan muskuloskeletal anak jika tidak diperhatikan sejak dini.",
      category: { name: "Informasi Kesehatan" },
    },
    {
      id: "demo-article-4",
      slug: "waspadai-kelainan-tulang",
      title: "Waspadai 4 Kelainan Tulang yang Umum Menyerang Anak",
      excerpt:
        "Setiap orang tua pasti berharap anaknya tumbuh dan berkembang dengan sempurna secara fisik, mental, dan sosial.",
      category: { name: "Pentingnya Postur Tubuh" },
    },
    {
      id: "demo-article-5",
      slug: "radiologi-dan-perannya",
      title: "Radiologi dan Perannya Bagi Pemeriksaan Kesehatan",
      excerpt:
        "Dalam melakukan diagnosis, dokter seringkali membutuhkan berbagai tindakan atau pemeriksaan tambahan.",
      category: { name: "Tips Keseharian" },
    },
  ];

  const marqueeFeatures = [...features, ...features, ...features];

  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        const physioRes = await api.get("/physiotherapists");
        setPhysios(physioRes.data.data || []);

        const articleRes = await api.get("/articles", {
          params: { limit: 6 },
        });
        setArticles(articleRes.data.data || []);
      } catch (err) {
        console.error("Error loading preview data:", err);
      }
    };

    loadPreviewData();
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const physioSource = physios.length > 0 ? physios : fallbackPhysios;
  const articleSource = articles.length > 0 ? articles.slice(0, 6) : fallbackArticles;

  const filteredPhysios = physioSource.filter((p) => {
    const matchName = p.name?.toLowerCase().includes(searchPhysio.toLowerCase());

    const matchCity = filterCity
      ? p.city?.toLowerCase().includes(filterCity.toLowerCase())
      : true;

    const matchSpec = filterSpecialty
      ? p.specialty?.toLowerCase().includes(filterSpecialty.toLowerCase())
      : true;

    return matchName && matchCity && matchSpec;
  });

  const cities = [...new Set(physioSource.map((p) => p.city).filter(Boolean))];

  const specialties = [
    ...new Set(physioSource.map((p) => p.specialty).filter(Boolean)),
  ];

  const fadeClass = (inView) =>
    `transition-all duration-1000 ease-out transform ${
      inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 font-['DM_Sans',sans-serif] text-slate-900 selection:bg-blue-200 overflow-x-hidden">
      <style>{`
        @keyframes infinite-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee {
          animation: infinite-scroll 35s linear infinite;
          width: max-content;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }

        .bg-clip-text::selection {
          background-color: rgba(59, 130, 246, 0.3);
          text-fill-color: #1e3a8a;
          -webkit-text-fill-color: #1e3a8a;
          color: #1e3a8a;
        }
      `}</style>

      <header className="fixed top-0 inset-x-0 z-50 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate("/")}
          >
            <img
              src="/logo-favicon-posturely.svg"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Posturely
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-8 font-semibold text-sm text-slate-500">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-blue-800 transition-colors"
            >
              Fitur
            </button>

            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-blue-800 transition-colors"
            >
              Cara Kerja
            </button>

            <button
              onClick={() => scrollToSection("physiotherapists")}
              className="hover:text-blue-800 transition-colors"
            >
              Fisioterapis
            </button>

            <button
              onClick={() => scrollToSection("education")}
              className="hover:text-blue-800 transition-colors"
            >
              Edukasi
            </button>

            <div className="relative group">
              <button
                type="button"
                onClick={() => navigate("/team")}
                className="inline-flex items-center gap-1 hover:text-blue-800 transition-colors"
              >
                Tim Kami
                <span className="text-xs transition-transform group-hover:rotate-180">
                  ▾
                </span>
              </button>

              <div className="invisible absolute left-1/2 top-[calc(100%+16px)] min-w-[210px] -translate-x-1/2 translate-y-2 rounded-2xl border border-blue-100 bg-white p-2 opacity-0 shadow-xl shadow-blue-900/10 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => navigate("/team")}
                  className="block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-800"
                >
                  Semua Tim
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/team/expert")}
                  className="block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-800"
                >
                  Expert Team
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/team/staff")}
                  className="block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-800"
                >
                  Staff Mahasiswa
                </button>
              </div>
            </div>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-all active:scale-95"
            >
              Masuk
            </button>

            <button
              onClick={() => navigate("/register/physio")}
              className="bg-blue-800 hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm shadow-blue-900/20"
            >
              Daftar Fisio
            </button>
          </div>

          <button
            className="lg:hidden p-2 text-slate-600 rounded-md active:scale-95 hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl flex flex-col p-6 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-6 text-xl font-bold tracking-tight mb-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-left text-slate-700"
              >
                Fitur
              </button>

              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-left text-slate-700"
              >
                Cara Kerja
              </button>

              <button
                onClick={() => scrollToSection("physiotherapists")}
                className="text-left text-slate-700"
              >
                Fisioterapis
              </button>

              <button
                onClick={() => scrollToSection("education")}
                className="text-left text-slate-700"
              >
                Edukasi
              </button>

              <button
                onClick={() => {
                  navigate("/team");
                  setMobileMenuOpen(false);
                }}
                className="text-left text-slate-700"
              >
                Tim Kami
              </button>

              <button
                onClick={() => {
                  navigate("/team/expert");
                  setMobileMenuOpen(false);
                }}
                className="text-left text-base text-slate-500 pl-4"
              >
                Expert Team
              </button>

              <button
                onClick={() => {
                  navigate("/team/staff");
                  setMobileMenuOpen(false);
                }}
                className="text-left text-base text-slate-500 pl-4"
              >
                Staff Mahasiswa
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              <button
                onClick={() => navigate("/login")}
                className="w-full py-4 bg-slate-100 text-slate-800 font-bold rounded-xl active:scale-95"
              >
                Masuk
              </button>

              <button
                onClick={() => navigate("/register/physio")}
                className="w-full py-4 bg-blue-800 text-white font-bold rounded-xl active:scale-95 shadow-sm"
              >
                Daftar Fisioterapis
              </button>
            </div>
          </div>
        )}
      </header>

      <section className="pt-32 pb-20 lg:pt-40 lg:pb-24 px-6 text-center overflow-hidden">
        <div className={`max-w-4xl mx-auto ${fadeClass(true)}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 mb-8 shadow-sm tracking-wide uppercase">
            <Sparkles size={14} className="text-blue-800" />
            Screening postur cerdas berbasis AI
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-[80px] font-['Instrument_Serif',serif] font-normal leading-[1.05] text-slate-900 tracking-tight mb-8">
            Deteksi Postur Anak <br className="hidden md:block" />
            dengan{" "}
            <em className="italic bg-clip-text text-transparent bg-gradient-to-br from-blue-800 to-slate-600 font-bold">
              Bantuan AI.
            </em>
          </h1>

          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
            Posturely membantu orang tua memantau kesehatan muskuloskeletal anak
            sejak dini, dan terhubung dengan fisioterapis profesional saat
            dibutuhkan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto bg-blue-800 text-white px-8 py-3.5 rounded-xl font-bold text-[15px] hover:bg-blue-900 transition-colors active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
              Mulai Screening <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate("/physiotherapists/map")}
              className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl font-bold text-[15px] hover:bg-slate-100 transition-colors active:scale-95 flex items-center justify-center gap-2 shadow-sm"
            >
              <Map size={18} /> Cari Fisioterapis
            </button>
          </div>
        </div>
      </section>

      <section
        ref={featureRef}
        id="features"
        className={`py-12 bg-white border-y border-slate-200 overflow-hidden ${fadeClass(
          featureInView
        )}`}
      >
        <div className="flex animate-marquee gap-6 px-6">
          {marqueeFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="w-[320px] sm:w-[360px] shrink-0 bg-white border border-slate-200 p-8 rounded-3xl hover:border-slate-300 transition-colors shadow-sm flex flex-col cursor-default"
            >
              <div
                className={`w-12 h-12 ${feat.bg} border ${feat.border} ${feat.color} rounded-2xl flex items-center justify-center mb-6`}
              >
                {feat.icon}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {feat.title}
              </h3>

              <p className="text-slate-500 font-medium leading-relaxed text-[15px]">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={howRef}
        id="how-it-works"
        className={`py-24 lg:py-32 px-6 bg-slate-900 text-white ${fadeClass(
          howInView
        )}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 lg:mb-24 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 block">
              Langkah-langkah
            </span>

            <h2 className="text-5xl md:text-6xl font-['Instrument_Serif',serif] font-normal tracking-tight mb-6">
              Cara kerja <em className="italic text-blue-400">Posturely</em>
            </h2>

            <p className="text-[17px] text-slate-400 font-medium leading-relaxed">
              Sederhana, bisa dilakukan di rumah. Didukung teknologi AI yang
              dirancang bersama para ahli fisioterapi.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 relative">
            <div className="hidden lg:block absolute top-6 left-12 right-12 h-px bg-slate-800 -z-10" />

            {howSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col gap-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-bold text-blue-400 shadow-xl shadow-slate-900">
                  {idx + 1}
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight">
                  {step.title}
                </h3>

                <p className="text-slate-400 leading-relaxed text-[15px] font-medium">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={physioRef}
        id="physiotherapists"
        className={`py-24 lg:py-32 px-6 border-b border-slate-200 bg-slate-50 ${fadeClass(
          physioInView
        )}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">
                Direktori
              </span>

              <h2 className="text-5xl md:text-6xl font-['Instrument_Serif',serif] font-normal tracking-tight text-slate-900 mb-3">
                Fisioterapis{" "}
                <em className="italic text-blue-800">terpercaya.</em>
              </h2>

              <p className="text-[17px] text-slate-500 font-medium">
                Spesialis yang siap membantu screening postur anak Anda.
              </p>
            </div>

            <button
              onClick={() => navigate("/physiotherapists/map")}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-800 px-5 py-3 rounded-xl text-[14px] font-bold hover:bg-slate-100 transition-colors active:scale-95 shrink-0 shadow-sm"
            >
              <Map size={16} /> Lihat di Peta
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Cari nama klinik/fisio..."
                value={searchPhysio}
                onChange={(e) => setSearchPhysio(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-800 text-[15px] font-medium transition-colors shadow-sm"
              />
            </div>

            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-800 text-[15px] font-medium cursor-pointer transition-colors shadow-sm"
            >
              <option value="">Semua Kota</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-800 text-[15px] font-medium cursor-pointer transition-colors shadow-sm"
            >
              <option value="">Semua Spesialisasi</option>
              {specialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhysios.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col hover:border-blue-800/40 transition-colors cursor-pointer group shadow-sm"
                onClick={() =>
                  String(p.id).startsWith("demo")
                    ? null
                    : navigate(`/physiotherapists/${p.id}`)
                }
              >
                <div className="flex gap-4 mb-6 items-start">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden text-2xl font-bold text-slate-300">
                    {p.photo_url || p.photo ? (
                      <img
                        src={p.photo_url || p.photo}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      p.name?.charAt(0) || "F"
                    )}
                  </div>

                  <div className="min-w-0 pt-1">
                    <h3 className="font-bold text-slate-900 text-lg truncate group-hover:text-blue-800 transition-colors">
                      {p.name}
                    </h3>

                    {p.is_verified && (
                      <div className="flex items-center gap-1.5 text-emerald-700 mt-1.5 mb-2.5">
                        <CheckCircle2 size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Terverifikasi
                        </span>
                      </div>
                    )}

                    {p.specialty && (
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 rounded-lg text-[10px] font-bold uppercase tracking-wider truncate max-w-full">
                        {p.specialty}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                  <div className="flex items-center gap-2.5 text-[14px] font-medium text-slate-500">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="truncate">
                      {p.city || "Lokasi tidak tersedia"}
                    </span>
                  </div>

                  {p.consultation_fee && (
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-[14px]">
                      <span className="text-slate-500 font-medium">
                        Tarif Konsultasi
                      </span>

                      <strong className="text-slate-900 font-extrabold">
                        Rp {Number(p.consultation_fee).toLocaleString("id-ID")}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="education"
        ref={articleRef}
        className={`py-24 lg:py-32 px-6 bg-white ${fadeClass(articleInView)}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">
                Edukasi
              </span>

              <h2 className="text-5xl md:text-6xl font-['Instrument_Serif',serif] font-normal tracking-tight text-slate-900 mb-3">
                Artikel postur{" "}
                <em className="italic text-blue-800">untuk orang tua.</em>
              </h2>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-[15px] font-bold text-slate-700 hover:text-blue-800 transition-colors"
            >
              Baca semua <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {articleSource.map((article) => (
              <article
                key={article.id}
                onClick={() =>
                  String(article.id).startsWith("demo")
                    ? null
                    : navigate(`/education/${article.slug}`)
                }
                className="bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
              >
                <span className="text-[10px] font-bold text-blue-800 bg-blue-100 border border-blue-200 uppercase tracking-widest mb-5 w-max px-3 py-1.5 rounded-lg">
                  {article.category?.name || "Edukasi"}
                </span>

                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug line-clamp-2 group-hover:text-blue-800 transition-colors">
                  {article.title}
                </h3>

                <p className="text-[15px] text-slate-500 font-medium leading-relaxed line-clamp-3 mb-2">
                  {article.excerpt ||
                    (article.content
                      ? `${article.content.substring(0, 130)}…`
                      : "")}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={ctaRef}
        className={`py-24 lg:py-32 px-6 bg-blue-900 text-white text-center ${fadeClass(
          ctaInView
        )}`}
      >
        <div className="max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-6 block">
            Mulai Sekarang
          </span>

          <h2 className="text-5xl md:text-7xl font-['Instrument_Serif',serif] font-normal tracking-tight mb-6 leading-[1.05]">
            Beri ruang pada anak untuk <br className="hidden md:block" />{" "}
            <em className="italic text-blue-300">tumbuh dengan sehat.</em>
          </h2>

          <p className="text-blue-100 text-lg font-medium mb-12 max-w-xl mx-auto leading-relaxed">
            Bergabung dan lihat bagaimana Posturely membantu Anda memahami
            postur anak dengan lebih mudah.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-bold text-[16px] hover:bg-slate-50 transition-colors active:scale-95 shadow-xl"
            >
              Daftar sebagai Orang Tua
            </button>

            <button
              onClick={() => navigate("/register/physio")}
              className="bg-transparent border border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-[16px] hover:bg-white/10 transition-colors active:scale-95"
            >
              Daftar Fisioterapis
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-400 py-16 px-6 font-medium">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          <div className="md:col-span-6">
            <div
              className="flex items-center gap-2.5 text-white mb-6 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img
                src="/logo-favicon-posturely.svg"
                alt="Posturely Logo"
                className="w-8 h-8 brightness-0 invert"
              />

              <span className="text-2xl font-bold tracking-tight">
                Posturely
              </span>
            </div>

            <p className="text-[15px] leading-relaxed max-w-sm text-slate-500">
              Platform screening postur anak berbasis AI yang membantu orang tua
              berkolaborasi dengan fisioterapis untuk tumbuh kembang yang
              optimal.
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">
              Tentang
            </h4>

            <div className="flex flex-col gap-4 text-[15px]">
              <button
                onClick={() => scrollToSection("features")}
                className="text-left hover:text-white transition-colors w-max"
              >
                Fitur Platform
              </button>

              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-left hover:text-white transition-colors w-max"
              >
                Cara Kerja AI
              </button>

              <button
                onClick={() => navigate("/team")}
                className="text-left hover:text-white transition-colors w-max"
              >
                Tim Kami
              </button>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">
              Layanan
            </h4>

            <div className="flex flex-col gap-4 text-[15px]">
              <button
                onClick={() => navigate("/login")}
                className="text-left hover:text-white transition-colors w-max"
              >
                Screening Postur
              </button>

              <button
                onClick={() => scrollToSection("education")}
                className="text-left hover:text-white transition-colors w-max"
              >
                Edukasi Postur
              </button>

              <button
                onClick={() => scrollToSection("physiotherapists")}
                className="text-left hover:text-white transition-colors w-max"
              >
                Direktori Fisioterapis
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-800 flex justify-center text-[13px] text-slate-500">
          <p>© 2026 Posturely. Semua hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}