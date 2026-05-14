export const EXPERT_TEAM = [
  {
    id: 1,
    slug: "expert-1",
    name: "Nama Expert 1",
    role: "Physiotherapy Expert",
    type: "Expert Team",
    image: "/images/team/expert-1.jpg",
    description:
      "Mendukung validasi pendekatan edukasi dan layanan pemantauan postur anak berbasis keilmuan fisioterapi.",
    bio:
      "Expert ini berperan dalam memberikan arahan keilmuan terkait fisioterapi anak, edukasi postur, serta validasi pendekatan layanan agar sesuai dengan prinsip kesehatan muskuloskeletal.",
    responsibilities: [
      "Memberikan masukan berbasis keilmuan fisioterapi.",
      "Mendukung validasi materi edukasi postur anak.",
      "Memberikan arahan pengembangan layanan berbasis kebutuhan pengguna.",
    ],
  },
  {
    id: 2,
    slug: "expert-2",
    name: "Nama Expert 2",
    role: "Child Development Advisor",
    type: "Expert Team",
    image: "/images/team/expert-2.jpg",
    description:
      "Memberikan arahan terkait tumbuh kembang anak, kebiasaan postur, dan edukasi kesehatan preventif.",
    bio:
      "Expert ini membantu memastikan pendekatan Posturely tetap ramah anak dan relevan untuk kebutuhan orang tua dalam memahami tumbuh kembang serta kebiasaan postur sehat.",
    responsibilities: [
      "Memberikan arahan terkait tumbuh kembang anak.",
      "Membantu penyusunan edukasi preventif.",
      "Mendukung evaluasi alur edukasi untuk orang tua.",
    ],
  },
  {
    id: 3,
    slug: "expert-3",
    name: "Nama Expert 3",
    role: "Digital Health Advisor",
    type: "Expert Team",
    image: "/images/team/expert-3.jpg",
    description:
      "Menghubungkan kebutuhan layanan kesehatan anak dengan solusi teknologi digital yang mudah digunakan.",
    bio:
      "Expert ini berfokus pada integrasi teknologi kesehatan digital agar platform Posturely mudah digunakan, aman, dan relevan untuk kebutuhan orang tua serta fisioterapis.",
    responsibilities: [
      "Memberikan arahan pengembangan digital health.",
      "Membantu penyusunan pengalaman pengguna layanan kesehatan digital.",
      "Mendukung strategi integrasi teknologi dengan kebutuhan klinis.",
    ],
    variant: "blue",
  },
];

export const STAFF_TEAM = [
  {
    id: 4,
    slug: "mahasiswa-1",
    name: "Nama Mahasiswa 1",
    role: "Student Team Member",
    type: "Student Team",
    image: "/images/team/staff-1.jpg",
    description:
      "Berperan dalam pengembangan ide, riset kebutuhan pengguna, dan dukungan implementasi platform Posturely.",
    bio:
      "Mahasiswa ini berperan dalam pengembangan konsep, riset kebutuhan pengguna, serta membantu memastikan fitur yang dibuat sesuai dengan kebutuhan orang tua dan fisioterapis.",
    responsibilities: [
      "Melakukan riset kebutuhan pengguna.",
      "Membantu pengembangan konsep fitur.",
      "Mendukung proses validasi ide produk.",
    ],
  },
  {
    id: 5,
    slug: "mahasiswa-2",
    name: "Nama Mahasiswa 2",
    role: "Student Team Member",
    type: "Student Team",
    image: "/images/team/staff-2.jpg",
    description:
      "Mendukung penyusunan konten, dokumentasi, dan analisis alur layanan agar mudah dipahami pengguna.",
    bio:
      "Mahasiswa ini membantu penyusunan konten edukasi, dokumentasi sistem, dan penyederhanaan informasi agar mudah dipahami oleh pengguna.",
    responsibilities: [
      "Menyusun konten edukasi.",
      "Membantu dokumentasi proyek.",
      "Menganalisis alur layanan pengguna.",
    ],
  },
  {
    id: 6,
    slug: "mahasiswa-3",
    name: "Nama Mahasiswa 3",
    role: "Student Team Member",
    type: "Student Team",
    image: "/images/team/staff-3.jpg",
    description:
      "Membantu pengembangan fitur, pengujian sistem, dan penyempurnaan pengalaman pengguna pada platform.",
    bio:
      "Mahasiswa ini mendukung proses teknis, pengujian fitur, serta evaluasi pengalaman pengguna agar platform berjalan lebih stabil dan nyaman digunakan.",
    responsibilities: [
      "Membantu pengembangan fitur.",
      "Melakukan pengujian sistem.",
      "Mengevaluasi pengalaman pengguna.",
    ],
    variant: "blue",
  },
  {
    id: 7,
    slug: "mahasiswa-4",
    name: "Nama Mahasiswa 4",
    role: "Student Team Member",
    type: "Student Team",
    image: "/images/team/staff-4.jpg",
    description:
      "Berperan dalam pengelolaan data, validasi kebutuhan aplikasi, dan dukungan operasional proyek.",
    bio:
      "Mahasiswa ini membantu pengelolaan data, validasi kebutuhan sistem, serta mendukung kebutuhan operasional agar proyek berjalan lebih terstruktur.",
    responsibilities: [
      "Mengelola kebutuhan data proyek.",
      "Membantu validasi kebutuhan aplikasi.",
      "Mendukung koordinasi operasional.",
    ],
  },
  {
    id: 8,
    slug: "mahasiswa-5",
    name: "Nama Mahasiswa 5",
    role: "Student Team Member",
    type: "Student Team",
    image: "/images/team/staff-5.jpg",
    description:
      "Mendukung koordinasi tim, evaluasi tampilan, serta penyempurnaan materi edukasi untuk pengguna.",
    bio:
      "Mahasiswa ini berperan dalam koordinasi tim, evaluasi tampilan halaman, serta penyempurnaan materi edukasi agar lebih komunikatif dan profesional.",
    responsibilities: [
      "Mendukung koordinasi tim.",
      "Mengevaluasi tampilan antarmuka.",
      "Menyempurnakan materi edukasi pengguna.",
    ],
  },
];

export const ALL_TEAM = [...EXPERT_TEAM, ...STAFF_TEAM];

export function getTeamBySlug(slug) {
  return ALL_TEAM.find((member) => member.slug === slug);
}