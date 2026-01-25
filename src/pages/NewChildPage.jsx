import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createChild } from "../services/childService.jsx";
import { useNotification } from "../hooks/useNotification.jsx";

function NewChildPage() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [form, setForm] = useState({
    name: "",
    birth_date: "",
    gender: "",
    weight: "",
    height: "",
  });

  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        birth_date: form.birth_date,
        gender: form.gender,
        weight: form.weight ? Number(form.weight) : null,
        height: form.height ? Number(form.height) : null,
      };

      const response = await createChild(payload);
      console.log("✅ Child created:", response);

      showNotification("success", "Data anak berhasil disimpan.");

      navigate("/children");
    } catch (err) {
      console.error("❌ Create child error:", err);

      let msg = "Gagal menyimpan data anak. Coba lagi.";
      if (err.response?.status === 422 && err.response.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      showNotification("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        padding: "2rem 0",
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "0 1rem",
        }}
      >
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: "pointer",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          ← Kembali
        </button>

        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: "1.75rem 1.5rem 2rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ margin: 0, marginBottom: "0.5rem", color: "#1f2937" }}>
            👶 Tambah Data Anak
          </h2>
          <p
            style={{
              margin: 0,
              marginBottom: "1.5rem",
              color: "#6b7280",
              fontSize: 14,
            }}
          >
            Lengkapi data dasar anak untuk analisis postur yang lebih akurat.
          </p>

          {/* Error Global */}
          {error && (
            <div
              style={{
                background: "#fee2e2",
                borderRadius: 8,
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
                color: "#b91c1c",
                fontSize: 14,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Nama */}
            <FormGroup
              label="Nama Anak"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Misal: Aisyah"
              error={fieldErrors.name?.[0]}
              required
            />

            {/* Tanggal Lahir */}
            <FormGroup
              label="Tanggal Lahir"
              name="birth_date"
              type="date"
              value={form.birth_date}
              onChange={handleChange}
              error={fieldErrors.birth_date?.[0]}
              required
            />

            {/* Gender */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="gender"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                Jenis Kelamin
              </label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: fieldErrors.gender
                    ? "2px solid #f87171"
                    : "1px solid #d1d5db",
                  fontSize: 14,
                  outline: "none",
                  background: "white",
                }}
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="M">Laki-laki</option>
                <option value="F">Perempuan</option>
              </select>
              {fieldErrors.gender?.[0] && (
                <div
                  style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}
                >
                  {fieldErrors.gender[0]}
                </div>
              )}
            </div>

            {/* Berat & Tinggi */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <FormGroup
                label="Berat Badan (kg)"
                name="weight"
                type="number"
                min="1"
                max="200"
                step="0.1"
                value={form.weight}
                onChange={handleChange}
                placeholder="Misal: 20"
                error={fieldErrors.weight?.[0]}
              />
              <FormGroup
                label="Tinggi Badan (cm)"
                name="height"
                type="number"
                min="30"
                max="220"
                step="0.1"
                value={form.height}
                onChange={handleChange}
                placeholder="Misal: 115"
                error={fieldErrors.height?.[0]}
              />
            </div>

            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginTop: 8,
                marginBottom: 16,
              }}
            >
              Data BB dan TB opsional, tapi sangat membantu akurasi analisis
              postur.
            </p>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: 8,
                border: "none",
                background: loading ? "#9ca3af" : "#3b82f6",
                color: "white",
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "🔄 Menyimpan..." : "💾 Simpan Data Anak"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function FormGroup({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  required = false,
  ...rest
}) {
  return (
    <div style={{ marginBottom: "1rem", flex: 1 }}>
      <label
        htmlFor={name}
        style={{
          display: "block",
          fontSize: 14,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 6,
        }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: error ? "2px solid #f87171" : "1px solid #d1d5db",
          fontSize: 14,
          outline: "none",
        }}
        {...rest}
      />
      {error && (
        <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default NewChildPage;
