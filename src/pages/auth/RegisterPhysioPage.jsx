import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FileText, Upload, CheckCircle } from "lucide-react";
import api from "../../utils/axios";
import "../../styles/register-physio.css";

function RegisterPhysioPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    clinic_name: "",
    city: "",
    specialty: "",
  });
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    if (certificate) {
      formData.append("certificate", certificate);
    }

    try {
      await api.post("/register/physio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal mendaftar. Periksa kembali data Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rp-page">
        <div className="rp-container">
          <div className="rp-success-card">
            <CheckCircle size={64} color="#10b981" strokeWidth={1.5} />
            <h2 className="rp-success-title">Pendaftaran Berhasil!</h2>
            <p className="rp-success-text">
              Akun Anda sedang diverifikasi oleh admin. Anda akan menerima
              notifikasi setelah akun disetujui.
            </p>
            <Link to="/login" className="rp-link-button">
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rp-page">
      <div className="rp-container">
        <div className="rp-card">
          <h1 className="rp-title">Daftar Fisioterapis</h1>
          <p className="rp-subtitle">
            Bergabunglah dengan platform kami untuk membantu anak-anak
          </p>

          {error && <div className="rp-error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="rp-form">
            <div className="rp-grid">
              <div className="rp-input-group">
                <label className="rp-label">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="rp-input"
                />
              </div>

              <div className="rp-input-group">
                <label className="rp-label">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="rp-input"
                />
              </div>

              <div className="rp-input-group">
                <label className="rp-label">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="rp-input"
                />
              </div>

              <div className="rp-input-group">
                <label className="rp-label">Konfirmasi Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password_confirmation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password_confirmation: e.target.value,
                    })
                  }
                  className="rp-input"
                />
              </div>

              <div className="rp-input-group">
                <label className="rp-label">Nomor Telepon</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  className="rp-input"
                />
              </div>

              <div className="rp-input-group">
                <label className="rp-label">Nama Klinik</label>
                <input
                  type="text"
                  required
                  value={form.clinic_name}
                  onChange={(e) =>
                    setForm({ ...form, clinic_name: e.target.value })
                  }
                  className="rp-input"
                />
              </div>

              <div className="rp-input-group">
                <label className="rp-label">Kota</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) =>
                    setForm({ ...form, city: e.target.value })
                  }
                  className="rp-input"
                />
              </div>

              <div className="rp-input-group">
                <label className="rp-label">Spesialisasi</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fisioterapi Anak"
                  value={form.specialty}
                  onChange={(e) =>
                    setForm({ ...form, specialty: e.target.value })
                  }
                  className="rp-input"
                />
              </div>
            </div>

            <div className="rp-input-group">
              <label className="rp-label">Sertifikat Praktik</label>
              <div className="rp-file-wrapper">
                <input
                  type="file"
                  id="certificate"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCertificate(e.target.files[0])}
                  className="rp-file-input"
                />
                <label htmlFor="certificate" className="rp-file-label">
                  {certificate ? (
                    <>
                      <FileText size={20} strokeWidth={1.5} />
                      <span>{certificate.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} strokeWidth={1.5} />
                      <span>Upload PDF/Image (max 5MB)</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`rp-submit ${loading ? "rp-submit--loading" : ""}`}
            >
              {loading ? "Mendaftar..." : "Daftar Sekarang"}
            </button>
          </form>

          <p className="rp-footer-text">
            Sudah punya akun?{" "}
            <Link to="/login" className="rp-link">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPhysioPage;
