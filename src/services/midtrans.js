// src/services/midtrans.js

const MIDTRANS_CLIENT_KEY =
  import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'Mid-client-zfcOZkyfNReNXGV0';

const SNAP_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';
// Production: 'https://app.midtrans.com/snap/snap.js'

export function loadSnapScript() {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve(window.snap);

    const existing = document.getElementById('midtrans-snap');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.snap));
      return;
    }

    const script = document.createElement('script');
    script.id = 'midtrans-snap';
    script.src = SNAP_URL;
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    script.onload = () => resolve(window.snap);
    script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap'));
    document.head.appendChild(script);
  });
}

export async function openSnap(snapToken, { onSuccess, onPending, onError, onClose } = {}) {
  const snap = await loadSnapScript();
  snap.pay(snapToken, {
    onSuccess: (result) => { console.log('[Midtrans] success:', result); onSuccess?.(result); },
    onPending: (result) => { console.log('[Midtrans] pending:', result); onPending?.(result); },
    onError:   (result) => { console.error('[Midtrans] error:', result); onError?.(result); },
    onClose:   ()       => { console.log('[Midtrans] closed'); onClose?.(); },
  });
}