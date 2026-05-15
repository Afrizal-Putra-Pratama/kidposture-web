import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Perbaikan Scroll Otomatis dari Halaman Lain ke Landing Page
  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const sectionId = location.hash.replace("#", "");
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  const goToSection = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const goToRoute = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const navLinks = [
    { label: "Tentang", id: "about" },
    { label: "Edukasi", id: "education" },
    { label: "Cara Kerja", id: "how-it-works" },
    { label: "Untuk Siapa", id: "for-whom" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-[65px] flex items-center justify-between gap-4">
        
        {/* LOGO */}
        <div
          className="inline-flex items-center gap-2 font-bold text-xl text-slate-900 cursor-pointer hover:opacity-85 transition-opacity"
          onClick={() => goToRoute("/")}
        >
          <img src="/logo-posturely.svg" alt="Posturely Logo" className="h-[65px] w-auto max-w-[160px] object-contain block" />
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-3">
          {navLinks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goToSection(item.id)}
              className="px-3.5 py-1.5 rounded-full text-[0.9rem] text-slate-600 hover:bg-slate-100 hover:text-sky-600 transition-all focus:outline-none"
            >
              {item.label}
            </button>
          ))}

          {/* DROPDOWN TIM KAMI */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => goToRoute("/team")}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[0.9rem] text-slate-600 hover:bg-slate-100 hover:text-sky-600 transition-all focus:outline-none"
            >
              Tim Kami
              <span className="text-[0.7rem] transition-transform group-hover:rotate-180">▾</span>
            </button>
            <div className="invisible absolute left-1/2 top-full mt-1 min-w-[180px] -translate-x-1/2 translate-y-2 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg shadow-slate-900/10 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <button onClick={() => goToRoute("/team")} className="block w-full rounded-lg px-4 py-2.5 text-left text-[0.85rem] font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600">Semua Tim</button>
              <button onClick={() => goToRoute("/team/expert")} className="block w-full rounded-lg px-4 py-2.5 text-left text-[0.85rem] font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600">Expert Team</button>
              <button onClick={() => goToRoute("/team/staff")} className="block w-full rounded-lg px-4 py-2.5 text-left text-[0.85rem] font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600">Staff Mahasiswa</button>
            </div>
          </div>
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => goToRoute("/login")} className="px-4 py-2 rounded-full text-[0.9rem] text-slate-600 hover:text-sky-600 transition-colors focus:outline-none">
            Masuk
          </button>
          <button onClick={() => goToRoute("/register/physio")} className="px-4 py-2 rounded-full bg-sky-500 text-white text-[0.9rem] font-medium shadow-lg shadow-sky-500/30 hover:bg-sky-600 hover:-translate-y-0.5 transition-all focus:outline-none">
            Daftar Fisioterapis
          </button>
        </div>

        {/* MOBILE TOGGLE */}
        <button type="button" className="md:hidden p-1.5 text-slate-700 focus:outline-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden flex flex-col gap-2 p-4 pb-5 bg-slate-50 border-t border-slate-200 shadow-2xl">
          {navLinks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goToSection(item.id)}
              className="py-3 text-left text-[0.95rem] text-slate-700 hover:text-sky-600 transition-colors focus:outline-none pl-2"
            >
              {item.label}
            </button>
          ))}

          {/* TIM KAMI MOBILE */}
          <div className="flex flex-col border-l-2 border-slate-200 ml-4 mt-1 mb-2">
            <button onClick={() => goToRoute("/team")} className="py-2.5 text-left text-[0.95rem] text-slate-700 hover:text-sky-600 pl-3">Tim Kami</button>
            <button onClick={() => goToRoute("/team/expert")} className="py-2 text-left text-[0.85rem] text-slate-500 hover:text-sky-600 pl-6">Expert Team</button>
            <button onClick={() => goToRoute("/team/staff")} className="py-2 text-left text-[0.85rem] text-slate-500 hover:text-sky-600 pl-6">Staff Mahasiswa</button>
          </div>

          <hr className="border-t border-slate-200 my-2" />

          <button onClick={() => goToRoute("/login")} className="px-4 py-2.5 rounded-full border border-slate-300 bg-white text-slate-700 text-[0.9rem] hover:bg-slate-100 transition-all focus:outline-none text-center mt-2">
            Masuk
          </button>
          <button onClick={() => goToRoute("/register/physio")} className="px-4 py-2.5 rounded-full border border-sky-500 bg-sky-500 text-white text-[0.9rem] hover:bg-sky-600 transition-all focus:outline-none text-center">
            Daftar Fisioterapis
          </button>
        </div>
      )}
    </header>
  );
}