import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, X, Trash2, Check, Loader2, Info } from "lucide-react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../services/notificationService";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Polling unread count setiap 30 detik
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    
    // Close dropdown saat klik di luar
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadUnreadCount = async () => {
    try {
      const data = await fetchUnreadCount();
      setUnreadCount(data.count ?? 0);
    } catch (err) {
      console.error("Error unread count:", err);
    }
  };

  const loadNotifications = async (reset = true) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page + 1;
      const data = await fetchNotifications(currentPage, 8); // per_page 8 agar tidak terlalu panjang

      if (reset) {
        setNotifications(data.data ?? []);
      } else {
        setNotifications((prev) => [...prev, ...(data.data ?? [])]);
      }

      setPage(currentPage);
      setHasMore(data.meta?.has_more ?? false);
    } catch (err) {
      console.error("Error notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!showDropdown) {
      loadNotifications(true);
    }
    setShowDropdown(!showDropdown);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await markNotificationAsRead(notif.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id ? { ...n, is_read: true } : n
          )
        );
      } catch (err) {
        console.error("Error marking read:", err);
      }
    }
    setShowDropdown(false);
    if (notif.screening_id) navigate(`/screenings/${notif.screening_id}`);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error mark all read:", err);
    }
  };

  const handleDeleteNotification = async (notif, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notif.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      if (!notif.is_read) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error delete notif:", err);
    }
  };

  const handleDeleteAll = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Hapus semua riwayat notifikasi?")) return;
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setPage(1);
      setHasMore(false);
    } catch (err) {
      console.error("Error delete all:", err);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Tombol Lonceng */}
      <button
        type="button"
        onClick={handleBellClick}
        className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all active:scale-95"
      >
        <Bell size={20} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white border border-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-100 rounded-lg shadow-xl z-[1000] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Notifikasi</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 transition-colors"
                >
                  Tandai Dibaca
                </button>
              )}
              <button
                onClick={() => setShowDropdown(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto hide-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 size={24} className="text-blue-500 animate-spin" />
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Memuat...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Bell size={20} className="text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-800">Belum Ada Kabar</p>
                <p className="text-xs text-slate-400 mt-1">Notifikasi aktivitas Anda akan muncul di sini.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`relative p-4 cursor-pointer transition-colors group flex gap-3 ${
                      notif.is_read ? "bg-white hover:bg-slate-50" : "bg-blue-50/40 hover:bg-blue-50"
                    }`}
                  >
                    {/* Unread Dot */}
                    {!notif.is_read && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <p className={`text-sm leading-tight truncate ${notif.is_read ? "text-slate-700 font-medium" : "text-slate-900 font-bold"}`}>
                          {notif.title}
                        </p>
                        <button
                          onClick={(e) => handleDeleteNotification(notif, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                        <Info size={10} />
                        <span>
                          {new Date(notif.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer / Load More */}
          {hasMore && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); loadNotifications(false); }}
              disabled={loading}
              className="w-full py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              LIHAT NOTIFIKASI SEBELUMNYA
            </button>
          )}

          {notifications.length > 0 && !hasMore && (
            <button
              onClick={handleDeleteAll}
              className="w-full py-2.5 bg-white border-t border-slate-50 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              Bersihkan Semua Notifikasi
            </button>
          )}
        </div>
      )}
    </div>
  );
}