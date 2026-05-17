import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const sectionId = location.hash.replace("#", "");
      setTimeout(() => {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  const goToSection = (sectionId) => {
    setMobileMenuOpen(false);

    if (location.pathname === "/") {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
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

  const teamLinks = [
    { label: "Semua Tim", path: "/team" },
    { label: "Founding Team", path: "/team/founders" },
    { label: "Core Development Team", path: "/team/core" },
    { label: "Expert & Advisor Team", path: "/team/experts" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-slate-50/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-[65px] max-w-7xl items-center justify-between gap-4 px-6">
        {/* LOGO */}
        <div
          className="inline-flex cursor-pointer items-center gap-2 text-xl font-bold text-slate-900 transition-opacity hover:opacity-85"
          onClick={() => goToRoute("/")}
        >
          <img
            src="/logo-posturely.svg"
            alt="Posturely Logo"
            className="block h-[65px] w-auto max-w-[160px] object-contain"
          />
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-3 md:flex">
          {navLinks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goToSection(item.id)}
              className="rounded-full px-3.5 py-1.5 text-[0.9rem] text-slate-600 transition-all hover:bg-slate-100 hover:text-sky-600 focus:outline-none"
            >
              {item.label}
            </button>
          ))}

          {/* DROPDOWN TIM KAMI */}
          <div className="group relative">
            <button
              type="button"
              onClick={() => goToRoute("/team")}
              className="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[0.9rem] text-slate-600 transition-all hover:bg-slate-100 hover:text-sky-600 focus:outline-none"
            >
              Tim Kami
              <span className="text-[0.7rem] transition-transform group-hover:rotate-180">
                ▾
              </span>
            </button>

            <div className="invisible absolute left-1/2 top-full mt-1 min-w-[230px] -translate-x-1/2 translate-y-2 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg shadow-slate-900/10 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {teamLinks.map((item) => (
                <button
                  key={item.path}
                  onClick={() => goToRoute(item.path)}
                  className="block w-full rounded-lg px-4 py-2.5 text-left text-[0.85rem] font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => goToRoute("/login")}
            className="rounded-full px-4 py-2 text-[0.9rem] text-slate-600 transition-colors hover:text-sky-600 focus:outline-none"
          >
            Masuk
          </button>

          <button
            onClick={() => goToRoute("/register/physio")}
            className="rounded-full bg-sky-500 px-4 py-2 text-[0.9rem] font-medium text-white shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5 hover:bg-sky-600 focus:outline-none"
          >
            Daftar Fisioterapis
          </button>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          type="button"
          className="p-1.5 text-slate-700 focus:outline-none md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 p-4 pb-5 shadow-2xl md:hidden">
          {navLinks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goToSection(item.id)}
              className="py-3 pl-2 text-left text-[0.95rem] text-slate-700 transition-colors hover:text-sky-600 focus:outline-none"
            >
              {item.label}
            </button>
          ))}

          {/* TIM KAMI MOBILE */}
          <div className="mb-2 ml-4 mt-1 flex flex-col border-l-2 border-slate-200">
            <button
              onClick={() => goToRoute("/team")}
              className="py-2.5 pl-3 text-left text-[0.95rem] text-slate-700 hover:text-sky-600"
            >
              Tim Kami
            </button>

            {teamLinks.slice(1).map((item) => (
              <button
                key={item.path}
                onClick={() => goToRoute(item.path)}
                className="py-2 pl-6 text-left text-[0.85rem] text-slate-500 hover:text-sky-600"
              >
                {item.label}
              </button>
            ))}
          </div>

          <hr className="my-2 border-t border-slate-200" />

          <button
            onClick={() => goToRoute("/login")}
            className="mt-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-center text-[0.9rem] text-slate-700 transition-all hover:bg-slate-100 focus:outline-none"
          >
            Masuk
          </button>

          <button
            onClick={() => goToRoute("/register/physio")}
            className="rounded-full border border-sky-500 bg-sky-500 px-4 py-2.5 text-center text-[0.9rem] text-white transition-all hover:bg-sky-600 focus:outline-none"
          >
            Daftar Fisioterapis
          </button>
        </div>
      )}
    </header>
  );
}