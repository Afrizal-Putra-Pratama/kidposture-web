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
  Lock
} from 'lucide-react';
import api from '../../utils/axios';

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-XXXX';
const MIDTRANS_SNAP_URL   = 'https://app.sandbox.midtrans.com/snap/snap.js';

const STATUS = {
  IDLE:        'idle',
  REQUESTING:  'requesting',
  SNAP_OPEN:   'snap_open',
  SUCCESS:     'success',
  PENDING:     'pending',
  FAILED:      'failed',
  ERROR:       'error',
};

export default function PaymentPage() {
  const location  = useLocation();
  const navigate  = useNavigate();

  const {
    physiotherapistId,
    physioName      = 'Fisioterapis',
    consultationFee = 0,
  } = location.state || {};

  const [status,   setStatus]   = useState(STATUS.IDLE);
  const [errMsg,   setErrMsg]   = useState('');
  const [snapReady, setSnapReady] = useState(false);

  // Load Midtrans Snap script
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
      setErrMsg('Gagal memuat sistem pembayaran. Periksa koneksi internet Anda.');
    };
    document.body.appendChild(script);
  }, []);

  // Redirect guard
  useEffect(() => {
    if (!physiotherapistId) {
      navigate(-1);
    }
  }, [physiotherapistId, navigate]);

  const handlePay = useCallback(async () => {
    if (!snapReady) {
      setErrMsg('Sistem pembayaran belum siap, tunggu sebentar lalu coba lagi.');
      return;
    }

    setStatus(STATUS.REQUESTING);
    setErrMsg('');

    try {
      const { data } = await api.post('/payments/create-transaction', {
        physiotherapist_id: physiotherapistId,
        amount:             Number(consultationFee),
      });

      const snapToken = data?.snap_token || data?.data?.snap_token;
      if (!snapToken) throw new Error('Token pembayaran tidak valid.');

      setStatus(STATUS.SNAP_OPEN);

      window.snap.pay(snapToken, {
        onSuccess: async (result) => {
          try {
            await api.post('/payments/verify', {
              order_id:           result.order_id,
              transaction_status: result.transaction_status,
            });
          // eslint-disable-next-line no-unused-vars
          } catch (_) {
            // Biarkan lanjut walau verify gagal di frontend
          }

          setStatus(STATUS.SUCCESS);
          setTimeout(() => {
            navigate('/chat', {
              state: { physiotherapistId },
              replace: true,
            });
          }, 2500);
        },
        onPending: () => setStatus(STATUS.PENDING),
        onError: (result) => {
          console.error('Midtrans error:', result);
          setStatus(STATUS.FAILED);
          setErrMsg('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: () => {
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
        'Terjadi kesalahan saat memulai pembayaran.'
      );
    }
  }, [snapReady, physiotherapistId, consultationFee, navigate, status]);

  const formattedFee = consultationFee
    ? `Rp ${Number(consultationFee).toLocaleString('id-ID')}`
    : '-';

  const isLoading = status === STATUS.REQUESTING || status === STATUS.SNAP_OPEN;

  // ─── Tampilan SUCCESS ────────────────────────────────────────────────
  if (status === STATUS.SUCCESS) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="bg-white w-full max-w-[420px] rounded-3xl border border-slate-100 shadow-xl p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-inner">
            <CheckCircle2 size={40} strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Pembayaran Berhasil!</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-8">
            Akses chat premium dengan <strong>{physioName}</strong> telah aktif. Membuka ruang obrolan...
          </p>
          <div className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
            <Loader2 size={16} className="animate-spin" /> Menghubungkan...
          </div>
        </div>
      </div>
    );
  }

  // ─── Tampilan PENDING ────────────────────────────────────────────────
  if (status === STATUS.PENDING) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="bg-white w-full max-w-[420px] rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-5 border border-amber-100 shadow-inner">
            <AlertCircle size={40} strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Menunggu Pembayaran</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-8">
            Silakan selesaikan instruksi pembayaran yang muncul. Akses chat akan otomatis aktif setelah dana diterima.
          </p>
          <button 
            onClick={() => navigate('/children')} 
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-colors active:scale-95"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── Tampilan UTAMA ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans text-slate-800">
      <div className="bg-white w-full max-w-[440px] rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
        
        {/* Dekorasi BG */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none" />

        <button 
          onClick={() => navigate(-1)} 
          className="relative flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors w-max active:scale-95 -ml-1 p-1 rounded-lg"
        >
          <ArrowLeft size={18} strokeWidth={2.5} /> Kembali
        </button>

        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-200 shadow-inner">
            <CreditCard size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Selesaikan Pembayaran</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Akses premium 30 hari</p>
          </div>
        </div>

        <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500">Fisioterapis</span>
            <span className="text-sm font-extrabold text-slate-900">{physioName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500">Layanan</span>
            <span className="text-sm font-bold text-slate-800">Chat Langsung</span>
          </div>
          <div className="h-px w-full bg-slate-200 my-0.5" />
          <div className="flex justify-between items-end">
            <span className="text-base font-extrabold text-slate-900">Total</span>
            <span className="text-2xl font-black text-blue-600 tracking-tight">{formattedFee}</span>
          </div>
        </div>

        {(status === STATUS.FAILED || status === STATUS.ERROR) && errMsg && (
          <div className="relative bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2">
            <XCircle size={18} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errMsg}</span>
          </div>
        )}

        <div className="relative flex flex-col gap-4">
          <button
            onClick={handlePay}
            disabled={isLoading || !snapReady}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-sm font-extrabold transition-all active:scale-[0.98] shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {status === STATUS.REQUESTING ? 'Membuka Midtrans...' : 'Menunggu Selesai...'}
              </>
            ) : (
              `Bayar Sekarang — ${formattedFee}`
            )}
          </button>

          <div className="flex flex-col items-center justify-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Lock size={12} /> Pembayaran Aman
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 opacity-60">
              {['BCA', 'BNI', 'Mandiri', 'QRIS', 'GoPay', 'OVO'].map((m) => (
                <span key={m} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[9px] font-bold text-slate-500 uppercase tracking-wider shadow-sm">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}