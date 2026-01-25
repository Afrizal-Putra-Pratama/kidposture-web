import { useState, useCallback } from "react";
import { NotificationContext } from "./NotificationContext.jsx";

function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  // { type: 'success'|'error'|'info', message: string }

  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notification, showNotification, clearNotification }}
    >
      {children}
      <NotificationBanner
        notification={notification}
        onClose={clearNotification}
      />
    </NotificationContext.Provider>
  );
}

function NotificationBanner({ notification, onClose }) {
  if (!notification) return null;

  const bg =
    notification.type === "success"
      ? "#dcfce7"
      : notification.type === "error"
      ? "#fee2e2"
      : "#dbeafe";
  const border =
    notification.type === "success"
      ? "#16a34a"
      : notification.type === "error"
      ? "#ef4444"
      : "#3b82f6";
  const color =
    notification.type === "success"
      ? "#166534"
      : notification.type === "error"
      ? "#b91c1c"
      : "#1d4ed8";

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        minWidth: 260,
        maxWidth: 360,
        padding: "10px 14px",
        borderRadius: 8,
        background: bg,
        border: `1px solid ${border}`,
        color,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
      }}
    >
      <div style={{ fontSize: 18 }}>
        {notification.type === "success"
          ? "✅"
          : notification.type === "error"
          ? "⚠️"
          : "ℹ️"}
      </div>
      <div style={{ fontSize: 14, flex: 1 }}>{notification.message}</div>
      <button
        onClick={onClose}
        style={{
          border: "none",
          background: "transparent",
          color,
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: 14,
        }}
      >
        ×
      </button>
    </div>
  );
}

export default NotificationProvider;
