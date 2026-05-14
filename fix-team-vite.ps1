$ErrorActionPreference = "Stop"

Write-Host "== Fix Our Team untuk React Vite ==" -ForegroundColor Cyan

# Bersihkan folder App Router Next.js yang tidak dipakai Vite
if (Test-Path "src\app") {
  Remove-Item "src\app" -Recurse -Force
  Write-Host "Removed unused Next.js folder: src\app" -ForegroundColor Yellow
}

# Buat folder
$folders = @(
  "src\features\team\components",
  "src\features\team\data",
  "src\pages",
  "public\images\team",
  "audit-output"
)

foreach ($folder in $folders) {
  if (!(Test-Path $folder)) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    Write-Host "Created: $folder" -ForegroundColor Green
  }
}

# TeamCard
@'
import "./team-card.css";

export default function TeamCard({
  name,
  role,
  image,
  description,
  variant = "light",
}) {
  return (
    <article className={`team-card team-card--${variant}`}>
      <div className="team-card__image-wrap">
        <img
          src={image}
          alt={name}
          className="team-card__image"
          loading="lazy"
        />

        <div className="team-card__overlay">
          <p className="team-card__role">{role}</p>
          <h3 className="team-card__name">{name}</h3>

          {description ? (
            <p className="team-card__description">{description}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
'@ | Out-File "src\features\team\components\TeamCard.jsx" -Encoding utf8

# TeamCard CSS
@'
.team-card {
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
  transition: transform 220ms ease, box-shadow 220ms ease;
}

.team-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.16);
}

.team-card--blue {
  border-color: rgba(37, 99, 235, 0.24);
  background: linear-gradient(135deg, #2563eb, #172554);
}

.team-card__image-wrap {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
}

.team-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
  transition: transform 500ms ease;
}

.team-card:hover .team-card__image {
  transform: scale(1.05);
}

.team-card__overlay {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  padding: 24px;
  color: white;
  background: linear-gradient(
    to top,
    rgba(2, 6, 23, 0.92),
    rgba(2, 6, 23, 0.46),
    transparent
  );
}

.team-card__role {
  margin: 0;
  color: #fbbf24;
  font-size: 14px;
  font-weight: 700;
}

.team-card__name {
  margin: 6px 0 0;
  font-size: 24px;
  line-height: 1.15;
  font-weight: 800;
}

.team-card__description {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
  line-height: 1.6;
}
'@ | Out-File "src\features\team\components\team-card.css" -Encoding utf8

# Team Data
@'
export const EXPERT_TEAM = [
  {
    name: "Nama Expert 1",
    role: "Cultural Curator",
    image: "/images/team/expert-1.jpg",
    description:
      "Berfokus pada kurasi budaya, edukasi, dan pelestarian warisan Nusantara.",
  },
  {
    name: "Nama Expert 2",
    role: "Research Advisor",
    image: "/images/team/expert-2.jpg",
    description:
      "Mendukung riset, pengembangan materi, dan strategi edukasi berbasis budaya.",
  },
  {
    name: "Nama Expert 3",
    role: "Creative Technology Expert",
    image: "/images/team/expert-3.jpg",
    description:
      "Menghubungkan nilai budaya dengan inovasi teknologi digital masa depan.",
    variant: "blue",
  },
];

export const STAFF_TEAM = [
  {
    name: "Nama Staff 1",
    role: "Program Officer",
    image: "/images/team/staff-1.jpg",
    description:
      "Mengelola program, agenda, dan kebutuhan operasional secara profesional.",
  },
  {
    name: "Nama Staff 2",
    role: "Content Strategist",
    image: "/images/team/staff-2.jpg",
    description:
      "Menyusun konten edukatif, informatif, dan menarik untuk audiens.",
  },
  {
    name: "Nama Staff 3",
    role: "Community Relations",
    image: "/images/team/staff-3.jpg",
    description:
      "Membangun komunikasi dan relasi bersama komunitas, mitra, dan pengguna.",
    variant: "blue",
  },
];

export const ALL_TEAM = [...EXPERT_TEAM, ...STAFF_TEAM];
'@ | Out-File "src\features\team\data\team.data.js" -Encoding utf8

# Team layout page component
@'
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import TeamCard from "./TeamCard";
import "./team-page.css";

const tabs = [
  {
    label: "All Team",
    href: "/team",
    value: "all",
  },
  {
    label: "Balale Expert Team",
    href: "/team/expert",
    value: "expert",
  },
  {
    label: "Balale Staff",
    href: "/team/staff",
    value: "staff",
  },
];

export default function TeamSectionPage({
  title,
  subtitle,
  teams,
  active = "all",
}) {
  return (
    <main className="team-page">
      <section className="team-hero">
        <div className="team-hero__pattern" />

        <div className="team-container team-hero__content">
          <div className="team-hero__inner">
            <div className="team-hero__badge">
              <span>Our Team</span>
              <ChevronDown size={16} />
            </div>

            <h1>{title}</h1>

            <p>{subtitle}</p>

            <div className="team-hero__line" />
          </div>
        </div>
      </section>

      <section className="team-content">
        <div className="team-container">
          <div className="team-tabs">
            {tabs.map((tab) => {
              const isActive = tab.value === active;

              return (
                <Link
                  key={tab.value}
                  to={tab.href}
                  className={`team-tab ${isActive ? "team-tab--active" : ""}`}
                >
                  {tab.label}
                  <ChevronRight size={16} />
                </Link>
              );
            })}
          </div>

          <div className="team-grid">
            {teams.map((member) => (
              <TeamCard
                key={`${member.name}-${member.role}`}
                {...member}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
'@ | Out-File "src\features\team\components\TeamSectionPage.jsx" -Encoding utf8

# Team page CSS
@'
.team-page {
  min-height: 100vh;
  background: #ffffff;
  color: #0f172a;
}

.team-container {
  width: min(1180px, calc(100% - 32px));
  margin-inline: auto;
}

.team-hero {
  position: relative;
  overflow: hidden;
  padding: 88px 0 76px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  background:
    radial-gradient(circle at top, rgba(180, 145, 79, 0.16), transparent 36%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
}

.team-hero__pattern {
  position: absolute;
  inset: 0;
  opacity: 0.08;
  background-image:
    linear-gradient(45deg, #0f172a 1px, transparent 1px),
    linear-gradient(-45deg, #0f172a 1px, transparent 1px);
  background-size: 28px 28px;
}

.team-hero__content {
  position: relative;
  z-index: 1;
}

.team-hero__inner {
  max-width: 860px;
  margin-inline: auto;
  text-align: center;
}

.team-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid rgba(180, 145, 79, 0.32);
  background: rgba(255, 255, 255, 0.82);
  color: #a87823;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.team-hero h1 {
  margin: 0;
  color: #101936;
  font-size: clamp(42px, 7vw, 76px);
  line-height: 1;
  letter-spacing: -0.055em;
  font-weight: 900;
}

.team-hero p {
  max-width: 760px;
  margin: 24px auto 0;
  color: #64748b;
  font-size: clamp(16px, 2vw, 21px);
  line-height: 1.7;
}

.team-hero__line {
  width: 116px;
  height: 6px;
  margin: 28px auto 0;
  border-radius: 999px;
  background: #b8914f;
}

.team-content {
  padding: 46px 0 80px;
}

.team-tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 42px;
}

.team-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 18px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: white;
  color: #334155;
  text-decoration: none;
  font-size: 14px;
  font-weight: 800;
  transition: all 200ms ease;
}

.team-tab:hover {
  border-color: #b8914f;
  color: #9a6b22;
  transform: translateY(-1px);
}

.team-tab--active {
  border-color: #b8914f;
  background: #b8914f;
  color: white;
  box-shadow: 0 12px 30px rgba(180, 145, 79, 0.26);
}

.team-tab--active:hover {
  color: white;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
}

@media (max-width: 960px) {
  .team-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .team-hero {
    padding: 64px 0 54px;
  }

  .team-grid {
    grid-template-columns: 1fr;
  }

  .team-content {
    padding-top: 34px;
  }
}
'@ | Out-File "src\features\team\components\team-page.css" -Encoding utf8

# Pages
@'
import TeamSectionPage from "../features/team/components/TeamSectionPage";
import { ALL_TEAM } from "../features/team/data/team.data";

export default function TeamPage() {
  return (
    <TeamSectionPage
      title="Balale Expert Team"
      subtitle="Kami adalah kumpulan kurator budaya, peneliti, desainer, dan pengembang teknologi yang berkomitmen menjaga warisan Nusantara sambil menginovasi masa depan."
      teams={ALL_TEAM}
      active="all"
    />
  );
}
'@ | Out-File "src\pages\TeamPage.jsx" -Encoding utf8

@'
import TeamSectionPage from "../features/team/components/TeamSectionPage";
import { EXPERT_TEAM } from "../features/team/data/team.data";

export default function TeamExpertPage() {
  return (
    <TeamSectionPage
      title="Balale Expert Team"
      subtitle="Tim ahli Balale terdiri dari para profesional yang berperan dalam kurasi budaya, riset, edukasi, dan inovasi digital untuk menjaga warisan Nusantara."
      teams={EXPERT_TEAM}
      active="expert"
    />
  );
}
'@ | Out-File "src\pages\TeamExpertPage.jsx" -Encoding utf8

@'
import TeamSectionPage from "../features/team/components/TeamSectionPage";
import { STAFF_TEAM } from "../features/team/data/team.data";

export default function TeamStaffPage() {
  return (
    <TeamSectionPage
      title="Balale Staff"
      subtitle="Tim staff Balale mendukung operasional, konten, komunitas, dan pengembangan layanan agar visi pelestarian budaya dapat berjalan secara profesional."
      teams={STAFF_TEAM}
      active="staff"
    />
  );
}
'@ | Out-File "src\pages\TeamStaffPage.jsx" -Encoding utf8

# Image README
@'
Masukkan foto team di folder ini:

expert-1.jpg
expert-2.jpg
expert-3.jpg
staff-1.jpg
staff-2.jpg
staff-3.jpg

Atau ubah path image di:
src/features/team/data/team.data.js
'@ | Out-File "public\images\team\README.txt" -Encoding utf8

# Route snippet
@'
Tambahkan import ini di src/App.jsx:

import TeamPage from "./pages/TeamPage";
import TeamExpertPage from "./pages/TeamExpertPage";
import TeamStaffPage from "./pages/TeamStaffPage";

Tambahkan route ini di dalam <Routes>:

<Route path="/team" element={<TeamPage />} />
<Route path="/team/expert" element={<TeamExpertPage />} />
<Route path="/team/staff" element={<TeamStaffPage />} />
'@ | Out-File "audit-output\team-route-snippet.txt" -Encoding utf8

Write-Host ""
Write-Host "SELESAI generate code Vite." -ForegroundColor Green
Write-Host "Sekarang edit src\App.jsx dan tambahkan route dari audit-output\team-route-snippet.txt"
Write-Host ""