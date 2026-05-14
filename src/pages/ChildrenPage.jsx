import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft, Plus, Edit2, Trash2, Camera, User, Calendar, Weight, Ruler, X,
  LayoutDashboard, MessageCircle, BookOpen, LogOut, Bell, AlertCircle
} from "lucide-react";
import { fetchChildren, updateChild, deleteChild } from "../services/childService.jsx";
import { logout, getCurrentUser } from "../services/authService.jsx";
import { useNotifications } from "../hooks/useNotification.jsx";

export default function ChildrenPage() {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const location = useLocation();

  // Data States
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Edit States
  const [editingChild, setEditingChild] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "", birth_date: "", gender: "", weight: "", height: "",
  });
  const [saving, setSaving] = useState(false);

  // Delete States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [childToDelete, setChildToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Global UI States (Dashboard)
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) setUser(currentUser);
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
      setError("Gagal mengambil data anak.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) markAsRead(notif.id);
    if (notif.screening_id) {
      navigate(`/screenings/${notif.screening_id}`);
      setNotifOpen(false);
    }
  };

  // --- Handlers: Edit ---
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
    setEditForm({ name: "", birth_date: "", gender: "", weight: "", height: "" });
    setSaving(false);
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

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
        setChildren((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
      }
      closeEditModal();
    } catch (err) {
      console.error("Edit error:", err);
      setError(err.response?.data?.message || "Gagal menyimpan perubahan. Pastikan data sudah benar.");
    } finally {
      setSaving(false);
    }
  };

  // --- Handlers: Delete ---
  const openDeleteModal = (child) => {
    setChildToDelete(child);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!childToDelete) return;
    setDeleting(true);
    try {
      await deleteChild(childToDelete.id);
      setChildren((prev) => prev.filter((c) => c.id !== childToDelete.id));
      setShowDeleteModal(false);
      setChildToDelete(null);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal menghapus data anak. Coba lagi.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <ChildrenSkeleton />;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* === SIDEBAR (DESKTOP) === */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen shrink-0 transition-all duration-300 z-50 ${isSidebarExpanded ? 'w-64' : 'w-[80px]'}`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className={`p-6 flex items-center ${isSidebarExpanded ? 'justify-start px-6' : 'justify-center px-0'} h-16 lg:h-20`}>
          <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 shrink-0 object-contain" />
          {isSidebarExpanded && <span className="font-bold text-xl text-slate-800 ml-3 truncate">Posturely</span>}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4 hide-scrollbar overflow-y-auto overflow-x-hidden">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" expanded={isSidebarExpanded} />
          <SidebarLink to="/chat" icon={MessageCircle} label="Konsultasi" expanded={isSidebarExpanded} />
          <SidebarLink to="/education" icon={BookOpen} label="Edukasi" expanded={isSidebarExpanded} />
          <SidebarLink to="/profile" icon={User} label="Profil Saya" expanded={isSidebarExpanded} />
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <button onClick={handleLogout} className={`flex items-center w-full rounded-md transition-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 ${isSidebarExpanded ? 'justify-start px-4 py-3 gap-3' : 'justify-center p-3'}`}>
            <LogOut size={20} className="shrink-0" /> 
            {isSidebarExpanded && <span className="truncate">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* === MOBILE SIDEBAR (DRAWER) === */}
      {isSidebarOpenMobile && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpenMobile(false)}></div>
          <div className="absolute inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 flex items-center justify-between border-b border-slate-100 h-16">
               <div className="flex items-center gap-3">
                  <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 shrink-0" />
                  <span className="font-bold text-lg text-slate-800">Posturely</span>
               </div>
               <button onClick={() => setIsSidebarOpenMobile(false)} className="text-slate-500 p-1.5 rounded-md hover:bg-slate-100"><X size={20}/></button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto hide-scrollbar">
              <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/chat" icon={MessageCircle} label="Konsultasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/education" icon={BookOpen} label="Edukasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/profile" icon={User} label="Profil Saya" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
            </nav>
            <div className="p-4 border-t border-slate-100 mt-auto">
               <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"><LogOut size={18}/> Keluar</button>
            </div>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shrink-0">
          <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md active:scale-95 transition-transform" onClick={() => setIsSidebarOpenMobile(true)}>
            <Menu size={24} />
          </button>

          <div className="hidden lg:block text-slate-500 text-sm font-medium">
            Kelola Data Anak
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-0">
            <div className="relative flex items-center">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full relative transition-colors flex items-center justify-center active:scale-95">
                <Bell size={20} strokeWidth={2} />
                {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>
              {notifOpen && (
                <div className="hidden lg:block">
                  <NotificationPanel notifications={notifications} close={() => setNotifOpen(false)} handleNotifClick={handleNotifClick} markAllAsRead={markAllAsRead} deleteNotification={deleteNotification} unreadCount={unreadCount} />
                </div>
              )}
            </div>
            
            <Link to="/profile" className="flex items-center md:gap-3 bg-slate-50 hover:bg-slate-100 p-1 md:pr-4 rounded-full border border-slate-200 transition-colors ml-1 shrink-0 active:scale-95">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200">
                <User size={18} />
              </div>
              <span className="hidden md:block text-sm font-semibold text-slate-700 whitespace-nowrap">{user?.name || 'Profil'}</span>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto hide-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Top Navigation & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors w-max active:scale-95">
                  <ArrowLeft size={16} /> Kembali ke Dashboard
                </button>
                <h1 className="text-2xl font-bold text-slate-900">Data Anak</h1>
                <p className="text-slate-500 text-sm">Kelola data anak Anda untuk analisis postur yang lebih presisi.</p>
              </div>
              
              {children.length > 0 && (
                <button onClick={() => navigate("/children/new")} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm shrink-0">
                  <Plus size={18} /> Tambah Anak
                </button>
              )}
            </div>

            {/* Error Global */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {/* Children Grid */}
            {!children.length ? (
              <div className="p-12 text-center flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl h-[400px]">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-5 border border-slate-100">
                  <User size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Data Anak</h3>
                <p className="text-slate-500 text-sm mb-8 max-w-sm">Tambahkan profil anak Anda terlebih dahulu untuk memulai fitur deteksi postur AI.</p>
                <button onClick={() => navigate("/children/new")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2 shadow-sm">
                  <Plus size={18} strokeWidth={2.5}/> Tambah Data Anak Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {children.map((child) => (
                  <div key={child.id} className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col transition-all hover:border-blue-200 hover:shadow-md group">
                    
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center text-xl font-bold border border-blue-200 shrink-0">
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 truncate mb-1">{child.name}</h3>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
                          <span className="bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1"><Calendar size={12}/> {child.age_years != null ? `${child.age_years} thn` : "-"}</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded">{child.gender === "M" ? "Laki-laki" : child.gender === "F" ? "Perempuan" : "-"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Weight size={16} className="text-slate-400" />
                        <span className="font-semibold">{child.weight ?? "-"} <span className="text-xs text-slate-500 font-normal">kg</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 border-l border-slate-200 pl-3">
                        <Ruler size={16} className="text-slate-400" />
                        <span className="font-semibold">{child.height ?? "-"} <span className="text-xs text-slate-500 font-normal">cm</span></span>
                      </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2">
                      <button onClick={() => navigate(`/children/${child.id}/screenings/new`)} className="col-span-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-blue-200 mb-2">
                        <Camera size={16} strokeWidth={2.5} /> Screening AI Baru
                      </button>
                      
                      <button onClick={() => openEditModal(child)} className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => openDeleteModal(child)} className="bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5">
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </main>

      {/* === MODAL EDIT === */}
      {editingChild && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in p-4" onClick={closeEditModal}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-slate-900">Edit Data Anak</h3>
              <button onClick={closeEditModal} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleEditSave} className="p-5 sm:p-6 overflow-y-auto hide-scrollbar flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                <input type="text" name="name" required value={editForm.name} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Lahir</label>
                <input type="date" name="birth_date" required max={new Date().toISOString().split('T')[0]} value={editForm.birth_date} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors cursor-pointer" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis Kelamin</label>
                <select name="gender" required value={editForm.gender} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors cursor-pointer">
                  <option value="">Pilih Gender</option>
                  <option value="M">Laki-laki</option>
                  <option value="F">Perempuan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Berat (kg)</label>
                  <input type="number" name="weight" min="1" max="200" step="0.1" value={editForm.weight} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tinggi (cm)</label>
                  <input type="number" name="height" min="30" max="220" step="0.1" value={editForm.height} onChange={handleEditChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors" />
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeEditModal} className="flex-1 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors active:scale-95">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm disabled:opacity-70">
                  {saving ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL DELETE CUSTOM === */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 p-6 sm:p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100">
              <Trash2 size={32} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-xl text-slate-900 mb-2">Hapus Data Anak?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Yakin ingin menghapus profil <strong>{childToDelete?.name}</strong>? Semua riwayat screening AI terkait anak ini juga akan terhapus secara permanen.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} disabled={deleting} className="flex-1 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors active:scale-95">Batal</button>
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm disabled:opacity-70">
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Notification Panel */}
      {notifOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden" onClick={() => setNotifOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"></div>
          <div className="absolute top-16 left-4 right-4 bg-white border border-slate-200 rounded-2xl overflow-hidden animate-in slide-in-from-top-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <NotificationPanel notifications={notifications} close={() => setNotifOpen(false)} handleNotifClick={handleNotifClick} markAllAsRead={markAllAsRead} deleteNotification={deleteNotification} unreadCount={unreadCount} />
          </div>
        </div>
      )}

    </div>
  );
}

// =====================================
// KOMPONEN PENDUKUNG (HELPERS)
// =====================================

// eslint-disable-next-line no-unused-vars
function SidebarLink({ to, icon: Icon, label, active, expanded, onClick, badge }) {
  return (
    <Link 
      to={to} 
      onClick={onClick} 
      className={`flex items-center rounded-xl font-medium transition-all duration-200 relative active:scale-95 ${expanded ? 'px-4 py-3 justify-start gap-3' : 'p-3 justify-center'} ${active ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}
    >
      <div className="relative shrink-0">
        <Icon size={22} className={active ? 'text-blue-600' : ''} />
        {badge > 0 && !expanded && (
           <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white"></span>
        )}
      </div>
      {expanded && (
        <div className="flex-1 flex justify-between items-center min-w-0">
          <span className="truncate">{label}</span>
          {badge > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">{badge}</span>}
        </div>
      )}
    </Link>
  );
}

