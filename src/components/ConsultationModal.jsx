import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, MessageCircle, Crown, UserCheck,
  Loader2, ShieldCheck, ChevronRight,
} from 'lucide-react';
import { getAccessStatus } from '../services/paymentService';
import PaymentModal from './PaymentModal';

export default function ConsultationModal({ physio, onClose, onSelectFree }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  if (!physio) return null;

  // Harga dinamis dari physio.consultation_fee
  const fee = physio.consultation_fee ? Number(physio.consultation_fee) : null;
  const formattedFee = fee
    ? `Rp ${fee.toLocaleString('id-ID')} / sesi`
    : 'Hubungi fisioterapis';

  async function handlePremiumChat() {
    setChecking(true);
    try {
      // Cek akses spesifik ke fisio ini (per-physio, bukan global)
      const res = await getAccessStatus(physio.id);
      const hasAccess = res?.has_access === true || res?.is_premium === true;
      if (hasAccess) {
        navigate('/chat', { state: { physiotherapistId: physio.id } });
      } else {
        setShowPayment(true);
      }
    } catch {
      setShowPayment(true);
    } finally {
      setChecking(false);
    }
  }

  function handlePaymentSuccess() {
    navigate(`/chat?physio_id=${physio.id}`);
  }

  function handleFreeConsultation() {
    onSelectFree(physio.id);
    onClose();
  }

  // Jika pembayaran aktif, ganti isi modal ke PaymentModal
  if (showPayment) {
    return (
      <PaymentModal
        physio={physio}
        onClose={() => { setShowPayment(false); onClose(); }}
        onSuccess={handlePaymentSuccess}
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-50 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Konsultasi dengan</p>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-tight mb-1">{physio.name}</h3>
            {physio.clinic_name && (
              <p className="text-xs font-medium text-slate-500">
                {physio.clinic_name}{physio.city ? ` · ${physio.city}` : ''}
              </p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors active:scale-95 shrink-0"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Options Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-4 bg-slate-50/30">
          
          {/* ── Chat Langsung (PREMIUM) ── */}
          <button
            onClick={handlePremiumChat}
            disabled={checking}
            className="flex items-start sm:items-center gap-4 p-4 sm:p-5 rounded-2xl border border-blue-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 transition-all active:scale-[0.98] text-left w-full group shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-100 transition-colors">
              {checking ? (
                <Loader2 size={24} strokeWidth={2} className="animate-spin" />
              ) : (
                <MessageCircle size={24} strokeWidth={1.5} />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-bold text-slate-900 text-sm sm:text-base">Chat Langsung</span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 flex items-center gap-1">
                  <Crown size={10} strokeWidth={2.5} /> Premium
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-2 pr-2">
                Konsultasi real-time via chat. Respon lebih cepat dan panduan langsung.
              </p>
              <p className="text-sm font-extrabold text-blue-600 tracking-tight">
                {formattedFee}
              </p>
            </div>
            
            <div className="hidden sm:block self-center text-slate-300 group-hover:text-blue-500 transition-colors shrink-0">
              <ChevronRight size={20} strokeWidth={2.5} />
            </div>
          </button>

          {/* ── Rujukan Gratis ── */}
          <button
            onClick={handleFreeConsultation}
            className="flex items-start sm:items-center gap-4 p-4 sm:p-5 rounded-2xl border border-emerald-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/30 transition-all active:scale-[0.98] text-left w-full group shadow-sm"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
              <UserCheck size={24} strokeWidth={1.5} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-bold text-slate-900 text-sm sm:text-base">Rujukan Fisioterapis</span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                  Gratis
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-2 pr-2">
                Kirim hasil screening postur anak Anda. Fisioterapis akan merespons & memberi rekomendasi.
              </p>
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Respon dalam 1–2 hari kerja
              </p>
            </div>
            
            <div className="hidden sm:block self-center text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0">
              <ChevronRight size={20} strokeWidth={2.5} />
            </div>
          </button>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
          <ShieldCheck size={16} className="text-slate-400" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Fisioterapis Terverifikasi Posturely
          </span>
        </div>

      </div>
    </div>
  );
}