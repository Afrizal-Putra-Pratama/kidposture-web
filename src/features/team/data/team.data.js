export const TEAM_GROUPS = {
  FOUNDERS: "founders",
  CORE: "core",
  EXPERTS: "experts",
};

export const EXPERT_ADVISOR_TEAM = [
  {
    id: 1,
    group: TEAM_GROUPS.EXPERTS,
    slug: "arif-kurniawan",
    href: "/team/experts/arif-kurniawan",
    name: "Arif Kurniawan, SST. FT, Ftr, M.Si",
    role: "Pediatric Physiotherapy Expert",
    type: "Expert & Advisor Team",
    image: "/images/team/experts/1.png",
    description:
      "Expert fisioterapi pediatri yang berfokus pada tumbuh kembang anak, kesehatan muskuloskeletal, dan screening postur anak.",
    bio:
      "Arif Kurniawan, SST. FT, Ftr, M.Si merupakan expert di bidang fisioterapi pediatri yang berfokus pada tumbuh kembang anak dan kesehatan muskuloskeletal. Dalam pengembangan Posturely, beliau berperan sebagai advisor dalam memastikan sistem screening postur anak tetap sesuai dengan prinsip fisioterapi klinis dan kebutuhan perkembangan anak. Keahliannya meliputi analisis postur, deteksi dini gangguan muskuloskeletal pada anak, serta pendekatan preventif melalui edukasi dan intervensi fisioterapi.",
    responsibilities: [
      "Memberikan arahan fisioterapi pediatri dalam pengembangan Posturely.",
      "Mendukung validasi pendekatan screening postur anak.",
      "Memberikan masukan terkait tumbuh kembang anak dan kesehatan muskuloskeletal.",
      "Menguatkan pendekatan preventif melalui edukasi dan intervensi fisioterapi.",
    ],
  },
  {
    id: 2,
    group: TEAM_GROUPS.EXPERTS,
    slug: "arif-setiawan",
    href: "/team/experts/arif-setiawan",
    name: "Arif Setiawan, S.Kom., M.Eng.",
    role: "Educational Technology & Informatics Advisor",
    type: "Expert & Advisor Team",
    image: "/images/team/experts/2.png",
    description:
      "Advisor teknologi pendidikan dan informatika yang memberi masukan terkait sistem digital, integrasi informasi, dan pengalaman pengguna.",
    bio:
      "Arif Setiawan merupakan expert dengan latar belakang Pendidikan Teknik Informatika yang berperan dalam memberikan masukan terkait pengembangan teknologi dan sistem digital pada Posturely. Beliau memiliki fokus pada pengembangan teknologi pendidikan, integrasi sistem informasi, serta optimalisasi pengalaman pengguna dalam aplikasi berbasis digital. Dalam Posturely, kontribusinya membantu memastikan pengembangan platform berjalan secara efektif, edukatif, dan mudah diakses oleh berbagai kalangan pengguna.",
    responsibilities: [
      "Memberikan arahan pengembangan teknologi digital Posturely.",
      "Mendukung integrasi sistem informasi dan edukasi digital.",
      "Memberikan masukan terkait pengalaman pengguna aplikasi.",
      "Membantu memastikan platform efektif, edukatif, dan mudah diakses.",
    ],
  },
  {
    id: 3,
    group: TEAM_GROUPS.EXPERTS,
    slug: "arif-pristianto",
    href: "/team/experts/arif-pristianto",
    name: "Arif Pristianto, M.Fis.",
    role: "Clinical Physiotherapy Validator & Pediatric Posture Expert",
    type: "Expert & Advisor Team",
    image: "/images/team/experts/3.png",
    description:
      "Validator klinis fisioterapi yang mengevaluasi kesesuaian indikator screening, interpretasi hasil, keamanan data, dan aksesibilitas sistem.",
    bio:
      "Arif Pristianto, M.Fis. merupakan dosen dan praktisi fisioterapi yang berperan sebagai validator ahli dalam pengembangan sistem Posturely. Dengan keahlian di bidang fisioterapi dan biomekanika pediatrik, beliau memberikan validasi terhadap kesesuaian indikator screening postur, interpretasi hasil analisis, serta relevansi fitur sistem dengan praktik fisioterapi anak. Dalam proses pengembangan Posturely, beliau turut mengevaluasi aspek clinical content suitability, compatibility fitur sistem, kejelasan informasi, keamanan data, hingga aksesibilitas aplikasi agar sesuai dengan kebutuhan pengguna dan standar pelayanan kesehatan digital.",
    responsibilities: [
      "Memvalidasi indikator screening postur anak.",
      "Mengevaluasi interpretasi hasil analisis postur.",
      "Memberikan validasi clinical content suitability.",
      "Mengevaluasi compatibility fitur, kejelasan informasi, keamanan data, dan aksesibilitas aplikasi.",
    ],
    variant: "blue",
  },
];
export const FOUNDING_TEAM = [
  {
    id: 1,
    group: TEAM_GROUPS.FOUNDERS,
    slug: "cournicova-affifah-syailendra",
    href: "/team/founders/cournicova-affifah-syailendra",
    name: "Cournicova Affifah Syailendra",
    role: "Founder & Chief Executive Officer (CEO)",
    type: "Founding Team",
    image: "/images/team/founders/1.jpg",
    description:
      "Mengarahkan visi, strategi inovasi, dan pengembangan bisnis Posturely sebagai solusi digital kesehatan anak.",
    bio:
      "Berlatar belakang Pendidikan Teknik Informatika, Cournicova berperan sebagai CEO dalam mengarahkan visi, strategi inovasi, dan pengembangan bisnis Posturely. Fokus utamanya adalah membangun solusi digital kesehatan yang mudah diakses serta mampu memberikan dampak nyata dalam deteksi dini gangguan postur anak.",
    responsibilities: [
      "Mengarahkan visi dan strategi pengembangan Posturely.",
      "Memimpin inovasi produk dan pengembangan bisnis.",
      "Membangun arah solusi digital kesehatan yang mudah diakses.",
      "Memastikan Posturely memberi dampak nyata dalam deteksi dini gangguan postur anak.",
    ],
  },
  {
    id: 2,
    group: TEAM_GROUPS.FOUNDERS,
    slug: "sulthon-kaffaah-al-farizzi",
    href: "/team/founders/sulthon-kaffaah-al-farizzi",
    name: "Sulthon Kaffaah Al Farizzi",
    role: "Founder & Chief Technology Officer (CTO)",
    type: "Founding Team",
    image: "/images/team/founders/2.jpg",
    description:
      "Bertanggung jawab dalam pengembangan teknologi, AI computer vision, integrasi MediaPipe, dan performa sistem Posturely.",
    bio:
      "Dengan latar belakang Informatika, Sulthon bertanggung jawab dalam pengembangan teknologi dan sistem Posturely. Ia berfokus pada implementasi AI berbasis computer vision, integrasi MediaPipe, pengembangan web application, serta keamanan dan performa sistem.",
    responsibilities: [
      "Mengembangkan arsitektur teknologi dan sistem Posturely.",
      "Mengimplementasikan AI berbasis computer vision.",
      "Mengintegrasikan MediaPipe untuk analisis postur.",
      "Membangun web application yang aman, stabil, dan performatif.",
    ],
  },
  {
    id: 3,
    group: TEAM_GROUPS.FOUNDERS,
    slug: "yulaihah",
    href: "/team/founders/yulaihah",
    name: "Yulaihah",
    role: "Founder & Chief Operating Officer (COO)",
    type: "Founding Team",
    image: "/images/team/founders/3.jpg",
    description:
      "Mengelola operasional pengembangan produk, koordinasi tim, dan penyempurnaan pengalaman pengguna Posturely.",
    bio:
      "Yulaihah berasal dari Pendidikan Teknik Informatika dan berperan dalam pengelolaan operasional pengembangan produk. Ia memastikan koordinasi tim, pengembangan fitur, serta pengalaman pengguna berjalan secara efektif dan terstruktur.",
    responsibilities: [
      "Mengelola operasional pengembangan produk.",
      "Memastikan koordinasi tim berjalan efektif.",
      "Mendukung pengembangan fitur secara terstruktur.",
      "Mengawal pengalaman pengguna agar nyaman dan mudah dipahami.",
    ],
    variant: "blue",
  },
  {
    id: 4,
    group: TEAM_GROUPS.FOUNDERS,
    slug: "afrizal-putra-pratama",
    href: "/team/founders/afrizal-putra-pratama",
    name: "Afrizal Putra Pratama",
    role: "Founder & Software Developer",
    type: "Founding Team",
    image: "/images/team/founders/4.jpg",
    description:
      "Berkontribusi dalam pengembangan backend system, manajemen database, dan implementasi teknis aplikasi web Posturely.",
    bio:
      "Afrizal berasal dari bidang Informatika dan berkontribusi dalam pengembangan backend system, database management, serta implementasi teknis aplikasi berbasis web agar sistem berjalan optimal dan stabil.",
    responsibilities: [
      "Mengembangkan backend system aplikasi Posturely.",
      "Mengelola struktur dan kebutuhan database.",
      "Mendukung implementasi teknis aplikasi berbasis web.",
      "Memastikan sistem berjalan optimal, stabil, dan terstruktur.",
    ],
  },
  {
    id: 5,
    group: TEAM_GROUPS.FOUNDERS,
    slug: "taqiyyah-nurul-azzah",
    href: "/team/founders/taqiyyah-nurul-azzah",
    name: "Taqiyyah Nurul ‘Azzah",
    role: "Founder & Physiotherapy Research Lead",
    type: "Founding Team",
    image: "/images/team/founders/5.jpg",
    description:
      "Berperan dalam pengembangan dasar penelitian, validasi klinis awal, dan pendekatan fisioterapi preventif untuk Posturely.",
    bio:
      "Taqi memiliki latar belakang fisioterapi dan berperan dalam pengembangan dasar penelitian serta validasi klinis awal Posturely. Fokusnya meliputi pengembangan indikator screening postur anak, edukasi kesehatan muskuloskeletal, dan pendekatan preventif fisioterapi.",
    responsibilities: [
      "Mengembangkan dasar penelitian fisioterapi untuk Posturely.",
      "Mendukung penyusunan indikator screening postur anak.",
      "Menyusun pendekatan edukasi kesehatan muskuloskeletal.",
      "Memberikan arahan preventif berbasis keilmuan fisioterapi.",
    ],
  },
  {
    id: 6,
    group: TEAM_GROUPS.FOUNDERS,
    slug: "fadhil-erdya-qasmal",
    href: "/team/founders/fadhil-erdya-qasmal",
    name: "Fadhil Erdya Qasmal",
    role: "Founder, Technical Support & Presenter",
    type: "Founding Team",
    image: "/images/team/founders/6.jpg",
    description:
      "Mendukung kesiapan teknis, demonstrasi sistem, dan penyampaian presentasi produk Posturely kepada audiens.",
    bio:
      "Fadhil berperan dalam dukungan teknis IT, demonstrasi sistem, serta penyampaian presentasi produk kepada audiens akademik maupun publik. Ia juga membantu memastikan kesiapan teknis selama pengembangan dan implementasi Posturely.",
    responsibilities: [
      "Memberikan dukungan teknis IT selama pengembangan.",
      "Membantu demonstrasi sistem Posturely.",
      "Menyampaikan presentasi produk kepada audiens akademik maupun publik.",
      "Memastikan kesiapan teknis saat implementasi dan presentasi.",
    ],
    variant: "blue",
  },
];

