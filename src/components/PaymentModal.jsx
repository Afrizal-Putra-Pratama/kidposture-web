/* eslint-disable no-unused-vars */
import { useState } from 'react';
import {
  X, MessageCircle, Zap, ClipboardList, Bell,
  ShieldCheck, Crown, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { createTransaction, openSnapPayment, verifyPayment } from '../services/paymentService';

const FEATURES = [
  { icon: MessageCircle, title: 'Chat Langsung', desc: 'Konsultasi real-time dengan fisioterapis' },
  { icon: Zap, title: 'Respons Prioritas', desc: 'Antrian utama, dibalas lebih cepat' },
  { icon: ClipboardList, title: 'Rekomendasi Personal', desc: 'Program latihan khusus kondisi anak' },
  { icon: Bell, title: 'Notifikasi Instan', desc: 'Update langsung dari fisioterapis' },
];

export default function PaymentModal({ physio, onClose, onSuccess }) {
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const feeNumber = physio?.consultation_fee ? Number(physio.consultation_fee) : null;
  const feeFormatted = feeNumber ? `Rp${feeNumber.toLocaleString('id-ID')}` : 'Rp50.000';

  async function handleBayar() {
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await createTransaction({ physiotherapist_id: physio?.id });

      if (res?.has_access) {
        setStatus('success');
        setTimeout(() => onSuccess?.(), 1800);
        return;
      }

      const snapToken = res?.snap_token || res?.data?.snap_token;
      const orderId = res?.order_id || res?.data?.order_id;

      if (!snapToken) throw new Error(res?.message || 'Gagal mendapatkan token pembayaran.');

      setStatus('processing');

      await openSnapPayment(snapToken, {
        onSuccess: async (result) => {
          try {
            const oid = orderId || result.order_id;
            const statusStr = result.transaction_status || 'settlement';
            await verifyPayment(oid, statusStr);
          // eslint-disable-next-line no-unused-vars
          } catch (_) {
            // Verify gagal tetap lanjut ke UI sukses
          }
          setStatus('success');
          setTimeout(() => onSuccess?.(), 1800);
        },
        onPending: () => {
          setStatus('idle');
          setErrorMsg('Pembayaran sedang diproses. Cek email/aplikasi e-wallet Anda.');
        },
        onError: () => {
          setStatus('error');
          setErrorMsg('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: () => {
          setStatus((prev) => (prev === 'processing' ? 'idle' : prev));
        },
      });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || err.message || 'Terjadi kesalahan sistem.');
    }
  }

  const isDisabled = status === 'loading' || status === 'processing' || status === 'success';

  return (
    <div 
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={!isDisabled ? onClose : undefined}
    >
      <div 
        className="bg-white w-full max-w-[420px] rounded-2xl border border-slate-100 overflow-hidden shadow-xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {status === 'success' ? (
          <div className="p-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shadow-inner">
              <CheckCircle2 size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-slate-900">Pembayaran Berhasil!</p>
              <p className="text-sm text-slate-500">
                Akses chat dengan <strong>{physio?.name?.split(' ')[0]}</strong> telah aktif. Menghubungkan...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 pb-4 flex justify-between items-start">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-100">
                  <Crown size={12} fill="currentColor" /> Premium
                </div>
                <h2 className="text-xl font-bold text-slate-900">Konsultasi Khusus</h2>
                <p className="text-xs text-slate-500">Mulai chat intensif dengan {physio?.name?.split(' ')[0] || 'Fisioterapis'}</p>
              </div>
              <button 
                onClick={onClose} 
                disabled={isDisabled}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mx-6 border-t border-slate-50" />

            {/* Price Info */}
            <div className="px-6 py-5">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{feeFormatted}</span>
                <span className="text-sm font-semibold text-slate-400">/sesi</span>
              </div>
              
            </div>

            {/* Features */}
            <div className="px-6 space-y-4 mb-6">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/50">
                    <Icon size={16} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 leading-none mb-1">{title}</p>
                    <p className="text-[11px] text-slate-500 leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Area */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex flex-col gap-3">
              {errorMsg && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
                  <AlertCircle size={14} /> {errorMsg}
                </div>
              )}

              <button
                onClick={handleBayar}
                disabled={isDisabled}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {status === 'loading' || status === 'processing' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{status === 'loading' ? 'Mempersiapkan...' : 'Menunggu Bayar...'}</span>
                  </>
                ) : (
                  `Bayar Sekarang — ${feeFormatted}`
                )}
              </button>

              <div className="flex items-center justify-center gap-2 opacity-60">
                <ShieldCheck size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aman via Midtrans</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}