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
  ChevronLeft,
  Search,
} from "lucide-react";
import api from "../utils/axios";
import "../styles/landing.css";

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

  // Filter fisio
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

  // auto slider (infinity) – depend on howSteps.length
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

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % howSteps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + howSteps.length) % howSteps.length);
  };

  // Filter fisio
  const filteredPhysios = physios.filter((p) => {
    const matchName = p.name?.toLowerCase().includes(searchPhysio.toLowerCase());
    const matchCity = filterCity ? p.city?.toLowerCase().includes(filterCity.toLowerCase()) : true;
    const matchSpec = filterSpecialty
      ? p.specialty?.toLowerCase().includes(filterSpecialty.toLowerCase())
      : true;
    return matchName && matchCity && matchSpec;
  });

  const cities = [...new Set(physios.map((p) => p.city).filter(Boolean))];
  const specialties = [...new Set(physios.map((p) => p.specialty).filter(Boolean))];

  const articleList = articles.slice(0, 6);

  return (
    <div className="landing-page">
      {/* Header / Navbar */}
      <header className="landing-header">
        <div className="landing-header__inner">
          <div className="landing-logo" onClick={() => navigate("/")}>
            <span className="landing-logo__dot" />
            <span>Posturely</span>
          </div>

          <nav className="landing-nav landing-nav--desktop">
            <button onClick={() => scrollToSection("about")} className="landing-nav__link">
              Tentang
            </button>
            <button onClick={() => scrollToSection("education")} className="landing-nav__link">
              Edukasi
            </button>
            <button onClick={() => scrollToSection("how-it-works")} className="landing-nav__link">
              Cara Kerja
            </button>
            <button onClick={() => scrollToSection("for-whom")} className="landing-nav__link">
              Untuk Siapa
            </button>
          </nav>

          <div className="landing-nav__actions landing-nav__actions--desktop">
            <button onClick={() => navigate("/login")} className="landing-nav__ghost">
              Masuk
            </button>
            <button onClick={() => navigate("/register/physio")} className="landing-nav__primary">
              Daftar Fisioterapis
            </button>
          </div>

          <button
            className="landing-nav__hamburger"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="landing-nav__mobile">
            <button onClick={() => scrollToSection("about")} className="landing-nav__mobile-link">
              Tentang
            </button>
            <button
              onClick={() => scrollToSection("education")}
              className="landing-nav__mobile-link"
            >
              Edukasi
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="landing-nav__mobile-link"
            >
              Cara Kerja
            </button>
            <button
              onClick={() => scrollToSection("for-whom")}
              className="landing-nav__mobile-link"
            >
              Untuk Siapa
            </button>
            <hr className="landing-nav__divider" />
            <button
              onClick={() => {
                navigate("/login");
                setMobileMenuOpen(false);
              }}
              className="landing-nav__mobile-cta"
            >
              Masuk
            </button>
            <button
              onClick={() => {
                navigate("/register/physio");
                setMobileMenuOpen(false);
              }}
              className="landing-nav__mobile-cta landing-nav__mobile-cta--primary"
            >
              Daftar Fisioterapis
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-accent hero-accent--top-left" />
        

        <div className="hero__inner">
          <div className="hero__content">
            <p className="hero__eyebrow">Screening postur anak yang praktis</p>
            <h1 className="hero__title">Deteksi Postur Anak dengan Bantuan AI</h1>
            <p className="hero__subtitle">
              Posturely membantu orang tua memantau kesehatan muskuloskeletal anak sejak dini,
              dan terhubung dengan fisioterapis anak saat dibutuhkan.
            </p>

            <div className="hero__actions hero__actions--stack">
              <button
                onClick={() => navigate("/login")}
                className="hero__btn hero__btn--primary hero__btn--full"
              >
                Mulai Screening
                <ArrowRight size={18} strokeWidth={2} />
              </button>
              <button
                onClick={() => scrollToSection("why-posture")}
                className="hero__btn hero__btn--secondary hero__btn--full"
              >
                Pelajari Kenapa Penting
              </button>
            </div>

            <div className="hero__meta">
              <span>
                <Zap size={16} strokeWidth={2} />
                Screening bisa dilakukan di rumah
              </span>
              <span>
                <UserCheck size={16} strokeWidth={2} />
                Fisioterapis anak terverifikasi
              </span>
            </div>

            <div className="hero__visual hero__visual--mobile">
              <div className="hero-card hero-card--soft">
                <div className="hero-card__icon hero-card__icon--soft">
                  <Activity size={32} strokeWidth={1.4} />
                </div>
                <div className="hero-card__content">
                  <p className="hero-card__label">Contoh Hasil Screening</p>
                  <p className="hero-card__score">Skor Postur: 82</p>
                  <p className="hero-card__status hero-card__status--fair">
                    Kategori: Perlu dipantau
                  </p>
                  <ul className="hero-card__list hero-card__list--clean">
                    <li>Ringkasan singkat untuk orang tua</li>
                    <li>Area tubuh yang perlu diperhatikan</li>
                    <li>Rekomendasi langkah selanjutnya</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="hero__visual hero__visual--desktop">
            <div className="hero-card">
              <div className="hero-card__icon">
                <Activity size={40} strokeWidth={1.4} />
              </div>
              <div className="hero-card__content">
                <p className="hero-card__label">Contoh Hasil Screening</p>
                <p className="hero-card__score">Skor Postur: 82</p>
                <p className="hero-card__status hero-card__status--fair">
                  Kategori: Perlu dipantau
                </p>
                <ul className="hero-card__list hero-card__list--clean">
                  <li>Ringkasan singkat untuk orang tua</li>
                  <li>Area tubuh yang perlu diperhatikan</li>
                  <li>Rekomendasi langkah selanjutnya</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kenapa Postur Anak Penting */}
      <section
        id="why-posture"
        ref={whyRef}
        className={`section section--alt section--accent-left fade-up ${
          whyInView ? "is-visible" : ""
        }`}
      >
        <div className="section__inner">
          <div className="section__header section__header--center" id="about">
            <h2>Kenapa Postur Anak Itu Penting?</h2>
            <p>
              Postur yang baik bukan hanya soal berdiri tegak, tapi juga berpengaruh pada tumbuh
              kembang, kenyamanan, dan rasa percaya diri anak di masa depan.
            </p>
          </div>

          <div className="grid grid--3">
            {whyCards.map((item, idx) => (
              <div key={idx} className="card card--shadow card--hover">
                <div className="card__icon">
                  <item.icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="card__title">{item.title}</h3>
                <p className="card__text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja Posturely */}
      <section
        id="how-it-works"
        ref={howRef}
        className={`section section--accent-right fade-up ${howInView ? "is-visible" : ""}`}
      >
        <div className="section__inner">
          <div className="section__header section__header--center">
            <h2>Cara Kerja Posturely</h2>
            <p>
              Alur yang sama dapat diakses dari rumah, dengan dukungan AI dan fisioterapis anak
              ketika dibutuhkan.
            </p>
          </div>

          <div className="how-layout">
            <ol className="how-timeline">
              {howSteps.map((step, idx) => (
                <li key={idx} className="how-timeline__item">
                  <div className="how-timeline__circle">{idx + 1}</div>
                  <div className="how-timeline__line" />
                  <div className="how-timeline__body">
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="steps-slider">
              <div className="steps-slider__card">
                <div className="steps-slider__badge">Step {currentStep + 1} dari 4</div>
                <h3>{howSteps[currentStep].title}</h3>
                <p>{howSteps[currentStep].text}</p>

                <div className="steps-slider__controls">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="steps-slider__btn"
                  >
                    <ChevronLeft size={20} strokeWidth={2} />
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="steps-slider__btn steps-slider__btn--primary"
                  >
                    Selanjutnya
                    <ChevronRight size={20} strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div className="steps-slider__dots">
                {howSteps.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentStep(idx)}
                    className={`steps-slider__dot ${
                      currentStep === idx ? "steps-slider__dot--active" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Unggulan */}
      <section
        id="features"
        ref={featureRef}
        className={`section section--alt fade-up ${featureInView ? "is-visible" : ""}`}
      >
        <div className="section__inner">
          <div className="section__header section__header--center">
            <h2>Fitur Unggulan Posturely</h2>
            <p>
              Satu platform yang menghubungkan orang tua, anak, dan fisioterapis melalui screening
              postur yang mudah dan terstruktur.
            </p>
          </div>

          <div className="grid grid--3">
            {features.map((feature, idx) => (
              <div key={idx} className="card card--border card--hover">
                <div className="card__icon card__icon--soft">
                  <feature.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="card__title">{feature.title}</h3>
                <p className="card__text">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Untuk Orang Tua & Fisioterapis */}
      <section
        id="for-whom"
        ref={roleRef}
        className={`section fade-up ${roleInView ? "is-visible" : ""}`}
      >
        <div className="section__inner">
          <div className="section__header section__header--center">
            <h2>Untuk Orang Tua & Fisioterapis</h2>
            <p>Posturely membantu dua pihak penting ini berkolaborasi untuk anak.</p>
          </div>

          <div className="grid grid--2 role-grid">
            <div className="role-card role-card--hover">
              <div className="role-card__icon">
                <Users size={40} strokeWidth={1.5} />
              </div>
              <h3>Untuk Orang Tua</h3>
              <ul className="role-card__list">
                {parentsItems.map((item, idx) => (
                  <li key={idx}>
                    <item.icon size={18} strokeWidth={2} />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="role-card__btn role-card__btn--tall"
              >
                Masuk sebagai Orang Tua
              </button>
            </div>

            <div className="role-card role-card--accent role-card--hover">
              <div className="role-card__icon role-card__icon--light">
                <HeartHandshake size={40} strokeWidth={1.5} />
              </div>
              <h3>Untuk Fisioterapis</h3>
              <ul className="role-card__list">
                {physioItems.map((item, idx) => (
                  <li key={idx}>
                    <item.icon size={18} strokeWidth={2} />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => navigate("/register/physio")}
                className="role-card__btn role-card__btn--light role-card__btn--tall"
              >
                Daftar sebagai Fisioterapis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Fisioterapis Terpercaya */}
      {physios.length > 0 && (
        <section
          ref={physioRef}
          className={`section section--alt section--accent-left fade-up ${
            physioInView ? "is-visible" : ""
          }`}
        >
          <div className="section__inner">
            <div className="section__header section__header--with-link">
              <div>
                <h2>Fisioterapis Terpercaya</h2>
                <p>Profil fisioterapis yang telah diverifikasi dan aktif menerima konsultasi.</p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="section-link"
              >
                Lihat seluruh fisioterapis di aplikasi
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="physio-filters">
              <div className="physio-filters__search">
                <Search size={18} strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Cari nama fisioterapis..."
                  value={searchPhysio}
                  onChange={(e) => setSearchPhysio(e.target.value)}
                />
              </div>

              <div className="physio-filters__group">
                <div className="physio-select">
                  <span className="physio-select__label">Kota</span>
                  <div className="physio-select__control">
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                    >
                      <option value="">Semua</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="physio-select">
                  <span className="physio-select__label">Spesialisasi</span>
                  <div className="physio-select__control">
                    <select
                      value={filterSpecialty}
                      onChange={(e) => setFilterSpecialty(e.target.value)}
                    >
                      <option value="">Semua</option>
                      {specialties.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid--3 physio-grid">
              {filteredPhysios.slice(0, 6).map((physio) => (
                <div
                  key={physio.id}
                  className="card physio-card physio-card--hover"
                  onClick={() => navigate(`/physiotherapists/${physio.id}`)}
                >
                  <div className="physio-card__header">
                    {physio.photo ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL.replace(
                          "/api",
                          ""
                        )}/storage/${physio.photo}`}
                        alt={physio.name}
                        className="physio-card__avatar"
                      />
                    ) : (
                      <div className="physio-card__avatar physio-card__avatar--placeholder">
                        {physio.name?.charAt(0)?.toUpperCase() || "F"}
                      </div>
                    )}
                    <div>
                      <h3>{physio.name}</h3>
                      <p>{physio.clinic_name}</p>
                    </div>
                  </div>
                  {physio.specialty && (
                    <span className="physio-card__tag">{physio.specialty}</span>
                  )}
                  <div className="physio-card__location">
                    <MapPin size={14} strokeWidth={1.5} />
                    <span>{physio.city}</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredPhysios.length === 0 && (
              <p className="no-results">Tidak ada fisioterapis yang cocok dengan filter Anda.</p>
            )}
          </div>
        </section>
      )}

      {/* Artikel Edukasi – tanpa thumbnail, teks saja */}
      {articleList.length > 0 && (
        <section
          id="education"
          ref={articleRef}
          className={`section section--accent-right fade-up ${
            articleInView ? "is-visible" : ""
          }`}
        >
          <div className="section__inner">
            <div className="section__header section__header--with-link">
              <div>
                <h2>Edukasi Postur Anak</h2>
                <p>
                  Artikel yang dapat diakses publik. Untuk konten lebih lengkap dan personal,
                  gunakan dashboard setelah masuk.
                </p>
              </div>
              <button onClick={() => navigate("/login")} className="section-link">
                Lihat edukasi lainnya di dashboard
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="grid grid--3 article-grid article-grid--text">
              {articleList.map((article) => (
                <article
                  key={article.id}
                  className="article-card article-card--hover article-card--text"
                  onClick={() => navigate(`/education/${article.slug}`)}
                >
                  <div className="article-card__body">
                    <span className="article-card__badge">
                      {article.category?.name || "Artikel"}
                    </span>
                    <h3>{article.title}</h3>
                    <p>
                      {article.excerpt ||
                        (article.content ? article.content.substring(0, 130) + "…" : "")}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA sebelum footer */}
      <section
        ref={ctaRef}
        className={`section section-cta section--accent-left fade-up ${
          ctaInView ? "is-visible" : ""
        }`}
      >
        <div className="section__inner section-cta__inner">
          <div>
            <h2>Mulai Screening Postur Anak Secara Gratis</h2>
            <p>
              Buat akun orang tua, lakukan screening pertama, dan lihat bagaimana Posturely
              membantu Anda memahami postur anak dengan lebih sederhana.
            </p>
          </div>
          <div className="section-cta__actions">
            <button
              onClick={() => navigate("/login")}
              className="hero__btn hero__btn--white"
            >
              Daftar sebagai Orang Tua
            </button>
            <button
              onClick={() => navigate("/register/physio")}
              className="hero__btn hero__btn--outline"
            >
              Daftar sebagai Fisioterapis
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <div className="landing-logo landing-logo--light">
              <span className="landing-logo__dot" />
              <span>Posturely</span>
            </div>
            <p>
              Posturely adalah platform screening postur anak berbasis AI yang membantu orang tua
              berkolaborasi dengan fisioterapis untuk tumbuh kembang yang lebih sehat.
            </p>
          </div>

          <div className="landing-footer__cols">
            <div className="landing-footer__col">
              <h4>Tentang</h4>
              <button onClick={() => scrollToSection("about")}>Tentang Posturely</button>
              <button onClick={() => scrollToSection("how-it-works")}>Cara Kerja</button>
            </div>
            <div className="landing-footer__col">
              <h4>Layanan</h4>
              <button onClick={() => scrollToSection("why-posture")}>
                Screening Postur Anak
              </button>
              <button onClick={() => scrollToSection("education")}>Edukasi Postur</button>
              <button onClick={() => scrollToSection("for-whom")}>Konsultasi Fisioterapis</button>
            </div>
            <div className="landing-footer__col">
              <h4>Kontak</h4>
              <button onClick={() => navigate("/login")}>Masuk ke aplikasi</button>
              <button onClick={() => navigate("/register/physio")}>
                Bergabung sebagai Fisioterapis
              </button>
            </div>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <p>© 2026 Posturely. Semua hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
