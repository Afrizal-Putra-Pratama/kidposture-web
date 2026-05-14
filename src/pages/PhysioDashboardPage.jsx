import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Stethoscope,
  Clock,
  CheckCircle,
  BookOpen,
  UserCog,
  MessageCircle,
  Crown,
  Bell,
  X,
  Menu,
  LayoutDashboard,
  LogOut,
  User,
  ChevronRight,
  AlertCircle,
  Search
} from "lucide-react";
import { fetchPhysioReferrals } from "../services/screeningService";
import { getConversations } from "../services/chatService";
import { logout } from "../services/authService";

export default function PhysioDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("requested");
  const [conversations, setConversations] = useState([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // UI States
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showChatNotif, setShowChatNotif] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    Promise.all([loadScreenings(), loadConversations()]).then(() => {
      setTimeout(() => setLoading(false), 500);
    });
  }, []);

  const loadScreenings = async () => {
    try {
      const data = await fetchPhysioReferrals();
      const list = data?.data ?? data;
      setScreenings(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error loading physio referrals:", err);
      setError("Gagal memuat data rujukan untuk fisioterapis.");
    }
  };

  const loadConversations = async () => {
    try {
      const res = await getConversations();
      const list = res?.data || res || [];
      setConversations(list);
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // ── Logika Data & Pencarian ──
  const unreadChats = conversations.filter((c) => c.unread_count > 0);
  const totalUnread = unreadChats.length;

  const onlyReferred = screenings.filter((s) => s.referral_status && s.referral_status !== "none");
  const countByStatus = (status) => onlyReferred.filter((s) => s.referral_status === status).length;

  // Filter berdasarkan Tab dan Query Pencarian
  const filteredScreenings = onlyReferred.filter((s) => {
    if (s.referral_status !== activeTab) return false;
    
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const childName = (s.child?.name || "").toLowerCase();
    const parentName = (s.parent?.name || "").toLowerCase();
    const parentEmail = (s.parent?.email || "").toLowerCase();

    return childName.includes(query) || parentName.includes(query) || parentEmail.includes(query);
  });

  const premiumScreenings = filteredScreenings.filter((s) => s.parent?.is_premium === true || s.is_premium === true);
  const regularScreenings = filteredScreenings.filter((s) => !s.parent?.is_premium && !s.is_premium);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50 items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-lg border border-red-200 text-center max-w-md w-full">
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
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      
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
          <SidebarLink to="/physio/chat" icon={MessageCircle} label="Konsultasi" active={location.pathname === '/physio/chat'} expanded={isSidebarExpanded} badge={totalUnread} />
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
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpenMobile(false)}></div>
          <div className="absolute inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 flex items-center justify-between border-b border-slate-100 h-16">
               <div className="flex items-center gap-3">
                  <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 shrink-0" />
                  <span className="font-bold text-lg text-slate-800">Posturely</span>
               </div>
               <button onClick={() => setIsSidebarOpenMobile(false)} className="text-slate-500 p-1.5 rounded-md hover:bg-slate-100 active:scale-95 transition-all"><X size={20}/></button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto hide-scrollbar">
              <SidebarLink to="/physio/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/physio/dashboard'} expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/chat" icon={MessageCircle} label="Konsultasi" expanded={true} badge={totalUnread} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/education" icon={BookOpen} label="Kelola Edukasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
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
        
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shrink-0">
          <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md active:scale-95 transition-transform" onClick={() => setIsSidebarOpenMobile(true)}>
            <Menu size={24} />
          </button>

          <div className="hidden lg:block text-slate-500 text-sm font-medium">
            Portal Fisioterapis
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-0">
            
            {/* Daftar Premium (Chat Notifications Highlight) */}
            <div className="relative flex items-center">
              <button 
                onClick={() => setShowChatNotif(!showChatNotif)} 
                className="p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md relative transition-all active:scale-95 flex items-center justify-center gap-2 border border-amber-200 px-3"
              >
                <Crown size={18} strokeWidth={2.5} />
                <span className="text-sm font-bold hidden sm:block">Daftar Premium</span>
                {totalUnread > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{totalUnread}</span>}
              </button>
              
              {/* Desktop Notification Panel */}
              {showChatNotif && (
                <div className="hidden lg:block absolute top-12 right-0 w-80 bg-white border border-slate-300 rounded-lg z-50 overflow-hidden animate-in slide-in-from-top-2">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-sm flex justify-between items-center">
                    <span className="text-slate-800">Daftar Pasien Premium</span>
                    <button onClick={() => setShowChatNotif(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200 transition-all"><X size={16}/></button>
                  </div>
                  <div className="max-h-72 overflow-y-auto hide-scrollbar">
                    {conversations.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 bg-white">
                        <MessageCircle size={24} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">Belum ada pesan</p>
                      </div>
                    ) : (
                      conversations.map(conv => {
                        const parent = conv.parent || (conv.participants || []).find(p => p.role !== "physio");
                        const isPremium = conv.is_premium || parent?.is_premium;
                        const hasUnread = conv.unread_count > 0;

                        const containerClass = isPremium 
                          ? "bg-amber-50 hover:bg-amber-100 border-l-4 border-l-amber-500 border-b border-b-slate-100" 
                          : `border-b border-b-slate-100 ${hasUnread ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50'}`;

                        return (
                          <div key={conv.id} onClick={() => { setShowChatNotif(false); navigate(`/physio/chat?conversation_id=${conv.id}`); }} className={`p-3 transition-colors cursor-pointer flex gap-3 items-center ${containerClass}`}>
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${isPremium ? 'bg-amber-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
                               {(parent?.name || "?")[0].toUpperCase()}
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-sm truncate ${hasUnread ? 'font-bold text-slate-800' : 'font-semibold text-slate-700'}`}>{parent?.name || "Parent"}</span>
                                  {isPremium && <Crown size={14} className="text-amber-600 fill-amber-100 shrink-0"/>}
                                </div>
                                <p className={`text-xs mt-0.5 truncate ${isPremium ? 'text-amber-700' : 'text-slate-500'}`}>{conv.last_message?.content || "Mulai percakapan..."}</p>
                             </div>
                             {hasUnread && <div className={`w-2 h-2 rounded-full shrink-0 ${isPremium ? 'bg-amber-600' : 'bg-blue-600'}`}></div>}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 border-t border-slate-200">
                     <button onClick={() => { setShowChatNotif(false); navigate("/physio/chat"); }} className="w-full py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"><MessageCircle size={14}/> Buka Menu Pesan</button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Icon Custom */}
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200 ml-2 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate("/physio/profile")}>
              <User size={18} />
            </div>
          </div>
        </header>

        {/* Area Dashboard yang bisa ter-scroll */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto hide-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Welcome Info */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard Rujukan</h1>
              <p className="text-slate-500 mt-1 text-sm">Kelola dan pantau screening anak yang dirujuk kepada Anda.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Menunggu Konfirmasi" value={countByStatus("requested")} icon={Clock} color="amber" />
              <StatCard label="Sedang Ditangani" value={countByStatus("accepted")} icon={Stethoscope} color="blue" />
              <StatCard label="Selesai" value={countByStatus("completed")} icon={CheckCircle} color="emerald" />
              <StatCard label="Pesan Premium Baru" value={totalUnread} icon={Crown} color="indigo" onClick={() => navigate("/physio/chat")} />
            </div>

            {/* Table Section */}
            <section className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
              
              {/* Header with Tabs & Search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 bg-white">
                
                {/* Tabs */}
                <div className="flex flex-nowrap overflow-x-auto hide-scrollbar px-2 pt-2 md:pt-0 shrink-0">
                  {[
                    { key: "requested", label: "Menunggu Konfirmasi" },
                    { key: "accepted", label: "Sedang Ditangani" },
                    { key: "completed", label: "Selesai" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all active:scale-95 border-b-2 -mb-[1px] ${
                        activeTab === tab.key 
                          ? "text-blue-600 border-blue-600 bg-blue-50/50" 
                          : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="p-2 md:p-3 w-full md:w-auto border-t md:border-t-0 border-slate-100">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Cari nama, ortu, email..." 
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Table Content (Scrollable Inner Area) */}
              <div className="p-0 overflow-y-auto max-h-[500px] bg-white relative hide-scrollbar">
                {filteredScreenings.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center h-64">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                      {searchQuery ? <Search size={24} /> : <Stethoscope size={24} />}
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">
                      {searchQuery ? "Tidak Ada Hasil Pencarian" : "Belum Ada Rujukan"}
                    </h3>
                    <p className="text-slate-500 text-sm max-w-sm">
                      {searchQuery ? "Coba gunakan kata kunci pencarian yang berbeda." : "Data rujukan yang sesuai dengan status ini akan muncul di sini."}
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <Th>Data Anak</Th>
                        <Th>Orang Tua</Th>
                        <Th className="text-center">Skor</Th>
                        <Th>Status Kondisi</Th>
                        <Th>Tanggal</Th>
                        <Th className="text-right">Aksi</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      
                      {/* Premium Rows */}
                      {premiumScreenings.map((s) => (
                        <ScreeningRow
                          key={`prem-${s.id}`}
                          s={s}
                          isPremium={true}
                          onDetail={() => navigate(`/physio/screenings/${s.id}`)}
                          onChat={() => navigate(`/physio/chat?conversation_id=${conversations.find((c) => (c.parent?.id || c.parent_id) === (s.parent?.id || s.parent_id))?.id || ""}`)}
                          hasConversation={conversations.some((c) => (c.parent?.id || c.parent_id) === (s.parent?.id || s.parent_id))}
                        />
                      ))}

                      {/* Divider if both exist */}
                      {premiumScreenings.length > 0 && regularScreenings.length > 0 && (
                        <tr>
                          <td colSpan="6" className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-y border-slate-100">
                            Pasien Reguler
                          </td>
                        </tr>
                      )}

                      {/* Regular Rows */}
                      {regularScreenings.map((s) => (
                        <ScreeningRow
                          key={`reg-${s.id}`}
                          s={s}
                          isPremium={false}
                          onDetail={() => navigate(`/physio/screenings/${s.id}`)}
                        />
                      ))}

                    </tbody>
                  </table>
                )}
              </div>
            </section>
            
          </div>
        </div>
      </main>

      {/* === MOBILE: Notifikasi Overlay === */}
      {showChatNotif && (
        <div className="fixed inset-0 z-[100] lg:hidden" onClick={() => setShowChatNotif(false)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>
          <div
            className="absolute top-16 left-4 right-4 bg-white border border-slate-300 rounded-xl overflow-hidden animate-in slide-in-from-top-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-sm flex justify-between items-center">
              <span className="text-slate-800">Daftar Pasien Premium</span>
              <button onClick={() => setShowChatNotif(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-200 active:scale-95 transition-all"><X size={16}/></button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto hide-scrollbar">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white">
                  <MessageCircle size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Belum ada pesan</p>
                </div>
              ) : (
                conversations.map(conv => {
                  const parent = conv.parent || (conv.participants || []).find(p => p.role !== "physio");
                  const isPremium = conv.is_premium || parent?.is_premium;
                  const hasUnread = conv.unread_count > 0;
                  
                  const containerClass = isPremium 
                    ? "bg-amber-50 hover:bg-amber-100 border-l-4 border-l-amber-500 border-b border-b-slate-100" 
                    : `border-b border-b-slate-100 active:bg-slate-100 ${hasUnread ? 'bg-blue-50/50' : 'bg-white'}`;

                  return (
                    <div key={conv.id} onClick={() => { setShowChatNotif(false); navigate(`/physio/chat?conversation_id=${conv.id}`); }} className={`p-3 transition-colors cursor-pointer flex gap-3 items-center ${containerClass}`}>
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${isPremium ? 'bg-amber-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
                         {(parent?.name || "?")[0].toUpperCase()}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-sm truncate ${hasUnread ? 'font-bold text-slate-800' : 'font-semibold text-slate-700'}`}>{parent?.name || "Parent"}</span>
                            {isPremium && <Crown size={14} className="text-amber-600 fill-amber-100 shrink-0"/>}
                          </div>
                          <p className={`text-xs mt-0.5 truncate ${isPremium ? 'text-amber-700' : 'text-slate-500'}`}>{conv.last_message?.content || "Mulai percakapan..."}</p>
                       </div>
                       {hasUnread && <div className={`w-2 h-2 rounded-full shrink-0 ${isPremium ? 'bg-amber-600' : 'bg-blue-600'}`}></div>}
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-slate-200">
               <button onClick={() => { setShowChatNotif(false); navigate("/physio/chat"); }} className="w-full py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-md border border-slate-300 transition-all active:scale-95 flex items-center justify-center gap-2"><MessageCircle size={14}/> Buka Menu Pesan</button>
            </div>
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

// eslint-disable-next-line no-unused-vars
function StatCard({ label, value, icon: Icon, color, onClick }) {
  const styles = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100"
  };

  return (
    <div 
      onClick={onClick} 
      className={`bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-center transition-all ${onClick ? 'cursor-pointer active:scale-95 hover:border-slate-300' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pr-2 line-clamp-2 leading-tight">{label}</span>
        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${styles[color]}`}>
          <Icon size={16} strokeWidth={2.5}/>
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return <th className={`px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50 sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0] ${className}`}>{children}</th>;
}

function Td({ children, className = "" }) {
  return <td className={`px-4 py-4 ${className}`}>{children}</td>;
}

function ScreeningRow({ s, isPremium, onDetail, onChat, hasConversation }) {
  const getBadgeStyle = (cat) => {
    if (cat === "GOOD" || cat === "Baik") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (cat === "FAIR" || cat === "Cukup") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <tr className={`group transition-colors ${isPremium ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-slate-50/80'}`}>
      <Td>
        <div className="font-semibold text-slate-800">{s.child?.name || "Tanpa Nama"}</div>
        <div className="text-xs text-slate-500 mt-0.5">{s.child?.age_years != null ? `${s.child.age_years} Tahun` : "-"}</div>
      </Td>
      <Td>
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium text-slate-700">{s.parent?.name || "-"}</div>
            <div className="text-xs text-slate-400">{s.parent?.email || "-"}</div>
          </div>
          {isPremium && (
            <span className="flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200 rounded text-[10px] font-bold px-1.5 py-0.5">
              <Crown size={10} /> PRO
            </span>
          )}
        </div>
      </Td>
      <Td className="text-center">
        <span className="font-bold text-slate-700">{s.score ?? "-"}</span>
      </Td>
      <Td>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border inline-block ${getBadgeStyle(s.category)}`}>
          {s.category || "Perlu Perhatian"}
        </span>
      </Td>
      <Td className="text-slate-600 whitespace-nowrap">
        {new Date(s.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
      </Td>
      <Td className="text-right">
        <div className="flex items-center justify-end gap-2">
          {isPremium && (
            <button
              onClick={onChat}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border transition-all active:scale-95 ${hasConversation ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}
            >
              <MessageCircle size={14} /> {hasConversation ? "Balas" : "Chat"}
            </button>
          )}
          <button
            onClick={onDetail}
            className="flex items-center gap-1 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-md text-xs font-bold transition-all active:scale-95"
          >
            Detail <ChevronRight size={14} />
          </button>
        </div>
      </Td>
    </tr>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50 animate-pulse font-sans overflow-hidden">
      <div className="w-20 lg:w-64 bg-white border-r border-slate-200 hidden lg:block shrink-0"></div>
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <div className="h-16 lg:h-20 bg-white border-b border-slate-200 shrink-0"></div>
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto hide-scrollbar">
          <div className="max-w-6xl w-full mx-auto space-y-6">
            <div className="space-y-2"><div className="h-8 bg-slate-200 rounded w-48"></div><div className="h-4 bg-slate-200 rounded w-72"></div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-lg border border-slate-200"></div>)}
            </div>
            <div className="h-96 bg-white rounded-lg border border-slate-200 shrink-0 mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}