export const CORE_DEVELOPMENT_TEAM = [
  {
    id: 1,
    group: TEAM_GROUPS.CORE,
    slug: "cournicova-affifah-syailendra",
    href: "/team/core/cournicova-affifah-syailendra",
    name: "Cournicova Affifah Syailendra",
    role: "Strategy & Business Lead",
    type: "Core Development Team",
    image: "/images/team/core/1.jpg",
    description:
      "Memimpin arah strategi, pengembangan bisnis, dan positioning Posturely sebagai solusi digital kesehatan anak.",
    bio:
      "Dalam Core Development Team, Cournicova berperan sebagai Strategy & Business Lead yang mengarahkan strategi inovasi, kebutuhan pengguna, dan pengembangan nilai bisnis Posturely agar solusi yang dibangun memiliki arah yang jelas, relevan, dan berdampak.",
    responsibilities: [
      "Mengarahkan strategi pengembangan produk.",
      "Mengelola positioning dan nilai utama Posturely.",
      "Menganalisis kebutuhan pengguna dan peluang implementasi.",
      "Mendukung pengembangan model bisnis dan keberlanjutan produk.",
    ],
  },
  {
    id: 2,
    group: TEAM_GROUPS.CORE,
    slug: "sulthon-kaffaah-al-farizzi",
    href: "/team/core/sulthon-kaffaah-al-farizzi",
    name: "Sulthon Kaffaah Al Farizzi",
    role: "Technology Lead",
    type: "Core Development Team",
    image: "/images/team/core/2.jpg",
    description:
      "Memimpin pengembangan teknologi, integrasi AI computer vision, MediaPipe, web application, dan performa sistem.",
    bio:
      "Dalam Core Development Team, Sulthon berperan sebagai Technology Lead yang bertanggung jawab pada pengembangan arsitektur teknologi, implementasi AI berbasis computer vision, integrasi MediaPipe, keamanan sistem, dan performa aplikasi Posturely.",
    responsibilities: [
      "Memimpin pengembangan teknologi Posturely.",
      "Mengimplementasikan AI computer vision dan MediaPipe.",
      "Mengembangkan web application yang stabil dan aman.",
      "Mengoptimalkan performa dan skalabilitas sistem.",
    ],
  },
  {
    id: 3,
    group: TEAM_GROUPS.CORE,
    slug: "yulaihah",
    href: "/team/core/yulaihah",
    name: "Yulaihah",
    role: "Operations & Product Coordination Lead",
    type: "Core Development Team",
    image: "/images/team/core/3.jpg",
    description:
      "Mengelola koordinasi operasional, alur pengembangan fitur, dan penyempurnaan pengalaman pengguna Posturely.",
    bio:
      "Dalam Core Development Team, Yulaihah berperan sebagai Operations & Product Coordination Lead yang memastikan koordinasi tim, pengembangan fitur, dan pengalaman pengguna berjalan secara terstruktur, efektif, dan selaras dengan tujuan Posturely.",
    responsibilities: [
      "Mengelola koordinasi operasional pengembangan produk.",
      "Menyusun alur kerja dan kebutuhan fitur.",
      "Mendukung evaluasi pengalaman pengguna.",
      "Memastikan proses pengembangan berjalan terstruktur.",
    ],
    variant: "blue",
  },
  {
    id: 4,
    group: TEAM_GROUPS.CORE,
    slug: "afrizal-putra-pratama",
    href: "/team/core/afrizal-putra-pratama",
    name: "Afrizal Putra Pratama",
    role: "Software Development Lead",
    type: "Core Development Team",
    image: "/images/team/core/4.jpg",
    description:
      "Mendukung pengembangan teknis aplikasi, backend system, database, dan stabilitas sistem Posturely.",
    bio:
      "Dalam Core Development Team, Afrizal berperan sebagai Software Development Lead yang berkontribusi pada pengembangan backend system, database management, dan implementasi teknis aplikasi berbasis web agar sistem Posturely berjalan stabil dan optimal.",
    responsibilities: [
      "Mengembangkan backend system Posturely.",
      "Mengelola database dan struktur data aplikasi.",
      "Mendukung integrasi fitur berbasis web.",
      "Menjaga stabilitas dan kualitas teknis sistem.",
    ],
  },
  {
    id: 5,
    group: TEAM_GROUPS.CORE,
    slug: "taqiyyah-nurul-azzah",
    href: "/team/core/taqiyyah-nurul-azzah",
    name: "Taqiyyah Nurul ‘Azzah",
    role: "Physiotherapy Research Lead",
    type: "Core Development Team",
    image: "/images/team/core/5.jpg",
    description:
      "Menguatkan aspek riset fisioterapi, indikator screening postur, dan edukasi kesehatan muskuloskeletal.",
    bio:
      "Dalam Core Development Team, Taqi berperan sebagai Physiotherapy Research Lead yang mendukung pengembangan dasar riset, penyusunan indikator screening postur anak, serta pendekatan edukasi kesehatan muskuloskeletal yang preventif dan mudah dipahami.",
    responsibilities: [
      "Mendukung riset fisioterapi untuk pengembangan Posturely.",
      "Menyusun indikator screening postur anak.",
      "Mengembangkan edukasi kesehatan muskuloskeletal.",
      "Memberikan masukan fisioterapi pada fitur dan rekomendasi sistem.",
    ],
  },
  {
    id: 6,
    group: TEAM_GROUPS.CORE,
    slug: "fadhil-erdya-qasmal",
    href: "/team/core/fadhil-erdya-qasmal",
    name: "Fadhil Erdya Qasmal",
    role: "Technical Support & Presentation Lead",
    type: "Core Development Team",
    image: "/images/team/core/6.jpg",
    description:
      "Mendukung kesiapan teknis, demonstrasi sistem, dan penyampaian presentasi produk secara profesional.",
    bio:
      "Dalam Core Development Team, Fadhil berperan sebagai Technical Support & Presentation Lead yang membantu kesiapan teknis aplikasi, demonstrasi sistem, serta penyampaian presentasi produk kepada audiens akademik maupun publik.",
    responsibilities: [
      "Menyiapkan kebutuhan teknis untuk demo dan presentasi.",
      "Mendukung troubleshooting sistem saat implementasi.",
      "Membantu demonstrasi fitur Posturely.",
      "Menyampaikan presentasi produk secara komunikatif.",
    ],
    variant: "blue",
  },
  {
    id: 7,
    group: TEAM_GROUPS.CORE,
    slug: "zahra-naura-azalia",
    href: "/team/core/zahra-naura-azalia",
    name: "Zahra Naura Azalia",
    role: "Physiotherapy Specialist",
    type: "Core Development Team",
    image: "/images/team/core/7.jpg",
    description:
      "Mendukung aspek fisioterapi, analisis postur anak, edukasi muskuloskeletal, dan rekomendasi latihan preventif.",
    bio:
      "Zahra Naura Azalia mendukung pengembangan aspek fisioterapi dan kesehatan postur dalam sistem Posturely. Fokusnya meliputi analisis postur anak, edukasi kesehatan muskuloskeletal, serta penyusunan rekomendasi latihan dan pencegahan gangguan postur.",
    responsibilities: [
      "Mendukung analisis postur anak berbasis keilmuan fisioterapi.",
      "Menyusun edukasi kesehatan muskuloskeletal.",
      "Membantu pengembangan rekomendasi latihan postur.",
      "Memberikan masukan terkait pencegahan gangguan postur anak.",
    ],
  },
  {
    id: 8,
    group: TEAM_GROUPS.CORE,
    slug: "octa-nurcahyani",
    href: "/team/core/octa-nurcahyani",
    name: "Octa Nurcahyani",
    role: "Communication & Presentation Specialist",
    type: "Core Development Team",
    image: "/images/team/core/8.jpg",
    description:
      "Berperan dalam komunikasi publik, branding, presentasi produk, dan penyusunan materi komunikasi Posturely.",
    bio:
      "Dengan latar belakang Pendidikan Bahasa Inggris, Octa Nur Cahyani berperan dalam bidang komunikasi publik, branding, dan presentasi produk. Ia bertanggung jawab dalam penyusunan materi komunikasi agar informasi mengenai Posturely dapat tersampaikan secara jelas, menarik, dan mudah dipahami masyarakat.",
    responsibilities: [
      "Menyusun materi komunikasi publik Posturely.",
      "Mendukung branding dan penyampaian pesan produk.",
      "Mempersiapkan presentasi produk yang jelas dan menarik.",
      "Menyederhanakan informasi agar mudah dipahami masyarakat.",
    ],
  },
];


