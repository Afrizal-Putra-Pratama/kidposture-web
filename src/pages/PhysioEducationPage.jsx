// src/pages/physio/PhysioEducationPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Tag,
  AlertCircle,
  Menu,
  LayoutDashboard,
  MessageCircle,
  BookOpen,
  User,
  LogOut,
  Crown,
  X
} from "lucide-react";
import physioArticleService from "../services/physioArticleService";
import { getConversations } from "../services/chatService";
import { logout } from "../services/authService";

export default function PhysioEducationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State untuk Badge Notifikasi Konsultasi
  const [unreadCount, setUnreadCount] = useState(0);

  // UI States (Konsisten dengan Dashboard)
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredArticles(articles);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredArticles(
        articles.filter(
          (a) =>
            a.title?.toLowerCase().includes(query) ||
            a.category?.name?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, articles]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load artikel
      const data = await physioArticleService.getAll();
      setArticles(Array.isArray(data) ? data : []);
      
      // Load chat ringan untuk mendapatkan badge unread di sidebar
      const chatRes = await getConversations();
      const chats = chatRes?.data || chatRes || [];
      const unread = chats.filter(c => c.unread_count > 0).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Gagal memuat artikel.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus artikel ini?")) return;

    try {
      await physioArticleService.delete(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting article:", err);
      alert("Gagal menghapus artikel.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50 items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-xl border border-red-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Gagal Memuat</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-md transition-all active:scale-95">Coba Lagi</button>
        </div>
      </div>
    );
  }

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
          <SidebarLink to="/physio/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/physio/dashboard'} expanded={isSidebarExpanded} />
          <SidebarLink to="/physio/chat" icon={MessageCircle} label="Konsultasi" active={location.pathname === '/physio/chat'} expanded={isSidebarExpanded} badge={unreadCount} />
          <SidebarLink to="/physio/education" icon={BookOpen} label="Kelola Edukasi" active={location.pathname === '/physio/education'} expanded={isSidebarExpanded} />
          <SidebarLink to="/physio/profile" icon={User} label="Profil & Pengaturan" active={location.pathname === '/physio/profile'} expanded={isSidebarExpanded} />
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <button onClick={handleLogout} className={`flex items-center w-full rounded-md transition-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 active:scale-95 ${isSidebarExpanded ? 'justify-start px-4 py-2.5 gap-3' : 'justify-center p-2.5'}`}>
            <LogOut size={20} className="shrink-0" /> 
            {isSidebarExpanded && <span className="text-sm truncate">Keluar</span>}
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
               <button onClick={() => setIsSidebarOpenMobile(false)} className="text-slate-500 p-1.5 rounded-md hover:bg-slate-100 active:scale-95 transition-all"><X size={20}/></button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto hide-scrollbar">
              <SidebarLink to="/physio/dashboard" icon={LayoutDashboard} label="Dashboard" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/chat" icon={MessageCircle} label="Konsultasi" expanded={true} badge={unreadCount} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/education" icon={BookOpen} label="Kelola Edukasi" active={true} expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/profile" icon={User} label="Profil & Pengaturan" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
            </nav>
            <div className="p-4 border-t border-slate-100 mt-auto">
               <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-sm text-red-600 hover:bg-red-50 rounded-md transition-all font-medium active:scale-95"><LogOut size={18}/> Keluar</button>
            </div>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        
        {/* Header Identik */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md active:scale-95 transition-transform" onClick={() => setIsSidebarOpenMobile(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden lg:block text-slate-500 text-sm font-medium">
              Portal Fisioterapis
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-0">
            {/* Navigasi cepat ke chat premium (opsional/konsistensi) */}
            <button 
              onClick={() => navigate("/physio/chat")}
              className="hidden sm:flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md transition-colors active:scale-95"
            >
              <Crown size={16} strokeWidth={2.5}/>
              <span className="text-xs font-bold uppercase tracking-wide">Daftar Premium</span>
            </button>
            
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200 ml-2 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate("/physio/profile")}>
              <User size={18} />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto hide-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Top Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Kelola Artikel Edukasi</h1>
                <p className="text-slate-500 mt-1 text-sm">Buat dan kelola informasi edukasi postur tubuh untuk orang tua.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/physio/education/create")}
                className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                <Plus size={18} /> Buat Artikel Baru
              </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white border border-slate-200 rounded-md p-2 shadow-sm flex items-center gap-3">
              <Search className="text-slate-400 ml-2 shrink-0" size={20} />
              <input
                type="text"
                placeholder="Cari artikel berdasarkan judul atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Content List */}
            {loading ? (
              <EducationSkeleton />
            ) : filteredArticles.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl h-64">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                  <Eye size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  {searchQuery ? "Tidak ada artikel yang cocok" : "Belum ada artikel"}
                </h3>
                <p className="text-slate-500 text-sm max-w-sm mb-6">
                  {searchQuery ? "Coba gunakan kata kunci pencarian yang berbeda." : "Mulai menulis artikel edukasi untuk membantu dan memberikan wawasan kepada orang tua."}
                </p>
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={() => navigate("/physio/education/create")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-md text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Buat Artikel Pertama
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onEdit={() => navigate(`/physio/education/${article.id}/edit`)}
                    onDelete={() => handleDelete(article.id)}
                    onView={() => navigate(`/education/${article.slug}`)}
                  />
                ))}
              </div>
            )}
            
          </div>
        </div>
      </main>
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
      className={`flex items-center rounded-md font-medium transition-all duration-200 relative active:scale-95 ${expanded ? 'px-4 py-2.5 justify-start gap-3' : 'p-2.5 justify-center'} ${active ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}
    >
      <div className="relative shrink-0">
        <Icon size={20} className={active ? 'text-blue-600' : ''} />
        {badge > 0 && !expanded && (
           <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white"></span>
        )}
      </div>
      {expanded && (
        <div className="flex-1 flex justify-between items-center min-w-0">
          <span className="text-sm truncate">{label}</span>
          {badge > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">{badge}</span>}
        </div>
      )}
    </Link>
  );
}

function ArticleCard({ article, onEdit, onDelete, onView }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-all hover:border-slate-300 group">
      {article.thumbnail ? (
        <div className="relative h-44 bg-slate-100 border-b border-slate-100 overflow-hidden">
          <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ) : (
        <div className="relative h-44 bg-slate-100 border-b border-slate-100 flex items-center justify-center text-slate-300">
           <BookOpen size={48} strokeWidth={1} />
        </div>
      )}

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-2.5 flex-wrap">
          {article.category?.name && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase tracking-wide">
              <Tag size={12} /> {article.category.name}
            </span>
          )}
          {article.published_at && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Calendar size={12} />
              {new Date(article.published_at).toLocaleDateString("id-ID", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-tight">{article.title}</h3>

        {article.excerpt ? (
          <p className="text-sm text-slate-500 mb-5 line-clamp-3 flex-1 leading-relaxed">{article.excerpt}</p>
        ) : (
           <div className="flex-1"></div>
        )}

        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-auto">
          <button
            type="button"
            onClick={onView}
            className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-slate-200"
          >
            <Eye size={14} /> Lihat
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-blue-100"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold active:scale-95 transition-all flex items-center justify-center border border-red-100"
            title="Hapus Artikel"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Skeleton untuk Loading State (Konsisten dengan gaya dashboard)
function EducationSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[360px]">
          <div className="h-44 bg-slate-200 shrink-0 border-b border-slate-100"></div>
          <div className="p-4 sm:p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 bg-slate-100 rounded w-20"></div>
              <div className="h-3 bg-slate-100 rounded w-24"></div>
            </div>
            <div className="h-5 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-5 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-slate-100 rounded w-full mb-1.5"></div>
            <div className="h-3 bg-slate-100 rounded w-full mb-1.5"></div>
            <div className="h-3 bg-slate-100 rounded w-4/5 mb-4"></div>
            
            <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
               <div className="flex-1 h-8 bg-slate-100 rounded-lg"></div>
               <div className="flex-1 h-8 bg-slate-100 rounded-lg"></div>
               <div className="w-10 h-8 bg-slate-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}