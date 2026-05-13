// src/pages/PaymentPage.jsx
// Halaman payment Midtrans Snap untuk konsultasi premium fisioterapis.
//
// Flow:
//  ConsultationModal → navigate('/payment', { state: { physiotherapistId, physioName, consultationFee } })
//  → PaymentPage: request snap_token ke backend → tampilkan Midtrans Snap popup
//  → onSuccess → navigate('/chat', { state: { physiotherapistId } })
//
// Backend yang dibutuhkan:
//  POST /api/payments/create-transaction
//    body : { physiotherapist_id, amount }
//    return: { snap_token: "...", order_id: "..." }
//
//  POST /api/payments/verify          (opsional, untuk konfirmasi server-side)
//    body : { order_id, transaction_status }

import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import api from '../../utils/axios';

// Midtrans Snap client key – ganti dengan key sandbox kamu di .env
const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-XXXX';
const MIDTRANS_SNAP_URL   = 'https://app.sandbox.midtrans.com/snap/snap.js';

// ─── Status tampilan ───────────────────────────────────────────────────────
const STATUS = {
  IDLE:        'idle',       // sebelum klik bayar
  REQUESTING:  'requesting', // minta snap_token ke backend
  SNAP_OPEN:   'snap_open',  // popup Midtrans sedang terbuka
  SUCCESS:     'success',    // pembayaran berhasil
  PENDING:     'pending',    // menunggu konfirmasi (transfer bank dll)
  FAILED:      'failed',     // gagal / dibatalkan user
  ERROR:       'error',      // error teknis
};