export const TEAM_SECTIONS = [
  {
    id: TEAM_GROUPS.FOUNDERS,
    title: "Founding Team",
    subtitle:
      "Enam pendiri awal Posturely yang membangun fondasi visi, teknologi, riset, operasional, dan pengembangan produk.",
    href: "/team/founders",
    members: FOUNDING_TEAM,
  },
  {
    id: TEAM_GROUPS.CORE,
    title: "Core Development Team",
    subtitle:
      "Tim pengembangan inti Posturely yang terdiri dari founder dan kontributor aktif lintas bidang untuk memperkuat teknologi, fisioterapi, komunikasi, dan kesiapan implementasi.",
    href: "/team/core",
    members: CORE_DEVELOPMENT_TEAM,
  },
  {
    id: TEAM_GROUPS.EXPERTS,
    title: "Expert & Advisor Team",
    subtitle:
      "Para expert, advisor, dan validator yang membantu memastikan Posturely relevan secara klinis, edukatif, aman, dan sesuai kebutuhan pengguna.",
    href: "/team/experts",
    members: EXPERT_ADVISOR_TEAM,
  },
];

export const ALL_TEAM = [
  ...FOUNDING_TEAM,
  ...CORE_DEVELOPMENT_TEAM,
  ...EXPERT_ADVISOR_TEAM,
];

export function getTeamSectionByGroup(group) {
  return TEAM_SECTIONS.find((section) => section.id === group);
}

export function getTeamByGroupAndSlug(group, slug) {
  return ALL_TEAM.find(
    (member) => member.group === group && member.slug === slug
  );
}

export function getTeamByHref(href) {
  return ALL_TEAM.find((member) => member.href === href);
}

export function getTeamBySlug(slug) {
  return ALL_TEAM.find((member) => member.slug === slug);
}

export function getTeamMembersByGroup(group) {
  return ALL_TEAM.filter((member) => member.group === group);
}

export function getRelatedTeamMembers(group, slug, limit = 3) {
  return ALL_TEAM.filter(
    (member) => member.group === group && member.slug !== slug
  ).slice(0, limit);
}