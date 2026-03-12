import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Building2,
  Briefcase,
  Clock,
  ShieldCheck,
  Calendar,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import physioService from '../../services/physioService';
import '../../styles/PhysiotherapistDetail.css';

export default function PhysiotherapistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [physio, setPhysio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchPhysio();
  }, [id]);

  const fetchPhysio = async () => {
    try {
      const data = await physioService.getById(id);
      setPhysio(data);
    } catch (error) {
      console.error('Error fetching physio:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNGSI BUKA GOOGLE MAPS
  const openInGoogleMaps = (latitude, longitude, clinicName) => {
    if (!latitude || !longitude) {
      alert("Koordinat klinik tidak tersedia");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Koordinat klinik tidak valid");
      return;
    }

    const label = encodeURIComponent(clinicName || "Klinik Fisioterapi");
    const url = `https://www.google.com/maps?q=${lat},${lng}&label=${label}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="physio-detail-page">
        <div className="physio-detail-container">
          <p className="physio-detail-loading">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!physio) {
    return (
      <div className="physio-detail-page">
        <div className="physio-detail-container">
          <div className="physio-detail-empty">
            <p>Fisioterapis tidak ditemukan.</p>
            <button
              onClick={() => navigate('/physiotherapists')}
              className="physio-detail-empty-btn"
            >
              Kembali ke Direktori
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isVerified = physio.is_verified === true && physio.is_active === true;

  return (
    <div className="physio-detail-page">
      <div className="physio-detail-container">
        {/* Card */}
        <div className="physio-detail-card">
          {/* Header dengan gradient */}
          <div className="physio-detail-header">
            <div className="physio-detail-header-content">
              {physio.photo_url ? (
                <img
                  src={physio.photo_url}
                  alt={physio.name}
                  className="physio-detail-avatar"
                />
              ) : (
                <div className="physio-detail-avatar physio-detail-avatar--placeholder">
                  {physio.name?.charAt(0)?.toUpperCase() || 'F'}
                </div>
              )}

              <div className="physio-detail-header-text">
                <h1 className="physio-detail-name">{physio.name}</h1>
                
                {isVerified && (
                  <div className="physio-detail-badge">
                    <ShieldCheck size={16} strokeWidth={2} />
                    <span>Fisioterapis Terverifikasi</span>
                  </div>
                )}

                <div className="physio-detail-meta">
                  {physio.specialty && (
                    <div className="physio-detail-meta-item">
                      <Briefcase size={16} strokeWidth={2} />
                      <span>{physio.specialty}</span>
                    </div>
                  )}
                  {physio.experience_years && (
                    <div className="physio-detail-meta-item">
                      <Clock size={16} strokeWidth={2} />
                      <span>{physio.experience_years} tahun pengalaman</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="physio-detail-body">
            {/* Bio Section */}
            {(physio.bio_short || physio.bio) && (
              <div className="physio-detail-section">
                <h2 className="physio-detail-section-title">Tentang</h2>
                <p className="physio-detail-section-text">
                  {physio.bio_short || physio.bio || 'Belum ada deskripsi.'}
                </p>
              </div>
            )}

            {/* Informasi Klinik */}
            <div className="physio-detail-section">
              <h2 className="physio-detail-section-title">Informasi Klinik</h2>
              <div className="physio-detail-info-grid">
                <div className="physio-detail-info-item">
                  <Building2 size={20} strokeWidth={1.5} />
                  <div className="physio-detail-info-content">
                    <span className="physio-detail-info-label">Klinik</span>
                    <span className="physio-detail-info-value">
                      {physio.clinic_name || 'Praktik fisioterapi'}
                    </span>
                  </div>
                </div>

                {/* ✅ LOKASI - DENGAN TOMBOL GOOGLE MAPS */}
                <div className="physio-detail-info-item physio-detail-info-item--location">
                  <MapPin size={20} strokeWidth={1.5} />
                  <div className="physio-detail-info-content">
                    <span className="physio-detail-info-label">Lokasi</span>
                    <span className="physio-detail-info-value">
                      {physio.city || 'Tidak tersedia'}
                    </span>
                    {physio.latitude && physio.longitude && (
                      <button
                        onClick={() => openInGoogleMaps(
                          physio.latitude,
                          physio.longitude,
                          physio.clinic_name
                        )}
                        className="physio-detail-map-link"
                      >
                        <MapPin size={14} strokeWidth={2} />
                        Buka di Google Maps
                        <ExternalLink size={12} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>

                {physio.phone && (
                  <div className="physio-detail-info-item">
                    <Phone size={20} strokeWidth={1.5} />
                    <div className="physio-detail-info-content">
                      <span className="physio-detail-info-label">Telepon</span>
                      <span className="physio-detail-info-value">
                        {physio.phone}
                      </span>
                    </div>
                  </div>
                )}

                {physio.email && (
                  <div className="physio-detail-info-item">
                    <Mail size={20} strokeWidth={1.5} />
                    <div className="physio-detail-info-content">
                      <span className="physio-detail-info-label">Email</span>
                      <span className="physio-detail-info-value">
                        {physio.email}
                      </span>
                    </div>
                  </div>
                )}

                {physio.consultation_fee && (
                  <div className="physio-detail-info-item">
                    <DollarSign size={20} strokeWidth={1.5} />
                    <div className="physio-detail-info-content">
                      <span className="physio-detail-info-label">
                        Tarif Konsultasi
                      </span>
                      <span className="physio-detail-info-value physio-detail-info-value--price">
                        Rp {Number(physio.consultation_fee).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Booking */}
            <div className="physio-detail-cta">
              <button
                disabled
                className="physio-detail-cta-btn physio-detail-cta-btn--disabled"
              >
                <Calendar size={18} strokeWidth={2} />
                <span>Booking Konsultasi (Segera Hadir)</span>
              </button>
              <p className="physio-detail-cta-note">
                Fitur booking akan segera tersedia
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="physio-detail-footer">
        <div className="physio-detail-footer__inner">
          <div className="physio-detail-footer__brand">
            <div className="physio-detail-footer__logo">
              <img 
              src="/logo-posturely.svg" 
              alt="Posturely Logo" 
              className="brand-logo-img" 
            />
            </div>
            <p>
              Platform screening postur anak berbasis AI yang membantu orang tua
              berkolaborasi dengan fisioterapis untuk tumbuh kembang yang lebih sehat.
            </p>
          </div>

          <div className="physio-detail-footer__cols">
            <div className="physio-detail-footer__col">
              <h4>Tentang</h4>
              <button onClick={() => navigate('/')}>Tentang Posturely</button>
              <button onClick={() => navigate('/')}>Cara Kerja</button>
            </div>
            <div className="physio-detail-footer__col">
              <h4>Layanan</h4>
              <button onClick={() => navigate('/')}>Screening Postur Anak</button>
              <button onClick={() => navigate('/education')}>Edukasi Postur</button>
              <button onClick={() => navigate('/physiotherapists')}>
                Konsultasi Fisioterapis
              </button>
            </div>
            <div className="physio-detail-footer__col">
              <h4>Kontak</h4>
              <button onClick={() => navigate('/login')}>Masuk ke aplikasi</button>
              <button onClick={() => navigate('/register/physio')}>
                Bergabung sebagai Fisioterapis
              </button>
            </div>
          </div>
        </div>

        <div className="physio-detail-footer__bottom">
          <p>© 2026 Posturely. Semua hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
