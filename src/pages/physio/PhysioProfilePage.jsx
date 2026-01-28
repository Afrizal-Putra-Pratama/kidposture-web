import { useState, useEffect } from "react";
import { MapPin, Phone, DollarSign, Clock, Image, Save } from "lucide-react";
import api from "../../utils/axios";

function PhysioProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    clinic_name: "",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    specialty: "",
    bio: "",
    consultation_fee: "",
    is_accepting_consultations: true,
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/physio/profile");
      const data = res.data.data;
      setProfile(data);
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        clinic_name: data.clinic_name || "",
        city: data.city || "",
        address: data.address || "",
        latitude: data.latitude || "",
        longitude: data.longitude || "",
        specialty: data.specialty || "",
        bio: data.bio || "",
        consultation_fee: data.consultation_fee || "",
        is_accepting_consultations:
          data.is_accepting_consultations ?? true,
      });
      if (data.photo) {
        setPhotoPreview(
          `${import.meta.env.VITE_API_BASE_URL.replace(
            "/api",
            ""
          )}/storage/${data.photo}`
        );
      }
    } catch (err) {
      console.error("Load profile error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null && form[key] !== "") {
        formData.append(key, form[key]);
      }
    });
    if (photo) {
      formData.append("photo", photo);
    }

    try {
      const res = await api.post("/physio/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Profile saved:", res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadProfile();
    } catch (err) {
      console.error("Save profile error:", err.response?.data || err);
      alert(
        "Gagal menyimpan profil: " +
          (err.response?.data?.message || "Periksa kembali isian Anda.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung di browser Anda");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
      },
      (error) => {
        alert("Gagal mendapatkan lokasi: " + error.message);
      }
    );
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <p style={styles.loadingText}>Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Profil Saya</h1>

          {/* ✅ indikator status pakai is_verified & is_active */}
          {profile && !profile.is_verified && (
            <div style={styles.statusBadge}>
              <span style={styles.statusText}>
                ⏳ Menunggu Verifikasi Admin
              </span>
            </div>
          )}

          {profile &&
            profile.is_verified &&
            profile.is_active && (
              <div
                style={{
                  ...styles.statusBadge,
                  background: "#d1fae5",
                  borderColor: "#6ee7b7",
                }}
              >
                <span
                  style={{
                    ...styles.statusText,
                    color: "#065f46",
                  }}
                >
                  ✅ Akun Terverifikasi & Aktif
                </span>
              </div>
            )}

          {profile &&
            profile.is_verified &&
            !profile.is_active && (
              <div
                style={{
                  ...styles.statusBadge,
                  background: "#fee2e2",
                  borderColor: "#fecaca",
                }}
              >
                <span
                  style={{
                    ...styles.statusText,
                    color: "#b91c1c",
                  }}
                >
                  ❌ Akun Dinonaktifkan
                </span>
              </div>
            )}
        </div>

        {success && (
          <div style={styles.successBox}>
            Profil berhasil diperbarui!
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Foto */}
          <div style={styles.photoSection}>
            <div style={styles.photoWrapper}>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  style={styles.photoPreview}
                />
              ) : (
                <div style={styles.photoPlaceholder}>
                  <Image size={48} strokeWidth={1.5} color="#9ca3af" />
                </div>
              )}
            </div>
            <label htmlFor="photo" style={styles.photoButton}>
              <Image size={16} strokeWidth={1.5} />
              Ubah Foto
            </label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              style={styles.hiddenInput}
            />
          </div>

          {/* Form grid */}
          <div style={styles.grid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Phone size={16} strokeWidth={1.5} />
                Nama Lengkap
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Phone size={16} strokeWidth={1.5} />
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Nama Klinik</label>
              <input
                type="text"
                value={form.clinic_name}
                onChange={(e) =>
                  setForm({ ...form, clinic_name: e.target.value })
                }
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Kota</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) =>
                  setForm({ ...form, city: e.target.value })
                }
                style={styles.input}
                required
              />
            </div>

            <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}>
              <label style={styles.label}>
                <MapPin size={16} strokeWidth={1.5} />
                Alamat Lengkap
              </label>
              <textarea
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                style={{
                  ...styles.input,
                  minHeight: 60,
                  resize: "vertical",
                }}
                rows={2}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Latitude</label>
              <input
                type="text"
                value={form.latitude}
                onChange={(e) =>
                  setForm({ ...form, latitude: e.target.value })
                }
                style={styles.input}
                placeholder="-0.026789"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Longitude</label>
              <input
                type="text"
                value={form.longitude}
                onChange={(e) =>
                  setForm({ ...form, longitude: e.target.value })
                }
                style={styles.input}
                placeholder="109.342453"
              />
            </div>

            <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}>
              <button
                type="button"
                onClick={handleGetLocation}
                style={styles.locationButton}
              >
                <MapPin size={16} strokeWidth={1.5} />
                Gunakan Lokasi Saat Ini
              </button>
            </div>

            <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}>
              <label style={styles.label}>Spesialisasi</label>
              <input
                type="text"
                value={form.specialty}
                onChange={(e) =>
                  setForm({ ...form, specialty: e.target.value })
                }
                style={styles.input}
                placeholder="Fisioterapi Anak, Postur, dll"
              />
            </div>

            <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}>
              <label style={styles.label}>Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) =>
                  setForm({ ...form, bio: e.target.value })
                }
                style={{
                  ...styles.input,
                  minHeight: 80,
                  resize: "vertical",
                }}
                rows={3}
                placeholder="Ceritakan tentang pengalaman dan keahlian Anda..."
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <DollarSign size={16} strokeWidth={1.5} />
                Tarif Konsultasi (Rp)
              </label>
              <input
                type="number"
                value={form.consultation_fee}
                onChange={(e) =>
                  setForm({
                    ...form,
                    consultation_fee: e.target.value,
                  })
                }
                style={styles.input}
                placeholder="50000"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Clock size={16} strokeWidth={1.5} />
                Status Konsultasi
              </label>
              <select
                value={String(form.is_accepting_consultations)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_accepting_consultations: e.target.value === "true",
                  })
                }
                style={styles.input}
              >
                <option value="true">Menerima Konsultasi</option>
                <option value="false">Tidak Menerima</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              ...styles.submitButton,
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Save size={18} strokeWidth={1.5} />
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
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
    maxWidth: 900,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "1.75rem",
    fontWeight: 600,
    color: "#111827",
  },
  statusBadge: {
    padding: "0.5rem 1rem",
    background: "#fef3c7",
    border: "1px solid #fcd34d",
    borderRadius: 6,
  },
  statusText: {
    fontSize: "0.875rem",
    color: "#92400e",
    fontWeight: 500,
  },
  successBox: {
    padding: "0.75rem 1rem",
    background: "#d1fae5",
    border: "1px solid #6ee7b7",
    borderRadius: 6,
    color: "#065f46",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  loadingText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "1rem",
  },
  form: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "2rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  photoSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
    paddingBottom: "2rem",
    borderBottom: "1px solid #e5e7eb",
  },
  photoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f3f4f6",
  },
  photoButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    background: "white",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "all 0.2s",
    color: "#374151",
  },
  hiddenInput: {
    display: "none",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
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
  locationButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.625rem",
    background: "white",
    border: "1px solid #3b82f6",
    borderRadius: 6,
    color: "#3b82f6",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  submitButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
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
    marginTop: "1.5rem",
  },
};

export default PhysioProfilePage;
