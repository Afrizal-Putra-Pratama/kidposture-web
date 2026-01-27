// src/components/NotificationBell.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../services/notificationService";

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const data = await fetchUnreadCount();
      setUnreadCount(data.count ?? 0);
    } catch (err) {
      console.error("Error loading unread count:", err);
    }
  };

  const loadNotifications = async (reset = true) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page + 1;
      const data = await fetchNotifications(currentPage, 10);

      if (reset) {
        setNotifications(data.data ?? []);
      } else {
        setNotifications((prev) => [...prev, ...(data.data ?? [])]);
      }

      setPage(currentPage);
      setHasMore(data.meta?.has_more ?? false);
    } catch (err) {
      console.error("Error loading notifications:", err);
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
            n.id === notif.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
          )
        );
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    }
    setShowDropdown(false);
    if (notif.screening_id) {
      navigate(`/screenings/${notif.screening_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleDeleteNotification = async (notif, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notif.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      if (!notif.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Hapus semua notifikasi?")) return;
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setPage(1);
      setHasMore(false);
    } catch (err) {
      console.error("Error deleting all notifications:", err);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    loadNotifications(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={handleBellClick}
        style={{
          position: "relative",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: 22,
          padding: 8,
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              background: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: 18,
              height: 18,
              fontSize: 11,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 8,
            width: 360,
            maxHeight: 420,
            overflow: "hidden",
            background: "white",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
              Notifikasi
            </h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteAll}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ef4444",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Hapus semua
                </button>
              )}
              {notifications.some((n) => !n.is_read) && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#3b82f6",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Tandai dibaca
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
            }}
          >
            {loading && notifications.length === 0 ? (
              <p
                style={{
                  padding: 16,
                  textAlign: "center",
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                Memuat...
              </p>
            ) : notifications.length === 0 ? (
              <p
                style={{
                  padding: 16,
                  textAlign: "center",
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                Belum ada notifikasi
              </p>
            ) : (
              <div>
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #f3f4f6",
                      cursor: "pointer",
                      background: notif.is_read ? "white" : "#eff6ff",
                      transition: "background 0.2s",
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = notif.is_read
                        ? "white"
                        : "#eff6ff")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <strong
                          style={{ fontSize: 14, color: "#111827" }}
                        >
                          {notif.title}
                        </strong>
                        {!notif.is_read && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#3b82f6",
                              marginTop: 2,
                            }}
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNotification(notif, e)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#9ca3af",
                          cursor: "pointer",
                          fontSize: 16,
                          padding: "2px 6px",
                          lineHeight: 1,
                        }}
                        title="Hapus notifikasi"
                      >
                        ✕
                      </button>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#6b7280",
                        lineHeight: 1.4,
                      }}
                    >
                      {notif.message}
                    </p>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>
                      {new Date(notif.created_at).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              style={{
                padding: "8px 16px",
                borderTop: "1px solid #e5e7eb",
                background: "white",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 13,
                fontWeight: 500,
                color: "#3b82f6",
              }}
            >
              {loading ? "Memuat..." : "Muat lebih banyak"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
