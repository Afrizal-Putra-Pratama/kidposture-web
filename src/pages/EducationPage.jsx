import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  LayoutDashboard,
  MessageCircle,
  User,
  LogOut,
  Bell,
  Menu,
  Trash2,
  CheckCircle,
  Activity,
} from "lucide-react";
import { articleService } from "../services/articleService";
import { logout, getCurrentUser } from "../services/authService";
import { useNotifications } from "../hooks/useNotification";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "")
  .replace(/\/api\/?$/, "");

function formatNotifTime(timestamp) {
  if (!timestamp) return "";
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} mnt lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID");
}

function getNotifIcon(type) {
  if (type === "referral_accepted") return <CheckCircle size={16} />;
  if (type === "referral_completed") return <Activity size={16} />;
  if (type === "new_recommendation") return <BookOpen size={16} />;
  return <Bell size={16} />;
}

export default function EducationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) setUser(currentUser);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await articleService.getCategories();
        if (response.success) setCategories(response.data);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage };
        if (selectedCategory) params.category_id = selectedCategory;
        if (searchQuery.trim()) params.search = searchQuery.trim();
        const response = await articleService.getArticles(params);
        if (response.success) {
          const list = response.data || [];
          setArticles(list);
          setPagination(response.pagination);
          setFeatured(list.length > 0 ? list[0] : null);
        }
      } catch (error) {
        console.error("Error loading articles:", error);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, [selectedCategory, searchQuery, currentPage]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setMobileFilterOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) markAsRead(notif.id);
    setNotifOpen(false);
    if (notif.screening_id) {
      navigate(`/screenings/${notif.screening_id}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const otherArticles = featured ? articles.filter((a) => a.id !== featured.id) : articles;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">

      {/* === SIDEBAR DESKTOP === */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen shrink-0 transition-all duration-300 z-50 ${isSidebarExpanded ? "w-64" : "w-[80px]"}`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className={`p-6 flex items-center ${isSidebarExpanded ? "justify-start px-6" : "justify-center px-0"} h-20`}>
          <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 shrink-0 object-contain" />
          {isSidebarExpanded && <span className="font-bold text-xl text-slate-800 ml-3 truncate">Posturely</span>}
        </div>
        <nav className="flex-1 px-3 space-y-2 mt-4 hide-scrollbar overflow-y-auto overflow-x-hidden">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === "/dashboard"} expanded={isSidebarExpanded} />
          <SidebarLink to="/chat" icon={MessageCircle} label="Konsultasi" active={location.pathname === "/chat"} expanded={isSidebarExpanded} />
          <SidebarLink to="/education" icon={BookOpen} label="Edukasi" active={location.pathname === "/education"} expanded={isSidebarExpanded} />
          <SidebarLink to="/profile" icon={User} label="Profil Saya" active={location.pathname === "/profile"} expanded={isSidebarExpanded} />
        </nav>
        <div className="p-4 border-t border-slate-100 mt-auto">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center w-full rounded-xl transition-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 ${isSidebarExpanded ? "justify-start px-4 py-3 gap-3" : "justify-center p-3"}`}
          >
            <LogOut size={22} className="shrink-0" />
            {isSidebarExpanded && <span className="truncate">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* === SIDEBAR MOBILE (DRAWER) === */}
      {isSidebarOpenMobile && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpenMobile(false)}></div>
          <div className="absolute inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 shrink-0" />
                <span className="font-bold text-lg text-slate-800">Posturely</span>
              </div>
              <button type="button" onClick={() => setIsSidebarOpenMobile(false)} className="text-slate-500 p-1 rounded-md hover:bg-slate-100">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto hide-scrollbar">
              <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === "/dashboard"} expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/chat" icon={MessageCircle} label="Konsultasi" active={location.pathname === "/chat"} expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/education" icon={BookOpen} label="Edukasi" active={location.pathname === "/education"} expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/profile" icon={User} label="Profil Saya" active={location.pathname === "/profile"} expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
            </nav>
            <div className="p-4 border-t border-slate-100 mt-auto">
              <button type="button" onClick={handleLogout} className="flex items-center gap-3 w-full p-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium">
                <LogOut size={20} /> Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">

        {/* Top Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md"
              onClick={() => setIsSidebarOpenMobile(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg lg:text-xl font-bold text-slate-800">Edukasi</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifikasi — desktop: absolute panel, mobile: fixed overlay */}
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full relative transition-colors flex items-center justify-center"
              >
                <Bell size={22} strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white pointer-events-none"></span>
                )}
              </button>
              {/* Desktop panel — absolute, tidak overflow layar */}
              {notifOpen && (
                <div className="hidden lg:block absolute top-12 right-0 w-96 bg-white border border-slate-200 rounded-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 shadow-2xl">
                  <NotifPanelContent
                    notifications={notifications}
                    close={() => setNotifOpen(false)}
                    handleNotifClick={handleNotifClick}
                    markAllAsRead={markAllAsRead}
                    deleteNotification={deleteNotification}
                    unreadCount={unreadCount}
                  />
                </div>
              )}
            </div>

            {/* Profil */}
            <Link
              to="/profile"
              className="flex items-center md:gap-3 hover:bg-slate-50 p-1 md:pr-4 rounded-full border border-transparent md:border-slate-200 transition-colors ml-1 shrink-0"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200">
                <User size={18} />
              </div>
              <span className="hidden md:block text-sm font-semibold text-slate-700 whitespace-nowrap">
                {user?.name || "Profil"}
              </span>
            </Link>
          </div>
        </header>

        {/* === PAGE BODY === */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 lg:p-8 space-y-6">

          {/* Page Title + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Artikel Edukasi</h2>
              <p className="text-sm text-slate-500 mt-1">Panduan dan artikel seputar kesehatan postur tubuh anak.</p>
            </div>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 w-full sm:w-72">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(""); setCurrentPage(1); }} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={14} />
                </button>
              )}
            </form>
          </div>

          {/*
            FILTER ROW — Strategi:
            - Desktop (lg+): chip kategori langsung di halaman
            - Mobile (<lg): HANYA tombol Filter → buka bottom drawer
            → tidak ada chip ganda di mobile
          */}
          <div className="flex items-center gap-2">
            {/* Chip kategori — HANYA desktop */}
            <div className="hidden lg:flex items-center gap-2 flex-wrap flex-1">
              <button
                type="button"
                onClick={() => handleCategoryChange(null)}
                className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${selectedCategory === null ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800"}`}
              >
                Semua
              </button>
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${selectedCategory === category.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800"}`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Tombol Filter — HANYA mobile, klik → buka drawer */}
            <button
              type="button"
              className="lg:hidden flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-slate-600 border border-slate-200 rounded-lg hover:border-slate-400 transition-colors"
              onClick={() => setMobileFilterOpen(true)}
            >
              <Filter size={15} />
              Filter
              {selectedCategory !== null && (
                <span className="w-2 h-2 bg-blue-600 rounded-full ml-0.5"></span>
              )}
            </button>

            {/* Badge kategori aktif — mobile only */}
            {selectedCategory !== null && (
              <span className="lg:hidden text-sm font-medium text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                {categories.find((c) => c.id === selectedCategory)?.name || "Aktif"}
                <button type="button" onClick={() => handleCategoryChange(null)} className="text-slate-400 hover:text-slate-700">
                  <X size={13} />
                </button>
              </span>
            )}
          </div>

          {/* === SKELETON LOADING === */}
          {loading && (
            <div className="space-y-6 animate-pulse">
              {/* Featured skeleton */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col md:flex-row">
                <div className="w-full md:w-80 lg:w-96 shrink-0 bg-slate-200" style={{ minHeight: "220px" }}></div>
                <div className="p-6 flex flex-col gap-3 flex-1 justify-center">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mt-2"></div>
                </div>
              </div>
              {/* Grid skeleton */}
              <div>
                <div className="h-5 bg-slate-200 rounded w-32 mb-4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                      <div className="h-44 bg-slate-200"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-3 bg-slate-200 rounded w-20"></div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2 mt-2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === KONTEN === */}
          {!loading && (
            <div className="space-y-6">

              {/* Featured Article */}
              {featured && (
                <Link
                  to={`/education/${featured.slug}`}
                  className="block bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors group"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-80 lg:w-96 shrink-0 bg-slate-100 overflow-hidden" style={{ minHeight: "200px" }}>
                      {featured.thumbnail ? (
                        <img
                          src={featured.thumbnail.startsWith("http") ? featured.thumbnail : `${API_BASE_URL}${featured.thumbnail}`}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          style={{ minHeight: "200px" }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300" style={{ minHeight: "200px" }}>
                          <BookOpen size={48} strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col justify-center gap-3">
                      {featured.category?.name && (
                        <span className="text-xs font-bold uppercase tracking-wide text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md w-fit">
                          {featured.category.name}
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                        {featured.title}
                      </h3>
                      {featured.excerpt && (
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                          {featured.excerpt.substring(0, 200)}...
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium mt-1">
                        <span className="flex items-center gap-1.5"><Calendar size={13} />{formatDate(featured.published_at || featured.created_at)}</span>
                        <span className="flex items-center gap-1.5"><Clock size={13} />{featured.read_time} menit</span>
                        <span className="flex items-center gap-1.5"><Eye size={13} />{featured.views} dilihat</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Article Grid */}
              {otherArticles.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-4">Semua Artikel</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otherArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} formatDate={formatDate} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {articles.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">Belum Ada Artikel</h3>
                  <p className="text-sm text-slate-500">Artikel untuk kategori ini akan segera hadir.</p>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.last_page }).map((_, idx) => {
                      const page = idx + 1;
                      return (
                        <button
                          type="button"
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 text-sm font-semibold rounded-lg transition-colors border ${currentPage === page ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
                    disabled={currentPage === pagination.last_page}
                    className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* === MOBILE: Notifikasi — Fixed overlay, tidak bisa out-of-frame === */}
      {notifOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden" onClick={() => setNotifOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"></div>
          <div
            className="absolute top-16 left-4 right-4 bg-white border border-slate-200 rounded-2xl overflow-hidden animate-in slide-in-from-top-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <NotifPanelContent
              notifications={notifications}
              close={() => setNotifOpen(false)}
              handleNotifClick={handleNotifClick}
              markAllAsRead={markAllAsRead}
              deleteNotification={deleteNotification}
              unreadCount={unreadCount}
            />
          </div>
        </div>
      )}

      {/* === MOBILE FILTER DRAWER (satu-satunya tampat filter di mobile) === */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[100] flex items-end lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)}></div>
          <div className="relative bg-white w-full rounded-t-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-300">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Filter Kategori</h3>
              <button type="button" onClick={() => setMobileFilterOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange(null)}
                className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${selectedCategory === null ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}
              >
                Semua
              </button>
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${selectedCategory === category.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className="p-5 pt-0">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl transition-colors hover:bg-slate-800 active:scale-[0.98]"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================
// SHARED COMPONENTS
// =====================================

// eslint-disable-next-line no-unused-vars
function SidebarLink({ to, icon: Icon, label, active, expanded, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center rounded-xl font-medium transition-all duration-200 ${expanded ? "px-4 py-3 justify-start gap-3" : "p-3 justify-center"} ${active ? "bg-slate-100 text-slate-900 border border-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent"}`}
    >
      <Icon size={22} className={`shrink-0 ${active ? "text-blue-600" : ""}`} />
      {expanded && <span className="truncate flex-1">{label}</span>}
    </Link>
  );
}

/* Konten panel notifikasi — dipakai baik di desktop (absolute) maupun mobile (fixed overlay) */
function NotifPanelContent({ notifications, close, unreadCount, markAllAsRead, handleNotifClick, deleteNotification }) {
  const safeNotifs = Array.isArray(notifications) ? notifications : [];
  return (
    <>
      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
        <span className="text-sm font-bold text-slate-800">Notifikasi</span>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-100/50 px-2 py-1 rounded border border-blue-100"
            >
              Tandai Dibaca
            </button>
          )}
          <button type="button" onClick={close} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto hide-scrollbar">
        {safeNotifs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 bg-slate-50/50">
            <Bell size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Belum ada notifikasi</p>
          </div>
        ) : (
          safeNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotifClick(n)}
              className={`p-4 border-b border-slate-50 transition-colors cursor-pointer flex gap-3 group ${!n.is_read ? "bg-blue-50/30 hover:bg-blue-50" : "hover:bg-slate-50"}`}
            >
              <div className={`mt-0.5 shrink-0 ${!n.is_read ? "text-blue-500" : "text-slate-400"}`}>
                {getNotifIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${!n.is_read ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}>{n.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-2">{formatNotifTime(n.created_at)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1 rounded hover:bg-slate-100 shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// eslint-disable-next-line no-unused-vars
function ArticleCard({ article, formatDate }) {
  const snippet = article.excerpt ? article.excerpt.substring(0, 110) + "..." : "";
  const thumbnailUrl = article.thumbnail
    ? article.thumbnail.startsWith("http")
      ? article.thumbnail
      : `${API_BASE_URL}${article.thumbnail}`
    : null;

  return (
    <Link to={`/education/${article.slug}`} className="block group">
      <article className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors h-full flex flex-col">
        <div className="h-44 bg-slate-100 overflow-hidden shrink-0">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-200">
              <BookOpen size={36} strokeWidth={1} />
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1 gap-2">
          {article.category?.name && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded w-fit">
              {article.category.name}
            </span>
          )}
          <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
            {article.title}
          </h4>
          {snippet && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{snippet}</p>}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100 mt-auto">
            <span className="flex items-center gap-1"><Clock size={12} /> {article.read_time} mnt</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {article.views}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}