import {
  Activity,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  HeartHandshake,
  LocateFixed,
  MapPin,
  Menu,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { landingContent } from "../data/landingContent";
import "./PosturelyLandingPage.css";

const ROUTES = {
  login: "/login",
  parentRegister: "/register/parent",
  physioRegister: "/register/physio",
  screening: "/parent/screening",
  education: "/education",
  map: "/physiotherapist-map",
  team: "/team",
};

function SectionHeader({ eyebrow, title, description, align = "center" }) {
  return (
    <div className={`posturely-section-header ${align === "left" ? "is-left" : ""}`}>
      {eyebrow ? <p className="posturely-eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

function PrimaryButton({ href, children, variant = "primary", icon = true }) {
  return (
    <a className={`posturely-btn posturely-btn-${variant}`} href={href}>
      <span>{children}</span>
      {icon ? <ArrowRight size={16} strokeWidth={2.4} /> : null}
    </a>
  );
}

function AppNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="posturely-navbar">
      <div className="posturely-container posturely-navbar-inner">
        <a className="posturely-brand" href="/">
          <span className="posturely-brand-mark">
            <Activity size={19} strokeWidth={2.8} />
          </span>
          <span className="posturely-brand-text">Posturely</span>
        </a>

        <nav className="posturely-navlinks">
          {landingContent.navLinks.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="posturely-navbar-actions">
          <a className="posturely-login-link" href={ROUTES.login}>
            Masuk
          </a>
          <a className="posturely-navbar-cta" href={ROUTES.screening}>
            Mulai Screening
          </a>
        </div>

        <button
          className="posturely-mobile-toggle"
          type="button"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <div className="posturely-mobile-menu">
          {landingContent.navLinks.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <a href={ROUTES.login} onClick={() => setOpen(false)}>
            Masuk
          </a>
          <a className="posturely-mobile-cta" href={ROUTES.screening} onClick={() => setOpen(false)}>
            Mulai Screening
          </a>
        </div>
      ) : null}
    </header>
  );
}

function HeroPreviewCard() {
  return (
    <div className="posturely-hero-preview" aria-label="Contoh hasil screening Posturely">
      <div className="posturely-preview-glow" />
      <div className="posturely-screening-card">
        <div className="posturely-card-topline">
          <div className="posturely-icon-badge">
            <Activity size={22} />
          </div>
          <span>Contoh hasil screening</span>
        </div>

        <div className="posturely-score-row">
          <div>
            <p>Skor Postur</p>
            <strong>82</strong>
          </div>
          <span className="posturely-status-pill">Perlu dipantau</span>
        </div>

        <div className="posturely-progress">
          <span style={{ width: "82%" }} />
        </div>

        <div className="posturely-body-analysis">
          <div className="posturely-body-illustration">
            <span className="head" />
            <span className="body" />
            <span className="shoulder shoulder-left" />
            <span className="shoulder shoulder-right" />
            <span className="line line-a" />
            <span className="line line-b" />
          </div>

          <div className="posturely-analysis-list">
            <div>
              <CheckCircle2 size={15} />
              <span>Bahu kanan perlu diperhatikan</span>
            </div>
            <div>
              <CheckCircle2 size={15} />
              <span>Area tubuh terdeteksi cukup stabil</span>
            </div>
            <div>
              <CheckCircle2 size={15} />
              <span>Rekomendasi langkah selanjutnya tersedia</span>
            </div>
          </div>
        </div>
      </div>

      <div className="posturely-floating-card posturely-floating-card-a">
        <ShieldCheck size={17} />
        <span>Screening awal dari rumah</span>
      </div>

      <div className="posturely-floating-card posturely-floating-card-b">
        <MapPin size={17} />
        <span>Fisio terdekat</span>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="posturely-hero" id="tentang">
      <div className="posturely-container posturely-hero-grid">
        <div className="posturely-hero-content">
          <p className="posturely-eyebrow">Screening postur anak berbasis AI</p>
          <h1>Kenali Risiko Postur Anak Lebih Awal dengan Bantuan AI</h1>
          <p className="posturely-hero-description">
            Posturely membantu orang tua melakukan screening awal postur anak dari rumah,
            memahami area yang perlu diperhatikan, dan terhubung dengan fisioterapis anak
            bila dibutuhkan.
          </p>

          <div className="posturely-hero-actions">
            <PrimaryButton href={ROUTES.screening}>Mulai Screening Gratis</PrimaryButton>
            <PrimaryButton href={ROUTES.map} variant="secondary">
              Cari Fisioterapis
            </PrimaryButton>
          </div>

          <div className="posturely-hero-trust">
            <span>
              <Sparkles size={14} />
              Panduan foto sederhana
            </span>
            <span>
              <ShieldCheck size={14} />
              Alat bantu screening awal
            </span>
            <span>
              <Stethoscope size={14} />
              Terhubung dengan fisioterapis
            </span>
          </div>
        </div>

        <HeroPreviewCard />
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="posturely-section posturely-problem-section">
      <div className="posturely-container">
        <SectionHeader
          eyebrow="Masalah yang sering tidak disadari"
          title="Postur Anak Sering Berubah Tanpa Disadari"
          description="Kebiasaan duduk lama, penggunaan gadget, tas sekolah, dan kurang aktivitas fisik dapat memengaruhi postur anak. Screening awal membantu orang tua lebih cepat memahami kondisi anak."
        />

        <div className="posturely-card-grid posturely-card-grid-4">
          {landingContent.painPoints.map((item, index) => (
            <article className="posturely-info-card" key={item.title}>
              <div className="posturely-card-number">{String(index + 1).padStart(2, "0")}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImportanceSection() {
  return (
    <section className="posturely-section">
      <div className="posturely-container">
        <SectionHeader
          eyebrow="Kenapa ini penting?"
          title="Postur yang Baik Mendukung Kenyamanan Anak"
          description="Postur bukan hanya soal berdiri tegak. Postur memengaruhi kenyamanan belajar, rasa percaya diri, dan kebiasaan gerak anak dalam jangka panjang."
        />

        <div className="posturely-card-grid posturely-card-grid-3">
          {landingContent.importance.map((item) => (
            <article className="posturely-feature-card" key={item.title}>
              <div className="posturely-icon-badge">
                <HeartHandshake size={21} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="posturely-section posturely-how-section" id="cara-kerja">
      <div className="posturely-container posturely-how-grid">
        <div>
          <SectionHeader
            align="left"
            eyebrow="Cara kerja Posturely"
            title="Alur yang Mudah untuk Orang Tua"
            description="Mulai dari foto postur anak, analisis awal oleh AI, hingga rekomendasi tindak lanjut yang mudah dipahami."
          />

          <div className="posturely-step-list">
            {landingContent.steps.map((step) => (
              <div className="posturely-step-item" key={step.label}>
                <div className="posturely-step-number">{step.label}</div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="posturely-flow-card">
          <div className="posturely-flow-pill">Step 2 dari 4</div>
          <BrainCircuit size={42} className="posturely-flow-icon" />
          <h3>Analisis oleh AI</h3>
          <p>
            Sistem membantu membaca sudut dan simetri tubuh anak secara otomatis,
            lalu menyajikan hasil awal dalam dashboard.
          </p>

          <div className="posturely-flow-actions">
            <button type="button">Sebelumnya</button>
            <button type="button" className="active">
              Selanjutnya
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="posturely-flow-dots">
            <span />
            <span className="active" />
            <span />
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductPreviewSection() {
  return (
    <section className="posturely-section posturely-preview-section">
      <div className="posturely-container posturely-product-preview-grid">
        <div className="posturely-dashboard-mockup">
          <div className="posturely-dashboard-header">
            <div>
              <span>Dashboard Orang Tua</span>
              <strong>Hasil Screening Anak</strong>
            </div>
            <span className="posturely-status-pill">Moderate</span>
          </div>

          <div className="posturely-dashboard-body">
            <div className="posturely-dashboard-score">
              <span>Posture Score</span>
              <strong>82/100</strong>
              <div className="posturely-progress">
                <span style={{ width: "82%" }} />
              </div>
            </div>

            <div className="posturely-dashboard-list">
              <div>
                <span>Shoulder Alignment</span>
                <strong>Needs Attention</strong>
              </div>
              <div>
                <span>Head Position</span>
                <strong>Forward Tendency</strong>
              </div>
              <div>
                <span>Recommendation</span>
                <strong>Monitor & consult if persistent</strong>
              </div>
            </div>
          </div>
        </div>

        <div>
          <SectionHeader
            align="left"
            eyebrow="Product preview"
            title="Hasil Screening yang Mudah Dipahami"
            description="Posturely menyajikan skor postur, area yang perlu dipantau, riwayat perkembangan, dan rekomendasi langkah berikutnya dalam dashboard yang sederhana."
          />

          <div className="posturely-check-list">
            <span>
              <CheckCircle2 size={18} />
              Skor postur dan kategori risiko
            </span>
            <span>
              <CheckCircle2 size={18} />
              Area tubuh yang perlu dipantau
            </span>
            <span>
              <CheckCircle2 size={18} />
              Riwayat screening berkala
            </span>
            <span>
              <CheckCircle2 size={18} />
              Rekomendasi edukasi dan konsultasi
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const icons = [Activity, MonitorSmartphone, ClipboardCheck, BookOpen, Stethoscope, LocateFixed];

  return (
    <section className="posturely-section" id="fitur">
      <div className="posturely-container">
        <SectionHeader
          eyebrow="Fitur unggulan"
          title="Satu Platform untuk Screening, Edukasi, dan Monitoring"
          description="Posturely membantu orang tua memahami postur anak dengan pendekatan yang lebih praktis, terstruktur, dan mudah digunakan."
        />

        <div className="posturely-card-grid posturely-card-grid-3">
          {landingContent.features.map((item, index) => {
            const Icon = icons[index] || Activity;

            return (
              <article className="posturely-feature-card" key={item.title}>
                <div className="posturely-icon-badge">
                  <Icon size={21} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function EducationSection() {
  return (
    <section className="posturely-section posturely-education-section" id="edukasi">
      <div className="posturely-container">
        <div className="posturely-split-heading">
          <SectionHeader
            align="left"
            eyebrow="Edukasi postur anak"
            title="Edukasi yang Mudah Dipahami Orang Tua"
            description="Memahami postur anak tidak harus rumit. Posturely menyediakan konten edukasi tentang kebiasaan duduk, penggunaan gadget, aktivitas fisik, dan tanda yang perlu dipantau."
          />
          <PrimaryButton href={ROUTES.education} variant="secondary">
            Lihat Edukasi
          </PrimaryButton>
        </div>

        <div className="posturely-card-grid posturely-card-grid-3">
          {landingContent.education.map((item) => (
            <article className="posturely-education-card" key={item.title}>
              <span>{item.category}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a href={ROUTES.education}>
                Baca panduan
                <ArrowRight size={15} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhysioMapSection() {
  const locations = useMemo(
    () => [
      { name: "Klinik Tumbuh Kembang", distance: "1.2 km", top: "31%", left: "62%" },
      { name: "Fisio Anak Terdekat", distance: "2.4 km", top: "55%", left: "42%" },
      { name: "Praktik Fisioterapi", distance: "3.1 km", top: "42%", left: "74%" },
    ],
    []
  );

  return (
    <section className="posturely-section posturely-map-section" id="map-fisioterapi">
      <div className="posturely-container posturely-map-grid">
        <div>
          <SectionHeader
            align="left"
            eyebrow="Map fisioterapis"
            title="Temukan Fisioterapis Anak Terdekat"
            description="Jika hasil screening menunjukkan area yang perlu dipantau, orang tua dapat mencari fisioterapis anak terdekat dan melihat informasi praktik yang tersedia."
          />

          <div className="posturely-check-list">
            <span>
              <LocateFixed size={18} />
              Cari berdasarkan lokasi
            </span>
            <span>
              <UserRound size={18} />
              Lihat profil fisioterapis
            </span>
            <span>
              <Stethoscope size={18} />
              Konsultasi lebih terarah
            </span>
            <span>
              <ClipboardCheck size={18} />
              Bawa hasil screening sebagai data awal
            </span>
          </div>

          <div className="posturely-section-actions">
            <PrimaryButton href={ROUTES.map}>Cari Fisioterapis di Peta</PrimaryButton>
          </div>
        </div>

        <div className="posturely-map-mockup" aria-label="Mockup peta fisioterapis">
          <div className="posturely-map-search">
            <MapPin size={16} />
            <span>Cari fisioterapis anak terdekat</span>
          </div>

          <div className="posturely-map-bg">
            <span className="road road-a" />
            <span className="road road-b" />
            <span className="road road-c" />

            {locations.map((location) => (
              <div
                className="posturely-map-pin"
                key={location.name}
                style={{ top: location.top, left: location.left }}
              >
                <MapPin size={17} />
              </div>
            ))}
          </div>

          <div className="posturely-location-list">
            {locations.map((location) => (
              <div key={location.name}>
                <span>{location.name}</span>
                <strong>{location.distance}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AudienceSection() {
  return (
    <section className="posturely-section" id="untuk-siapa">
      <div className="posturely-container">
        <SectionHeader
          eyebrow="Untuk orang tua & fisioterapis"
          title="Dibuat untuk Kolaborasi Perawatan Anak"
          description="Posturely membantu orang tua dan fisioterapis memahami postur anak dengan alur yang lebih mudah dan terstruktur."
        />

        <div className="posturely-audience-grid">
          <article className="posturely-audience-card">
            <div className="posturely-icon-badge">
              <UserRound size={21} />
            </div>
            <h3>Untuk Orang Tua</h3>
            <ul>
              <li>Screening postur anak berkala dengan AI</li>
              <li>Pantau riwayat hasil screening setiap anak</li>
              <li>Dapatkan edukasi dan rekomendasi awal</li>
              <li>Rujuk langsung ke fisioterapis anak terdekat</li>
            </ul>
            <PrimaryButton href={ROUTES.parentRegister} variant="dark">
              Daftar sebagai Orang Tua
            </PrimaryButton>
          </article>

          <article className="posturely-audience-card is-blue">
            <div className="posturely-icon-badge">
              <Stethoscope size={21} />
            </div>
            <h3>Untuk Fisioterapis</h3>
            <ul>
              <li>Menerima rujukan screening dari orang tua</li>
              <li>Melihat ringkasan awal dan foto postur</li>
              <li>Memberikan rekomendasi latihan dan edukasi</li>
              <li>Membangun profil praktik dan jangkauan pasien</li>
            </ul>
            <PrimaryButton href={ROUTES.physioRegister} variant="white">
              Daftar sebagai Fisioterapis
            </PrimaryButton>
          </article>
        </div>
      </div>
    </section>
  );
}

function ExpertValidationSection() {
  return (
    <section className="posturely-section posturely-expert-section">
      <div className="posturely-container posturely-expert-grid">
        <div>
          <SectionHeader
            align="left"
            eyebrow="Expert validation"
            title="Dikembangkan Bersama Ahli Fisioterapi dan Teknologi"
            description="Posturely dirancang dengan pendekatan kolaboratif antara teknologi AI, edukasi orang tua, dan validasi dari praktisi fisioterapi."
          />

          <div className="posturely-section-actions">
            <PrimaryButton href={ROUTES.team} variant="secondary">
              Lihat Tim Ahli
            </PrimaryButton>
          </div>
        </div>

        <div className="posturely-expert-cards">
          <div>
            <Stethoscope size={24} />
            <strong>Pediatric Physiotherapy Expert</strong>
            <span>Validasi pendekatan tumbuh kembang dan postur anak.</span>
          </div>
          <div>
            <ShieldCheck size={24} />
            <strong>Clinical Physiotherapy Validator</strong>
            <span>Membantu memastikan alur screening tetap etis dan relevan.</span>
          </div>
          <div>
            <BrainCircuit size={24} />
            <strong>Educational Technology Advisor</strong>
            <span>Menguatkan pengalaman edukasi digital untuk orang tua.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function EthicalAiSection() {
  return (
    <section className="posturely-ethical-section">
      <div className="posturely-container posturely-ethical-card">
        <div className="posturely-icon-badge">
          <ShieldCheck size={24} />
        </div>
        <div>
          <p className="posturely-eyebrow">Responsible AI</p>
          <h2>AI sebagai Alat Bantu, Bukan Pengganti Diagnosis Klinis</h2>
          <p>
            Hasil Posturely digunakan sebagai panduan awal. Untuk kondisi tertentu,
            orang tua tetap disarankan berkonsultasi langsung dengan fisioterapis atau
            tenaga kesehatan profesional.
          </p>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="posturely-section posturely-faq-section" id="faq">
      <div className="posturely-container posturely-faq-grid">
        <SectionHeader
          align="left"
          eyebrow="FAQ"
          title="Pertanyaan yang Sering Diajukan"
          description="Beberapa hal penting yang perlu dipahami orang tua sebelum menggunakan Posturely."
        />

        <div className="posturely-faq-list">
          {landingContent.faq.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                className={`posturely-faq-item ${isActive ? "is-active" : ""}`}
                key={item.question}
                type="button"
                onClick={() => setActiveIndex(isActive ? -1 : index)}
              >
                <span>
                  <strong>{item.question}</strong>
                  {isActive ? <p>{item.answer}</p> : null}
                </span>
                <ChevronRight size={18} />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="posturely-final-cta">
      <div className="posturely-container">
        <p className="posturely-eyebrow">Mulai dari satu foto</p>
        <h2>Mulai Screening Postur Anak Secara Gratis</h2>
        <p>
          Buat akun orang tua, lakukan screening pertama, dan lihat bagaimana Posturely
          membantu Anda memahami postur anak dengan lebih sederhana.
        </p>
        <div className="posturely-cta-actions">
          <PrimaryButton href={ROUTES.parentRegister} variant="white">
            Daftar sebagai Orang Tua
          </PrimaryButton>
          <PrimaryButton href={ROUTES.physioRegister} variant="outline-white">
            Daftar sebagai Fisioterapis
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="posturely-footer">
      <div className="posturely-container posturely-footer-grid">
        <div>
          <a className="posturely-brand posturely-footer-brand" href="/">
            <span className="posturely-brand-mark">
              <Activity size={18} strokeWidth={2.8} />
            </span>
            <span className="posturely-brand-text">Posturely</span>
          </a>
          <p>
            Platform screening postur anak berbasis AI yang membantu orang tua,
            anak, dan fisioterapis membangun kebiasaan postur yang lebih sehat.
          </p>
        </div>

        <div>
          <h3>Tentang</h3>
          <a href="#tentang">Tentang Posturely</a>
          <a href="#cara-kerja">Cara Kerja</a>
          <a href={ROUTES.team}>Tim Kami</a>
        </div>

        <div>
          <h3>Layanan</h3>
          <a href={ROUTES.screening}>Screening Postur Anak</a>
          <a href={ROUTES.education}>Edukasi Postur</a>
          <a href={ROUTES.map}>Map Fisioterapis</a>
        </div>

        <div>
          <h3>Kontak</h3>
          <a href={ROUTES.login}>Masuk ke aplikasi</a>
          <a href={ROUTES.physioRegister}>Bergabung sebagai Fisioterapis</a>
        </div>
      </div>

      <div className="posturely-container posturely-footer-bottom">
        <span>© 2026 Posturely. Semua hak cipta dilindungi.</span>
      </div>
    </footer>
  );
}

export default function PosturelyLandingPage() {
  return (
    <main className="posturely-page">
      <AppNavbar />
      <HeroSection />
      <ProblemSection />
      <ImportanceSection />
      <HowItWorksSection />
      <ProductPreviewSection />
      <FeaturesSection />
      <EducationSection />
      <PhysioMapSection />
      <AudienceSection />
      <ExpertValidationSection />
      <EthicalAiSection />
      <FaqSection />
      <FinalCtaSection />
      <Footer />
    </main>
  );
}