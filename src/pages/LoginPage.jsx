import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

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
    setError(null); // Clear error saat user typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ✅ POST ke /api/login
      const response = await api.post("/login", {
        email: formData.email,
        password: formData.password,
      });

      console.log("✅ Login berhasil:", response.data);

      // Simpan token & user ke localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect ke dashboard
      navigate("/dashboard");
    } catch (err) {
  console.error("❌ Login error:", err);
  console.error("❌ Response data:", err.response?.data); // ✅ Tambah ini
  
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
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        padding: "40px",
        width: "100%",
        maxWidth: "400px",
      }}>
        {/* Logo / Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "8px",
          }}>
            🧒 KIDPOSTURE
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Smart Posture Screening for Children
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@example.com"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                transition: "border 0.3s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                transition: "border 0.3s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: "12px 16px",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "8px",
              marginBottom: "20px",
            }}>
              <p style={{ fontSize: "14px", color: "#dc2626", margin: 0 }}>
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#9ca3af" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
          >
            {loading ? "🔄 Loading..." : "🚀 Login"}
          </button>
        </form>

        {/* Footer */}
        <p style={{
          textAlign: "center",
          fontSize: "13px",
          color: "#6b7280",
          marginTop: "24px",
        }}>
          Belum punya akun?{" "}
          <a
            href="/register"
            style={{
              color: "#667eea",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
