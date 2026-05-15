import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, Phone, DollarSign, Search, Filter, 
  ChevronLeft, Map, Building2, Stethoscope, CheckCircle2 
} from "lucide-react";
import api from "../../utils/axios";

export default function PhysiotherapistListPage() {
  const navigate = useNavigate();
  const [physios, setPhysios] = useState([]);
  const [filteredPhysios, setFilteredPhysios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSpecialty, setSearchSpecialty] = useState("");

  useEffect(() => {
    loadPhysios();
  }, []);

  useEffect(() => {
    filterPhysios();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, searchSpecialty, physios]);

  const loadPhysios = async () => {
    setLoading(true);
    try {
      const res = await api.get("/physiotherapists");
      // Hanya tampilkan yang aktif
      const activePhysios = (res.data.data || []).filter(p => p.is_active !== false);
      setPhysios(activePhysios);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterPhysios = () => {
    let filtered = [...physios];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name?.toLowerCase().includes(q) || 
        p.city?.toLowerCase().includes(q) ||
        p.clinic_name?.toLowerCase().includes(q)
      );
    }

    if (searchSpecialty) {
      filtered = filtered.filter((p) =>
        p.specialty?.toLowerCase().includes(searchSpecialty.toLowerCase())
      );
    }

    setFilteredPhysios(filtered);
  };

  const formatFee = (fee) => {
    if (!fee) return "Hubungi untuk info";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(fee);
  };

  const getImageUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith("http")) return photoPath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
    return `${baseUrl}/storage/${photoPath}`;
  };

  // Mengambil daftar spesialisasi unik untuk dropdown
  const specialties = [...new Set(physios.map(p => p.specialty).filter(Boolean))].sort();

  if (loading) return <ListSkeleton navigate={navigate} />;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Header Minimalis */}
      <HeaderMinimal navigate={navigate} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Direktori Fisioterapis</h1>
            <p className="text-slate-500 mt-1.5 text-sm md:text-base max-w-2xl">
              Temukan fisioterapis terverifikasi untuk membantu konsultasi dan screening postur anak Anda.
            </p>
          </div>
          <button 
            onClick={() => navigate('/physiotherapists/map')} 
            className="w-full md:w-auto bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <Map size={18} /> Lihat di Peta
          </button>
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, kota, atau klinik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <Stethoscope size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={searchSpecialty}
              onChange={(e) => setSearchSpecialty(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="">Semua Spesialisasi</option>
              {specialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid List */}
        {filteredPhysios.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Search size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Tidak Ditemukan</h3>
            <p className="text-slate-500 text-sm">Tidak ada fisioterapis yang sesuai dengan pencarian Anda.</p>
            <button 
              onClick={() => { setSearchQuery(""); setSearchSpecialty(""); }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors active:scale-95"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhysios.map((physio) => (
              <div key={physio.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:border-blue-300 hover:shadow-md transition-all group">
                
                {/* Header Card (Avatar & Name) */}
                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-2xl font-bold text-slate-400">
                    {physio.photo_url || physio.photo ? (
                      <img src={getImageUrl(physio.photo_url || physio.photo)} alt={physio.name} className="w-full h-full object-cover" />
                    ) : (
                      physio.name?.charAt(0) || "F"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-blue-700 transition-colors">{physio.name}</h3>
                    {physio.is_verified && (
                      <div className="flex items-center gap-1 text-emerald-600 mt-0.5 mb-1.5">
                        <CheckCircle2 size={12} strokeWidth={2.5}/>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Terverifikasi</span>
                      </div>
                    )}
                    {physio.specialty && (
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold uppercase tracking-wider truncate max-w-full">
                        {physio.specialty}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info List */}
                <div className="flex flex-col gap-2.5 mb-5 flex-1">
                  <div className="flex items-start gap-2.5">
                    <Building2 size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 leading-snug line-clamp-2">
                      {physio.clinic_name || "Praktik Mandiri"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin size={16} className="text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-600 truncate">{physio.city || "Kota tidak tersedia"}</span>
                  </div>
                  {physio.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone size={16} className="text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-600 truncate">{physio.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 mt-1 pt-2.5 border-t border-slate-100">
                    <DollarSign size={16} className="text-emerald-500 shrink-0" />
                    <span className="text-sm font-extrabold text-slate-800 truncate">
                      {formatFee(physio.consultation_fee)}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => navigate(`/physiotherapists/${physio.id}`)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] shadow-sm mt-auto"
                >
                  Lihat Detail Profil
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Baru */}
      <FooterBaru navigate={navigate} />

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
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">Kembali</span>
          </button>

          <div className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate("/")}>
            <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">Posturely</span>
          </div>

          <div className="w-[70px]"></div>
        </div>
      </div>
    </header>
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
            <button onClick={() => navigate("/physiotherapists")} className="text-left text-white font-bold transition-colors">Direktori Fisioterapis</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 text-center text-sm font-medium text-slate-500">
        <p>© 2026 Posturely. Semua hak cipta dilindungi.</p>
      </div>
    </footer>
  );
}

function ListSkeleton({ navigate }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans animate-pulse">
      <HeaderMinimal navigate={navigate} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-3"><div className="h-8 w-48 bg-slate-200 rounded"></div><div className="h-4 w-72 bg-slate-200 rounded"></div></div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-16 bg-white border border-slate-200 rounded-2xl mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-[280px]"></div>
          ))}
        </div>
      </main>
    </div>
  );
}