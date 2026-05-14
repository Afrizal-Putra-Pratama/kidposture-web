import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Activity, Calendar, TrendingUp, AlertCircle, Filter, Plus, Eye,
  LayoutDashboard, MessageCircle, BookOpen, User, LogOut, Bell, X, Menu, ArrowLeft
} from "lucide-react";
import { fetchChildScreenings } from "../services/screeningService.jsx";
import { logout, getCurrentUser } from "../services/authService.jsx";
import { useNotifications } from "../hooks/useNotification.jsx";

export default function ChildScreeningsPage() {
  const { childId } = useParams();
  const navigate = useNavigate();

  // Data States
  const [screenings, setScreenings] = useState([]);
  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Filter States
  const [filterCategory, setFilterCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Global UI States (Dashboard)
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }
    if (!childId) {
      setError("ID anak tidak ditemukan.");
      setLoading(false);
      return;
    }

    setUser(getCurrentUser());

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setMaxDate(`${year}-${month}-${day}`);

    loadScreenings();
  }, [childId]);

  const loadScreenings = async () => {
    try {
      setLoading(true);
      setError(null);
      const json = await fetchChildScreenings(childId);
      const list = Array.isArray(json) ? json : json.data ?? [];
      setScreenings(list);
      if (list.length > 0 && list[0].child) {
        setChildName(list[0].child.name);
      }
    } catch (err) {
      console.error("Error loading screenings:", err);
      setError(err.message || "Gagal mengambil data screening");
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

  // Memoized Filter Logic
  const filteredScreenings = useMemo(() => {
    let filtered = [...screenings];
    if (filterCategory) {
      filtered = filtered.filter((s) => {
        const cat = s.category?.toLowerCase() || "";
        if (filterCategory === "good") return cat === "good";
        if (filterCategory === "fair") return cat === "fair";
        if (filterCategory === "attention") return cat === "needs_attention" || cat === "attention";
        return false;
      });
    }
    if (startDate) filtered = filtered.filter((s) => new Date(s.created_at) >= new Date(startDate));
    if (endDate) filtered = filtered.filter((s) => new Date(s.created_at) <= new Date(endDate + "T23:59:59"));
    return filtered;
  }, [screenings, filterCategory, startDate, endDate]);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, startDate, endDate]);

  const resetFilters = () => {
    setFilterCategory("");
    setStartDate("");
    setEndDate("");
  };

  const latestScreening = screenings.length > 0 ? screenings[0] : null;

  // Pagination Logic
  const totalPages = Math.ceil(filteredScreenings.length / rowsPerPage) || 1;
  const paginatedScreenings = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredScreenings.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredScreenings, currentPage]);

  // Chart Data: Diambil dari paginatedScreenings (sehingga ikut berubah sesuai halaman tabel)
  const chartData = useMemo(() =>
    paginatedScreenings
      .map((s) => ({
        date: new Date(s.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
        score: s.score,
      }))
      .reverse(), // Reverse agar urutan waktunya (kiri ke kanan) benar di grafik
    [paginatedScreenings]
  );

  const getCategoryConfig = (category) => {
    const cat = category?.toUpperCase() || "";
    if (cat === "GOOD") return { label: "Baik", color: "emerald" };
    if (cat === "FAIR") return { label: "Cukup", color: "amber" };
    return { label: "Perhatian", color: "red" };
  };

  const getMetricStatus = (value, type) => {
    let threshold = { good: 2.0, warning: 5.0 };
    if (type === "index") threshold = { good: 0.2, warning: 0.35 };

    const absVal = Math.abs(value);
    if (absVal <= threshold.good) return { color: "#10b981", label: "Normal", bg: "bg-emerald-50 text-emerald-700" };
    if (absVal <= threshold.warning) return { color: "#f59e0b", label: "Cukup", bg: "bg-amber-50 text-amber-700" };
    return { color: "#ef4444", label: "Perhatian", bg: "bg-red-50 text-red-700" };
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) return <ScreeningsSkeleton />;

  if (error) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg border border-red-100 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Gagal Memuat</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={loadScreenings} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-all active:scale-95">Coba Lagi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* === SIDEBAR (DESKTOP) === */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-slate-100 sticky top-0 h-screen shrink-0 transition-all duration-300 z-50 ${isSidebarExpanded ? 'w-64' : 'w-[80px]'}`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className={`p-5 flex items-center ${isSidebarExpanded ? 'justify-start px-5' : 'justify-center px-0'} h-16`}>
          <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-7 h-7 shrink-0 object-contain" />
          {isSidebarExpanded && <span className="font-bold text-lg text-slate-800 ml-3 truncate">Posturely</span>}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4 hide-scrollbar overflow-y-auto overflow-x-hidden">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" expanded={isSidebarExpanded} />
          <SidebarLink to="/chat" icon={MessageCircle} label="Konsultasi" expanded={isSidebarExpanded} />
          <SidebarLink to="/education" icon={BookOpen} label="Edukasi" expanded={isSidebarExpanded} />
          <SidebarLink to="/profile" icon={User} label="Profil Saya" expanded={isSidebarExpanded} />
        </nav>

        <div className="p-3 border-t border-slate-100 mt-auto">
          <button onClick={handleLogout} className={`flex items-center w-full rounded-md transition-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 ${isSidebarExpanded ? 'justify-start px-3 py-2.5 gap-3' : 'justify-center p-2.5'}`}>
            <LogOut size={18} className="shrink-0" /> 
            {isSidebarExpanded && <span className="text-sm truncate">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* === MOBILE SIDEBAR (DRAWER) === */}
      {isSidebarOpenMobile && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpenMobile(false)}></div>
          <div className="absolute inset-y-0 left-0 w-72 bg-white border-r border-slate-100 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-5 flex items-center justify-between border-b border-slate-100 h-16">
               <div className="flex items-center gap-3">
                  <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-7 h-7 shrink-0" />
                  <span className="font-bold text-lg text-slate-800">Posturely</span>
               </div>
               <button onClick={() => setIsSidebarOpenMobile(false)} className="text-slate-500 p-1.5 rounded-md hover:bg-slate-100"><X size={18}/></button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto hide-scrollbar">
              <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/chat" icon={MessageCircle} label="Konsultasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/education" icon={BookOpen} label="Edukasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/profile" icon={User} label="Profil Saya" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
            </nav>
            <div className="p-3 border-t border-slate-100 mt-auto">
               <button onClick={handleLogout} className="flex items-center gap-3 w-full p-2.5 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium"><LogOut size={18}/> Keluar</button>
            </div>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-40 shrink-0">
          <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md active:scale-95 transition-transform" onClick={() => setIsSidebarOpenMobile(true)}>
            <Menu size={20} />
          </button>

          <div className="hidden lg:block text-slate-500 text-sm font-medium">
            Riwayat Screening Anak
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-0">
            <div className="relative flex items-center">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md relative transition-colors flex items-center justify-center active:scale-95">
                <Bell size={18} strokeWidth={2} />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
              </button>
              {notifOpen && (
                <div className="hidden lg:block">
                  <NotificationPanel notifications={notifications} close={() => setNotifOpen(false)} handleNotifClick={handleNotifClick} markAllAsRead={markAllAsRead} deleteNotification={deleteNotification} unreadCount={unreadCount} />
                </div>
              )}
            </div>
            
            <Link to="/profile" className="flex items-center md:gap-2 bg-slate-50 hover:bg-slate-100 p-1 md:pr-3 rounded-md border border-slate-100 transition-colors ml-1 shrink-0 active:scale-95">
              <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200">
                <User size={16} />
              </div>
              <span className="hidden md:block text-xs font-semibold text-slate-700 whitespace-nowrap">{user?.name || 'Profil'}</span>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto hide-scrollbar">
          <div className="max-w-6xl mx-auto space-y-5">
            
            {/* Top Navigation & Title (Tombol Kembali Dihapus) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-100">
              <div className="flex flex-col gap-1">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-none">
                  Screening {childName ? `: ${childName}` : ""}
                </h1>
                <p className="text-sm text-slate-500">Pantau riwayat dan perkembangan postur anak.</p>
              </div>
              
              <button onClick={() => navigate(`/children/${childId}/screenings/new`)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0">
                <Plus size={16} strokeWidth={2.5}/> Screening Baru
              </button>
            </div>

            {screenings.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center bg-white border border-slate-100 rounded-lg min-h-[300px]">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                  <Activity size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Screening</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm">Mulai screening pertama untuk memantau postur dan perkembangan {childName}.</p>
                <button onClick={() => navigate(`/children/${childId}/screenings/new`)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-bold transition-all active:scale-95 flex items-center gap-2">
                  <Plus size={16} strokeWidth={2.5}/> Mulai Screening Sekarang
                </button>
              </div>
            ) : (
              <>
                {/* Statistics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Status Terbaru */}
                  <div className="bg-white p-5 rounded-lg border border-slate-100 flex flex-col">
                    <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
                      <TrendingUp size={16} className="text-blue-600" /> Status Terbaru
                    </h2>
                    {latestScreening && (
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-end gap-2 mb-3">
                          <span className={`text-4xl font-extrabold text-${getCategoryConfig(latestScreening.category).color}-600 leading-none`}>
                            {latestScreening.score?.toFixed(1) || "-"}
                          </span>
                          <span className="text-slate-400 font-semibold mb-1">/ 100</span>
                        </div>
                        <div className={`w-max px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 border bg-${getCategoryConfig(latestScreening.category).color}-50 text-${getCategoryConfig(latestScreening.category).color}-700 border-${getCategoryConfig(latestScreening.category).color}-200`}>
                          {getCategoryConfig(latestScreening.category).label}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100 flex-1">
                          {latestScreening.summary || "Ringkasan hasil screening akan tampil di sini."}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-400">
                          <Calendar size={14} />
                          {new Date(latestScreening.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hasil Analisis Detail */}
                  {latestScreening?.metrics && (
                    <div className="bg-white p-5 rounded-lg border border-slate-100">
                      <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
                        <Activity size={16} className="text-blue-600" /> Hasil Analisis Postur
                      </h2>
                      <div className="space-y-2">
                        <MetricItem label="Kemiringan Bahu" value={latestScreening.metrics.shoulder_tilt_index} unit="%" type="percent" getStatus={getMetricStatus} />
                        <MetricItem label="Kemiringan Panggul" value={latestScreening.metrics.hip_tilt_index} unit="%" type="percent" getStatus={getMetricStatus} />
                        <MetricItem label="Posisi Kepala Maju" value={latestScreening.metrics.forward_head_index} unit="" type="index" getStatus={getMetricStatus} />
                        <MetricItem label="Kemiringan Leher" value={latestScreening.metrics.neck_inclination_deg} unit="°" type="degree" getStatus={getMetricStatus} />
                        <MetricItem label="Kemiringan Badan" value={latestScreening.metrics.torso_inclination_deg} unit="°" type="degree" getStatus={getMetricStatus} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Chart Section (Hanya untuk Paginated Data, Fix Layar) */}
                {chartData.length > 1 && (
                  <div className="bg-white p-5 rounded-lg border border-slate-100">
                    <h2 className="text-sm font-bold text-slate-800 mb-4">Perkembangan Skor (Sesuai Halaman Tabel)</h2>
                    <div className="h-[260px] w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                          <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                          <Tooltip
                            contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", padding: "8px" }}
                            formatter={(value) => [<span className="font-bold text-blue-600">{value}</span>, "Skor"]}
                            labelStyle={{ color: "#64748b", marginBottom: "4px" }}
                          />
                          <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: "#2563eb", strokeWidth: 1, stroke: "#fff" }} activeDot={{ r: 5, fill: "#2563eb", stroke: "#fff", strokeWidth: 1 }} name="Skor Postur" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Riwayat (Filter & Table) */}
                <div className="bg-white p-5 rounded-lg border border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-50 pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-800">Riwayat Screening</h2>
                      <p className="text-xs text-slate-500">{filteredScreenings.length} dari {screenings.length} data</p>
                    </div>
                    <button onClick={() => setFiltersOpen(!filtersOpen)} className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95 border ${filtersOpen ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                      <Filter size={14} /> Filter
                    </button>
                  </div>

                  {/* Filter Panel */}
                  {filtersOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-md border border-slate-100 mb-5 animate-in slide-in-from-top-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kategori</label>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs outline-none">
                          <option value="">Semua Kategori</option>
                          <option value="good">Baik</option>
                          <option value="fair">Cukup</option>
                          <option value="attention">Perhatian</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dari Tgl</label>
                        <input type="date" value={startDate} max={maxDate} onChange={(e) => { setStartDate(e.target.value); if (!e.target.value) setEndDate(""); }} className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs outline-none" />
                      </div>
                      <div className="space-y-1 flex flex-col justify-end">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sampai Tgl</label>
                        <div className="flex gap-2">
                          <input type="date" value={endDate} min={startDate || undefined} max={maxDate} disabled={!startDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1 w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs outline-none disabled:opacity-50" />
                          {(filterCategory || startDate || endDate) && (
                            <button onClick={resetFilters} className="px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-md text-xs font-bold active:scale-95 transition-all">Reset</button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Table - Bisa Diklik Penuh per Baris */}
                  {filteredScreenings.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-md border border-slate-100 border-dashed">
                      <p className="text-xs font-semibold text-slate-500">Tidak ada data screening yang sesuai filter.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto hide-scrollbar border border-slate-100 rounded-md">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                          <tr>
                            <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Tanggal</th>
                            <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Skor</th>
                            <th className="py-2.5 px-3 uppercase tracking-wider text-[10px]">Kategori</th>
                            <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] w-full min-w-[150px]">Ringkasan</th>
                            <th className="py-2.5 px-3 uppercase tracking-wider text-[10px] text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-600 text-xs">
                          {paginatedScreenings.map((scr) => {
                            const cat = getCategoryConfig(scr.category);
                            const d = new Date(scr.created_at);
                            return (
                              <tr 
                                key={scr.id} 
                                onClick={() => navigate(`/screenings/${scr.id}`)}
                                className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                              >
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-slate-700 group-hover:text-blue-700">{d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</div>
                                  <div className="text-[10px] text-slate-400 group-hover:text-blue-500">{d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
                                </td>
                                <td className="py-3 px-3 font-bold text-slate-800">{scr.score?.toFixed(1) || "-"}</td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-${cat.color}-50 text-${cat.color}-700 border-${cat.color}-200`}>
                                    {cat.label}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <p className="truncate max-w-[200px] lg:max-w-[350px] text-[11px]" title={scr.summary}>{scr.summary || "-"}</p>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {/* Tombol akan bereaksi saat baris di-hover */}
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 rounded-md text-[11px] font-bold transition-all shadow-sm">
                                    <Eye size={12}/> Detail
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination Fix */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1.5 rounded-md text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                        Sebelumnya
                      </button>
                      <span className="text-xs font-semibold text-slate-500">Hal {currentPage} / {totalPages}</span>
                      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-md text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                        Berikutnya
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Notification Panel */}
      {notifOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden" onClick={() => setNotifOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"></div>
          <div className="absolute top-14 left-3 right-3 bg-white border border-slate-100 rounded-lg overflow-hidden animate-in slide-in-from-top-2 shadow-lg" onClick={(e) => e.stopPropagation()}>
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

function MetricItem({ label, value, unit, type, getStatus }) {
  if (value == null) return null;
  const status = getStatus(value, type);
  return (
    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-100">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-extrabold text-slate-800">
          {(type === "index" || type === "percent") ? value.toFixed(2) : value.toFixed(1)}{unit}
        </span>
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${status.bg}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function SidebarLink({ to, icon: Icon, label, active, expanded, onClick, badge }) {
  return (
    <Link to={to} onClick={onClick} className={`flex items-center rounded-lg font-medium transition-all duration-200 relative active:scale-95 ${expanded ? 'px-3 py-2.5 justify-start gap-3' : 'p-2.5 justify-center'} ${active ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}>
      <div className="relative shrink-0">
        <Icon size={20} className={active ? 'text-blue-600' : ''} />
        {badge > 0 && !expanded && <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white"></span>}
      </div>
      {expanded && (
        <div className="flex-1 flex justify-between items-center min-w-0">
          <span className="text-sm truncate">{label}</span>
          {badge > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{badge}</span>}
        </div>
      )}
    </Link>
  );
}

// eslint-disable-next-line no-unused-vars
function NotificationPanel({ notifications, close, unreadCount, markAllAsRead, handleNotifClick, deleteNotification }) {
  return (
    <div className="lg:absolute lg:top-12 lg:right-0 w-full lg:w-80 bg-white lg:border border-slate-100 rounded-lg lg:z-50 overflow-hidden lg:shadow-xl">
      <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-sm flex justify-between items-center">
        <span className="text-slate-800">Notifikasi</span>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <button onClick={markAllAsRead} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-100/50 px-2 py-1 rounded border border-blue-100">Dibaca</button>}
          <button onClick={close} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><X size={16}/></button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto hide-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">Belum ada notifikasi</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} onClick={() => handleNotifClick(n)} className={`p-3 border-b border-slate-50 transition-colors cursor-pointer flex gap-2.5 group ${!n.is_read ? 'bg-blue-50/30 hover:bg-blue-50' : 'hover:bg-slate-50'}`}>
              <div className={`mt-0.5 shrink-0 ${!n.is_read ? 'text-blue-500' : 'text-slate-400'}`}><Bell size={14} /></div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${!n.is_read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'} truncate`}>{n.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ScreeningsSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50 animate-pulse overflow-hidden">
      <div className="w-20 lg:w-64 bg-white border-r border-slate-100 hidden lg:block shrink-0"></div>
      <div className="flex-1 min-w-0 h-full flex flex-col">
        <div className="h-16 bg-white border-b border-slate-100 shrink-0"></div>
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto hide-scrollbar">
          <div className="max-w-6xl mx-auto space-y-5">
            <div className="h-16 bg-white border border-slate-100 rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="h-48 bg-white border border-slate-100 rounded-lg"></div>
              <div className="h-48 bg-white border border-slate-100 rounded-lg"></div>
            </div>
            <div className="h-64 bg-white border border-slate-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}