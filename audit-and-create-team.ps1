# ============================================================
# Audit + Generate Our Team Landing Structure
# Project: kidposture-web
# Run from: D:\projects\posturely\kidposture-web
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "== Audit struktur project ==" -ForegroundColor Cyan

$root = Get-Location
$auditDir = Join-Path $root "audit-output"

if (!(Test-Path $auditDir)) {
  New-Item -ItemType Directory -Path $auditDir | Out-Null
}

# 1. Audit struktur bersih tanpa node_modules, .next, .git
Get-ChildItem -Recurse -Force |
Where-Object {
  $_.FullName -notmatch '\\node_modules\\' -and
  $_.FullName -notmatch '\\.next\\' -and
  $_.FullName -notmatch '\\.git\\' -and
  $_.FullName -notmatch '\\dist\\' -and
  $_.FullName -notmatch '\\build\\'
} |
Select-Object FullName |
Out-File (Join-Path $auditDir "structure-clean.txt") -Encoding utf8

# 2. Audit src kalau ada
if (Test-Path "src") {
  tree src /F /A | Out-File (Join-Path $auditDir "structure-src.txt") -Encoding utf8
}

# 3. Audit app router
if (Test-Path "src\app") {
  tree src\app /F /A | Out-File (Join-Path $auditDir "structure-app.txt") -Encoding utf8
}

# 4. Audit package json
if (Test-Path "package.json") {
  Get-Content "package.json" | Out-File (Join-Path $auditDir "package-json.txt") -Encoding utf8
}

Write-Host "Audit selesai. File ada di folder audit-output." -ForegroundColor Green


# ============================================================
# Detect struktur Next.js
# ============================================================

Write-Host "== Deteksi struktur Next.js ==" -ForegroundColor Cyan

$hasSrcApp = Test-Path "src\app"
$hasApp = Test-Path "app"
$useSrc = $hasSrcApp

if ($useSrc) {
  $appRoot = "src\app"
  $featureRoot = "src\features"
  $componentRoot = "src\components"
  $libRoot = "src\lib"
} elseif ($hasApp) {
  $appRoot = "app"
  $featureRoot = "features"
  $componentRoot = "components"
  $libRoot = "lib"
} else {
  Write-Host "Folder app tidak ditemukan. Project mungkin belum pakai App Router." -ForegroundColor Yellow
  Write-Host "Script tetap membuat struktur di src/app." -ForegroundColor Yellow

  $appRoot = "src\app"
  $featureRoot = "src\features"
  $componentRoot = "src\components"
  $libRoot = "src\lib"
}

# Deteksi locale [lang]
$useLang = $false
$langLandingRoot = ""

if (Test-Path "$appRoot\[lang]") {
  $useLang = $true

  if (Test-Path "$appRoot\[lang]\(landing)") {
    $langLandingRoot = "$appRoot\[lang]\(landing)"
  } else {
    $langLandingRoot = "$appRoot\[lang]"
  }
}

if ($useLang) {
  $teamRouteRoot = "$langLandingRoot\team"
} else {
  $teamRouteRoot = "$appRoot\team"
}

Write-Host "App root: $appRoot"
Write-Host "Team route root: $teamRouteRoot"


# ============================================================
# Create folders
# ============================================================

$folders = @(
  "$teamRouteRoot",
  "$teamRouteRoot\expert",
  "$teamRouteRoot\staff",
  "$featureRoot\team\components",
  "$featureRoot\team\data",
  "public\images\team"
)

foreach ($folder in $folders) {
  if (!(Test-Path $folder)) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    Write-Host "Created: $folder" -ForegroundColor Green
  }
}


# ============================================================
# Create helper cn if needed
# ============================================================

if (!(Test-Path $libRoot)) {
  New-Item -ItemType Directory -Path $libRoot -Force | Out-Null
}

$utilsFile = "$libRoot\utils.ts"

if (!(Test-Path $utilsFile)) {
@'
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
'@ | Out-File $utilsFile -Encoding utf8

  Write-Host "Created: $utilsFile" -ForegroundColor Green
}


# ============================================================
# Create TeamCard
# ============================================================

$teamCardFile = "$featureRoot\team\components\team-card.tsx"

@'
import Image from "next/image";
import { cn } from "@/lib/utils";

export type TeamCardProps = {
  name: string;
  role: string;
  image: string;
  description?: string;
  variant?: "light" | "blue";
};

