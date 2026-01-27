import api from "../utils/axios";

export async function fetchNotifications(page = 1, perPage = 10) {
  const res = await api.get("/notifications", {
    params: { page, per_page: perPage },
  });
  return res.data; // { data: [...], meta: {...} }
}

export async function fetchUnreadCount() {
  const res = await api.get("/notifications/unread-count");
  return res.data; // { count: number }
}

export async function markNotificationAsRead(id) {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsAsRead() {
  const res = await api.patch("/notifications/read-all");
  return res.data;
}

export async function deleteNotification(id) {
  const res = await api.delete(`/notifications/${id}`);
  return res.data;
}

export async function deleteAllNotifications() {
  const res = await api.delete("/notifications");
  return res.data;
}
