import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Users,
  BookOpen,
  ArrowRight,
  MapPin,
  ChevronRight,
  HeartHandshake,
  Brain,
  ShieldCheck,
  CheckCircle2,
  Zap,
  UserCheck,
  Menu,
  X,
  Search,
  Map,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import api from "../utils/axios";
import AccessibilityWidget from "../components/AccessibilityWidget";

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
      { threshold: 0.15, ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
}

function LandingPage() {
  const navigate = useNavigate();
  const [physios, setPhysios] = useState([]);
  const [articles, setArticles] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const sliderIntervalRef = useRef(null);

  const [searchPhysio, setSearchPhysio] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");

  const features = [
    {
      icon: Activity,
      title: "Deteksi Postur AI",
      description:
        "Analisis postur anak dengan kecerdasan buatan, hasil screening dalam hitungan detik.",
    },
    {
      icon: Users,
      title: "Konsultasi Fisioterapis",
      description:
        "Terhubung dengan fisioterapis anak terverifikasi untuk rekomendasi yang lebih personal.",
    },
    {
      icon: BookOpen,
      title: "Edukasi Terpercaya",
      description:
        "Konten edukasi yang disusun bersama fisioterapis, mudah dipahami orang tua.",
    },
  ];

  const whyCards = [
    {
      icon: Brain,
      title: "Pengaruh ke tumbuh kembang",
      text: "Postur yang kurang baik dapat memengaruhi perkembangan tulang, otot, dan kepercayaan diri anak.",
    },
    {
      icon: ShieldCheck,
      title: "Deteksi lebih dini",
      text: "Semakin dini terdeteksi, semakin mudah dicegah sebelum menimbulkan keluhan nyeri atau kelainan bentuk.",
    },
    {
      icon: HeartHandshake,
      title: "Peran orang tua & fisio",
      text: "Kolaborasi orang tua dan fisioterapis membantu anak membangun kebiasaan postur yang sehat.",
    },
  ];

  const howSteps = [
    {
      title: "Foto postur anak",
      text: "Orang tua mengambil foto postur anak sesuai panduan aplikasi dari berbagai sudut.",
    },
    {
      title: "Analisis oleh AI",
      text: "Sistem AI Posturely menganalisis sudut dan simetri tubuh anak secara otomatis.",
    },
    {
      title: "Hasil & ringkasan",
      text: "Orang tua melihat skor postur, kategori risiko, dan ringkasan mudah dibaca dalam dashboard.",
    },
    {
      title: "Rekomendasi & rujukan",
      text: "Jika perlu, orang tua dapat merujuk ke fisioterapis untuk penilaian lebih lanjut dan program latihan.",
    },
  ];

  const parentsItems = [
    { icon: CheckCircle2, text: "Screening postur anak berkala dengan AI" },
    { icon: CheckCircle2, text: "Pantau riwayat hasil screening setiap anak" },
    { icon: CheckCircle2, text: "Dapatkan rekomendasi aktivitas dari fisioterapis" },
    { icon: CheckCircle2, text: "Rujuk langsung ke fisioterapis anak terdekat" },
  ];

  const physioItems = [
    { icon: CheckCircle2, text: "Menerima rujukan screening dari orang tua" },
    { icon: CheckCircle2, text: "Melihat hasil analisis AI dan foto postur" },
    { icon: CheckCircle2, text: "Memberikan rekomendasi latihan dan edukasi" },
    { icon: CheckCircle2, text: "Membangun profil praktik dan jangkauan pasien" },
  ];

  const [whyRef, whyInView] = useInView();
  const [howRef, howInView] = useInView();
  const [featureRef, featureInView] = useInView();
  const [roleRef, roleInView] = useInView();
  const [articleRef, articleInView] = useInView();
  const [physioRef, physioInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        const physioRes = await api.get("/physiotherapists");
        setPhysios(physioRes.data.data || []);

        const articleRes = await api.get("/articles", { params: { limit: 6 } });
        setArticles(articleRes.data.data || []);
      } catch (err) {
        console.error("Error loading preview data:", err);
      }
    };

    loadPreviewData();
  }, []);

  useEffect(() => {
    if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);

    sliderIntervalRef.current = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % howSteps.length);
    }, 6000);

    return () => {
      if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
    };
  }, [howSteps.length]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const nextStep = () => setCurrentStep((prev) => (prev + 1) % howSteps.length);
  const prevStep = () => setCurrentStep((prev) => (prev - 1 + howSteps.length) % howSteps.length);

  const filteredPhysios = physios.filter((p) => {
    const matchName = p.name?.toLowerCase().includes(searchPhysio.toLowerCase());
    const matchCity = filterCity ? p.city?.toLowerCase().includes(filterCity.toLowerCase()) : true;
    const matchSpec = filterSpecialty ? p.specialty?.toLowerCase().includes(filterSpecialty.toLowerCase()) : true;
    return matchName && matchCity && matchSpec;
  });

  const cities = [...new Set(physios.map((p) => p.city).filter(Boolean))];
  const specialties = [...new Set(physios.map((p) => p.specialty).filter(Boolean))];
  const articleList = articles.slice(0, 6);

  const openInGoogleMaps = (latitude, longitude, clinicName) => {
    if (!latitude || !longitude) {
      alert("Koordinat klinik tidak tersedia");
      return;
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      alert("Koordinat klinik tidak valid");
      return;
    }
    const label = encodeURIComponent(clinicName || "Klinik Fisioterapi");
    const url = `http://googleusercontent.com/maps.google.com/maps?q=${lat},${lng}&label=${label}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const fadeClass = (inView) =>
    `transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-[100] bg-slate-50/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto h-[65px] px-6 flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 font-bold text-xl text-slate-900 cursor-pointer hover:opacity-85 transition-opacity" onClick={() => navigate("/")}>
            <img src="/logo-posturely.svg" alt="Posturely Logo" className="h-[65px] w-auto max-w-[160px] object-contain block" />
          </div>

          <nav className="hidden md:flex items-center gap-3">
            {["Tentang", "Edukasi", "Cara Kerja", "Untuk Siapa"].map((item, idx) => {
              const ids = ["about", "education", "how-it-works", "for-whom"];
              return (
                <button
                  key={idx}
                  onClick={() => scrollToSection(ids[idx])}
                  className="px-3.5 py-1.5 rounded-full text-[0.9rem] text-slate-600 hover:bg-slate-100 hover:text-sky-600 transition-all focus:outline-none"
                >
                  {item}
                </button>
              );
            })}

            {/* ✅ INJEKSI MENU TIM KAMI (Dropdown) */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => navigate("/team")}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[0.9rem] text-slate-600 hover:bg-slate-100 hover:text-sky-600 transition-all focus:outline-none"
              >
                Tim Kami
                <span className="text-[0.7rem] transition-transform group-hover:rotate-180">▾</span>
              </button>
              <div className="invisible absolute left-1/2 top-full mt-1 min-w-[180px] -translate-x-1/2 translate-y-2 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg shadow-slate-900/10 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <button onClick={() => navigate("/team")} className="block w-full rounded-lg px-4 py-2.5 text-left text-[0.85rem] font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600">Semua Tim</button>
                <button onClick={() => navigate("/team/experts")} className="block w-full rounded-lg px-4 py-2.5 text-left text-[0.85rem] font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600">Expert & Advisor Team</button>
                <button onClick={() => navigate("/team/core")} className="block w-full rounded-lg px-4 py-2.5 text-left text-[0.85rem] font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600">Core Development Team</button>
                <button onClick={() => navigate("/team/founders")}className="block w-full rounded-lg px-4 py-2.5 text-left text-[0.85rem] font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600">Founding Team</button>
              </div>
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="px-4 py-2 rounded-full text-[0.9rem] text-slate-600 hover:text-sky-600 transition-colors focus:outline-none">
              Masuk
            </button>
            <button onClick={() => navigate("/register/physio")} className="px-4 py-2 rounded-full bg-sky-500 text-white text-[0.9rem] font-medium shadow-lg shadow-sky-500/30 hover:bg-sky-600 hover:-translate-y-0.5 transition-all focus:outline-none">
              Daftar Fisioterapis
            </button>
          </div>

          <button className="md:hidden p-1.5 text-slate-700 focus:outline-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden flex flex-col gap-2 p-4 pb-5 bg-slate-50 border-t border-slate-200">
            {["Tentang", "Edukasi", "Cara Kerja", "Untuk Siapa"].map((item, idx) => {
              const ids = ["about", "education", "how-it-works", "for-whom"];
              return (
                <button
                  key={idx}
                  onClick={() => scrollToSection(ids[idx])}
                  className="py-3 text-left text-[0.95rem] text-slate-700 hover:text-sky-600 transition-colors focus:outline-none"
                >
                  {item}
                </button>
              );
            })}
            
            {/* ✅ INJEKSI MENU TIM KAMI (Mobile) */}
            <div className="flex flex-col border-l-2 border-slate-200 ml-2 mt-1 mb-2">
               <button onClick={() => { navigate("/team"); setMobileMenuOpen(false); }} className="py-2.5 text-left text-[0.95rem] text-slate-700 hover:text-sky-600 pl-3">Tim Kami</button>
               <button onClick={() => { navigate("/team/experts"); setMobileMenuOpen(false); }} className="py-2 text-left text-[0.85rem] text-slate-500 hover:text-sky-600 pl-6">Expert & Advisor Team</button>
               <button onClick={() => { navigate("/team/core"); setMobileMenuOpen(false); }} className="py-2 text-left text-[0.85rem] text-slate-500 hover:text-sky-600 pl-6">Core Development Team</button>
               <button onClick={() => { navigate("/team/founders"); setMobileMenuOpen(false); }} className="py-2 text-left text-[0.85rem] text-slate-500 hover:text-sky-600 pl-6">Founding Team</button>
            </div>

            <hr className="border-t border-slate-200 my-2" />
            <button
              onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
              className="px-4 py-2.5 rounded-full border border-slate-300 bg-white text-slate-700 text-[0.9rem] hover:bg-slate-100 transition-all focus:outline-none text-center"
            >
              Masuk
            </button>
            <button
              onClick={() => { navigate("/register/physio"); setMobileMenuOpen(false); }}
              className="px-4 py-2.5 rounded-full border border-sky-500 bg-sky-500 text-white text-[0.9rem] hover:bg-sky-600 transition-all focus:outline-none text-center"
            >
              Daftar Fisioterapis
            </button>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section id="about" className="relative px-6 pt-[4.5rem] pb-16 bg-gradient-to-b from-slate-100 via-white to-white overflow-hidden">
        {/* Accents */}
        <div className="absolute w-[220px] h-[220px] rounded-full bg-sky-400/20 blur-3xl -top-20 -left-10 pointer-events-none" />
        <div className="absolute w-[220px] h-[220px] rounded-full bg-sky-400/20 blur-3xl -bottom-20 -right-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center relative z-10">
          <div className="flex flex-col gap-6">
            <p className="text-[0.85rem] font-semibold tracking-[0.08em] uppercase text-sky-600 m-0">
              Screening postur anak yang praktis
            </p>
            <h1 className="text-[clamp(2.4rem,4vw,3rem)] leading-[1.2] font-bold text-slate-900 m-0">
              Deteksi Postur Anak dengan Bantuan AI
            </h1>
            <p className="text-base text-slate-600 max-w-[34rem] m-0">
              Posturely membantu orang tua memantau kesehatan muskuloskeletal anak
              sejak dini, dan terhubung dengan fisioterapis anak saat dibutuhkan.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-full bg-sky-500 text-white text-[0.95rem] font-medium hover:bg-sky-600 hover:-translate-y-0.5 shadow-lg shadow-sky-500/40 transition-all w-full sm:w-auto"
              >
                Mulai Screening <ArrowRight size={18} strokeWidth={2} />
              </button>
              <button
                onClick={() => navigate("/map")}
                className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-700 text-[0.95rem] font-medium border border-slate-300 hover:border-sky-500 hover:text-sky-600 transition-all w-full sm:w-auto"
              >
                <Map size={18} strokeWidth={2} /> Cari Fisioterapis di Peta
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mt-3 text-[0.85rem] text-slate-600">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100">
                <Zap size={16} strokeWidth={2} /> Screening bisa dilakukan di rumah
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100">
                <UserCheck size={16} strokeWidth={2} /> Fisioterapis anak terverifikasi
              </span>
            </div>

            {/* Visual Hero Mobile */}
            <div className="lg:hidden flex justify-center mt-6">
              <div className="w-full max-w-[360px] p-6 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-400/20 flex flex-col gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 text-sky-600 flex items-center justify-center">
                  <Activity size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[0.8rem] uppercase tracking-wider text-slate-400 m-0 mb-1">Contoh Hasil Screening</p>
                  <p className="text-[1.1rem] font-semibold text-slate-900 m-0">Skor Postur: 82</p>
                  <p className="text-[0.85rem] text-amber-600 mt-0.5 mb-2.5">Kategori: Perlu dipantau</p>
                  <ul className="text-[0.85rem] text-slate-600 list-disc pl-4 space-y-1 m-0">
                    <li>Ringkasan singkat untuk orang tua</li>
                    <li>Area tubuh yang perlu diperhatikan</li>
                    <li>Rekomendasi langkah selanjutnya</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Hero Desktop */}
          <div className="hidden lg:flex justify-center">
            <div className="w-full max-w-[360px] p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/10 flex flex-col gap-4">
              <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-sky-100 to-sky-200 text-sky-600 flex items-center justify-center">
                <Activity size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[0.8rem] uppercase tracking-wider text-slate-400 m-0 mb-1">Contoh Hasil Screening</p>
                <p className="text-[1.1rem] font-semibold text-slate-900 m-0">Skor Postur: 82</p>
                <p className="text-[0.85rem] text-amber-600 mt-0.5 mb-2.5">Kategori: Perlu dipantau</p>
                <ul className="text-[0.85rem] text-slate-600 list-disc pl-4 space-y-1 m-0">
                  <li>Ringkasan singkat untuk orang tua</li>
                  <li>Area tubuh yang perlu diperhatikan</li>
                  <li>Rekomendasi langkah selanjutnya</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY POSTURE SECTION */}
      <section id="why-posture" ref={whyRef} className={`relative py-16 px-6 bg-slate-50 overflow-hidden ${fadeClass(whyInView)}`}>
        <div className="absolute w-[200px] h-[200px] rounded-full bg-sky-400/10 blur-2xl top-10 -left-20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-[1.9rem] font-bold text-slate-900 mb-2">Kenapa Postur Anak Itu Penting?</h2>
            <p className="text-[0.98rem] text-slate-600 m-0">
              Postur yang baik bukan hanya soal berdiri tegak, tapi juga berpengaruh pada tumbuh kembang, kenyamanan, dan rasa percaya diri anak di masa depan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyCards.map((item, idx) => (
              <div key={idx} className="p-6 bg-white border border-slate-200 shadow-lg shadow-slate-900/5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-100 cursor-pointer">
                <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-sky-100 to-sky-200 text-sky-600 flex items-center justify-center mb-3">
                  <item.icon size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-[1.05rem] font-semibold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-[0.95rem] text-slate-600 m-0">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" ref={howRef} className={`relative py-16 px-6 bg-white overflow-hidden ${fadeClass(howInView)}`}>
        <div className="absolute w-[200px] h-[200px] rounded-full bg-sky-400/10 blur-2xl bottom-5 -right-20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-[1.9rem] font-bold text-slate-900 mb-2">Cara Kerja Posturely</h2>
            <p className="text-[0.98rem] text-slate-600 m-0">
              Alur yang sama dapat diakses dari rumah, dengan dukungan AI dan fisioterapis anak ketika dibutuhkan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
            <ol className="relative m-0 p-0 list-none space-y-6">
              {howSteps.map((step, idx) => (
                <li key={idx} className="relative flex items-start gap-4">
                  <div className="relative z-10 w-[30px] h-[30px] rounded-full bg-white border-2 border-sky-500 flex items-center justify-center text-sky-600 font-semibold text-[0.8rem] shrink-0">
                    {idx + 1}
                  </div>
                  {idx !== howSteps.length - 1 && (
                    <div className="absolute left-[15px] top-[30px] w-[2px] h-[calc(100%+24px-30px)] bg-slate-200" />
                  )}
                  <div className="flex-1 pb-2">
                    <h3 className="text-[1rem] font-semibold text-slate-900 mb-1">{step.title}</h3>
                    <p className="text-[0.9rem] text-slate-600 m-0">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="flex flex-col items-center gap-5">
              <div className="w-full max-w-[520px] p-7 text-center rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-900/5">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[0.75rem] font-semibold uppercase tracking-wider mb-3">
                  Step {currentStep + 1} dari 4
                </span>
                <h3 className="text-[1.25rem] font-semibold text-slate-900 mb-2">{howSteps[currentStep].title}</h3>
                <p className="text-[0.95rem] text-slate-600 mb-6">{howSteps[currentStep].text}</p>

                <div className="flex justify-center gap-3">
                  <button onClick={prevStep} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-300 bg-white text-slate-700 text-[0.88rem] hover:bg-slate-100 hover:border-sky-500 transition-all focus:outline-none">
                    <ChevronLeft size={18} strokeWidth={2} /> Sebelumnya
                  </button>
                  <button onClick={nextStep} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-sky-500 bg-sky-500 text-white text-[0.88rem] hover:bg-sky-600 transition-all focus:outline-none">
                    Selanjutnya <ChevronRight size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                {howSteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-[10px] rounded-full transition-all duration-300 p-0 border-none ${
                      currentStep === idx ? "w-[24px] bg-sky-500" : "w-[10px] bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" ref={featureRef} className={`relative py-16 px-6 bg-slate-50 overflow-hidden ${fadeClass(featureInView)}`}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-[1.9rem] font-bold text-slate-900 mb-2">Fitur Unggulan Posturely</h2>
            <p className="text-[0.98rem] text-slate-600 m-0">
              Satu platform yang menghubungkan orang tua, anak, dan fisioterapis melalui screening postur yang mudah dan terstruktur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="p-6 bg-white border border-slate-200 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-100 cursor-pointer">
                <div className="w-[44px] h-[44px] rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 text-sky-600 flex items-center justify-center mb-3">
                  <feature.icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-[1.05rem] font-semibold text-slate-900 mb-1.5">{feature.title}</h3>
                <p className="text-[0.95rem] text-slate-600 m-0">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WHOM SECTION */}
      <section id="for-whom" ref={roleRef} className={`relative py-16 px-6 bg-white overflow-hidden ${fadeClass(roleInView)}`}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-[1.9rem] font-bold text-slate-900 mb-2">Untuk Orang Tua & Fisioterapis</h2>
            <p className="text-[0.98rem] text-slate-600 m-0">Posturely membantu dua pihak penting ini berkolaborasi untuk anak.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Orang Tua Card */}
            <div className="flex flex-col justify-between gap-4 p-8 rounded-2xl border border-slate-200 bg-white min-h-[320px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-100 cursor-pointer">
              <div>
                <div className="w-[56px] h-[56px] rounded-2xl bg-slate-100 text-sky-600 flex items-center justify-center mb-2">
                  <Users size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-[1.15rem] font-bold text-slate-900 mb-3">Untuk Orang Tua</h3>
                <ul className="space-y-2 text-[0.94rem] text-slate-700">
                  {parentsItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <item.icon size={18} strokeWidth={2} className="shrink-0 text-sky-500 mt-[2px]" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => navigate("/login")} className="mt-4 w-full py-3.5 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 hover:-translate-y-0.5 transition-all">
                Masuk sebagai Orang Tua
              </button>
            </div>

            {/* Fisioterapis Card */}
            <div className="flex flex-col justify-between gap-4 p-8 rounded-2xl border border-transparent bg-gradient-to-br from-slate-900 to-sky-600 text-white min-h-[320px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/30 cursor-pointer">
              <div>
                <div className="w-[56px] h-[56px] rounded-2xl bg-white/20 text-white flex items-center justify-center mb-2">
                  <HeartHandshake size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-[1.15rem] font-bold text-white mb-3">Untuk Fisioterapis</h3>
                <ul className="space-y-2 text-[0.94rem] text-slate-100">
                  {physioItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <item.icon size={18} strokeWidth={2} className="shrink-0 text-sky-300 mt-[2px]" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => navigate("/register/physio")} className="mt-4 w-full py-3.5 rounded-full bg-white text-sky-600 font-medium hover:bg-slate-50 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                Daftar sebagai Fisioterapis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PHYSIOTHERAPISTS SECTION */}
      {physios.length > 0 && (
        <section ref={physioRef} className={`relative py-16 px-6 bg-slate-50 overflow-hidden ${fadeClass(physioInView)}`}>
          <div className="absolute w-[200px] h-[200px] rounded-full bg-sky-400/10 blur-2xl top-10 -left-20 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
              <div>
                <h2 className="text-[1.9rem] font-bold text-slate-900 mb-2">Fisioterapis Terpercaya</h2>
                <p className="text-[0.98rem] text-slate-600 m-0">Profil fisioterapis yang telah diverifikasi dan aktif menerima konsultasi.</p>
              </div>
              <button onClick={() => navigate("/map")} className="inline-flex items-center gap-1.5 text-[0.95rem] font-medium text-sky-600 hover:text-sky-500 transition-colors">
                <Map size={18} strokeWidth={2} /> Lihat di peta <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8 p-4 md:p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex-1 min-w-[240px] flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-300 bg-white">
                <Search size={18} strokeWidth={2} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama fisioterapis..."
                  value={searchPhysio}
                  onChange={(e) => setSearchPhysio(e.target.value)}
                  className="w-full border-none bg-transparent outline-none text-[0.9rem] text-slate-700"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.75rem] uppercase tracking-wider text-slate-500 pl-2">Kota</span>
                  <div className="relative border border-slate-300 bg-white rounded-full px-3 py-1.5 min-w-[160px]">
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="w-full border-none bg-transparent outline-none text-[0.88rem] text-slate-700 appearance-none pr-6 cursor-pointer"
                    >
                      <option value="">Semua</option>
                      {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.8rem] text-slate-500 pointer-events-none">▾</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[0.75rem] uppercase tracking-wider text-slate-500 pl-2">Spesialisasi</span>
                  <div className="relative border border-slate-300 bg-white rounded-full px-3 py-1.5 min-w-[160px]">
                    <select
                      value={filterSpecialty}
                      onChange={(e) => setFilterSpecialty(e.target.value)}
                      className="w-full border-none bg-transparent outline-none text-[0.88rem] text-slate-700 appearance-none pr-6 cursor-pointer"
                    >
                      <option value="">Semua</option>
                      {specialties.map((spec) => <option key={spec} value={spec}>{spec}</option>)}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.8rem] text-slate-500 pointer-events-none">▾</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filteredPhysios.slice(0, 6).map((physio) => {
                const isVerified = physio.is_verified === true && physio.is_active === true;
                return (
                  <div
                    key={physio.id}
                    className="flex flex-col p-5 bg-white border border-slate-200 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-100 cursor-pointer"
                    onClick={() => navigate(`/physiotherapists/${physio.id}`)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {physio.photo_url ? (
                        <img src={physio.photo_url} alt={physio.name} className="w-[52px] h-[52px] rounded-xl object-cover border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center bg-gradient-to-br from-sky-100 to-sky-200 text-[1.1rem] font-semibold text-sky-600 shrink-0">
                          {physio.name?.charAt(0)?.toUpperCase() || "F"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="m-0 text-[1rem] font-semibold text-slate-900 truncate">{physio.name}</h3>
                        <p className="m-0 text-[0.8rem] text-slate-500 truncate mt-0.5">{physio.clinic_name || "Praktik fisioterapi"}</p>
                      </div>
                    </div>

                    {isVerified && (
                      <span className="inline-flex items-center w-max gap-1 px-2 py-1 rounded-full border border-emerald-300 bg-emerald-100 text-emerald-800 text-[0.72rem] font-semibold mt-1 mb-2">
                        <ShieldCheck size={14} strokeWidth={1.8} /> Fisioterapis terverifikasi
                      </span>
                    )}

                    {physio.specialty && (
                      <span className="inline-block w-max px-2.5 py-1 rounded-full bg-blue-100 text-sky-700 text-[0.75rem] font-medium mb-2">
                        {physio.specialty}
                      </span>
                    )}

                    {(physio.bio_short || physio.bio) && (
                      <p className="text-[0.85rem] text-slate-600 leading-[1.45] mt-1 mb-3 line-clamp-2">
                        {physio.bio_short || physio.bio}
                      </p>
                    )}

                    <div className="flex justify-between items-center gap-2 text-[0.8rem] text-slate-500 mt-auto">
                      <div className="inline-flex items-center gap-1">
                        <MapPin size={14} strokeWidth={1.5} /> <span className="truncate">{physio.city || "Lokasi tidak tersedia"}</span>
                      </div>
                      {physio.consultation_fee && (
                        <div className="flex flex-col items-end gap-[1px]">
                          <span className="text-[0.7rem] text-slate-400">Tarif konsultasi</span>
                          <strong className="text-[0.88rem] text-slate-900 font-semibold">Rp {Number(physio.consultation_fee).toLocaleString("id-ID")}</strong>
                        </div>
                      )}
                    </div>

                    {/* Google Maps Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInGoogleMaps(physio.latitude, physio.longitude, physio.clinic_name);
                      }}
                      className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[0.88rem] font-medium transition-all shadow-lg shadow-sky-500/25 hover:-translate-y-0.5"
                    >
                      <MapPin size={16} strokeWidth={2} /> Buka Lokasi <ExternalLink size={14} strokeWidth={2} />
                    </button>
                  </div>
                );
              })}
            </div>

            {filteredPhysios.length === 0 && (
              <p className="text-center p-8 text-slate-500">Tidak ada fisioterapis yang cocok dengan filter Anda.</p>
            )}
          </div>
        </section>
      )}

      {/* EDUCATION SECTION */}
      {articleList.length > 0 && (
        <section id="education" ref={articleRef} className={`relative py-16 px-6 bg-white overflow-hidden ${fadeClass(articleInView)}`}>
          <div className="absolute w-[200px] h-[200px] rounded-full bg-sky-400/10 blur-2xl bottom-5 -right-20 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
              <div>
                <h2 className="text-[1.9rem] font-bold text-slate-900 mb-2">Edukasi Postur Anak</h2>
                <p className="text-[0.98rem] text-slate-600 m-0">Artikel publik. Untuk konten lengkap, gunakan dashboard setelah masuk.</p>
              </div>
              <button onClick={() => navigate("/login")} className="inline-flex items-center gap-1.5 text-[0.95rem] font-medium text-sky-600 hover:text-sky-500 transition-colors">
                Lihat edukasi lainnya <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {articleList.map((article) => (
                <article
                  key={article.id}
                  className="flex flex-col p-5 bg-white border border-slate-200 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-100 cursor-pointer"
                  onClick={() => navigate(`/education/${article.slug}`)}
                >
                  <span className="inline-block w-max px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[0.75rem] font-medium mb-3">
                    {article.category?.name || "Artikel"}
                  </span>
                  <h3 className="m-0 text-[1rem] font-bold text-slate-900 mb-2 line-clamp-2 leading-snug">{article.title}</h3>
                  <p className="m-0 text-[0.9rem] text-slate-600 line-clamp-3">
                    {article.excerpt || (article.content ? article.content.substring(0, 130) + "…" : "")}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA SECTION */}
      <section ref={ctaRef} className={`py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-950 text-white text-center ${fadeClass(ctaInView)}`}>
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-[1.9rem] font-bold m-0">Mulai Screening Postur Anak Secara Gratis</h2>
          <p className="text-[0.96rem] max-w-[42rem] m-0 text-slate-300">
            Buat akun orang tua, lakukan screening pertama, dan lihat bagaimana Posturely membantu Anda memahami postur anak dengan lebih sederhana.
          </p>
          <div className="flex flex-wrap justify-center gap-3 w-full sm:w-auto">
            <button onClick={() => navigate("/login")} className="px-6 py-3 rounded-full bg-white text-slate-900 font-medium hover:-translate-y-0.5 transition-transform shadow-lg w-full sm:w-auto">
              Daftar sebagai Orang Tua
            </button>
            <button onClick={() => navigate("/register/physio")} className="px-6 py-3 rounded-full bg-transparent border border-white/50 text-white font-medium hover:bg-white/10 hover:border-white transition-all w-full sm:w-auto">
              Daftar sebagai Fisioterapis
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 font-bold text-[1.3rem] text-slate-50 cursor-pointer" onClick={() => scrollToSection("top")}>
              <img src="/logo-posturely.svg" alt="Posturely Logo" className="h-[50px] w-auto object-contain brightness-0 invert opacity-90" />
            </div>
            <p className="mt-4 text-[0.92rem] leading-relaxed text-slate-400 max-w-sm">
              Posturely adalah platform screening postur anak berbasis AI yang membantu orang tua berkolaborasi dengan fisioterapis untuk tumbuh kembang yang lebih sehat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2">
              <h4 className="m-0 mb-2 text-[0.85rem] uppercase tracking-wider text-slate-200">Tentang</h4>
              <button onClick={() => scrollToSection("about")} className="text-left text-[0.88rem] text-slate-400 hover:text-sky-200 transition-colors p-0 bg-transparent border-none">Tentang Posturely</button>
              <button onClick={() => scrollToSection("how-it-works")} className="text-left text-[0.88rem] text-slate-400 hover:text-sky-200 transition-colors p-0 bg-transparent border-none">Cara Kerja</button>
              
              {/* ✅ INJEKSI MENU TIM KAMI (Footer) */}
              <button onClick={() => navigate("/team")} className="text-left text-[0.88rem] text-slate-400 hover:text-sky-200 transition-colors p-0 bg-transparent border-none">Tim Kami</button>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="m-0 mb-2 text-[0.85rem] uppercase tracking-wider text-slate-200">Layanan</h4>
              <button onClick={() => scrollToSection("why-posture")} className="text-left text-[0.88rem] text-slate-400 hover:text-sky-200 transition-colors p-0 bg-transparent border-none">Screening Postur Anak</button>
              <button onClick={() => scrollToSection("education")} className="text-left text-[0.88rem] text-slate-400 hover:text-sky-200 transition-colors p-0 bg-transparent border-none">Edukasi Postur</button>
              <button onClick={() => scrollToSection("for-whom")} className="text-left text-[0.88rem] text-slate-400 hover:text-sky-200 transition-colors p-0 bg-transparent border-none">Konsultasi Fisioterapis</button>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="m-0 mb-2 text-[0.85rem] uppercase tracking-wider text-slate-200">Kontak</h4>
              <button onClick={() => navigate("/login")} className="text-left text-[0.88rem] text-slate-400 hover:text-sky-200 transition-colors p-0 bg-transparent border-none">Masuk ke aplikasi</button>
              <button onClick={() => navigate("/register/physio")} className="text-left text-[0.88rem] text-slate-400 hover:text-sky-200 transition-colors p-0 bg-transparent border-none">Bergabung sebagai Fisioterapis</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-700 pt-6 text-center text-[0.85rem]">
          <p className="m-0">© 2026 Posturely. Semua hak cipta dilindungi.</p>
        </div>
      </footer>
      
      <AccessibilityWidget />
      <div id="top" />
    </div>
  );
}

export default LandingPage;