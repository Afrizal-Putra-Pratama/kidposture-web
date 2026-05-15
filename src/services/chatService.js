// src/services/chatService.js
import api from '../utils/axios';
import Pusher from 'pusher-js';

// ─── REST ─────────────────────────────────────────────────────

export const getConversations = () =>
  api.get('/conversations').then((r) => r.data);

// Resolve physiotherapist_id → user_id sebelum buat conversation
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

// ─── Pusher Singleton ─────────────────────────────────────────
// Satu instance Pusher dipakai seluruh app agar tidak ada koneksi duplikat.
// Instance di-reset jika token berubah (logout/login).

let pusherInstance = null;
let pusherToken    = null;

export function getPusherInstance() {
  const token   = localStorage.getItem('token');
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const appUrl  = baseUrl.replace(/\/api\/?$/, '');

  // Buat ulang jika token berubah (misal setelah re-login)
  if (pusherInstance && pusherToken !== token) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }

  if (pusherInstance) return pusherInstance;

  pusherToken    = token;
  pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
    cluster:      import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS:     true,
    authEndpoint: `${baseUrl}/broadcasting/auth`, // pakai /api prefix agar Sanctum token dipakai
    auth: {
      headers: {
        Authorization:                `Bearer ${token}`,
        Accept:                       'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    },
  });

  pusherInstance.connection.bind('connected',    () => console.log('[Pusher] Connected, socket_id:', pusherInstance.connection.socket_id));
  pusherInstance.connection.bind('disconnected', () => console.log('[Pusher] Disconnected'));
  pusherInstance.connection.bind('error',        (err) => console.error('[Pusher] Error:', err));

  return pusherInstance;
}

// ─── Ambil socket_id dari Pusher ──────────────────────────────
// WAJIB dikirim sebagai header X-Socket-ID ke backend.
// Tanpa ini, toOthers() di Laravel tidak tahu siapa pengirimnya
// dan bisa skip SEMUA penerima termasuk lawan bicara.
function getSocketId() {
  try {
    return getPusherInstance()?.connection?.socket_id || null;
  } catch {
    return null;
  }
}

// ─── Kirim pesan teks ─────────────────────────────────────────
export const sendMessage = (conversationId, content) => {
  const socketId = getSocketId();
  return api.post(
    `/conversations/${conversationId}/messages`,
    { body: content },
    { headers: socketId ? { 'X-Socket-ID': socketId } : {} }
  ).then((r) => r.data);
};

// ─── Upload file/gambar dalam conversation ────────────────────
export const sendFile = async (conversationId, file, caption = '') => {
  const token    = localStorage.getItem('token');
  const baseUrl  = import.meta.env.VITE_API_BASE_URL || '';
  const socketId = getSocketId();

  const formData = new FormData();
  formData.append('file', file);
  if (caption) formData.append('body', caption);

  const headers = {
    Authorization:                `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true',
    // Jangan set Content-Type — biar browser set boundary multipart otomatis
  };
  if (socketId) headers['X-Socket-ID'] = socketId;

  const res = await fetch(`${baseUrl}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

/**
 * Subscribe ke channel conversation private.
 * Mendengarkan event 'MessageSent' (dari Laravel broadcast).
 *
 * @param {number|string} conversationId
 * @param {(message: object) => void} onMessage  — dipanggil saat pesan baru tiba
 * @returns {() => void}  — fungsi unsubscribe, panggil saat cleanup
 */
export function subscribeToConversation(conversationId, onMessage) {
  const pusher      = getPusherInstance();
  const channelName = `private-conversation.${conversationId}`;

  // Unsubscribe dulu jika sudah ada (hindari double-binding)
  const existingChannel = pusher.channel(channelName);
  if (existingChannel) {
    existingChannel.unbind_all();
    pusher.unsubscribe(channelName);
  }

  const channel = pusher.subscribe(channelName);

  // Laravel default broadcast as "App\Events\MessageSent" tapi broadcastAs() bisa override.
  // Kita listen semua kemungkinan nama event.
  const handler = (data) => {
    console.log('[Pusher] Event diterima:', data);
    const msg = data?.message ?? data;
    if (msg && (msg.id || msg.body)) onMessage(msg);
  };

  channel.bind('MessageSent',              handler); // jika pakai broadcastAs('MessageSent')
  channel.bind('message.sent',             handler); // alternatif snake_case
  channel.bind('App\\Events\\MessageSent', handler); // Laravel default tanpa broadcastAs

  channel.bind('pusher:subscription_succeeded', () => {
    console.log('[Pusher] Subscribed ke channel:', channelName);
  });

  channel.bind('pusher:subscription_error', (status) => {
    console.error(`[Pusher] Gagal subscribe channel ${channelName}:`, status);
  });

  return () => {
    channel.unbind_all();
    pusher.unsubscribe(channelName);
  };
}

export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
    pusherToken    = null;
  }
}