export default function PaymentPage() {
  const location  = useLocation();
  const navigate  = useNavigate();

  // Data dari ConsultationModal via navigate state
  const {
    physiotherapistId,
    physioName      = 'Fisioterapis',
    consultationFee = 0,
  } = location.state || {};

  const [status,   setStatus]   = useState(STATUS.IDLE);
  const [errMsg,   setErrMsg]   = useState('');
  const [snapReady, setSnapReady] = useState(false);

  // ── 1. Load Midtrans Snap script sekali saja ───────────────────────────
  useEffect(() => {
    if (document.getElementById('midtrans-snap-script')) {
      setSnapReady(true);
      return;
    }
    const script    = document.createElement('script');
    script.id       = 'midtrans-snap-script';
    script.src      = MIDTRANS_SNAP_URL;
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    script.onload   = () => setSnapReady(true);
    script.onerror  = () => {
      setStatus(STATUS.ERROR);
      setErrMsg('Gagal memuat skrip pembayaran Midtrans. Periksa koneksi internet kamu.');
    };
    document.body.appendChild(script);
  }, []);

  // ── 2. Redirect guard: kalau tidak ada physio, balik ──────────────────
  useEffect(() => {
    if (!physiotherapistId) {
      navigate(-1);
    }
  }, [physiotherapistId, navigate]);

  // ── 3. Klik tombol Bayar ──────────────────────────────────────────────
  const handlePay = useCallback(async () => {
    if (!snapReady) {
      setErrMsg('Sistem pembayaran belum siap, tunggu sebentar lalu coba lagi.');
      return;
    }

    setStatus(STATUS.REQUESTING);
    setErrMsg('');

    try {
      // Request snap_token dari backend
      const { data } = await api.post('/payments/create-transaction', {
        physiotherapist_id: physiotherapistId,
        amount:             Number(consultationFee),
      });

      const snapToken = data?.snap_token || data?.data?.snap_token;
      if (!snapToken) throw new Error('snap_token tidak ditemukan di response backend.');

      setStatus(STATUS.SNAP_OPEN);

      // Buka popup Midtrans Snap
      window.snap.pay(snapToken, {
        onSuccess: async (result) => {
          // Opsional: konfirmasi ke backend
          try {
            await api.post('/payments/verify', {
              order_id:           result.order_id,
              transaction_status: result.transaction_status,
            });
          } catch (_) {
            // Jangan blokir flow meski verify gagal
          }

          setStatus(STATUS.SUCCESS);

          // Tunggu sebentar agar user lihat animasi sukses, lalu redirect ke chat
          setTimeout(() => {
            navigate('/chat', {
              state: { physiotherapistId },
              replace: true,
            });
          }, 2000);
        },

        onPending: () => {
          setStatus(STATUS.PENDING);
        },

        onError: (result) => {
          console.error('Midtrans error:', result);
          setStatus(STATUS.FAILED);
          setErrMsg('Pembayaran gagal. Silakan coba lagi.');
        },

        onClose: () => {
          // User nutup popup tanpa selesai bayar
          if (status === STATUS.SNAP_OPEN || status === STATUS.REQUESTING) {
            setStatus(STATUS.IDLE);
          }
        },
      });
    } catch (err) {
      console.error('PaymentPage error:', err);
      setStatus(STATUS.ERROR);
      setErrMsg(
        err.response?.data?.message ||
        err.message ||
        'Terjadi kesalahan saat menginisiasi pembayaran.'
      );
    }
  }, [snapReady, physiotherapistId, consultationFee, navigate, status]);

  // ─── Helpers format ───────────────────────────────────────────────────
  const formattedFee = consultationFee
    ? `Rp ${Number(consultationFee).toLocaleString('id-ID')}`
    : '-';

  // ─── Render state: SUCCESS ─────────────────────────────────────────────
  if (status === STATUS.SUCCESS) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, textAlign: 'center', padding: '48px 28px' }}>
          <CheckCircle2 size={64} color="#059669" strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <h2 style={{ ...styles.heading, color: '#059669' }}>Pembayaran Berhasil!</h2>
          <p style={styles.subText}>
            Memuat sesi chat dengan <strong>{physioName}</strong>…
          </p>
          <Loader2 size={24} color="#6b7280" style={{ animation: 'spin 0.8s linear infinite', marginTop: 24 }} />
        </div>
        <GlobalKeyframes />
      </div>
    );
  }

  // ─── Render state: PENDING ─────────────────────────────────────────────
  if (status === STATUS.PENDING) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, textAlign: 'center', padding: '48px 28px' }}>
          <AlertCircle size={64} color="#f59e0b" strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <h2 style={{ ...styles.heading, color: '#d97706' }}>Menunggu Pembayaran</h2>
          <p style={styles.subText}>
            Pembayaran kamu sedang diproses. Setelah dikonfirmasi, akses chat akan aktif otomatis.
          </p>
          <button onClick={() => navigate('/children')} style={styles.btnSecondary}>
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── Render utama ──────────────────────────────────────────────────────
  const isLoading = status === STATUS.REQUESTING || status === STATUS.SNAP_OPEN;

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Back button */}
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <ArrowLeft size={16} strokeWidth={2} />
          Kembali
        </button>

        {/* Title */}
        <div style={styles.titleSection}>
          <CreditCard size={28} color="#2563eb" strokeWidth={1.5} />
          <h1 style={styles.heading}>Pembayaran Konsultasi</h1>
        </div>

        {/* Order summary */}
        <div style={styles.summaryBox}>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Fisioterapis</span>
            <span style={styles.summaryValue}>{physioName}</span>
          </div>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Layanan</span>
            <span style={styles.summaryValue}>Chat Langsung (Premium)</span>
          </div>
          <div style={{ ...styles.summaryRow, borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 4 }}>
            <span style={{ ...styles.summaryLabel, fontWeight: 700, color: '#111827' }}>Total</span>
            <span style={{ ...styles.summaryValue, fontWeight: 700, color: '#2563eb', fontSize: 18 }}>
              {formattedFee}
            </span>
          </div>
        </div>

        {/* Error */}
        {(status === STATUS.FAILED || status === STATUS.ERROR) && errMsg && (
          <div style={styles.errorBox}>
            <XCircle size={16} strokeWidth={2} />
            <span>{errMsg}</span>
          </div>
        )}

        {/* CTA Bayar */}
        <button
          onClick={handlePay}
          disabled={isLoading || !snapReady}
          style={{
            ...styles.btnPrimary,
            opacity: (isLoading || !snapReady) ? 0.65 : 1,
            cursor:  (isLoading || !snapReady) ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
              {status === STATUS.REQUESTING ? 'Menyiapkan pembayaran…' : 'Menunggu pembayaran…'}
            </>
          ) : (
            <>
              <CreditCard size={18} strokeWidth={2} />
              Bayar Sekarang · {formattedFee}
            </>
          )}
        </button>

        {/* Trust badges */}
        <div style={styles.trustRow}>
          <ShieldCheck size={14} color="#6b7280" strokeWidth={2} />
          <span style={styles.trustText}>
            Pembayaran aman via Midtrans · Didukung Transfer Bank, QRIS, E-wallet
          </span>
        </div>

        {/* Payment method icons (text fallback) */}
        <div style={styles.methodList}>
          {['BCA', 'BNI', 'Mandiri', 'QRIS', 'GoPay', 'OVO', 'Dana'].map((m) => (
            <span key={m} style={styles.methodBadge}>{m}</span>
          ))}
        </div>
      </div>

      <GlobalKeyframes />
    </div>
  );
}

