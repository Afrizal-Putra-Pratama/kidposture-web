// src/services/chatService.js
import api from '../utils/axios';
import Pusher from 'pusher-js';

// ─── REST ─────────────────────────────────────────────────────

export const getConversations = () =>
  api.get('/conversations').then((r) => r.data);

// ✅ Resolve physiotherapist_id → user_id sebelum buat conversation
export const getPhysioUserId = (physiotherapistId) =>
  api.get(`/physiotherapists/${physiotherapistId}`).then((r) => {
    const data = r.data?.data || r.data;
    return data?.user_id;
  });

// Terima physio user_id (bukan physiotherapist id)
export const getOrCreateConversation = (physioUserId) =>
  api.post('/conversations', { physio_user_id: physioUserId }).then((r) => r.data);

export const getMessages = (conversationId) =>
  api.get(`/conversations/${conversationId}/messages`).then((r) => r.data);

export const sendMessage = (conversationId, content) =>
  api.post(`/conversations/${conversationId}/messages`, { body: content }).then((r) => r.data);

// ✅ Upload file/gambar dalam conversation
export const sendFile = async (conversationId, file, caption = '') => {
  const token   = localStorage.getItem('token');
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

  const formData = new FormData();
  formData.append('file', file);
  if (caption) formData.append('body', caption);

  const res = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
      // Jangan set Content-Type — biar browser set boundary multipart otomatis
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// ─── Pusher ───────────────────────────────────────────────────
let pusherInstance = null;

export function getPusherInstance() {
  if (pusherInstance) return pusherInstance;

  const token   = localStorage.getItem('token');
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const appUrl  = baseUrl.replace(/\/api$/, '');

  pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authEndpoint: `${appUrl}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    },
  });

  return pusherInstance;
}

export function subscribeToConversation(conversationId, onMessage) {
  const pusher      = getPusherInstance();
  const channelName = `private-conversation.${conversationId}`;
  const channel     = pusher.subscribe(channelName);
  channel.bind('MessageSent',  (data) => onMessage(data?.message || data));
  channel.bind('message.sent', (data) => onMessage(data?.message || data));
  return () => {
    channel.unbind_all();
    pusher.unsubscribe(channelName);
  };
}

export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
}