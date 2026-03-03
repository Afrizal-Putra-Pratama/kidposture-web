import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  Activity,
  AlertCircle,
  BookOpen,
  LogOut,
  Plus,
  History,
  Camera,
  User,
  Bell,
  Menu,
  X,
  Search,
  ChevronDown,
  MoreVertical,
  CheckCircle,
  Trash2,
  Pencil,
} from "lucide-react";
import { fetchChildren, createChild, updateChild, deleteChild } from "../services/childService.jsx";
import { logout, getCurrentUser } from "../services/authService.jsx";
import { useNotifications } from "../hooks/useNotification.jsx";
import "../styles/dashboard.css";

function ParentDashboard() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Modal tambah anak
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    birth_date: "",
    gender: "",
    weight: "",
    height: "",
  });
  const [addError, setAddError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [maxDate, setMaxDate] = useState("");

  // Modal edit anak
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    birth_date: "",
    gender: "",
    weight: "",
    height: "",
  });
  const [editChildId, setEditChildId] = useState(null);
  const [editError, setEditError] = useState(null);
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // Modal delete anak
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteChildData, setDeleteChildData] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Notifications hook
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    loadData();

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setMaxDate(`${year}-${month}-${day}`);
  }, []);

  // Block body scroll when modal open
  useEffect(() => {
    const anyModalOpen = showAddModal || showEditModal || showDeleteModal;
    if (anyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showAddModal, showEditModal, showDeleteModal]);

  const applyFilters = useCallback(() => {
    let filtered = [...children];

    if (searchName) {
      filtered = filtered.filter((child) =>
        child.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((child) => {
        const cat = child.latest_screening?.category?.toLowerCase() || "";
        if (filterCategory === "baik") {
          return cat.includes("good") || cat.includes("baik");
        } else if (filterCategory === "cukup") {
          return cat.includes("fair") || cat.includes("cukup");
        } else if (filterCategory === "attention") {
          return cat.includes("attention") || cat.includes("perhatian");
        }
        return false;
      });
    }

    setFilteredChildren(filtered);
  }, [children, searchName, filterCategory]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchChildren();

      if (data.success) {
        setChildren(data.data);
      } else if (Array.isArray(data)) {
        setChildren(data);
      } else {
        setChildren([]);
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const totalScreenings = children.reduce(
    (sum, child) => sum + (child.screenings_count || 0),
    0
  );

  const childrenNeedingAttention = children.filter(
    (child) =>
      child.latest_screening &&
      child.latest_screening.category &&
      (child.latest_screening.category.toLowerCase().includes("attention") ||
        child.latest_screening.category.toLowerCase().includes("perhatian"))
  );

  const handleNotifClick = (notif) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }
    if (notif.screening_id) {
      navigate(`/screenings/${notif.screening_id}`);
      setNotifOpen(false);
    }
  };

  // =====================
  // Modal Add Child
  // =====================
  const openAddModal = () => {
    setShowAddModal(true);
    setAddForm({ name: "", birth_date: "", gender: "", weight: "", height: "" });
    setAddError(null);
    setFieldErrors({});
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setSaving(false);
    setAddError(null);
    setFieldErrors({});
  };

  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
    setAddError(null);
    setFieldErrors({});
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAddError(null);
    setFieldErrors({});

    try {
      const payload = {
        name: addForm.name,
        birth_date: addForm.birth_date,
        gender: addForm.gender,
        weight: addForm.weight ? Number(addForm.weight) : null,
        height: addForm.height ? Number(addForm.height) : null,
      };

      await createChild(payload);
      await loadData();
      closeAddModal();
    } catch (err) {
      console.error("Create child error:", err);
      let msg = "Gagal menyimpan data anak. Coba lagi.";
      if (err.response?.status === 422 && err.response.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setAddError(msg);
    } finally {
      setSaving(false);
    }
  };

  // =====================
  // Modal Edit Child
  // =====================
  const openEditModal = (child) => {
    setEditChildId(child.id);
    setEditForm({
      name: child.name || "",
      birth_date: child.birth_date || "",
      gender: child.gender || "",
      weight: child.weight || "",
      height: child.height || "",
    });
    setEditError(null);
    setEditFieldErrors({});
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditSaving(false);
    setEditError(null);
    setEditFieldErrors({});
    setEditChildId(null);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
    setEditError(null);
    setEditFieldErrors({});
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError(null);
    setEditFieldErrors({});

    try {
      const payload = {
        name: editForm.name,
        birth_date: editForm.birth_date,
        gender: editForm.gender,
        weight: editForm.weight ? Number(editForm.weight) : null,
        height: editForm.height ? Number(editForm.height) : null,
      };

      await updateChild(editChildId, payload);
      await loadData();
      closeEditModal();
    } catch (err) {
      console.error("Update child error:", err);
      let msg = "Gagal memperbarui data anak. Coba lagi.";
      if (err.response?.status === 422 && err.response.data?.errors) {
        setEditFieldErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setEditError(msg);
    } finally {
      setEditSaving(false);
    }
  };

  // =====================
  // Modal Delete Child
  // =====================
  const openDeleteModal = (child) => {
    setDeleteChildData(child);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleting(false);
    setDeleteError(null);
    setDeleteChildData(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteChildData) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteChild(deleteChildData.id);
      await loadData();
      closeDeleteModal();
    } catch (err) {
      console.error("Delete child error:", err);
      const msg = err.response?.data?.message || "Gagal menghapus data anak. Coba lagi.";
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-error">
            <div className="dashboard-error__icon">
              <AlertCircle size={48} strokeWidth={1.5} />
            </div>
            <h2>Gagal Memuat Data</h2>
            <p>{error}</p>
            <button onClick={loadData} className="dashboard-btn dashboard-btn--primary">
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-page">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <div className="dashboard-header__content">
              <div className="dashboard-header__logo" onClick={() => navigate("/")}>
                <span className="dashboard-logo__dot" />
                <span>Posturely</span>
              </div>

              {/* Desktop Actions */}
              <div className="dashboard-header__actions dashboard-header__actions--desktop">
                <div className="notif-wrapper">
                  <button
                    className="dashboard-header__link dashboard-header__link--icon"
                    onClick={() => setNotifOpen(!notifOpen)}
                  >
                    <Bell size={18} strokeWidth={2} />
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                  </button>

                  {notifOpen && (
                    <div className="notif-dropdown">
                      <div className="notif-dropdown__header">
                        <h4>Notifikasi</h4>
                        <div className="notif-dropdown__actions">
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} title="Tandai semua dibaca">
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button onClick={() => setNotifOpen(false)}>
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="notif-dropdown__body">
                        {notifications.length === 0 ? (
                          <div className="notif-empty">
                            <Bell size={32} strokeWidth={1.5} />
                            <p>Belum ada notifikasi</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`notif-item ${!notif.is_read ? "notif-item--unread" : ""}`}
                              onClick={() => handleNotifClick(notif)}
                            >
                              <div className="notif-item__icon">
                                {getNotifIcon(notif.type)}
                              </div>
                              <div className="notif-item__content">
                                <p className="notif-item__title">{notif.title}</p>
                                <p className="notif-item__message">{notif.message}</p>
                                <span className="notif-item__time">
                                  {formatNotifTime(notif.created_at)}
                                </span>
                              </div>
                              <button
                                className="notif-item__delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notif.id);
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link to="/education" className="dashboard-header__link">
                  <BookOpen size={18} strokeWidth={2} />
                  Edukasi
                </Link>

                <Link to="/profile" className="dashboard-header__link">
                  <User size={18} strokeWidth={2} />
                  Profil
                </Link>

                <button onClick={handleLogout} className="dashboard-header__logout">
                  <LogOut size={18} strokeWidth={2} />
                  Keluar
                </button>
              </div>

              {/* Mobile: Notif + Hamburger */}
              <div className="dashboard-header__mobile-actions">
                <div className="notif-wrapper">
                  <button
                    className="dashboard-header__link dashboard-header__link--icon"
                    onClick={() => setNotifOpen(!notifOpen)}
                  >
                    <Bell size={18} strokeWidth={2} />
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                  </button>

                  {notifOpen && (
                    <div className="notif-dropdown notif-dropdown--mobile">
                      <div className="notif-dropdown__header">
                        <h4>Notifikasi</h4>
                        <div className="notif-dropdown__actions">
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} title="Tandai semua dibaca">
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button onClick={() => setNotifOpen(false)}>
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="notif-dropdown__body">
                        {notifications.length === 0 ? (
                          <div className="notif-empty">
                            <Bell size={32} strokeWidth={1.5} />
                            <p>Belum ada notifikasi</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`notif-item ${!notif.is_read ? "notif-item--unread" : ""}`}
                              onClick={() => handleNotifClick(notif)}
                            >
                              <div className="notif-item__icon">
                                {getNotifIcon(notif.type)}
                              </div>
                              <div className="notif-item__content">
                                <p className="notif-item__title">{notif.title}</p>
                                <p className="notif-item__message">{notif.message}</p>
                                <span className="notif-item__time">
                                  {formatNotifTime(notif.created_at)}
                                </span>
                              </div>
                              <button
                                className="notif-item__delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notif.id);
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="dashboard-header__hamburger"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="dashboard-header__mobile">
                <Link
                  to="/education"
                  className="dashboard-header__mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpen size={18} strokeWidth={2} />
                  Edukasi
                </Link>
                <Link
                  to="/profile"
                  className="dashboard-header__mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={18} strokeWidth={2} />
                  Profil
                </Link>
                <hr className="dashboard-header__divider" />
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="dashboard-header__mobile-logout"
                >
                  <LogOut size={18} strokeWidth={2} />
                  Keluar
                </button>
              </div>
            )}

            <div className="dashboard-welcome">
              <h1>Halo, {user?.name || "Orang Tua"}!</h1>
              <p>Ringkasan postur dan perkembangan anak berdasarkan hasil screening</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="dashboard-stats">
            <StatCard label="Total Anak" value={children.length} color="primary">
              <Users size={28} strokeWidth={1.5} />
            </StatCard>
            <StatCard label="Total Screening" value={totalScreenings} color="success">
              <Activity size={28} strokeWidth={1.5} />
            </StatCard>
            <StatCard
              label="Perlu Perhatian"
              value={childrenNeedingAttention.length}
              color="warning"
            >
              <AlertCircle size={28} strokeWidth={1.5} />
            </StatCard>
          </div>

          {/* Children Section */}
          <div className="dashboard-section">
            <div className="dashboard-section__header">
              <h2>Data Anak & Hasil Screening</h2>
              <button onClick={openAddModal} className="dashboard-section__action">
                <Plus size={18} strokeWidth={2} />
                Tambah Data Anak
              </button>
            </div>

            {/* Filters */}
            {children.length > 0 && (
              <div className="dashboard-filters">
                <div className="dashboard-filters__search">
                  <Search size={18} strokeWidth={2} />
                  <input
                    type="text"
                    placeholder="Cari nama anak..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>

                <div className="dashboard-filters__select-wrap">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="dashboard-filters__select"
                  >
                    <option value="">Semua Kategori</option>
                    <option value="baik">Baik</option>
                    <option value="cukup">Cukup</option>
                    <option value="attention">Perlu Perhatian</option>
                  </select>
                  <ChevronDown size={16} strokeWidth={2} className="dashboard-filters__icon" />
                </div>
              </div>
            )}

            {filteredChildren.length === 0 && children.length > 0 ? (
              <div className="dashboard-empty">
                <div className="dashboard-empty__icon">
                  <Search size={48} strokeWidth={1.5} />
                </div>
                <h3>Tidak Ada Hasil</h3>
                <p>Tidak ditemukan anak dengan kriteria filter yang dipilih.</p>
              </div>
            ) : children.length === 0 ? (
              <EmptyStateComp
                title="Belum ada data anak"
                description="Tambahkan data anak terlebih dahulu untuk mulai screening postur."
                actionLabel="Tambah Data Anak"
                onAction={openAddModal}
              >
                <Users size={48} strokeWidth={1.5} />
              </EmptyStateComp>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="dashboard-table-wrapper dashboard-table-wrapper--desktop">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Nama Anak</th>
                        <th>BB / TB</th>
                        <th>Hasil Screening Terakhir</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChildren.map((child) => (
                        <ChildRowDesktop
                          key={child.id}
                          child={child}
                          onScreeningClick={() =>
                            navigate(`/children/${child.id}/screenings/new`)
                          }
                          onHistoryClick={() =>
                            navigate(`/children/${child.id}/screenings`)
                          }
                          onEditClick={() => openEditModal(child)}
                          onDeleteClick={() => openDeleteModal(child)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Table */}
                <div className="dashboard-table-wrapper dashboard-table-wrapper--mobile">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Nama Anak</th>
                        <th>Hasil Screening</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChildren.map((child) => (
                        <ChildRowMobile
                          key={child.id}
                          child={child}
                          actionMenuOpen={actionMenuOpen}
                          setActionMenuOpen={setActionMenuOpen}
                          onScreeningClick={() =>
                            navigate(`/children/${child.id}/screenings/new`)
                          }
                          onHistoryClick={() =>
                            navigate(`/children/${child.id}/screenings`)
                          }
                          onEditClick={() => {
                            openEditModal(child);
                            setActionMenuOpen(null);
                          }}
                          onDeleteClick={() => {
                            openDeleteModal(child);
                            setActionMenuOpen(null);
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===================== */}
      {/* Modal Add Child       */}
      {/* ===================== */}
      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeAddModal(); }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3>Tambah Data Anak</h3>
              <button onClick={closeAddModal} className="modal-close" type="button">
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {addError && (
              <div className="modal-error">
                <AlertCircle size={16} strokeWidth={2} />
                {addError}
              </div>
            )}

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label htmlFor="add-name">
                  Nama Anak <span className="required">*</span>
                </label>
                <input
                  id="add-name"
                  name="name"
                  type="text"
                  value={addForm.name}
                  onChange={handleAddChange}
                  placeholder="Misal: Aisyah"
                  required
                  className={fieldErrors.name ? "input-error" : ""}
                />
                {fieldErrors.name && (
                  <div className="field-error">{fieldErrors.name[0]}</div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="add-birth">
                    Tanggal Lahir <span className="required">*</span>
                  </label>
                  <input
                    id="add-birth"
                    name="birth_date"
                    type="date"
                    value={addForm.birth_date}
                    onChange={handleAddChange}
                    max={maxDate}
                    required
                    className={fieldErrors.birth_date ? "input-error" : ""}
                  />
                  {fieldErrors.birth_date && (
                    <div className="field-error">{fieldErrors.birth_date[0]}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="add-gender">
                    Jenis Kelamin <span className="required">*</span>
                  </label>
                  <div className="select-wrapper">
                    <select
                      id="add-gender"
                      name="gender"
                      value={addForm.gender}
                      onChange={handleAddChange}
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="add-weight">Berat Badan (kg)</label>
                  <input
                    id="add-weight"
                    name="weight"
                    type="number"
                    min="1"
                    max="200"
                    step="0.1"
                    value={addForm.weight}
                    onChange={handleAddChange}
                    placeholder="20"
                    className={fieldErrors.weight ? "input-error" : ""}
                  />
                  {fieldErrors.weight && (
                    <div className="field-error">{fieldErrors.weight[0]}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="add-height">Tinggi Badan (cm)</label>
                  <input
                    id="add-height"
                    name="height"
                    type="number"
                    min="30"
                    max="220"
                    step="0.1"
                    value={addForm.height}
                    onChange={handleAddChange}
                    placeholder="115"
                    className={fieldErrors.height ? "input-error" : ""}
                  />
                  {fieldErrors.height && (
                    <div className="field-error">{fieldErrors.height[0]}</div>
                  )}
                </div>
              </div>

              <p className="form-help">
                Data BB dan TB opsional, tapi membantu akurasi analisis postur.
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="dashboard-btn dashboard-btn--secondary"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="dashboard-btn dashboard-btn--primary"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* Modal Edit Child      */}
      {/* ===================== */}
      {showEditModal && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Data Anak</h3>
              <button onClick={closeEditModal} className="modal-close" type="button">
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {editError && (
              <div className="modal-error">
                <AlertCircle size={16} strokeWidth={2} />
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="edit-name">
                  Nama Anak <span className="required">*</span>
                </label>
                <input
                  id="edit-name"
                  name="name"
                  type="text"
                  value={editForm.name}
                  onChange={handleEditChange}
                  placeholder="Misal: Aisyah"
                  required
                  className={editFieldErrors.name ? "input-error" : ""}
                />
                {editFieldErrors.name && (
                  <div className="field-error">{editFieldErrors.name[0]}</div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-birth">
                    Tanggal Lahir <span className="required">*</span>
                  </label>
                  <input
                    id="edit-birth"
                    name="birth_date"
                    type="date"
                    value={editForm.birth_date}
                    onChange={handleEditChange}
                    max={maxDate}
                    required
                    className={editFieldErrors.birth_date ? "input-error" : ""}
                  />
                  {editFieldErrors.birth_date && (
                    <div className="field-error">{editFieldErrors.birth_date[0]}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-gender">
                    Jenis Kelamin <span className="required">*</span>
                  </label>
                  <div className="select-wrapper">
                    <select
                      id="edit-gender"
                      name="gender"
                      value={editForm.gender}
                      onChange={handleEditChange}
                      required
                      className={editFieldErrors.gender ? "input-error" : ""}
                    >
                      <option value="">Pilih</option>
                      <option value="M">Laki-laki</option>
                      <option value="F">Perempuan</option>
                    </select>
                    <ChevronDown size={16} className="select-icon" />
                  </div>
                  {editFieldErrors.gender && (
                    <div className="field-error">{editFieldErrors.gender[0]}</div>
                  )}
                </div>
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
                    placeholder="20"
                    className={editFieldErrors.weight ? "input-error" : ""}
                  />
                  {editFieldErrors.weight && (
                    <div className="field-error">{editFieldErrors.weight[0]}</div>
                  )}
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
                    placeholder="115"
                    className={editFieldErrors.height ? "input-error" : ""}
                  />
                  {editFieldErrors.height && (
                    <div className="field-error">{editFieldErrors.height[0]}</div>
                  )}
                </div>
              </div>

              <p className="form-help">
                Data BB dan TB opsional, tapi membantu akurasi analisis postur.
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="dashboard-btn dashboard-btn--secondary"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="dashboard-btn dashboard-btn--primary"
                >
                  {editSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* Modal Delete Child    */}
      {/* ===================== */}
      {showDeleteModal && deleteChildData && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal(); }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "400px",
              padding: "2rem 2rem 2rem",
              position: "relative",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            {/* Close button */}
            <button
              onClick={closeDeleteModal}
              type="button"
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "#f3f4f6",
                border: "none",
                borderRadius: "8px",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              <X size={16} strokeWidth={2} />
            </button>

            {/* Icon */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ef4444",
                marginTop: "0.5rem",
              }}
            >
              <Trash2 size={28} strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h3
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#111827",
                textAlign: "center",
              }}
            >
              Hapus Data Anak
            </h3>

            {/* Description */}
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "#6b7280",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              Kamu yakin ingin menghapus data{" "}
              <strong style={{ color: "#111827" }}>{deleteChildData.name}</strong>?{" "}
              Semua riwayat screening terkait juga akan terhapus dan tidak dapat dikembalikan.
            </p>

            {deleteError && (
              <div className="modal-error" style={{ width: "100%" }}>
                <AlertCircle size={16} strokeWidth={2} />
                {deleteError}
              </div>
            )}

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                width: "100%",
                marginTop: "0.25rem",
              }}
            >
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="dashboard-btn dashboard-btn--secondary"
                style={{ flex: 1 }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="dashboard-btn dashboard-btn--danger"
                style={{ flex: 1 }}
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// === Components ===

function StatCard({ label, value, color, children }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__left">
        <div className="stat-card__icon">{children}</div>
        <div className="stat-card__label">{label}</div>
      </div>
      <div className="stat-card__right">
        <div className="stat-card__value">{value}</div>
      </div>
    </div>
  );
}

function ChildRowDesktop({ child, onScreeningClick, onHistoryClick, onEditClick, onDeleteClick }) {
  const latest = child.latest_screening;
  const badge = latest?.category ? getBadgeConfig(latest.category) : null;

  return (
    <tr>
      <td>
        <div className="table-name">{child.name}</div>
        <div className="table-meta">
          {child.age_years ? `${child.age_years} thn` : ""}
          {child.gender === "M" ? " • L" : child.gender === "F" ? " • P" : ""}
        </div>
      </td>
      <td>
        <div className="table-cell-metrics">
          {child.weight && child.height ? (
            <>{child.weight} kg / {child.height} cm</>
          ) : (
            <span className="table-empty">-</span>
          )}
        </div>
      </td>
      <td>
        {latest ? (
          <div className="table-cell-result">
            <span className="table-score">Skor {latest.score ?? "-"}</span>
            {badge && (
              <span className={`table-badge table-badge--${badge.type}`}>{badge.text}</span>
            )}
          </div>
        ) : (
          <span className="table-empty">Belum screening</span>
        )}
      </td>
      <td>
        <div className="table-cell-actions table-cell-actions--desktop">
          <button
            className="dashboard-btn dashboard-btn--secondary dashboard-btn--sm"
            onClick={onHistoryClick}
          >
            <History size={14} strokeWidth={2} />
            Riwayat
          </button>
          <button
            className="dashboard-btn dashboard-btn--primary dashboard-btn--sm"
            onClick={onScreeningClick}
          >
            <Camera size={14} strokeWidth={2} />
            Screening
          </button>
          <button
            className="dashboard-btn dashboard-btn--secondary dashboard-btn--sm"
            onClick={onEditClick}
            title="Edit data anak"
          >
            <Pencil size={14} strokeWidth={2} />
          </button>
          <button
            className="dashboard-btn dashboard-btn--danger dashboard-btn--sm"
            onClick={onDeleteClick}
            title="Hapus data anak"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ChildRowMobile({
  child,
  actionMenuOpen,
  setActionMenuOpen,
  onScreeningClick,
  onHistoryClick,
  onEditClick,
  onDeleteClick,
}) {
  const latest = child.latest_screening;
  const badge = latest?.category ? getBadgeConfig(latest.category) : null;
  const isOpen = actionMenuOpen === child.id;

  return (
    <tr>
      <td>
        <div className="table-name">{child.name}</div>
        <div className="table-meta">
          {child.weight && child.height && (
            <>{child.weight}kg / {child.height}cm</>
          )}
        </div>
      </td>
      <td>
        {latest ? (
          <div className="table-cell-result">
            <span className="table-score">Skor {latest.score ?? "-"}</span>
            {badge && (
              <span className={`table-badge table-badge--${badge.type}`}>{badge.text}</span>
            )}
          </div>
        ) : (
          <span className="table-empty">Belum</span>
        )}
      </td>
      <td>
        <div className="table-cell-actions">
          <div className="action-menu-wrapper">
            <button
              className="action-menu-btn"
              onClick={() => setActionMenuOpen(isOpen ? null : child.id)}
            >
              <MoreVertical size={18} strokeWidth={2} />
            </button>

            {isOpen && (
              <div className="action-menu-dropdown">
                <button
                  onClick={() => {
                    onScreeningClick();
                    setActionMenuOpen(null);
                  }}
                >
                  <Camera size={16} strokeWidth={2} />
                  Screening Baru
                </button>
                <button
                  onClick={() => {
                    onHistoryClick();
                    setActionMenuOpen(null);
                  }}
                >
                  <History size={16} strokeWidth={2} />
                  Riwayat
                </button>
                <button onClick={onEditClick}>
                  <Pencil size={16} strokeWidth={2} />
                  Edit Data
                </button>
                <button
                  className="action-menu-dropdown__danger"
                  onClick={onDeleteClick}
                >
                  <Trash2 size={16} strokeWidth={2} />
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

function getBadgeConfig(category) {
  const cat = category.toLowerCase();
  if (cat.includes("good") || cat.includes("baik")) {
    return { text: "Baik", type: "success" };
  } else if (cat.includes("fair") || cat.includes("cukup")) {
    return { text: "Cukup", type: "warning" };
  } else {
    return { text: "Perhatian", type: "danger" };
  }
}

function getNotifIcon(type) {
  switch (type) {
    case "referral_accepted":
      return <CheckCircle size={16} strokeWidth={1.5} />;
    case "referral_completed":
      return <Activity size={16} strokeWidth={1.5} />;
    case "new_recommendation":
      return <BookOpen size={16} strokeWidth={1.5} />;
    default:
      return <Bell size={16} strokeWidth={1.5} />;
  }
}

function formatNotifTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  return date.toLocaleDateString("id-ID");
}

function EmptyStateComp({ title, description, actionLabel, onAction, children }) {
  return (
    <div className="dashboard-empty">
      <div className="dashboard-empty__icon">{children}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button className="dashboard-btn dashboard-btn--primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-skeleton">
          <Activity size={48} strokeWidth={1.5} />
          <p>Memuat dashboard...</p>
        </div>
      </div>
    </div>
  );
}

export default ParentDashboard;
