import { useState } from "react";
import { X, Crown, MessageCircle, Zap, Shield, Check, Loader2 } from "lucide-react";
import { createTransaction, openSnapPayment } from "../services/paymentService";

const FEATURES = [
  {
    icon: <MessageCircle size={16} />,
    title: "Chat Langsung",
    desc: "Konsultasi real-time tanpa batas waktu",
  },
  {
    icon: <Zap size={16} />,
    title: "Respons Prioritas",
    desc: "Fisioterapis merespons Anda lebih cepat",
  },
  {
    icon: <Shield size={16} />,
    title: "Riwayat Terjamin",
    desc: "Akses histori konsultasi kapan saja",
  },
];

export default function PremiumModal({ onClose, onSuccess, physioId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await createTransaction({
        type: "premium_subscription",
        physio_id: physioId || undefined,
      });

      const snapToken = data?.snap_token || data?.token;
      if (!snapToken) throw new Error("Token pembayaran tidak diterima.");

      await openSnapPayment(snapToken, {
        onSuccess: (result) => {
          onSuccess?.(result);
          onClose();
        },
        // eslint-disable-next-line no-unused-vars
        onPending: (result) => {
          onClose();
        },
        // eslint-disable-next-line no-unused-vars
        onError: (result) => {
          setError("Pembayaran gagal. Silakan coba lagi.");
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
        },
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Gagal memulai pembayaran.");
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-[380px] rounded-2xl border border-slate-100 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col relative">
        
        {/* Tombol Tutup */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors z-10 active:scale-95"
        >
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="p-6 text-center bg-gradient-to-b from-amber-50/50 to-white border-b border-slate-50">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-amber-200/50">
            <Crown size={12} fill="currentColor" /> Premium
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Dukungan Maksimal</h2>
          <p className="text-xs text-slate-500 leading-relaxed px-4">
            Dapatkan akses konsultasi langsung untuk pantau tumbuh kembang si kecil bersama ahlinya.
          </p>
        </div>

        {/* Price Section */}
        <div className="px-8 py-6 text-center">
          <div className="flex items-start justify-center gap-1">
            <span className="text-lg font-bold text-slate-900 mt-1">Rp</span>
            <span className="text-5xl font-black text-slate-900 tracking-tight text-blue-600">49k</span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-2 lowercase">Per bulan · Batalkan kapan saja</p>
        </div>

        {/* Features List */}
        <div className="px-6 py-2 space-y-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-start gap-4 p-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                {f.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 leading-none mb-1">{f.title}</p>
                <p className="text-[11px] text-slate-500 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Section */}
        <div className="p-6 mt-2 flex flex-col gap-3">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <Crown size={18} fill="currentColor" /> Langganan Sekarang
              </>
            )}
          </button>

          <button 
            onClick={onClose}
            className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors active:scale-95"
          >
            Mungkin Nanti
          </button>

          <div className="flex items-center justify-center gap-2 mt-2 opacity-50">
            <span className="text-[10px] font-medium text-slate-400">Pembayaran aman via</span>
            <img src="/midtrans-logo.png" alt="Midtrans" className="h-3 grayscale hover:grayscale-0 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Tambahan: AlertCircle icon fallback
function AlertCircle({ size }) {
  return (
    <svg 
      width={size} height={size} 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}