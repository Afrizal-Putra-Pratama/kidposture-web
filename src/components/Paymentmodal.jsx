// src/components/PaymentModal.jsx

import { useState } from 'react';
import {
  X, MessageCircle, Zap, ClipboardList, Bell,
  ShieldCheck, Crown, Loader2, CheckCircle2,
} from 'lucide-react';
import { createTransaction, openSnapPayment, verifyPayment } from '../services/paymentService';

const FEATURES = [
  { icon: MessageCircle, title: 'Chat Langsung',        desc: 'Konsultasi real-time dengan fisioterapis' },
  { icon: Zap,           title: 'Respons Prioritas',    desc: 'Antrian prioritas, dibalas lebih cepat' },
  { icon: ClipboardList, title: 'Rekomendasi Personal', desc: 'Program latihan khusus kondisi anak' },
  { icon: Bell,          title: 'Notifikasi Instan',    desc: 'Update langsung dari fisioterapis' },
];

export default function PaymentModal({ physio, onClose, onSuccess }) {
  const [status,   setStatus]   = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const feeNumber    = physio?.consultation_fee ? Number(physio.consultation_fee) : null;
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
      // ✅ Simpan order_id dari response createTransaction
      const orderId   = res?.order_id   || res?.data?.order_id;

      if (!snapToken) throw new Error(res?.message || 'Gagal mendapatkan token pembayaran.');

      setStatus('processing');

      await openSnapPayment(snapToken, {
        onSuccess: async (result) => {
          try {
            // ✅ Pakai orderId dari createTransaction, fallback ke result.order_id
            const oid    = orderId || result.order_id;
            const status = result.transaction_status || 'settlement';
            await verifyPayment(oid, status);
          } catch (_) {
            // verify gagal tetap lanjut
          }
          setStatus('success');
          setTimeout(() => onSuccess?.(), 1800);
        },
        onPending: () => {
          setStatus('idle');
          setErrorMsg('Pembayaran sedang diproses. Cek email kamu untuk instruksi lanjutan.');
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
      setErrorMsg(err.response?.data?.message || err.message || 'Terjadi kesalahan. Coba beberapa saat lagi.');
    }
  }

  const isDisabled = status === 'loading' || status === 'processing' || status === 'success';

  return (
    <>
      <div style={s.overlay} onClick={!isDisabled ? onClose : undefined}>
        <div style={s.modal} onClick={(e) => e.stopPropagation()}>

          {status === 'success' ? (
            <div style={s.successWrap}>
              <CheckCircle2 size={52} color="#2563eb" strokeWidth={1.5} />
              <p style={s.successTitle}>Pembayaran Berhasil!</p>
              <p style={s.successSub}>
                Akses chat dengan <strong>{physio?.name?.split(' ')[0]}</strong> sudah aktif.
                Menghubungkan ke chat...
              </p>
            </div>
          ) : (
            <>
              <div style={s.header}>
                <div>
                  <div style={s.badge}>
                    <Crown size={11} color="#1d4ed8" /><span>PREMIUM</span>
                  </div>
                  <h2 style={s.title}>Chat dengan {physio?.name?.split(' ')[0] || 'Fisioterapis'}</h2>
                  <p style={s.subtitle}>Konsultasi real-time dengan fisioterapis pilihan kamu</p>
                </div>
                <button style={s.closeBtn} onClick={onClose} disabled={isDisabled}>
                  <X size={20} strokeWidth={2} />
                </button>
              </div>

              <div style={s.divider} />

              <div style={s.priceRow}>
                <span style={s.price}>{feeFormatted}</span>
                <span style={s.pricePer}>/sesi</span>
              </div>
              <p style={s.priceNote}>Akses 1 bulan per fisioterapis</p>

              <div style={s.features}>
                {FEATURES.map(({ icon: Icon, title, desc }) => (
                  <div key={title} style={s.featureItem}>
                    <div style={s.featureIcon}>
                      <Icon size={16} strokeWidth={1.75} color="#2563eb" />
                    </div>
                    <div>
                      <p style={s.featureTitle}>{title}</p>
                      <p style={s.featureDesc}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {errorMsg && (
                <div style={s.errorBox}>
                  <p style={s.errorText}>{errorMsg}</p>
                </div>
              )}

              <button
                onClick={handleBayar}
                disabled={isDisabled}
                style={{ ...s.ctaBtn, opacity: isDisabled ? 0.65 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
              >
                {status === 'loading' || status === 'processing' ? (
                  <span style={s.ctaBtnInner}>
                    <Loader2 size={17} style={s.spinner} />
                    {status === 'loading' ? 'Mempersiapkan...' : 'Menunggu pembayaran...'}
                  </span>
                ) : (
                  `Bayar Sekarang — ${feeFormatted}`
                )}
              </button>

              <div style={s.trust}>
                <ShieldCheck size={13} color="#9ca3af" />
                <span style={s.trustText}>Pembayaran aman diproses via Midtrans</span>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes pm-slidein { from { transform:translateY(100%);opacity:0; } to { transform:translateY(0);opacity:1; } }
        @keyframes pm-spin { to { transform:rotate(360deg); } }
      `}</style>
    </>
  );
}

const s = {
  overlay:      { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:1100, padding:0 },
  modal:        { background:'#fff', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, padding:'24px 20px 36px', boxShadow:'0 -8px 40px rgba(0,0,0,0.15)', animation:'pm-slidein 0.28s cubic-bezier(0.32,0.72,0,1)', maxHeight:'92dvh', overflowY:'auto' },
  successWrap:  { display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'20px 0 8px', gap:12 },
  successTitle: { fontSize:18, fontWeight:700, color:'#111827', margin:0 },
  successSub:   { fontSize:13, color:'#6b7280', margin:0 },
  header:       { display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:16 },
  badge:        { display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, letterSpacing:'0.08em', color:'#1d4ed8', background:'#dbeafe', borderRadius:999, padding:'3px 10px', marginBottom:8 },
  title:        { fontSize:20, fontWeight:700, color:'#111827', margin:'0 0 4px' },
  subtitle:     { fontSize:13, color:'#6b7280', margin:0 },
  closeBtn:     { background:'#f3f4f6', border:'none', borderRadius:8, padding:6, cursor:'pointer', color:'#6b7280', display:'flex', alignItems:'center', flexShrink:0 },
  divider:      { height:1, background:'#f3f4f6', margin:'0 0 16px' },
  priceRow:     { display:'flex', alignItems:'flex-end', gap:4, marginBottom:2 },
  price:        { fontSize:28, fontWeight:700, color:'#111827' },
  pricePer:     { fontSize:13, color:'#9ca3af', marginBottom:4 },
  priceNote:    { fontSize:12, color:'#9ca3af', margin:'0 0 16px' },
  features:     { display:'flex', flexDirection:'column', gap:12, marginBottom:20 },
  featureItem:  { display:'flex', alignItems:'flex-start', gap:10 },
  featureIcon:  { width:32, height:32, borderRadius:8, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  featureTitle: { fontSize:13, fontWeight:600, color:'#111827', margin:'0 0 2px' },
  featureDesc:  { fontSize:12, color:'#6b7280', margin:0 },
  errorBox:     { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'10px 14px', marginBottom:14 },
  errorText:    { fontSize:13, color:'#dc2626', margin:0 },
  ctaBtn:       { width:'100%', background:'#2563eb', color:'#fff', border:'none', borderRadius:12, padding:'15px 20px', fontSize:15, fontWeight:600, cursor:'pointer', marginBottom:12, transition:'background 0.15s' },
  ctaBtnInner:  { display:'flex', alignItems:'center', justifyContent:'center', gap:8 },
  spinner:      { animation:'pm-spin 0.7s linear infinite' },
  trust:        { display:'flex', alignItems:'center', gap:6, justifyContent:'center' },
  trustText:    { fontSize:12, color:'#9ca3af' },
};