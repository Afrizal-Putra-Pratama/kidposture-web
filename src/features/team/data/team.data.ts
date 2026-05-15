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
