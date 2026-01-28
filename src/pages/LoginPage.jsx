import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService.jsx";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

      // Redirect sesuai role
      if (role === "physio") {
        navigate("/physio/dashboard");
      } else if (role === "admin") {
        navigate("/admin/physiotherapists");
      } else {
        // parent
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

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>KidPosture</h1>
          <p style={styles.subtitle}>Smart Posture Screening for Children</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="email@example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Belum punya akun?{" "}
            <Link to="/register/physio" style={styles.link}>
              Daftar sebagai Fisioterapis
            </Link>
          </p>
          <Link to="/" style={styles.linkBack}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fafafa",
    padding: "1rem",
  },
  card: {
    background: "white",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    padding: "2.5rem",
    width: "100%",
    maxWidth: 400,
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: 0,
  },
  inputGroup: {
    marginBottom: "1.25rem",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "0.5rem",
  },
  input: {
    width: "100%",
    padding: "0.625rem 0.875rem",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: "0.9rem",
    outline: "none",
    transition: "all 0.2s",
  },
  errorBox: {
    padding: "0.75rem 1rem",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 6,
    marginBottom: "1rem",
  },
  errorText: {
    fontSize: "0.875rem",
    color: "#dc2626",
    margin: 0,
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
    transition: "all 0.2s",
    marginTop: "0.5rem",
  },
  footer: {
    marginTop: "1.5rem",
    textAlign: "center",
  },
  footerText: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "0.75rem",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: 500,
  },
  linkBack: {
    display: "inline-block",
    fontSize: "0.875rem",
    color: "#6b7280",
    textDecoration: "none",
    transition: "color 0.2s",
  },
};

export default LoginPage;
