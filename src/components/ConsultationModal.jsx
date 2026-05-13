// src/components/ConsultationModal.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, MessageCircle, Crown, UserCheck,
  Loader2, ShieldCheck, ChevronRight,
} from 'lucide-react';
import { getAccessStatus } from '../services/paymentService';
import PaymentModal from './TempModal';

export default function ConsultationModal({ physio, onClose, onSelectFree }) {
  const navigate  = useNavigate();
  const [checking,    setChecking]    = useState(false);
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
      // ✅ Cek akses spesifik ke fisio ini (per-physio, bukan global)
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
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>

        <div style={s.header}>
          <div>
            <p style={s.label}>Konsultasi dengan</p>
            <h3 style={s.physioName}>{physio.name}</h3>
            {physio.clinic_name && (
              <p style={s.physioMeta}>
                {physio.clinic_name}{physio.city ? ` · ${physio.city}` : ''}
              </p>
            )}
          </div>
          <button style={s.closeBtn} onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div style={s.divider} />

        <div style={s.options}>
          {/* ── Chat Langsung (PREMIUM) ── */}
          <button
            style={{ ...s.option, borderColor: '#bfdbfe', opacity: checking ? 0.7 : 1 }}
            onClick={handlePremiumChat}
            disabled={checking}
          >
            <div style={{ ...s.optionIcon, background: '#dbeafe' }}>
              {checking
                ? <Loader2 size={22} strokeWidth={2} color="#2563eb" style={{ animation: 'spin 0.7s linear infinite' }} />
                : <MessageCircle size={22} strokeWidth={1.75} color="#2563eb" />
              }
            </div>
            <div style={s.optionBody}>
              <div style={s.titleRow}>
                <span style={s.optionTitle}>Chat Langsung</span>
                <span style={s.badgePremium}><Crown size={10} /> PREMIUM</span>
              </div>
              <p style={s.optionDesc}>
                Konsultasi real-time via chat. Respon lebih cepat dan langsung.
              </p>
              {/* ✅ Harga dinamis */}
              <p style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', margin: 0 }}>
                {formattedFee}
              </p>
            </div>
            <ChevronRight size={18} strokeWidth={2} color="#d1d5db" />
          </button>

          {/* ── Rujukan Gratis ── */}
          <button
            style={{ ...s.option, borderColor: '#d1fae5' }}
            onClick={handleFreeConsultation}
          >
            <div style={{ ...s.optionIcon, background: '#d1fae5' }}>
              <UserCheck size={22} strokeWidth={1.75} color="#059669" />
            </div>
            <div style={s.optionBody}>
              <div style={s.titleRow}>
                <span style={s.optionTitle}>Rujukan Fisioterapis</span>
                <span style={s.badgeFree}>GRATIS</span>
              </div>
              <p style={s.optionDesc}>
                Kirim hasil screening. Fisioterapis akan merespons dan memberi rekomendasi.
              </p>
              <p style={{ fontSize: 12, color: '#059669', margin: 0 }}>
                Respon dalam 1–2 hari kerja
              </p>
            </div>
            <ChevronRight size={18} strokeWidth={2} color="#d1d5db" />
          </button>
        </div>

        <div style={s.trust}>
          <ShieldCheck size={13} color="#9ca3af" />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>
            Fisioterapis telah terverifikasi oleh Posturely
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes cm-slidein {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const s = {
  overlay:    { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:1000 },
  modal:      { background:'#fff', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, padding:'24px 20px 32px', boxShadow:'0 -4px 40px rgba(0,0,0,0.12)', animation:'cm-slidein 0.25s cubic-bezier(0.32,0.72,0,1)' },
  header:     { display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:16 },
  label:      { fontSize:12, color:'#6b7280', margin:'0 0 2px' },
  physioName: { fontSize:18, fontWeight:700, color:'#111827', margin:'0 0 2px' },
  physioMeta: { fontSize:13, color:'#6b7280', margin:0 },
  closeBtn:   { background:'#f3f4f6', border:'none', borderRadius:8, padding:6, cursor:'pointer', color:'#6b7280', display:'flex', alignItems:'center', flexShrink:0 },
  divider:    { height:1, background:'#f3f4f6', marginBottom:16 },
  options:    { display:'flex', flexDirection:'column', gap:12, marginBottom:16 },
  option:     { display:'flex', alignItems:'center', gap:14, padding:16, borderRadius:14, border:'1.5px solid', background:'#fff', cursor:'pointer', textAlign:'left', width:'100%' },
  optionIcon: { flexShrink:0, width:46, height:46, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' },
  optionBody: { flex:1, minWidth:0 },
  titleRow:   { display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' },
  optionTitle:  { fontSize:15, fontWeight:600, color:'#111827' },
  badgePremium: { display:'inline-flex', alignItems:'center', gap:3, fontSize:10, fontWeight:700, color:'#1d4ed8', background:'#dbeafe', borderRadius:999, padding:'2px 8px' },
  badgeFree:    { fontSize:10, fontWeight:700, color:'#065f46', background:'#d1fae5', borderRadius:999, padding:'2px 8px' },
  optionDesc:   { fontSize:13, color:'#6b7280', margin:'0 0 4px', lineHeight:1.5 },
  trust:        { display:'flex', alignItems:'center', gap:6, justifyContent:'center' },
};