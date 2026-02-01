import { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  DollarSign,
  Clock,
  Image,
  Save,
  ShieldCheck,
  ShieldAlert,
  Hourglass,
  LogOut,
} from "lucide-react";
import api from "../../utils/axios";
import "../../styles/PhysioProfilePage.css";


const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || ""
).replace(/\/api\/?$/, "");

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
        const normalized = data.photo.startsWith("http")
          ? data.photo
          : `${API_BASE_URL}/storage/${data.photo}`;
        setPhotoPreview(normalized);
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
      await api.post("/physio/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Logout error:", err.response?.data || err);
    } finally {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const renderStatus = () => {
    if (!profile) return null;

    if (!profile.is_verified) {
      return (
        <div className="status-badge status-badge--pending">
          <Hourglass size={16} />
          <span>Menunggu verifikasi admin</span>
        </div>
      );
    }

    if (profile.is_verified && profile.is_active) {
      return (
        <div className="status-badge status-badge--active">
          <ShieldCheck size={16} />
          <span>Akun terverifikasi dan aktif</span>
        </div>
      );
    }

    if (profile.is_verified && !profile.is_active) {
      return (
        <div className="status-badge status-badge--inactive">
          <ShieldAlert size={16} />
          <span>Akun dinonaktifkan</span>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="physio-profile-page">
        <div className="physio-profile-container">
          <p className="loading-text">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="physio-profile-page">
      <div className="physio-profile-container">
        <div className="physio-profile-header">
          <div className="physio-profile-header-main">
            <h1 className="physio-profile-title">Profil Fisioterapis</h1>
            {renderStatus()}
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>

        {success && (
          <div className="success-box">
            Profil berhasil diperbarui.
          </div>
        )}

        <form onSubmit={handleSubmit} className="physio-profile-form">
          <div className="photo-section">
            <div className="photo-wrapper">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="photo-preview"
                />
              ) : (
                <div className="photo-placeholder">
                  <Image size={48} strokeWidth={1.5} color="#9ca3af" />
                </div>
              )}
            </div>
            <label htmlFor="photo" className="photo-button">
              <Image size={16} strokeWidth={1.5} />
              <span>Ubah foto</span>
            </label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden-input"
            />
          </div>

          <div className="physio-profile-grid">
            <div className="input-group">
              <label className="input-label">
                <Phone size={16} strokeWidth={1.5} />
                <span>Nama lengkap</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <Phone size={16} strokeWidth={1.5} />
                <span>Nomor telepon</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Nama klinik</label>
              <input
                type="text"
                value={form.clinic_name}
                onChange={(e) =>
                  setForm({ ...form, clinic_name: e.target.value })
                }
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Kota</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) =>
                  setForm({ ...form, city: e.target.value })
                }
                className="input-field"
                required
              />
            </div>

            <div className="input-group input-group--full">
              <label className="input-label">
                <MapPin size={16} strokeWidth={1.5} />
                <span>Alamat lengkap</span>
              </label>
              <textarea
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                className="input-field input-field--textarea"
                rows={2}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Latitude</label>
              <input
                type="text"
                value={form.latitude}
                onChange={(e) =>
                  setForm({ ...form, latitude: e.target.value })
                }
                className="input-field"
                placeholder="-0.026789"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Longitude</label>
              <input
                type="text"
                value={form.longitude}
                onChange={(e) =>
                  setForm({ ...form, longitude: e.target.value })
                }
                className="input-field"
                placeholder="109.342453"
              />
            </div>

            <div className="input-group input-group--full">
              <button
                type="button"
                onClick={handleGetLocation}
                className="location-button"
              >
                <MapPin size={16} strokeWidth={1.5} />
                <span>Gunakan lokasi saat ini</span>
              </button>
            </div>

            <div className="input-group input-group--full">
              <label className="input-label">Spesialisasi</label>
              <input
                type="text"
                value={form.specialty}
                onChange={(e) =>
                  setForm({ ...form, specialty: e.target.value })
                }
                className="input-field"
                placeholder="Fisioterapi anak, postur, dan lainnya"
              />
            </div>

            <div className="input-group input-group--full">
              <label className="input-label">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) =>
                  setForm({ ...form, bio: e.target.value })
                }
                className="input-field input-field--textarea"
                rows={3}
                placeholder="Ceritakan tentang pengalaman dan keahlian Anda."
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <DollarSign size={16} strokeWidth={1.5} />
                <span>Tarif konsultasi (Rp)</span>
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
                className="input-field"
                placeholder="50000"
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <Clock size={16} strokeWidth={1.5} />
                <span>Status konsultasi</span>
              </label>
              <select
                value={String(form.is_accepting_consultations)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_accepting_consultations:
                      e.target.value === "true",
                  })
                }
                className="input-field"
              >
                <option value="true">Menerima konsultasi</option>
                <option value="false">Tidak menerima</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="submit-button"
          >
            <Save size={18} strokeWidth={1.5} />
            <span>{saving ? "Menyimpan..." : "Simpan perubahan"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default PhysioProfilePage;