// ─── Inline styles ─────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight:      '100vh',
    background:     '#f8fafc',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '24px 16px',
  },
  card: {
    background:   '#fff',
    borderRadius: 20,
    boxShadow:    '0 4px 32px rgba(0,0,0,0.08)',
    padding:      '32px 28px',
    width:        '100%',
    maxWidth:     460,
    display:      'flex',
    flexDirection:'column',
    gap:          20,
  },
  backBtn: {
    display:     'inline-flex',
    alignItems:  'center',
    gap:         6,
    background:  'none',
    border:      'none',
    color:       '#6b7280',
    fontSize:    14,
    cursor:      'pointer',
    padding:     0,
    alignSelf:   'flex-start',
  },
  titleSection: {
    display:    'flex',
    alignItems: 'center',
    gap:        12,
  },
  heading: {
    fontSize:   22,
    fontWeight: 700,
    color:      '#111827',
    margin:     0,
  },
  subText: {
    fontSize:   15,
    color:      '#6b7280',
    margin:     '8px 0 0',
    lineHeight: 1.6,
  },
  summaryBox: {
    background:   '#f8fafc',
    borderRadius: 12,
    padding:      '16px 18px',
    display:      'flex',
    flexDirection:'column',
    gap:          10,
  },
  summaryRow: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'baseline',
    gap:            8,
  },
  summaryLabel: {
    fontSize: 14,
    color:    '#6b7280',
  },
  summaryValue: {
    fontSize:  14,
    color:     '#111827',
    textAlign: 'right',
  },
  errorBox: {
    display:      'flex',
    alignItems:   'flex-start',
    gap:          8,
    background:   '#fef2f2',
    border:       '1px solid #fecaca',
    borderRadius: 10,
    padding:      '12px 14px',
    color:        '#dc2626',
    fontSize:     13,
    lineHeight:   1.5,
  },
  btnPrimary: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
    background:     '#2563eb',
    color:          '#fff',
    border:         'none',
    borderRadius:   12,
    padding:        '14px 24px',
    fontSize:       15,
    fontWeight:     600,
    width:          '100%',
    transition:     'background 0.15s',
  },
  btnSecondary: {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
    background:     '#f3f4f6',
    color:          '#374151',
    border:         'none',
    borderRadius:   10,
    padding:        '12px 20px',
    fontSize:       14,
    fontWeight:     600,
    cursor:         'pointer',
    marginTop:      16,
    width:          '100%',
  },
  trustRow: {
    display:    'flex',
    alignItems: 'flex-start',
    gap:        6,
  },
  trustText: {
    fontSize:   12,
    color:      '#9ca3af',
    lineHeight: 1.5,
  },
  methodList: {
    display:  'flex',
    flexWrap: 'wrap',
    gap:      6,
  },
  methodBadge: {
    fontSize:     11,
    fontWeight:   600,
    color:        '#6b7280',
    background:   '#f3f4f6',
    borderRadius: 6,
    padding:      '3px 8px',
    border:       '1px solid #e5e7eb',
  },
};

// Inject keyframes untuk spinner
function GlobalKeyframes() {
  return (
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  );
}