import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

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
      const response = await api.get("/children");
      console.log("✅ Children data:", response.data);

      if (response.data.success && Array.isArray(response.data.data)) {
        setChildren(response.data.data);
      } else if (Array.isArray(response.data)) {
        setChildren(response.data);
      } else {
        setChildren([]);
      }
    } catch (err) {
      console.error("❌ Error loading children:", err);
      setError("Gagal mengambil data anak");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (childId, childName) => {
    const confirm = window.confirm(
      `Yakin ingin menghapus data ${childName}? Semua riwayat screening anak ini juga bisa terpengaruh.`
    );
    if (!confirm) return;

    try {
      await api.delete(`/children/${childId}`);
      // hapus dari state tanpa reload full
      setChildren((prev) => prev.filter((c) => c.id !== childId));
    } catch (err) {
      console.error("❌ Delete error:", err);
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

      const response = await api.put(`/children/${editingChild.id}`, payload);
      console.log("✅ Updated child:", response.data);

      if (response.data.success && response.data.data) {
        const updated = response.data.data;
        setChildren((prev) =>
          prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
        );
      } else {
        // fallback: reload semua
        await loadChildren();
      }

      closeEditModal();
    } catch (err) {
      console.error("❌ Edit error:", err);
      setError(
        err.response?.data?.message ||
        "Gagal menyimpan perubahan. Pastikan data sudah benar."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Memuat...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (!children.length) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
        <h2>Data Anak</h2>
        <p>Belum ada data anak. Silakan tambah anak melalui aplikasi.</p>
        <button
          onClick={() => navigate("/children/new")}
          style={{
            padding: "0.6rem 1.2rem",
            background: "#4e73df",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 500,
            fontSize: "0.9rem",
            marginTop: "0.5rem",
          }}
        >
          + Tambah Anak
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ marginBottom: 0 }}>Data Anak</h2>
        <button
          onClick={() => navigate("/children/new")}
          style={{
            padding: "0.6rem 1.2rem",
            background: "#4e73df",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 500,
            fontSize: "0.9rem",
          }}
        >
          + Tambah Anak
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {children.map((child) => (
          <div
            key={child.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/children/${child.id}/screenings`)}
              >
                <h3 style={{ margin: 0 }}>{child.name}</h3>
                <p style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
                  {child.age_years != null ? `${child.age_years} tahun` : "-"} •{" "}
                  {child.gender === "M"
                    ? "Laki-laki"
                    : child.gender === "F"
                    ? "Perempuan"
                    : "-"}
                </p>
                <p style={{ margin: "4px 0", fontSize: 13, color: "#777" }}>
                  BB {child.weight ?? "-"} kg • TB {child.height ?? "-"} cm
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button
                  onClick={() => openEditModal(child)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(child.id, child.name)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid #fecaca",
                    background: "#fee2e2",
                    color: "#b91c1c",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  🗑 Hapus
                </button>
                <button
                  onClick={() =>
                    navigate(`/children/${child.id}/screenings/new`)
                  }
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "none",
                    background: "#3b82f6",
                    color: "white",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  📸 Screening Baru
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Edit Modal */}
      {editingChild && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: "1.5rem",
              width: "100%",
              maxWidth: 500,
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
              ✏️ Edit Data Anak
            </h3>
            <p style={{ fontSize: 14, color: "#6b7280", marginTop: 0, marginBottom: "1rem" }}>
              Perbarui data {editingChild.name} agar analisis postur tetap akurat.
            </p>

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

            <form onSubmit={handleEditSave}>
              <SimpleInput
                label="Nama Anak"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                required
              />
              <SimpleInput
                label="Tanggal Lahir"
                name="birth_date"
                type="date"
                value={editForm.birth_date}
                onChange={handleEditChange}
                required
              />

              <div style={{ marginBottom: "0.75rem" }}>
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
                  value={editForm.gender}
                  onChange={handleEditChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    outline: "none",
                    background: "white",
                  }}
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="M">Laki-laki</option>
                  <option value="F">Perempuan</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <SimpleInput
                  label="Berat Badan (kg)"
                  name="weight"
                  type="number"
                  min="1"
                  max="200"
                  step="0.1"
                  value={editForm.weight}
                  onChange={handleEditChange}
                />
                <SimpleInput
                  label="Tinggi Badan (cm)"
                  name="height"
                  type="number"
                  min="30"
                  max="220"
                  step="0.1"
                  value={editForm.height}
                  onChange={handleEditChange}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.5rem",
                  marginTop: "1.25rem",
                }}
              >
                <button
                  type="button"
                  onClick={closeEditModal}
                  style={{
                    padding: "0.55rem 1.2rem",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "0.55rem 1.2rem",
                    borderRadius: 8,
                    border: "none",
                    background: saving ? "#9ca3af" : "#3b82f6",
                    color: "white",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SimpleInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  ...rest
}) {
  return (
    <div style={{ marginBottom: "0.75rem", flex: 1 }}>
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
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          fontSize: 14,
          outline: "none",
        }}
        {...rest}
      />
    </div>
  );
}

export default ChildrenPage;