export function TeamCard({
  name,
  role,
  image,
  description,
  variant = "light",
}: TeamCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[28px] border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        variant === "blue"
          ? "border-blue-700/20 bg-gradient-to-br from-blue-700 to-blue-950"
          : "border-slate-200 bg-white/90 shadow-sm"
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent p-6 text-white">
          <p className="text-sm font-semibold text-amber-300">{role}</p>
          <h3 className="mt-1 text-2xl font-bold">{name}</h3>

          {description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
'@ | Out-File $teamCardFile -Encoding utf8

Write-Host "Generated: $teamCardFile" -ForegroundColor Green


# ============================================================
# Create Team Data
# ============================================================

$teamDataFile = "$featureRoot\team\data\team.data.ts"

@'
import type { TeamCardProps } from "@/features/team/components/team-card";

export const EXPERT_TEAM: TeamCardProps[] = [
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

export const STAFF_TEAM: TeamCardProps[] = [
  {
    name: "Nama Staff 1",
    role: "Program Officer",
    image: "/images/team/staff-1.jpg",
    description:
      "Mengelola program, agenda, dan kebutuhan operasional Balale secara profesional.",
  },
  {
    name: "Nama Staff 2",
    role: "Content Strategist",
    image: "/images/team/staff-2.jpg",
    description:
      "Menyusun konten edukatif, informatif, dan menarik untuk audiens Balale.",
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

export const ALL_TEAM: TeamCardProps[] = [...EXPERT_TEAM, ...STAFF_TEAM];
'@ | Out-File $teamDataFile -Encoding utf8

Write-Host "Generated: $teamDataFile" -ForegroundColor Green


# ============================================================
# Create Team Page Component
# ============================================================

$teamPageFile = "$featureRoot\team\components\team-page.tsx"

@'
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

import { TeamCard, type TeamCardProps } from "@/features/team/components/team-card";
import { cn } from "@/lib/utils";

type TeamPageProps = {
  title: string;
  subtitle: string;
  teams: TeamCardProps[];
  active?: "all" | "expert" | "staff";
};

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
] as const;

export function TeamPage({
  title,
  subtitle,
  teams,
  active = "all",
}: TeamPageProps) {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 py-20">
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(45deg,#0f172a_1px,transparent_1px),linear-gradient(-45deg,#0f172a_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm">
              <span>Our Team</span>
              <ChevronDown className="h-4 w-4" />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
              {title}
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              {subtitle}
            </p>

            <div className="mx-auto mt-8 h-1.5 w-28 rounded-full bg-amber-500" />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            {tabs.map((tab) => {
              const isActive = tab.value === active;

              return (
                <Link
                  key={tab.value}
                  href={tab.href}
                  className={cn(
                    "inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-semibold transition",
                    isActive
                      ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-amber-400 hover:text-amber-700"
                  )}
                >
                  {tab.label}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              );
            })}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((member) => (
              <TeamCard key={`${member.name}-${member.role}`} {...member} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
'@ | Out-File $teamPageFile -Encoding utf8

Write-Host "Generated: $teamPageFile" -ForegroundColor Green


# ============================================================
# Create route pages
# ============================================================

$teamMainPage = "$teamRouteRoot\page.tsx"
$teamExpertPage = "$teamRouteRoot\expert\page.tsx"
$teamStaffPage = "$teamRouteRoot\staff\page.tsx"

@'
import type { Metadata } from "next";

import { TeamPage } from "@/features/team/components/team-page";
import { ALL_TEAM } from "@/features/team/data/team.data";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Kenali tim Balale yang terdiri dari kurator budaya, peneliti, desainer, dan pengembang teknologi.",
};

export default function Page() {
  return (
    <TeamPage
      title="Balale Expert Team"
      subtitle="Kami adalah kumpulan kurator budaya, peneliti, desainer, dan pengembang teknologi yang berkomitmen menjaga warisan Nusantara sambil menginovasi masa depan."
      teams={ALL_TEAM}
      active="all"
    />
  );
}
'@ | Out-File $teamMainPage -Encoding utf8

@'
import type { Metadata } from "next";

import { TeamPage } from "@/features/team/components/team-page";
import { EXPERT_TEAM } from "@/features/team/data/team.data";

export const metadata: Metadata = {
  title: "Balale Expert Team",
  description:
    "Tim ahli Balale dalam bidang budaya, riset, edukasi, desain, dan teknologi.",
};

export default function Page() {
  return (
    <TeamPage
      title="Balale Expert Team"
      subtitle="Tim ahli Balale terdiri dari para profesional yang berperan dalam kurasi budaya, riset, edukasi, dan inovasi digital untuk menjaga warisan Nusantara."
      teams={EXPERT_TEAM}
      active="expert"
    />
  );
}
'@ | Out-File $teamExpertPage -Encoding utf8

@'
import type { Metadata } from "next";

import { TeamPage } from "@/features/team/components/team-page";
import { STAFF_TEAM } from "@/features/team/data/team.data";

export const metadata: Metadata = {
  title: "Balale Staff",
  description:
    "Tim operasional Balale yang mendukung program, konten, komunitas, dan layanan digital.",
};

export default function Page() {
  return (
    <TeamPage
      title="Balale Staff"
      subtitle="Tim staff Balale mendukung operasional, konten, komunitas, dan pengembangan layanan agar visi pelestarian budaya dapat berjalan secara profesional."
      teams={STAFF_TEAM}
      active="staff"
    />
  );
}
'@ | Out-File $teamStaffPage -Encoding utf8

Write-Host "Generated route pages." -ForegroundColor Green


# ============================================================
# Create placeholder notes for images
# ============================================================

$readmeImage = "public\images\team\README.txt"

@'
Masukkan foto team di folder ini dengan nama:

expert-1.jpg
expert-2.jpg
expert-3.jpg
staff-1.jpg
staff-2.jpg
staff-3.jpg

Atau ubah path image di:
src/features/team/data/team.data.ts

Kalau gambar belum ada, halaman tetap terbuat tetapi Next.js akan error saat image tidak ditemukan.
'@ | Out-File $readmeImage -Encoding utf8

Write-Host "Image note created: $readmeImage" -ForegroundColor Green


# ============================================================
# Final
# ============================================================

Write-Host ""
Write-Host "SELESAI." -ForegroundColor Green
Write-Host "1. Audit ada di: audit-output"
Write-Host "2. Halaman team dibuat di: $teamRouteRoot"
Write-Host "3. Data team ada di: $teamDataFile"
Write-Host "4. Masukkan gambar ke: public\images\team"
Write-Host ""
Write-Host "Jalankan:"
Write-Host "npm run dev"
Write-Host ""