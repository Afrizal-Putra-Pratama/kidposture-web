import { useState } from "react";
import { X, Crown, MessageCircle, Zap, Shield, Check, Loader } from "lucide-react";
import { createTransaction, openSnapPayment } from "../services/paymentService";
import "../styles/chat.css";

const FEATURES = [
  {
    icon: <MessageCircle size={13} />,
    title: "Chat Langsung dengan Fisioterapis",
    desc: "Konsultasi real-time tanpa batas waktu",
  },
  {
    icon: <Zap size={13} />,
    title: "Respons Prioritas",
    desc: "Antrian utama — fisioterapis merespons lebih cepat",
  },
  {
    icon: <Shield size={13} />,
    title: "Riwayat Chat Tersimpan",
    desc: "Akses histori konsultasi kapan saja",
  },
];

/**
 * PremiumModal
 *
 * Props:
 *   onClose()           – tutup modal
 *   onSuccess()         – dipanggil setelah pembayaran berhasil
 *   physioId (optional) – kalau langsung arahkan ke chat physio tertentu
 */
export default function PremiumModal({ onClose, onSuccess, physioId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buat transaksi ke backend
      const data = await createTransaction({
        type: "premium_subscription",
        physio_id: physioId || undefined,
      });

      const snapToken = data?.snap_token || data?.token;
      if (!snapToken) throw new Error("Token pembayaran tidak diterima.");

      // Buka Midtrans Snap
      await openSnapPayment(snapToken, {
        onSuccess: (result) => {
          console.log("Payment success:", result);
          onSuccess?.(result);
          onClose();
        },
        onPending: (result) => {
          console.log("Payment pending:", result);
          // Tetap tutup modal, tampilkan info di luar
          onClose();
        },
        onError: (result) => {
          console.error("Payment error:", result);
          setError("Pembayaran gagal. Silakan coba lagi.");
          setLoading(false);
        },
        onClose: () => {
          // User menutup popup Midtrans tanpa bayar
          setLoading(false);
        },
      });
    } catch (err) {
      console.error("createTransaction error:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Gagal memulai pembayaran. Coba lagi."
      );
      setLoading(false);
    }
  };

  return (
    <div
      className="premium-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="premium-modal">
        {/* Header */}
        <div className="premium-modal__header">
          <button className="premium-modal__close" onClick={onClose}>
            <X size={16} strokeWidth={2} />
          </button>
          <div className="premium-modal__badge">
            <Crown size={12} />
            PREMIUM
          </div>
          <h2>Akses Chat dengan Fisioterapis</h2>
          <p>
            Konsultasi langsung untuk mendampingi tumbuh kembang si kecil
            lebih optimal
          </p>
        </div>

        {/* Price */}
        <div className="premium-modal__price">
          <div className="premium-price-amount">
            <sup>Rp</sup>49.000
          </div>
          <div className="premium-price-period">per bulan · batalkan kapan saja</div>
        </div>

        {/* Features */}
        <div className="premium-modal__features">
          {FEATURES.map((f, i) => (
            <div key={i} className="premium-feature-item">
              <div className="premium-feature-item__icon">
                <Check size={12} strokeWidth={3} />
              </div>
              <div className="premium-feature-item__text">
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="premium-modal__actions">
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "0.625rem 0.875rem",
                fontSize: "0.82rem",
                color: "#dc2626",
              }}
            >
              {error}
            </div>
          )}

          <button
            className="premium-btn-primary"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={16} style={{ animation: "spin 0.7s linear infinite" }} />
                Memproses...
              </>
            ) : (
              <>
                <Crown size={16} />
                Upgrade Sekarang
              </>
            )}
          </button>

          <button className="premium-btn-secondary" onClick={onClose}>
            Nanti saja
          </button>

          <p className="premium-modal__note">
            Pembayaran aman via Midtrans · Kartu kredit, transfer bank, e-wallet
          </p>
        </div>
      </div>
    </div>
  );
}