import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goToSection = (sectionId) => {
    setMobileMenuOpen(false);

    if (location.pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
      });
      return;
    }

    navigate(`/#${sectionId}`);
  };

  const goToRoute = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
          onClick={() => goToRoute("/")}
        >
          <img
            src="/logo-favicon-posturely.svg"
            alt="Posturely Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Posturely
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-8 font-semibold text-sm text-slate-500">
          <button
            type="button"
            onClick={() => goToSection("features")}
            className="hover:text-blue-800 transition-colors"
          >
            Fitur
          </button>

          <button
            type="button"
            onClick={() => goToSection("how-it-works")}
            className="hover:text-blue-800 transition-colors"
          >
            Cara Kerja
          </button>

          <button
            type="button"
            onClick={() => goToSection("physiotherapists")}
            className="hover:text-blue-800 transition-colors"
          >
            Fisioterapis
          </button>

          <button
            type="button"
            onClick={() => goToSection("education")}
            className="hover:text-blue-800 transition-colors"
          >
            Edukasi
          </button>

          <div className="relative group">
            <button
              type="button"
              onClick={() => goToRoute("/team")}
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
                onClick={() => goToRoute("/team")}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-800"
              >
                Semua Tim
              </button>

              <button
                type="button"
                onClick={() => goToRoute("/team/expert")}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-800"
              >
                Expert Team
              </button>

              <button
                type="button"
                onClick={() => goToRoute("/team/staff")}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-800"
              >
                Staff Mahasiswa
              </button>
            </div>
          </div>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <button
            type="button"
            onClick={() => goToRoute("/login")}
            className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-all active:scale-95"
          >
            Masuk
          </button>

          <button
            type="button"
            onClick={() => goToRoute("/register/physio")}
            className="bg-blue-800 hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm shadow-blue-900/20"
          >
            Daftar Fisio
          </button>
        </div>

        <button
          type="button"
          className="lg:hidden p-2 text-slate-600 rounded-md active:scale-95 hover:bg-slate-100"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl flex flex-col p-6">
          <div className="flex flex-col gap-6 text-xl font-bold tracking-tight mb-8">
            <button
              type="button"
              onClick={() => goToSection("features")}
              className="text-left text-slate-700"
            >
              Fitur
            </button>

            <button
              type="button"
              onClick={() => goToSection("how-it-works")}
              className="text-left text-slate-700"
            >
              Cara Kerja
            </button>

            <button
              type="button"
              onClick={() => goToSection("physiotherapists")}
              className="text-left text-slate-700"
            >
              Fisioterapis
            </button>

            <button
              type="button"
              onClick={() => goToSection("education")}
              className="text-left text-slate-700"
            >
              Edukasi
            </button>

            <button
              type="button"
              onClick={() => goToRoute("/team")}
              className="text-left text-slate-700"
            >
              Tim Kami
            </button>

            <button
              type="button"
              onClick={() => goToRoute("/team/expert")}
              className="text-left text-base text-slate-500 pl-4"
            >
              Expert Team
            </button>

            <button
              type="button"
              onClick={() => goToRoute("/team/staff")}
              className="text-left text-base text-slate-500 pl-4"
            >
              Staff Mahasiswa
            </button>
          </div>

          <div className="flex flex-col gap-3 mt-auto">
            <button
              type="button"
              onClick={() => goToRoute("/login")}
              className="w-full py-4 bg-slate-100 text-slate-800 font-bold rounded-xl active:scale-95"
            >
              Masuk
            </button>

            <button
              type="button"
              onClick={() => goToRoute("/register/physio")}
              className="w-full py-4 bg-blue-800 text-white font-bold rounded-xl active:scale-95 shadow-sm"
            >
              Daftar Fisioterapis
            </button>
          </div>
        </div>
      )}
    </header>
  );
}