function NotificationPanel({ notifications, close, unreadCount, markAllAsRead, handleNotifClick, deleteNotification }) {
  return (
    <div className="lg:absolute lg:top-12 lg:right-0 w-full lg:w-96 bg-white lg:border border-slate-200 rounded-2xl lg:z-50 overflow-hidden lg:shadow-2xl">
      <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-sm flex justify-between items-center">
        <span className="text-slate-800">Notifikasi</span>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <button onClick={markAllAsRead} className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-100/50 px-2 py-1 rounded border border-blue-100">Dibaca</button>}
          <button onClick={close} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><X size={18}/></button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto hide-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Bell size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Belum ada notifikasi</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} onClick={() => handleNotifClick(n)} className={`p-4 border-b border-slate-50 transition-colors cursor-pointer flex gap-3 group ${!n.is_read ? 'bg-blue-50/30 hover:bg-blue-50' : 'hover:bg-slate-50'}`}>
              <div className={`mt-0.5 shrink-0 ${!n.is_read ? 'text-blue-500' : 'text-slate-400'}`}><Bell size={16} /></div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.is_read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'} truncate`}>{n.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1 rounded hover:bg-slate-100 shrink-0"><Trash2 size={16}/></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ChildrenSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50 animate-pulse overflow-hidden">
      <div className="w-20 lg:w-64 bg-white border-r border-slate-200 hidden lg:block shrink-0"></div>
      <div className="flex-1 min-w-0 h-full flex flex-col">
        <div className="h-16 lg:h-20 bg-white border-b border-slate-200 shrink-0"></div>
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto hide-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-2"><div className="h-8 w-40 bg-slate-200 rounded-md"></div><div className="h-4 w-64 bg-slate-200 rounded"></div></div>
              <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 h-[220px]"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}