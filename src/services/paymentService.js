// src/services/paymentService.js

import api from '../utils/axios';

// ── Load Midtrans Snap script ─────────────────────────────────────────────
export function loadMidtransSnap() {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve(window.snap);
    const script = document.createElement('script');
    const isProd = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
    script.src   = isProd
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
    script.onload  = () => resolve(window.snap);
    script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap'));
    document.head.appendChild(script);
  });
}

// ── POST /api/subscription/create-payment ────────────────────────────────
export const createTransaction = (payload = {}) =>
  api.post('/subscription/create-payment', payload).then((r) => r.data);

// ── POST /api/subscription/verify ────────────────────────────────────────
// ✅ Aktifkan subscription setelah Snap onSuccess (webhook tidak jalan di localhost)
export const verifyPayment = (orderId, transactionStatus) =>
  api.post('/subscription/verify', {
    order_id:           orderId,
    transaction_status: transactionStatus,
  }).then((r) => r.data);

// ── GET /api/subscription/status ─────────────────────────────────────────
export const getSubscriptionStatus = () =>
  api.get('/subscription/status').then((r) => r.data);

// ── GET /api/subscription/status?physiotherapist_id=X ────────────────────
export const getAccessStatus = (physiotherapistId) =>
  api.get(`/subscription/status?physiotherapist_id=${physiotherapistId}`).then((r) => r.data);

// ── Buka Midtrans Snap popup ──────────────────────────────────────────────
export async function openSnapPayment(snapToken, callbacks = {}) {
  const snap = await loadMidtransSnap();
  snap.pay(snapToken, {
    onSuccess: (r) => callbacks.onSuccess?.(r),
    onPending: (r) => callbacks.onPending?.(r),
    onError:   (r) => callbacks.onError?.(r),
    onClose:   ()  => callbacks.onClose?.(),
  });
}

export default {
  loadMidtransSnap,
  createTransaction,
  verifyPayment,
  getSubscriptionStatus,
  getAccessStatus,
  openSnapPayment,
};