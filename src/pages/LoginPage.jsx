import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, Brain, Users, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { login } from "../services/authService.jsx";
import "../styles/auth.css";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderIntervalRef = useRef(null);

  const slides = [
    {
      icon: Activity,
      title: "Deteksi Postur AI",
      text: "Analisis postur anak dengan kecerdasan buatan dalam hitungan detik. Dapatkan laporan lengkap hasil screening.",
    },
    {
      icon: Brain,
      title: "Rekomendasi Personal",
      text: "Sistem AI memberikan saran berdasarkan hasil screening untuk menjaga kesehatan postur anak Anda.",
    },
    {
      icon: Users,
      title: "Konsultasi Fisioterapis",
      text: "Hubungi fisioterapis anak terverifikasi untuk pemeriksaan dan program latihan yang lebih mendalam.",
    },
  ];

  useEffect(() => {
    if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);

    sliderIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
    };
  }, [slides.length]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user } = await login({
        email: formData.email,
        password: formData.password,
      });

      const role = user.role?.toLowerCase();

      if (role === "physio") {
        navigate("/physio/dashboard");
      } else if (role === "admin") {
        navigate("/admin/physiotherapists");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.response?.data?.errors?.email) {
        setError(err.response.data.errors.email[0]);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Terjadi kesalahan. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="auth-page">
      {/* Form kiri */}
      <div className="auth-form-container">
        <div className="auth-form">
          <div className="auth-logo" onClick={() => navigate("/")}>
            <img 
              src="/logo-posturely.svg" 
              alt="Posturely Logo" 
              className="brand-logo-img" 
            />
          </div>

          <div className="auth-header">
            <h1>Selamat Datang Kembali</h1>
            <p>Masuk untuk melanjutkan screening postur anak Anda.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="email@example.com"
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="auth-error">
                <p>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="auth-btn auth-btn--primary">
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Belum punya akun?{" "}
              <Link to="/register/parent" className="auth-link">
                Daftar sebagai Orang Tua
              </Link>
            </p>
            <p>
              Fisioterapis?{" "}
              <Link to="/register/physio" className="auth-link">
                Daftar di sini
              </Link>
            </p>
            <Link to="/" className="auth-back">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>

      {/* Slider kanan (desktop only) */}
      <div className="auth-slider">
        <div className="auth-slider__card">
          <div className="auth-slider__icon">
            {slides[currentSlide].icon &&
              (() => {
                const Icon = slides[currentSlide].icon;
                return <Icon size={48} strokeWidth={1.5} />;
              })()}
          </div>
          <h3>{slides[currentSlide].title}</h3>
          <p>{slides[currentSlide].text}</p>

          <div className="auth-slider__controls">
            <button type="button" onClick={prevSlide} className="auth-slider__btn">
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <button type="button" onClick={nextSlide} className="auth-slider__btn">
              <ChevronRight size={20} strokeWidth={2} />
            </button>
          </div>

          <div className="auth-slider__dots">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`auth-slider__dot ${currentSlide === idx ? "auth-slider__dot--active" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
