import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FileText, Upload, CheckCircle } from "lucide-react";
import api from "../../utils/axios";

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
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.successCard}>
            <CheckCircle size={64} color="#10b981" strokeWidth={1.5} />
            <h2 style={styles.successTitle}>Pendaftaran Berhasil!</h2>
            <p style={styles.successText}>
              Akun Anda sedang diverifikasi oleh admin. Anda akan menerima
              notifikasi setelah akun disetujui.
            </p>
            <Link to="/login" style={styles.linkButton}>
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Daftar Fisioterapis</h1>
          <p style={styles.subtitle}>
            Bergabunglah dengan platform kami untuk membantu anak-anak
          </p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Konfirmasi Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password_confirmation}
                  onChange={(e) =>
                    setForm({ ...form, password_confirmation: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Nomor Telepon</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Nama Klinik</label>
                <input
                  type="text"
                  required
                  value={form.clinic_name}
                  onChange={(e) =>
                    setForm({ ...form, clinic_name: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Kota</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Spesialisasi</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fisioterapi Anak"
                  value={form.specialty}
                  onChange={(e) =>
                    setForm({ ...form, specialty: e.target.value })
                  }
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Sertifikat Praktik</label>
              <div style={styles.fileInputWrapper}>
                <input
                  type="file"
                  id="certificate"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCertificate(e.target.files[0])}
                  style={styles.fileInput}
                />
                <label htmlFor="certificate" style={styles.fileLabel}>
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
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Mendaftar..." : "Daftar Sekarang"}
            </button>
          </form>

          <p style={styles.footerText}>
            Sudah punya akun?{" "}
            <Link to="/login" style={styles.link}>
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fafafa",
    padding: "2rem 1rem",
  },
  container: {
    maxWidth: 800,
    margin: "0 auto",
  },
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "2rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  title: {
    margin: 0,
    fontSize: "1.75rem",
    fontWeight: 600,
    color: "#111827",
  },
  subtitle: {
    margin: "0.5rem 0 1.5rem",
    color: "#6b7280",
    fontSize: "0.95rem",
  },
  errorBox: {
    padding: "0.75rem 1rem",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 6,
    color: "#dc2626",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
  form: {
    marginTop: "1.5rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    padding: "0.625rem 0.875rem",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: "0.9rem",
    outline: "none",
    transition: "all 0.2s",
  },
  fileInputWrapper: {
    position: "relative",
  },
  fileInput: {
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
  },
  fileLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.625rem 0.875rem",
    border: "1px dashed #d1d5db",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#6b7280",
    transition: "all 0.2s",
  },
  submitButton: {
    width: "100%",
    padding: "0.75rem",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: 6,
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "1rem",
  },
  footerText: {
    marginTop: "1.5rem",
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#6b7280",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: 500,
  },
  successCard: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "3rem 2rem",
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  successTitle: {
    margin: "1rem 0 0.5rem",
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#111827",
  },
  successText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "0.95rem",
    marginBottom: "1.5rem",
  },
  linkButton: {
    display: "inline-block",
    padding: "0.625rem 1.5rem",
    background: "#3b82f6",
    color: "white",
    textDecoration: "none",
    borderRadius: 6,
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "all 0.2s",
  },
};

export default RegisterPhysioPage;
