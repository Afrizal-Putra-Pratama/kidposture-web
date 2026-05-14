import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  LogOut,
  BookOpen,
  MessageCircle,
  LayoutDashboard,
  Bell,
  Menu,
  X,
  Trash2,
  ShieldCheck
} from "lucide-react";
import { logout, getCurrentUser } from "../services/authService.jsx";
import { useNotifications } from "../hooks/useNotification.jsx";

export default function ParentProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  useEffect(() => {
    const fetchUser = () => {
      setTimeout(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setLoading(false);
      }, 600);
    };
    fetchUser();
  }, []);

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

  if (loading) {
    return <ProfileSkeleton />;
  }

  const createdDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("id-ID", {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : new Date().toLocaleDateString("id-ID", {
        day: 'numeric', month: 'long', year: 'numeric'
      });

  return (

    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
     
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
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/dashboard'} expanded={isSidebarExpanded} />
          <SidebarLink to="/chat" icon={MessageCircle} label="Konsultasi" active={location.pathname === '/chat'} expanded={isSidebarExpanded} />
          <SidebarLink to="/education" icon={BookOpen} label="Edukasi" active={location.pathname === '/education'} expanded={isSidebarExpanded} />
          <SidebarLink to="/profile" icon={User} label="Profil Saya" active={location.pathname === '/profile'} expanded={isSidebarExpanded} />
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <button onClick={handleLogout} className={`flex items-center w-full rounded-md transition-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 ${isSidebarExpanded ? 'justify-start px-4 py-3 gap-3' : 'justify-center p-3'}`}>
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
            <div className="p-6 flex items-center justify-between border-b border-slate-100 h-16">
               <div className="flex items-center gap-3">
                  <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 shrink-0" />
                  <span className="font-bold text-lg text-slate-800">Posturely</span>
               </div>
               <button onClick={() => setIsSidebarOpenMobile(false)} className="text-slate-500 p-1 rounded-md hover:bg-slate-100"><X size={24}/></button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto hide-scrollbar">
              <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/chat" icon={MessageCircle} label="Konsultasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/education" icon={BookOpen} label="Edukasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/profile" icon={User} label="Profil Saya" active={true} expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
            </nav>
            <div className="p-4 border-t border-slate-100 mt-auto">
               <button onClick={handleLogout} className="flex items-center gap-3 w-full p-4 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"><LogOut size={20}/> Keluar</button>
            </div>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      {/* PERBAIKAN: Menambahkan h-full */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        
        {/* Top Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shrink-0">
          <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md" onClick={() => setIsSidebarOpenMobile(true)}>
            <Menu size={24} />
          </button>

          <div className="hidden lg:block text-slate-500 text-sm font-medium">
            Pengaturan Akun & Profil
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-0">
            <div className="relative flex items-center">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full relative transition-colors flex items-center justify-center">
                <Bell size={22} strokeWidth={2} />
                {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>
              {notifOpen && (
                <div className="hidden lg:block">
                  <NotificationPanel notifications={notifications} close={() => setNotifOpen(false)} handleNotifClick={handleNotifClick} markAllAsRead={markAllAsRead} deleteNotification={deleteNotification} unreadCount={unreadCount} />
                </div>
              )}
            </div>
            
            <div className="flex items-center md:gap-3 bg-slate-50 p-1 md:pr-4 rounded-full border border-slate-200 transition-colors ml-1 shrink-0">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200">
                <User size={18} />
              </div>
              <span className="hidden md:block text-sm font-semibold text-slate-700 whitespace-nowrap">{user?.name || 'Profil'}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto hide-scrollbar">
          <div className="max-w-3xl mx-auto">
            
            {/* Header Profil */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
                <p className="text-slate-500 mt-1 text-sm">Kelola informasi data diri dan detail akun Anda.</p>
              </div>
            </div>

            {/* Profile Card Terpadu */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              
              {/* Banner Clean Putih */}
              <div className="h-28 bg-white relative border-b border-slate-100">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white"></div>
              </div>
              
              <div className="px-6 pb-8 relative">
                {/* Avatar Mengambang */}
                <div className="flex justify-between items-end mb-6">
                  <div className="-mt-12 relative z-10">
                    <div className="w-24 h-24 bg-white rounded-lg p-1.5 shadow-sm border border-slate-200">
                      <div className="w-full h-full bg-slate-50 text-slate-500 rounded-md flex items-center justify-center border border-slate-100">
                        <User size={40} strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                    <ShieldCheck size={16} />
                    <span className="text-xs font-bold uppercase tracking-wide">Akun Aktif</span>
                  </div>
                </div>

                {/* Detail Data Profil */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Info Pribadi */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
                      Informasi Pribadi
                    </h3>
                    <div className="space-y-3">
                      <ProfileField 
                        icon={User} 
                        label="Nama Lengkap" 
                        value={user?.name || '-'} 
                      />
                      <ProfileField 
                        icon={Mail} 
                        label="Alamat Email" 
                        value={user?.email || '-'} 
                      />
                      <ProfileField 
                        icon={Calendar} 
                        label="Bergabung Sejak" 
                        value={createdDate} 
                      />
                    </div>
                  </div>

                 
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
                      Pengaturan Akun
                    </h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                      <p className="text-sm text-slate-600 mb-4">
                        Pembaruan kata sandi atau perubahan email dapat dilakukan dengan menghubungi dukungan teknis.
                      </p>
                      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-md text-sm font-semibold transition-all">
                        <LogOut size={16} /> Keluar dari Akun
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

     
      {notifOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden" onClick={() => setNotifOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"></div>
          <div
            className="absolute top-16 left-4 right-4 bg-white border border-slate-200 rounded-lg overflow-hidden animate-in slide-in-from-top-2 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-800">Notifikasi</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-100">Dibaca</button>
                )}
                <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><X size={18}/></button>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto hide-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50/50">
                  <Bell size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Belum ada notifikasi</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} onClick={() => handleNotifClick(n)} className={`p-3 border-b border-slate-50 transition-colors cursor-pointer flex gap-3 group ${!n.is_read ? 'bg-blue-50/30 hover:bg-blue-50' : 'hover:bg-slate-50'}`}>
                    <div className={`mt-0.5 shrink-0 ${!n.is_read ? 'text-blue-500' : 'text-slate-400'}`}><Bell size={14} /></div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.is_read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'} truncate`}>{n.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
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
function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-md border border-slate-200">
      <div className="text-slate-400 shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-semibold text-slate-800 truncate">{value}</span>
      </div>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function SidebarLink({ to, icon: Icon, label, active, expanded, onClick }) {
  return (
    <Link 
      to={to} 
      onClick={onClick} 
      className={`flex items-center rounded-md font-medium transition-all duration-200 ${expanded ? 'px-4 py-2.5 justify-start gap-3' : 'p-2.5 justify-center'} ${active ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}
    >
      <Icon size={20} className={`shrink-0 ${active ? 'text-blue-600' : ''}`} />
      {expanded && <span className="text-sm truncate flex-1">{label}</span>}
    </Link>
  );
}

function NotificationPanel({ notifications, close, unreadCount, markAllAsRead, handleNotifClick, deleteNotification }) {
  return (
    <div className="absolute top-12 right-0 w-80 sm:w-80 bg-white border border-slate-200 rounded-lg z-50 overflow-hidden animate-in slide-in-from-top-2 shadow-xl">
      <div className="p-3 bg-white border-b border-slate-100 font-bold text-sm flex justify-between items-center bg-slate-50/50">
        <span className="text-slate-800">Notifikasi</span>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <button onClick={markAllAsRead} className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-100">Dibaca</button>}
          <button onClick={close} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><X size={16}/></button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto hide-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-50/50">
            <Bell size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">Belum ada notifikasi</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} onClick={() => handleNotifClick(n)} className={`p-3 border-b border-slate-50 transition-colors cursor-pointer flex gap-3 group ${!n.is_read ? 'bg-blue-50/30 hover:bg-blue-50' : 'hover:bg-slate-50'}`}>
              <div className={`mt-0.5 shrink-0 ${!n.is_read ? 'text-blue-500' : 'text-slate-400'}`}><Bell size={14} /></div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.is_read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'} truncate`}>{n.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1 rounded hover:bg-slate-100 shrink-0"><Trash2 size={14}/></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// PERBAIKAN: Skeleton Loading juga diberi h-screen dan h-full
function ProfileSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50 animate-pulse overflow-hidden">
      {/* Sidebar Skeleton */}
      <div className="w-20 lg:w-64 bg-white border-r border-slate-200 hidden lg:block shrink-0"></div>
      
      <div className="flex-1 min-w-0 h-full flex flex-col">
        {/* Header Skeleton */}
        <div className="h-16 lg:h-20 bg-white border-b border-slate-200 shrink-0"></div>
        
        {/* Content Skeleton */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto hide-scrollbar">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-2">
              <div className="h-8 bg-slate-200 rounded w-48"></div>
              <div className="h-4 bg-slate-200 rounded w-72"></div>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="h-28 bg-slate-100 border-b border-slate-200"></div>
              <div className="px-6 pb-8">
                <div className="-mt-12 mb-6">
                  <div className="w-24 h-24 bg-slate-200 rounded-lg border-4 border-white"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
                    <div className="h-12 bg-slate-100 rounded-md"></div>
                    <div className="h-12 bg-slate-100 rounded-md"></div>
                    <div className="h-12 bg-slate-100 rounded-md"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
                    <div className="h-32 bg-slate-100 rounded-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}