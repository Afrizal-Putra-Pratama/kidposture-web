import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
  MessageCircle,
  LayoutDashboard,
  Filter,
} from "lucide-react";
import { fetchChildren, createChild, updateChild, deleteChild } from "../services/childService.jsx";
import { logout, getCurrentUser } from "../services/authService.jsx";
import { useNotifications } from "../hooks/useNotification.jsx";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [children, setChildren] = useState([]);
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // UI States
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Sidebar Hover State Desktop
  const [notifOpen, setNotifOpen] = useState(false);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", birth_date: "", gender: "", weight: "", height: "" });
  const [addError, setAddError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [maxDate, setMaxDate] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", birth_date: "", gender: "", weight: "", height: "" });
  const [editChildId, setEditChildId] = useState(null);
  const [editError, setEditError] = useState(null);
  const [editFieldErrors, setEditFieldErrors] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteChildData, setDeleteChildData] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Filter & Search States
  const [searchName, setSearchName] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // --- INITIAL LOAD ---
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) setUser(currentUser);
    loadData();

    const today = new Date();
    setMaxDate(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const anyModalOpen = showAddModal || showEditModal || showDeleteModal;
    document.body.style.overflow = anyModalOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [showAddModal, showEditModal, showDeleteModal]);

  // --- FILTERING LOGIC ---
  const applyFilters = useCallback(() => {
    let filtered = [...children];
    
    if (searchName) {
      filtered = filtered.filter((child) => child.name.toLowerCase().includes(searchName.toLowerCase()));
    }
    
    if (activeFilters.length > 0) {
      filtered = filtered.filter((child) => {
        const cat = child.latest_screening?.category?.toLowerCase() || "";
        return activeFilters.some(f => {
          if (f === "baik") return cat.includes("good") || cat.includes("baik");
          if (f === "cukup") return cat.includes("fair") || cat.includes("cukup");
          if (f === "attention") return cat.includes("attention") || cat.includes("perhatian");
          return false;
        });
      });
    }
    setFilteredChildren(filtered);
  }, [children, searchName, activeFilters]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const toggleFilter = (val) => {
    setActiveFilters(prev => 
      prev.includes(val) ? prev.filter(f => f !== val) : [...prev, val]
    );
  };

  // --- FETCH DATA ---
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchChildren();
      setChildren(data.success ? data.data : (Array.isArray(data) ? data : []));
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) markAsRead(notif.id);
    if (notif.screening_id) {
      navigate(`/screenings/${notif.screening_id}`);
      setNotifOpen(false);
    }
  };

  // --- HANDLERS: TAMBAH ANAK ---
  const openAddModal = () => { setShowAddModal(true); setAddForm({ name: "", birth_date: "", gender: "", weight: "", height: "" }); setAddError(null); setFieldErrors({}); };
  const closeAddModal = () => { setShowAddModal(false); setSaving(false); setAddError(null); setFieldErrors({}); };
  const handleAddChange = (e) => { setAddForm({ ...addForm, [e.target.name]: e.target.value }); setAddError(null); setFieldErrors({}); };
  const handleAddSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setAddError(null); setFieldErrors({});
    try {
      await createChild({ ...addForm, weight: addForm.weight ? Number(addForm.weight) : null, height: addForm.height ? Number(addForm.height) : null });
      await loadData(); closeAddModal();
    } catch (err) {
      let msg = "Gagal menyimpan data anak. Coba lagi.";
      if (err.response?.status === 422 && err.response.data?.errors) setFieldErrors(err.response.data.errors);
      else if (err.response?.data?.message) msg = err.response.data.message;
      setAddError(msg);
    } finally { setSaving(false); }
  };

  // --- HANDLERS: EDIT ANAK ---
  const openEditModal = (child) => { setEditChildId(child.id); setEditForm({ name: child.name || "", birth_date: child.birth_date || "", gender: child.gender || "", weight: child.weight || "", height: child.height || "" }); setEditError(null); setEditFieldErrors({}); setShowEditModal(true); };
  const closeEditModal = () => { setShowEditModal(false); setEditSaving(false); setEditError(null); setEditFieldErrors({}); setEditChildId(null); };
  const handleEditChange = (e) => { setEditForm({ ...editForm, [e.target.name]: e.target.value }); setEditError(null); setEditFieldErrors({}); };
  const handleEditSubmit = async (e) => {
    e.preventDefault(); setEditSaving(true); setEditError(null); setEditFieldErrors({});
    try {
      await updateChild(editChildId, { ...editForm, weight: editForm.weight ? Number(editForm.weight) : null, height: editForm.height ? Number(editForm.height) : null });
      await loadData(); closeEditModal();
    } catch (err) {
      let msg = "Gagal memperbarui data. Coba lagi.";
      if (err.response?.status === 422 && err.response.data?.errors) setEditFieldErrors(err.response.data.errors);
      else if (err.response?.data?.message) msg = err.response.data.message;
      setEditError(msg);
    } finally { setEditSaving(false); }
  };

  // --- HANDLERS: HAPUS ANAK ---
  const openDeleteModal = (child) => { setDeleteChildData(child); setDeleteError(null); setShowDeleteModal(true); };
  const closeDeleteModal = () => { setShowDeleteModal(false); setDeleting(false); setDeleteError(null); setDeleteChildData(null); };
  const handleDeleteConfirm = async () => {
    if (!deleteChildData) return;
    setDeleting(true); setDeleteError(null);
    try {
      await deleteChild(deleteChildData.id); await loadData(); closeDeleteModal();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Gagal menghapus data anak. Coba lagi.");
    } finally { setDeleting(false); }
  };

  const totalScreenings = children.reduce((sum, child) => sum + (child.screenings_count || 0), 0);
  const attentionCount = children.filter((child) => 
    child.latest_screening?.category?.toLowerCase().includes("attention") || 
    child.latest_screening?.category?.toLowerCase().includes("perhatian")
  ).length;

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="h-screen overflow-hidden bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-xl border border-red-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Gagal Memuat</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={loadData} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl">Coba Lagi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* === SIDEBAR (DESKTOP) WITH HOVER EXPAND === */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen shrink-0 transition-all duration-300 z-50 ${isSidebarExpanded ? 'w-64' : 'w-[80px]'}`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className={`p-6 flex items-center ${isSidebarExpanded ? 'justify-start px-6' : 'justify-center px-0'} h-20`}>
          <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 shrink-0 object-contain" />
          {isSidebarExpanded && <span className="font-bold text-xl text-slate-800 ml-3 truncate">Posturely</span>}
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4 hide-scrollbar overflow-y-auto overflow-x-hidden">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/dashboard'} expanded={isSidebarExpanded} />
          <SidebarLink to="/chat" icon={MessageCircle} label="Konsultasi" active={location.pathname === '/chat'} expanded={isSidebarExpanded} />
          <SidebarLink to="/education" icon={BookOpen} label="Edukasi" active={location.pathname === '/education'} expanded={isSidebarExpanded} />
          <SidebarLink to="/profile" icon={User} label="Profil Saya" active={location.pathname === '/profile'} expanded={isSidebarExpanded} />
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <button onClick={handleLogout} className={`flex items-center w-full rounded-xl transition-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 ${isSidebarExpanded ? 'justify-start px-4 py-3 gap-3' : 'justify-center p-3'}`}>
            <LogOut size={22} className="shrink-0" /> 
            {isSidebarExpanded && <span className="truncate">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* === MOBILE SIDEBAR (DRAWER) === */}
      {isSidebarOpenMobile && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpenMobile(false)}></div>
          <div className="absolute inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
               <div className="flex items-center gap-3">
                  <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 shrink-0" />
                  <span className="font-bold text-lg text-slate-800">Posturely</span>
               </div>
               <button onClick={() => setIsSidebarOpenMobile(false)} className="text-slate-500 p-1 rounded-md hover:bg-slate-100"><X size={24}/></button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto hide-scrollbar">
              <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/dashboard'} expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/chat" icon={MessageCircle} label="Konsultasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/education" icon={BookOpen} label="Edukasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/profile" icon={User} label="Profil Saya" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
            </nav>
            <div className="p-4 border-t border-slate-100 mt-auto">
               <button onClick={handleLogout} className="flex items-center gap-3 w-full p-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"><LogOut size={20}/> Keluar</button>
            </div>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        
        {/* Top Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shrink-0">
          <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md" onClick={() => setIsSidebarOpenMobile(true)}>
            <Menu size={24} />
          </button>

          <div className="hidden lg:block text-slate-500 text-sm font-medium">
            Selamat datang, <span className="text-slate-900 font-bold">{user?.name}</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-0">
            {/* Notifications Icon */}
            <div className="relative flex items-center">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full relative transition-colors flex items-center justify-center">
                <Bell size={22} strokeWidth={2} />
                {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>
              {/* Desktop: absolute panel */}
              {notifOpen && (
                <div className="hidden lg:block">
                  <NotificationPanel notifications={notifications} close={() => setNotifOpen(false)} handleNotifClick={handleNotifClick} markAllAsRead={markAllAsRead} deleteNotification={deleteNotification} unreadCount={unreadCount} />
                </div>
              )}
            </div>
            
            {/* Profile Mobile */}
            <Link to="/profile" className="flex items-center md:gap-3 hover:bg-slate-50 p-1 md:pr-4 rounded-full border border-transparent md:border-slate-200 transition-colors ml-1 shrink-0">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200">
                <User size={18} />
              </div>
              <span className="hidden md:block text-sm font-semibold text-slate-700 whitespace-nowrap">{user?.name || 'Profil'}</span>
            </Link>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 overflow-y-auto hide-scrollbar">
          {/* Welcome Info */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Data & Screening Anak</h1>
            <p className="text-slate-500 mt-1 text-sm lg:text-base">Pantau perkembangan postur tubuh buah hati Anda secara berkala.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
            <StatCard label="Jumlah Anak" value={children.length} icon={Users} color="blue" />
            <StatCard label="Total Screening" value={totalScreenings} icon={Activity} color="emerald" />
            <StatCard label="Perlu Perhatian" value={attentionCount} icon={AlertCircle} color="amber" />
          </div>

          {/* Table Section */}
          <section className="bg-white rounded-2xl border border-slate-200 overflow-visible relative mb-8">
            <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 rounded-t-2xl">
              <div className="flex flex-1 items-center gap-3">
                {/* Search Input */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Cari nama anak..." 
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all shadow-sm"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>

                {/* Filter Button */}
                {children.length > 0 && (
                  <div className="relative">
                    <button 
                      onClick={() => setIsFilterOpen(!isFilterOpen)} 
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${activeFilters.length > 0 ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Filter size={16} /> 
                      <span className="hidden sm:inline text-sm">Filter</span>
                      {activeFilters.length > 0 && <span className="bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ml-1 font-bold">{activeFilters.length}</span>}
                    </button>
                    
                    {/* Dropdown Filter */}
                    {isFilterOpen && (
                      <div className="absolute top-[110%] right-0 md:right-auto md:left-0 w-60 bg-white border border-slate-200 rounded-xl p-3 z-[60] shadow-xl animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori Kondisi</span>
                          <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 p-1 rounded hover:bg-slate-100"><X size={16}/></button>
                        </div>
                        <div className="space-y-1.5">
                          <FilterCheckbox label="Kondisi Baik" value="baik" activeFilters={activeFilters} toggleFilter={toggleFilter} />
                          <FilterCheckbox label="Cukup" value="cukup" activeFilters={activeFilters} toggleFilter={toggleFilter} />
                          <FilterCheckbox label="Perlu Perhatian" value="attention" activeFilters={activeFilters} toggleFilter={toggleFilter} />
                        </div>
                        {activeFilters.length > 0 && (
                          <button onClick={() => setActiveFilters([])} className="mt-3 w-full text-xs text-center py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium border border-red-100">Reset Filter</button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Add Button */}
              <button onClick={() => openAddModal()} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow shrink-0">
                <Plus size={18} /> Tambah Anak
              </button>
            </div>

            {/* Table (Desktop) */}
            <div className="hidden md:block overflow-x-auto hide-scrollbar">
              {filteredChildren.length === 0 ? (
                <EmptyState onAction={openAddModal} hasData={children.length > 0} />
              ) : (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold tracking-wider">
                      <th className="px-6 py-4">Nama Anak</th>
                      <th className="px-6 py-4">Umur / Gender</th>
                      <th className="px-6 py-4">Status Terakhir</th>
                      <th className="px-6 py-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredChildren.map(child => (
                      <tr key={child.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">{child.name}</td>
                        <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">
                          {child.age_years || '0'} Thn <span className="text-slate-300 mx-1">•</span> {child.gender === 'M' ? 'L' : 'P'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge category={child.latest_screening?.category} score={child.latest_screening?.score} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => navigate(`/children/${child.id}/screenings/new`)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100" title="Screening Baru"><Camera size={18}/></button>
                            <button onClick={() => navigate(`/children/${child.id}/screenings`)} className="p-2 text-slate-500 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors" title="Riwayat Screening"><History size={18}/></button>
                            <button onClick={() => openEditModal(child)} className="p-2 text-slate-500 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors" title="Edit Profil"><Pencil size={18}/></button>
                            <button onClick={() => openDeleteModal(child)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100" title="Hapus"><Trash2 size={18}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* List (Mobile) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredChildren.length === 0 ? (
                 <EmptyState onAction={openAddModal} hasData={children.length > 0} />
              ) : (
                filteredChildren.map(child => (
                  <div key={child.id} className="p-4 space-y-4 bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-lg truncate">{child.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{child.age_years || 0} Thn • {child.gender === 'M' ? 'Laki-laki' : 'Perempuan'}</p>
                      </div>
                      <StatusBadge category={child.latest_screening?.category} score={child.latest_screening?.score} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => navigate(`/children/${child.id}/screenings/new`)} className="bg-blue-50 text-blue-600 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-blue-100 active:scale-95 transition-transform"><Camera size={14}/> Screening Baru</button>
                      <button onClick={() => navigate(`/children/${child.id}/screenings`)} className="border border-slate-200 text-slate-600 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 active:scale-95 transition-transform"><History size={14}/> Riwayat</button>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 gap-2">
                       <button onClick={() => openEditModal(child)} className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"><Pencil size={14}/> Edit</button>
                       <button onClick={() => openDeleteModal(child)} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14}/> Hapus</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      {/* === MOBILE: Notifikasi — Fixed overlay, tidak out-of-frame === */}
      {notifOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden" onClick={() => setNotifOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"></div>
          <div
            className="absolute top-16 left-4 right-4 bg-white border border-slate-200 rounded-2xl overflow-hidden animate-in slide-in-from-top-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-800">Notifikasi</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-100/50 px-2 py-1 rounded border border-blue-100 shadow-sm">Dibaca</button>
                )}
                <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><X size={18}/></button>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto hide-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-slate-400 bg-slate-50/50">
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
        </div>
      )}

      {/* ===================== */}
      {/* MODAL: ADD & EDIT     */}
      {/* ===================== */}
      {(showAddModal || showEditModal) && (
        <Modal title={showAddModal ? "Tambah Data Anak" : "Edit Data Anak"} close={showAddModal ? closeAddModal : closeEditModal}>
           <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="space-y-4">
              {(addError || editError) && (
                <div className="p-3.5 bg-red-50 text-red-600 rounded-xl flex items-center gap-2.5 text-sm border border-red-100 shadow-inner">
                  <AlertCircle size={18} className="shrink-0"/> {addError || editError}
                </div>
              )}

              <Input label="Nama Lengkap" name="name" value={showAddModal ? addForm.name : editForm.name} onChange={showAddModal ? handleAddChange : handleEditChange} required error={(showAddModal ? fieldErrors : editFieldErrors).name?.[0]} placeholder="Masukkan nama anak" />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Tgl Lahir" name="birth_date" type="date" value={showAddModal ? addForm.birth_date : editForm.birth_date} onChange={showAddModal ? handleAddChange : handleEditChange} required max={maxDate} error={(showAddModal ? fieldErrors : editFieldErrors).birth_date?.[0]} />
                <Select label="Gender" name="gender" value={showAddModal ? addForm.gender : editForm.gender} onChange={showAddModal ? handleAddChange : handleEditChange} options={[{v:'M', l:'Laki-laki'}, {v:'F', l:'Perempuan'}]} required error={(showAddModal ? fieldErrors : editFieldErrors).gender?.[0]} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Berat (kg)" name="weight" type="number" step="0.1" placeholder="Opsional" value={showAddModal ? addForm.weight : editForm.weight} onChange={showAddModal ? handleAddChange : handleEditChange} error={(showAddModal ? fieldErrors : editFieldErrors).weight?.[0]} />
                <Input label="Tinggi (cm)" name="height" type="number" step="0.1" placeholder="Opsional" value={showAddModal ? addForm.height : editForm.height} onChange={showAddModal ? handleAddChange : handleEditChange} error={(showAddModal ? fieldErrors : editFieldErrors).height?.[0]} />
              </div>

              <div className="flex gap-3 mt-8 pt-5 border-t border-slate-100">
                <button type="button" onClick={showAddModal ? closeAddModal : closeEditModal} className="flex-1 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-medium transition-colors border border-slate-200">Batal</button>
                <button type="submit" disabled={showAddModal ? saving : editSaving} className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors shadow-lg active:scale-[0.98]">{(showAddModal ? saving : editSaving) ? "Menyimpan..." : "Simpan"}</button>
              </div>
           </form>
        </Modal>
      )}

      {/* ===================== */}
      {/* MODAL: DELETE         */}
      {/* ===================== */}
      {showDeleteModal && (
        <Modal title="Hapus Data Anak" close={closeDeleteModal}>
          <div className="text-center pb-2">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
              <Trash2 size={28} strokeWidth={1.5} />
            </div>
            <p className="text-slate-600 mb-6 leading-relaxed">Apakah Anda yakin ingin menghapus profil <strong className="text-slate-800">{deleteChildData?.name}</strong>? Semua riwayat screening akan terhapus permanen.</p>
            {deleteError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded-xl border border-red-100 font-medium">{deleteError}</p>}
            
            <div className="flex gap-3">
              <button onClick={closeDeleteModal} disabled={deleting} className="flex-1 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-medium transition-colors border border-slate-200">Batal</button>
              <button onClick={handleDeleteConfirm} disabled={deleting} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-red-500/20 active:scale-[0.98]">{deleting ? "Memproses..." : "Ya, Hapus"}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// =====================================
// KOMPONEN PENDUKUNG (HELPERS)
// =====================================

// eslint-disable-next-line no-unused-vars
function SidebarLink({ to, icon: Icon, label, active, expanded, onClick }) {
  return (
    <Link 
      to={to} 
      onClick={onClick} 
      className={`flex items-center rounded-xl font-medium transition-all duration-200 ${expanded ? 'px-4 py-3 justify-start gap-3' : 'p-3 justify-center'} ${active ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}
    >
      <Icon size={22} className={`shrink-0 ${active ? 'text-blue-600' : ''}`} />
      {expanded && <span className="truncate flex-1">{label}</span>}
    </Link>
  );
}

