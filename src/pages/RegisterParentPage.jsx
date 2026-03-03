import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle, X } from "lucide-react";
import api from "../utils/axios";
import "../styles/auth.css";

function RegisterParentPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.password_confirmation) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);

    try {
      await api.post("/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: "parent",
      });

      setShowSuccessModal(true);
    } catch (err) {
      if (err.response?.data?.errors) {
        const msgs = Object.values(err.response.data.errors).flat();
        setError(msgs.join(", "));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Terjadi kesalahan. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-page auth-page--register">
        <div className="auth-form-container auth-form-container--center">
          <div className="auth-form">
            <div className="auth-logo" onClick={() => navigate("/")}>
              <span className="auth-logo__dot" />
              <span>Posturely</span>
            </div>

            <div className="auth-header">
              <h1>Daftar sebagai Orang Tua</h1>
              <p>Buat akun untuk mulai memantau postur anak anda dengan AI.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nama Anda"
                />
              </div>

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
                  placeholder="Minimal 8 karakter"
                />
              </div>

              <div className="auth-field">
                <label>Konfirmasi Password</label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                  placeholder="Ketik ulang password"
                />
              </div>

              {error && (
                <div className="auth-error">
                  <p>{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="auth-btn auth-btn--primary">
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Sudah punya akun?{" "}
                <Link to="/login" className="auth-link">
                  Masuk di sini
                </Link>
              </p>
              <p>
                Fisioterapis?{" "}
                <Link to="/register/physio" className="auth-link">
                  Daftar sebagai Fisioterapis
                </Link>
              </p>
              <Link to="/" className="auth-back">
                ← Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Registrasi Berhasil */}
      {showSuccessModal && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) navigate("/login"); }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "380px",
              padding: "2rem",
              position: "relative",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            {/* Close */}
            <button
              onClick={() => navigate("/login")}
              type="button"
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "#f3f4f6",
                border: "none",
                borderRadius: "8px",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              <X size={16} strokeWidth={2} />
            </button>

            {/* Icon */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#22c55e",
                marginTop: "0.5rem",
              }}
            >
              <CheckCircle size={32} strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h3
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#111827",
                textAlign: "center",
              }}
            >
              Registrasi Berhasil!
            </h3>

            {/* Description */}
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "#6b7280",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              Akun kamu telah berhasil dibuat. Silakan masuk menggunakan email dan password yang sudah didaftarkan.
            </p>

            {/* CTA */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="auth-btn auth-btn--primary"
              style={{ width: "100%", marginTop: "0.25rem" }}
            >
              Masuk Sekarang
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default RegisterParentPage;