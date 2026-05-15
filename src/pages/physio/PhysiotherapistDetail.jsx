import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Building2, Briefcase,
  Clock, ShieldCheck, MessageCircle, DollarSign, ExternalLink, ChevronLeft, User
} from 'lucide-react';
import physioService from '../../services/physioService';
import ConsultationModal from '../../components/ConsultationModal.jsx';

export default function PhysiotherapistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [physio, setPhysio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consultModal, setConsultModal] = useState(false);

  // Cek apakah user sudah login
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (!id) return;
    physioService.getById(id)
      .then((data) => setPhysio(data))
      .catch((err) => console.error('Error fetching physio:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const openInGoogleMaps = (latitude, longitude, clinicName) => {
    if (!latitude || !longitude) { alert("Koordinat klinik tidak tersedia"); return; }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) { alert("Koordinat klinik tidak valid"); return; }
    const label = encodeURIComponent(clinicName || "Klinik Fisioterapi");
    window.open(`http://googleusercontent.com/maps.google.com/maps?q=${lat},${lng}&label=${label}`, '_blank', 'noopener,noreferrer');
  };

  const handleSelectFree = () => {
    navigate('/children'); // arahkan ke pilih anak → screening → rujukan
  };

  if (loading) return <DetailSkeleton />;

  if (!physio) return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <HeaderMinimal navigate={navigate} />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Fisioterapis Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-6 text-sm">Profil fisioterapis yang Anda cari tidak tersedia atau sudah dinonaktifkan.</p>
          <button onClick={() => navigate('/physiotherapists')} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
            Kembali ke Direktori
          </button>
        </div>
      </div>
    </div>
  );

  const isVerified = physio.is_verified === true && physio.is_active === true;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Header Tanpa Sidebar Dashboard */}
      <HeaderMinimal navigate={navigate} />

      {/* Main Content - Layout Memanjang ke Kanan (Side-by-Side) */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        <div className="flex items-center gap-3 mb-6">
           <button onClick={() => navigate(-1)} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all active:scale-95">
             <ChevronLeft size={18} />
           </button>
           <h1 className="text-2xl font-bold text-slate-900">Detail Fisioterapis</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* === KOLOM KIRI: FOTO, NAMA, & TENTANG === */}
          <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-blue-50 to-white"></div>
              
              <div className="relative w-32 h-32 mx-auto bg-white rounded-full p-1.5 shadow-sm border border-slate-200 mb-4 z-10">
                <div className="w-full h-full bg-slate-100 text-slate-500 rounded-full flex items-center justify-center overflow-hidden border border-slate-100 font-bold text-4xl">
                  {physio.photo_url ? (
                    <img src={physio.photo_url} alt={physio.name} className="w-full h-full object-cover" />
                  ) : (
                    physio.name?.charAt(0)?.toUpperCase() || 'F'
                  )}
                </div>
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 mb-2 relative z-10">{physio.name}</h1>
              
              <div className="flex flex-col items-center gap-2 mb-6 relative z-10">
                {isVerified && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
                    <ShieldCheck size={14} strokeWidth={2.5} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Terverifikasi</span>
                  </div>
                )}
                {physio.specialty && (
                  <div className="text-slate-600 text-sm font-medium">
                    {physio.specialty}
                  </div>
                )}
                {physio.experience_years && (
                  <div className="text-slate-500 text-sm">
                    {physio.experience_years} thn pengalaman
                  </div>
                )}
              </div>

              <button
                onClick={() => isLoggedIn ? setConsultModal(true) : navigate('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle size={20} />
                <span>Konsultasi Sekarang</span>
              </button>
            </div>

            {(physio.bio_short || physio.bio) && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Tentang</h2>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {physio.bio_short || physio.bio}
                </p>
              </div>
            )}
          </div>

          {/* === KOLOM KANAN: INFORMASI KLINIK & KONTAK === */}
          <div className="flex-1 w-full flex flex-col gap-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                Informasi Praktik & Layanan
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={Building2} label="Klinik / Tempat Praktik" value={physio.clinic_name || 'Praktik Mandiri'} />
                
                <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin size={20} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lokasi Praktik</p>
                    <p className="text-sm font-semibold text-slate-800 mb-2">{physio.city || 'Tidak tersedia'}</p>
                    {physio.latitude && physio.longitude && (
                      <button 
                        onClick={() => openInGoogleMaps(physio.latitude, physio.longitude, physio.clinic_name)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded border border-blue-100 active:scale-95 transition-all"
                      >
                        Buka Peta <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {physio.phone && <InfoCard icon={Phone} label="Telepon" value={physio.phone} />}
                {physio.email && <InfoCard icon={Mail} label="Email" value={physio.email} />}
                
                {physio.consultation_fee && (
                  <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <DollarSign size={20} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tarif Konsultasi</p>
                      <p className="text-lg font-extrabold text-slate-900">
                        Rp {Number(physio.consultation_fee).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Butuh bantuan segera?</h3>
                <p className="text-sm text-blue-700">Konsultasikan kondisi postur anak Anda melalui fitur chat atau rujukan gratis.</p>
              </div>
              <button
                onClick={() => isLoggedIn ? setConsultModal(true) : navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all active:scale-[0.98] shadow-sm whitespace-nowrap"
              >
                Mulai Konsultasi
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Footer Baru */}
      <FooterBaru navigate={navigate} />

      {/* Consultation Modal */}
      {consultModal && (
        <ConsultationModal
          physio={physio}
          onClose={() => setConsultModal(false)}
          onSelectFree={handleSelectFree}
        />
      )}
    </div>
  );
}

// ==========================================
// Komponen Pendukung
// ==========================================

function HeaderMinimal({ navigate }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate("/")}>
            <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">Posturely</span>
          </div>
          
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/physiotherapists')} className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">Direktori Fisio</button>
             <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
               <User size={16} />
             </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// eslint-disable-next-line no-unused-vars
function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-100">
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function FooterBaru({ navigate }) {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 py-16 px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        <div className="md:col-span-6 lg:col-span-6">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo-favicon-posturely.svg" alt="Posturely Logo" className="w-9 h-9 object-contain" />
            <span className="text-2xl font-bold text-white tracking-tight">Posturely</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Platform screening postur anak berbasis AI yang membantu orang tua berkolaborasi dengan fisioterapis untuk tumbuh kembang yang lebih sehat dan optimal.
          </p>
        </div>
        <div className="md:col-span-3 lg:col-span-3">
          <h4 className="text-white font-bold tracking-wider uppercase text-sm mb-6">Tentang</h4>
          <div className="flex flex-col space-y-3 text-sm font-medium">
            <button onClick={() => navigate("/")} className="text-left text-slate-400 hover:text-white transition-colors">Tentang Posturely</button>
            <button onClick={() => navigate("/")} className="text-left text-slate-400 hover:text-white transition-colors">Cara Kerja</button>
          </div>
        </div>
        <div className="md:col-span-3 lg:col-span-3">
          <h4 className="text-white font-bold tracking-wider uppercase text-sm mb-6">Layanan</h4>
          <div className="flex flex-col space-y-3 text-sm font-medium">
            <button onClick={() => navigate("/")} className="text-left text-slate-400 hover:text-white transition-colors">Screening Postur Anak</button>
            <button onClick={() => navigate("/education")} className="text-left text-slate-400 hover:text-white transition-colors">Edukasi Postur</button>
            <button onClick={() => navigate("/physiotherapists")} className="text-left text-slate-400 hover:text-white transition-colors">Direktori Fisioterapis</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 text-center text-sm font-medium text-slate-500">
        <p>© 2026 Posturely. Semua hak cipta dilindungi.</p>
      </div>
    </footer>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 animate-pulse font-sans">
      <div className="h-16 lg:h-20 bg-white border-b border-slate-200"></div>
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="h-8 w-48 bg-slate-200 rounded mb-6"></div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[400px] bg-white p-8 rounded-2xl border border-slate-200 h-[400px]"></div>
          <div className="flex-1 bg-white p-8 rounded-2xl border border-slate-200 h-[400px]"></div>
        </div>
      </div>
    </div>
  );
}