function FilterCheckbox({ label, value, activeFilters, toggleFilter }) {
  const isActive = activeFilters.includes(value);
  return (
    <label className={`flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border ${isActive ? 'border-blue-100 bg-blue-50/50' : 'border-transparent'}`}>
      <input 
        type="checkbox" 
        checked={isActive} 
        onChange={() => toggleFilter(value)}
        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer shadow-inner"
      />
      <span className={`text-sm ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{label}</span>
    </label>
  );
}

// eslint-disable-next-line no-unused-vars
function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center gap-4 transition-colors hover:border-slate-300 hover:bg-slate-50/50">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${colors[color]} border shadow-inner`}>
        <Icon size={28} />
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <span className="text-2xl font-bold text-slate-900 leading-none">{value}</span>
        <span className="text-sm font-medium text-slate-500 mt-1.5 truncate">{label}</span>
      </div>
    </div>
  );
}

function StatusBadge({ category, score }) {
  if (!category) return <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">Belum screening</span>;
  const cat = category.toLowerCase();
  let style = "bg-slate-100 text-slate-600 border-slate-200";
  let label = "Tidak Diketahui";

  if (cat.includes('baik') || cat.includes('good')) { style = "bg-emerald-50 text-emerald-700 border-emerald-200"; label = "Kondisi Baik"; }
  if (cat.includes('cukup') || cat.includes('fair')) { style = "bg-amber-50 text-amber-700 border-amber-200"; label = "Kondisi Cukup"; }
  if (cat.includes('attention') || cat.includes('perhatian')) { style = "bg-red-50 text-red-700 border-red-200"; label = "Perlu Perhatian"; }

  return (
    <div className="flex flex-col items-start gap-1">
      <span className="font-bold text-slate-800 text-sm leading-tight">Skor {score ?? '-'}</span>
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${style}`}>{label}</span>
    </div>
  );
}

function EmptyState({ onAction, hasData }) {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center bg-white border-b border-slate-200">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-100 shadow-inner">
        {hasData ? <Search size={24} /> : <Users size={24} />}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{hasData ? "Tidak Ada Hasil" : "Belum Ada Data Anak"}</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-sm">{hasData ? "Coba sesuaikan kata kunci atau filter pencarian Anda." : "Silakan tambahkan profil anak Anda untuk mulai menggunakan fitur screening."}</p>
      {!hasData && (
        <button onClick={onAction} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow active:scale-95">
          <Plus size={18} /> Tambah Data Anak
        </button>
      )}
    </div>
  );
}

function Modal({ title, close, children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={close}></div>
      <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 relative animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center rounded-t-2xl bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800 tracking-tight">{title}</h3>
          <button type="button" onClick={close} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-1.5 rounded-lg transition-colors border border-slate-200 shadow-sm"><X size={18}/></button>
        </div>
        <div className="p-6 bg-white rounded-b-2xl">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, error, ...props }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input {...props} className={`w-full px-4 py-2.5 bg-slate-50 border ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-slate-500'} rounded-xl text-sm outline-none transition-all shadow-inner placeholder:text-slate-400`} />
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}

function Select({ label, options, error, ...props }) {
  return (
    <div className="space-y-1.5 relative min-w-0">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <select {...props} className={`w-full px-4 py-2.5 bg-slate-50 border ${error ? 'border-red-300' : 'border-slate-200 focus:border-slate-500'} rounded-xl text-sm outline-none appearance-none cursor-pointer transition-all shadow-inner`}>
        <option value="">Pilih</option>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <div className="absolute right-4 bottom-3 text-slate-400 pointer-events-none"><Menu size={14} /></div>
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}

function NotificationPanel({ notifications, close, unreadCount, markAllAsRead, handleNotifClick, deleteNotification }) {
  return (
    <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 shadow-2xl">
      <div className="p-4 bg-white border-b border-slate-100 font-bold text-sm flex justify-between items-center bg-slate-50/50">
        <span className="text-slate-800">Notifikasi</span>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <button onClick={markAllAsRead} className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-100/50 px-2 py-1 rounded border border-blue-100 shadow-sm">Dibaca</button>}
          <button onClick={close} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><X size={18}/></button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto hide-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-slate-400 bg-slate-50/50">
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

function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50 animate-pulse overflow-hidden">
      <div className="w-20 lg:w-64 bg-white border-r border-slate-200 hidden lg:block shrink-0"></div>
      <div className="flex-1 min-w-0 h-full flex flex-col">
        <div className="h-16 lg:h-20 bg-white border-b border-slate-200 shrink-0"></div>
        <div className="flex-1 p-4 lg:p-8 space-y-8 overflow-y-auto hide-scrollbar">
          <div className="space-y-3"><div className="h-8 bg-slate-200 rounded-lg w-64"></div><div className="h-4 bg-slate-200 rounded w-96"></div></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0"><div className="h-28 bg-white rounded-xl border border-slate-200"></div><div className="h-28 bg-white rounded-xl border border-slate-200"></div><div className="h-28 bg-white rounded-xl border border-slate-200"></div></div>
          <div className="h-96 bg-white rounded-xl border border-slate-200 shrink-0"></div>
        </div>
      </div>
    </div>
  );
}