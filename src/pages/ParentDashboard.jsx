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
} from "lucide-react";
import { fetchChildren, createChild } from "../services/childService.jsx";
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

    // Set max date to today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setMaxDate(`${year}-${month}-${day}`);
  }, []);

  // Block body scroll when modal open
  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showAddModal]);

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

  // Modal Add Child
  const openAddModal = () => {
    setShowAddModal(true);
    setAddForm({
      name: "",
      birth_date: "",
      gender: "",
      weight: "",
      height: "",
    });
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
    setAddForm({
      ...addForm,
      [e.target.name]: e.target.value,
    });
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

      {/* Modal Add Child - DI LUAR dashboard-page */}
      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeAddModal();
            }
          }}
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



function ChildRowDesktop({ child, onScreeningClick, onHistoryClick }) {
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
            <>
              {child.weight} kg / {child.height} cm
            </>
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
            <>
              {child.weight}kg / {child.height}cm
            </>
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
