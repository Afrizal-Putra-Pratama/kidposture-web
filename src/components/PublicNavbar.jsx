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
    <header className="landing-header">
      <div className="landing-header__inner">
        <div className="landing-logo" onClick={() => goToRoute("/")}>
          <img
            src="/logo-posturely.svg"
            alt="Posturely Logo"
            className="brand-logo-img"
          />
        </div>

        <nav className="landing-nav landing-nav--desktop">
          <button
            type="button"
            onClick={() => goToSection("about")}
            className="landing-nav__link"
          >
            Tentang
          </button>

          <button
            type="button"
            onClick={() => goToSection("education")}
            className="landing-nav__link"
          >
            Edukasi
          </button>

          <button
            type="button"
            onClick={() => goToSection("how-it-works")}
            className="landing-nav__link"
          >
            Cara Kerja
          </button>

          <button
            type="button"
            onClick={() => goToSection("for-whom")}
            className="landing-nav__link"
          >
            Untuk Siapa
          </button>

          <div className="landing-nav__dropdown">
            <button
              type="button"
              onClick={() => goToRoute("/team")}
              className="landing-nav__link landing-nav__dropdown-trigger"
            >
              Tim Kami
              <span className="landing-nav__dropdown-caret">▾</span>
            </button>

            <div className="landing-nav__dropdown-menu">
              <button type="button" onClick={() => goToRoute("/team")}>
                Semua Tim
              </button>

              <button type="button" onClick={() => goToRoute("/team/expert")}>
                Expert Team
              </button>

              <button type="button" onClick={() => goToRoute("/team/staff")}>
                Staff Team
              </button>
            </div>
          </div>
        </nav>

        <div className="landing-nav__actions landing-nav__actions--desktop">
          <button
            type="button"
            onClick={() => goToRoute("/login")}
            className="landing-nav__ghost"
          >
            Masuk
          </button>

          <button
            type="button"
            onClick={() => goToRoute("/register/physio")}
            className="landing-nav__primary"
          >
            Daftar Fisioterapis
          </button>
        </div>

        <button
          type="button"
          className="landing-nav__hamburger"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="landing-nav__mobile">
          <button
            type="button"
            onClick={() => goToSection("about")}
            className="landing-nav__mobile-link"
          >
            Tentang
          </button>

          <button
            type="button"
            onClick={() => goToSection("education")}
            className="landing-nav__mobile-link"
          >
            Edukasi
          </button>

          <button
            type="button"
            onClick={() => goToSection("how-it-works")}
            className="landing-nav__mobile-link"
          >
            Cara Kerja
          </button>

          <button
            type="button"
            onClick={() => goToSection("for-whom")}
            className="landing-nav__mobile-link"
          >
            Untuk Siapa
          </button>

          <button
            type="button"
            onClick={() => goToRoute("/team")}
            className="landing-nav__mobile-link"
          >
            Tim Kami
          </button>

          <button
            type="button"
            onClick={() => goToRoute("/team/expert")}
            className="landing-nav__mobile-link landing-nav__mobile-link--sub"
          >
            Expert Team
          </button>

          <button
            type="button"
            onClick={() => goToRoute("/team/staff")}
            className="landing-nav__mobile-link landing-nav__mobile-link--sub"
          >
            Staff Team
          </button>

          <hr className="landing-nav__divider" />

          <button
            type="button"
            onClick={() => goToRoute("/login")}
            className="landing-nav__mobile-cta"
          >
            Masuk
          </button>

          <button
            type="button"
            onClick={() => goToRoute("/register/physio")}
            className="landing-nav__mobile-cta landing-nav__mobile-cta--primary"
          >
            Daftar Fisioterapis
          </button>
        </div>
      )}
    </header>
  );
}