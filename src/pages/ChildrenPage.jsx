import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Camera,
  User,
  Calendar,
  Weight,
  Ruler,
  X,
} from "lucide-react";
import {
  fetchChildren,
  updateChild,
  deleteChild,
} from "../services/childService.jsx";
import "../styles/children.css";

function ChildrenPage() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingChild, setEditingChild] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    birth_date: "",
    gender: "",
    weight: "",
    height: "",
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChildren();

      if (data.success && Array.isArray(data.data)) {
        setChildren(data.data);
      } else if (Array.isArray(data)) {
        setChildren(data);
      } else {
        setChildren([]);
      }
    } catch (err) {
      console.error("Error loading children:", err);
      setError("Gagal mengambil data anak");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (childId, childName) => {
    const confirm = window.confirm(
      `Yakin ingin menghapus data ${childName}? Semua riwayat screening anak ini juga akan terhapus.`
    );
    if (!confirm) return;

    try {
      await deleteChild(childId);
      setChildren((prev) => prev.filter((c) => c.id !== childId));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal menghapus data anak. Coba lagi.");
    }
  };

  const openEditModal = (child) => {
    setEditingChild(child);
    setEditForm({
      name: child.name || "",
      birth_date: child.birth_date || "",
      gender: child.gender || "",
      weight: child.weight ?? "",
      height: child.height ?? "",
    });
    setError(null);
  };

  const closeEditModal = () => {
    setEditingChild(null);
    setEditForm({
      name: "",
      birth_date: "",
      gender: "",
      weight: "",
      height: "",
    });
    setSaving(false);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingChild) return;

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: editForm.name,
        birth_date: editForm.birth_date,
        gender: editForm.gender,
        weight: editForm.weight ? Number(editForm.weight) : null,
        height: editForm.height ? Number(editForm.height) : null,
      };

      const data = await updateChild(editingChild.id, payload);
      const updated = data.success && data.data ? data.data : data;

      if (updated && updated.id) {
        setChildren((prev) =>
          prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
        );
      }

      closeEditModal();
    } catch (err) {
      console.error("Edit error:", err);
      const msg =
        err.response?.data?.message ||
        "Gagal menyimpan perubahan. Pastikan data sudah benar.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="children-page">
        <div className="children-container">
          <div className="children-skeleton">
            <User size={48} strokeWidth={1.5} />
            <p>Memuat data anak...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!children.length) {
    return (
      <div className="children-page">
        <div className="children-container">
          <div className="children-header">
            <Link to="/dashboard" className="children-back">
              <ArrowLeft size={18} strokeWidth={2} />
              Kembali
            </Link>
          </div>

          <div className="children-empty">
            <div className="children-empty__icon">
              <User size={48} strokeWidth={1.5} />
            </div>
            <h3>Belum Ada Data Anak</h3>
            <p>Tambahkan data anak terlebih dahulu untuk mulai screening postur.</p>
            <button
              onClick={() => navigate("/children/new")}
              className="children-btn children-btn--primary"
            >
              <Plus size={18} strokeWidth={2} />
              Tambah Anak
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="children-page">
      <div className="children-container">
        <div className="children-header">
          <Link to="/dashboard" className="children-back">
            <ArrowLeft size={18} strokeWidth={2} />
            Kembali
          </Link>

          <div className="children-header__main">
            <div className="children-header__title">
              <h1>Data Anak</h1>
              <p>Kelola data anak untuk analisis postur yang lebih akurat</p>
            </div>

            <button
              onClick={() => navigate("/children/new")}
              className="children-btn children-btn--primary"
            >
              <Plus size={18} strokeWidth={2} />
              Tambah Anak
            </button>
          </div>
        </div>

        <div className="children-list">
          {children.map((child) => (
            <div key={child.id} className="child-card">
              <div className="child-card__avatar">
                {child.name.charAt(0).toUpperCase()}
              </div>

              <div className="child-card__info">
                <h3 className="child-card__name">{child.name}</h3>
                <div className="child-card__meta">
                  <span>
                    <Calendar size={14} strokeWidth={1.5} />
                    {child.age_years != null ? `${child.age_years} tahun` : "-"}
                  </span>
                  <span>
                    {child.gender === "M"
                      ? "Laki-laki"
                      : child.gender === "F"
                      ? "Perempuan"
                      : "-"}
                  </span>
                </div>
                <div className="child-card__meta">
                  <span>
                    <Weight size={14} strokeWidth={1.5} />
                    {child.weight ?? "-"} kg
                  </span>
                  <span>
                    <Ruler size={14} strokeWidth={1.5} />
                    {child.height ?? "-"} cm
                  </span>
                </div>
              </div>

              <div className="child-card__actions">
                <button
                  onClick={() => openEditModal(child)}
                  className="children-btn children-btn--secondary children-btn--sm"
                  title="Edit Data"
                >
                  <Edit2 size={14} strokeWidth={2} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(child.id, child.name)}
                  className="children-btn children-btn--danger children-btn--sm"
                  title="Hapus Data"
                >
                  <Trash2 size={14} strokeWidth={2} />
                  Hapus
                </button>
                <button
                  onClick={() => navigate(`/children/${child.id}/screenings/new`)}
                  className="children-btn children-btn--primary children-btn--sm"
                  title="Screening Baru"
                >
                  <Camera size={14} strokeWidth={2} />
                  Screening
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingChild && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit Data Anak</h3>
                <button onClick={closeEditModal} className="modal-close">
                  <X size={20} />
                </button>
              </div>

              {error && <div className="modal-error">{error}</div>}

              <form onSubmit={handleEditSave}>
                <div className="form-group">
                  <label htmlFor="edit-name">Nama Anak</label>
                  <input
                    id="edit-name"
                    name="name"
                    type="text"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-birth">Tanggal Lahir</label>
                  <input
                    id="edit-birth"
                    name="birth_date"
                    type="date"
                    value={editForm.birth_date}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-gender">Jenis Kelamin</label>
                  <select
                    id="edit-gender"
                    name="gender"
                    value={editForm.gender}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="M">Laki-laki</option>
                    <option value="F">Perempuan</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-weight">Berat Badan (kg)</label>
                    <input
                      id="edit-weight"
                      name="weight"
                      type="number"
                      min="1"
                      max="200"
                      step="0.1"
                      value={editForm.weight}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-height">Tinggi Badan (cm)</label>
                    <input
                      id="edit-height"
                      name="height"
                      type="number"
                      min="30"
                      max="220"
                      step="0.1"
                      value={editForm.height}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="children-btn children-btn--secondary"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="children-btn children-btn--primary"
                  >
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChildrenPage;
