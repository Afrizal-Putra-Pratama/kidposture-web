import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { createChild } from "../services/childService.jsx";
import "../styles/children.css";

function NewChildPage() {
  const navigate = useNavigate();

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
  const [maxDate, setMaxDate] = useState("");

  useEffect(() => {
    // Set max date to today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setMaxDate(`${year}-${month}-${day}`);
  }, []);

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

      await createChild(payload);
      navigate("/dashboard");
    } catch (err) {
      console.error("Create child error:", err);

      let msg = "Gagal menyimpan data anak. Coba lagi.";
      if (err.response?.status === 422 && err.response.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="children-page">
      <div className="children-container children-container--narrow">
        <div className="children-header">
          <Link to="/dashboard" className="children-back">
            <ArrowLeft size={18} strokeWidth={2} />
            Kembali
          </Link>
        </div>

        <div className="children-form-card">
          <h1>Tambah Data Anak</h1>
          <p className="children-form-card__subtitle">
            Lengkapi data dasar anak untuk analisis postur yang lebih akurat.
          </p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Nama */}
            <div className="form-group">
              <label htmlFor="name">
                Nama Anak <span className="required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Misal: Aisyah"
                required
                className={fieldErrors.name ? "input-error" : ""}
              />
              {fieldErrors.name && (
                <div className="field-error">{fieldErrors.name[0]}</div>
              )}
            </div>

            {/* Tanggal Lahir & Jenis Kelamin */}
            <div className="form-row form-row--mobile-stack">
              <div className="form-group">
                <label htmlFor="birth_date">
                  Tanggal Lahir <span className="required">*</span>
                </label>
                <input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={form.birth_date}
                  onChange={handleChange}
                  max={maxDate}
                  required
                  className={fieldErrors.birth_date ? "input-error" : ""}
                />
                {fieldErrors.birth_date && (
                  <div className="field-error">{fieldErrors.birth_date[0]}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="gender">
                  Jenis Kelamin <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    className={fieldErrors.gender ? "input-error" : ""}
                  >
                    <option value="">Pilih</option>
                    <option value="M">Laki-laki</option>
                    <option value="F">Perempuan</option>
                  </select>
                  <ChevronDown size={16} className="select-icon" />
                </div>
                {fieldErrors.gender && (
                  <div className="field-error">{fieldErrors.gender[0]}</div>
                )}
              </div>
            </div>

            {/* Berat & Tinggi */}
            <div className="form-row form-row--mobile-stack">
              <div className="form-group">
                <label htmlFor="weight">Berat Badan (kg)</label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  min="1"
                  max="200"
                  step="0.1"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="20"
                  className={fieldErrors.weight ? "input-error" : ""}
                />
                {fieldErrors.weight && (
                  <div className="field-error">{fieldErrors.weight[0]}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="height">Tinggi Badan (cm)</label>
                <input
                  id="height"
                  name="height"
                  type="number"
                  min="30"
                  max="220"
                  step="0.1"
                  value={form.height}
                  onChange={handleChange}
                  placeholder="115"
                  className={fieldErrors.height ? "input-error" : ""}
                />
                {fieldErrors.height && (
                  <div className="field-error">{fieldErrors.height[0]}</div>
                )}
              </div>
            </div>

            <p className="form-help">
              Data BB dan TB opsional, tapi sangat membantu akurasi analisis postur.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="children-btn children-btn--primary children-btn--full"
            >
              {loading ? "Menyimpan..." : "Simpan Data Anak"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NewChildPage;
