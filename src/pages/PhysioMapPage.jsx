import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, MapPin, Phone, Search, Filter, X, Stethoscope, CheckCircle2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import physioService from "../services/physioService";

// Fix Leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function PhysioMapPage() {
  const navigate = useNavigate();
  const [allPhysios, setAllPhysios] = useState([]);
  const [filteredPhysios, setFilteredPhysios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const list = await physioService.getAll();
        // Filter hanya yang terverifikasi dan punya koordinat
        const physiosWithCoords = list.filter(
          (p) => p.latitude && p.longitude && p.is_verified === true && p.is_active === true
        );
        setAllPhysios(physiosWithCoords);
        setFilteredPhysios(physiosWithCoords);
      } catch (err) {
        console.error("Gagal memuat data fisioterapis", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Apply filters setiap ada perubahan
  useEffect(() => {
    let result = [...allPhysios];

    if (searchName.trim()) {
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    if (filterCity) {
      result = result.filter((p) =>
        p.city?.toLowerCase().includes(filterCity.toLowerCase())
      );
    }
    if (filterSpecialty) {
      result = result.filter((p) =>
        p.specialty?.toLowerCase().includes(filterSpecialty.toLowerCase())
      );
    }

    setFilteredPhysios(result);
  }, [searchName, filterCity, filterSpecialty, allPhysios]);

  const handleResetFilters = () => {
    setSearchName("");
    setFilterCity("");
    setFilterSpecialty("");
  };

  const scrollToSection = (id) => {
    navigate("/");
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Extract unique values untuk dropdown
  const cities = [...new Set(allPhysios.map((p) => p.city).filter(Boolean))].sort();
  const specialties = [...new Set(allPhysios.map((p) => p.specialty).filter(Boolean))].sort();

  const center =
    filteredPhysios.length > 0
      ? [filteredPhysios[0].latitude, filteredPhysios[0].longitude]
      : allPhysios.length > 0
      ? [allPhysios[0].latitude, allPhysios[0].longitude]
      : [-6.2, 106.8]; // Default Jakarta

  const activeFiltersCount = [searchName, filterCity, filterSpecialty].filter(Boolean).length;

  if (loading) return <MapSkeleton />;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* 1. Header & Title Section */}
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

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 border ${showFilters || activeFiltersCount > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              <Filter size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Filter</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-[10px] rounded-full ml-1">{activeFiltersCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 relative">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Peta Fisioterapis</h1>
            <p className="text-slate-500 mt-1.5 text-sm md:text-base">Temukan lokasi praktik fisioterapis terverifikasi di sekitar Anda ({filteredPhysios.length} tersedia).</p>
          </div>
        </div>

        {/* Filter Panel (Slide down animation) */}
        {showFilters && (
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm animate-in slide-in-from-top-4 fade-in duration-300 relative z-30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Filter Pencarian</h3>
              <div className="flex items-center gap-3">
                {activeFiltersCount > 0 && (
                  <button onClick={handleResetFilters} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">Reset</button>
                )}
                <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"><X size={18} strokeWidth={2.5}/></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Fisioterapis</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Cari nama..." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all" />
                </div>
              </div>
              
              {/* City */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kota</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none">
                    <option value="">Semua Kota</option>
                    {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
              </div>

              {/* Specialty */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Spesialisasi</label>
                <div className="relative">
                  <Stethoscope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select value={filterSpecialty} onChange={(e) => setFilterSpecialty(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none">
                    <option value="">Semua Spesialisasi</option>
                    {specialties.map((spec) => <option key={spec} value={spec}>{spec}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="flex-1 w-full bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden min-h-[500px] shadow-sm relative z-0">
          {filteredPhysios.length === 0 ? (
            <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                <MapPin size={28} strokeWidth={1.5} />
              </div>
              <p className="font-bold text-slate-800 text-lg mb-1">Tidak Ada Hasil</p>
              <p className="text-slate-500 text-sm mb-6 max-w-sm">Coba sesuaikan filter atau kata kunci pencarian Anda untuk melihat lebih banyak lokasi.</p>
              <button onClick={handleResetFilters} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm">Reset Filter</button>
            </div>
          ) : (
            <MapContainer 
              center={center} 
              zoom={11} 
              className="absolute inset-0 w-full h-full z-0" 
              style={{ minHeight: "500px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredPhysios.map((p) => (
                <Marker key={p.id} position={[p.latitude, p.longitude]}>
                  <Popup className="posturely-custom-popup">
                    <div className="p-1 min-w-[200px]">
                      <h3 className="font-bold text-base text-slate-900 leading-tight mb-1">{p.name}</h3>
                      <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 w-max px-2 py-0.5 rounded border border-emerald-100 mb-3">
                        <CheckCircle2 size={12} strokeWidth={2.5}/>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Terverifikasi</span>
                      </div>
                      
                      <div className="space-y-2.5 text-sm text-slate-600 mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="mt-0.5 text-slate-400 shrink-0" />
                          <span className="leading-snug">{p.clinic_name || "Praktik Fisioterapi"}<br/><span className="text-xs text-slate-400">{p.city}</span></span>
                        </div>
                        {p.specialty && (
                          <div className="flex items-start gap-2">
                            <Stethoscope size={14} className="mt-0.5 text-slate-400 shrink-0" />
                            <span className="leading-snug text-xs">{p.specialty}</span>
                          </div>
                        )}
                        {p.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-slate-400 shrink-0" />
                            <span className="text-xs font-medium">{p.phone}</span>
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => navigate(`/physiotherapists/${p.id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        Lihat Profil Detail
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </main>

      {/* 3. Footer (Konsisten dengan Desain Baru) */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 py-16 px-6 lg:px-8 mt-auto z-10 relative">
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
              <button onClick={() => scrollToSection("about")} className="text-left text-slate-400 hover:text-white transition-colors">Tentang Posturely</button>
              <button onClick={() => scrollToSection("how-it-works")} className="text-left text-slate-400 hover:text-white transition-colors">Cara Kerja</button>
            </div>
          </div>

          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-white font-bold tracking-wider uppercase text-sm mb-6">Layanan</h4>
            <div className="flex flex-col space-y-3 text-sm font-medium">
              <button onClick={() => scrollToSection("why-posture")} className="text-left text-slate-400 hover:text-white transition-colors">Screening Postur Anak</button>
              <button onClick={() => scrollToSection("education")} className="text-left text-slate-400 hover:text-white transition-colors">Edukasi Postur</button>
              <button onClick={() => scrollToSection("for-whom")} className="text-left text-slate-400 hover:text-white transition-colors">Konsultasi Fisioterapis</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 text-center text-sm font-medium text-slate-500 flex justify-center items-center">
          <p>© 2026 Posturely. Semua hak cipta dilindungi.</p>
        </div>
      </footer>

      {/* Tambahan CSS Global khusus styling Popup Leaflet bawaan agar tidak bentrok dengan Tailwind */}
      <style>{`
        .posturely-custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .posturely-custom-popup .leaflet-popup-content {
          margin: 0;
          line-height: normal;
        }
        .posturely-custom-popup .leaflet-popup-tip {
          box-shadow: none;
        }
        .posturely-custom-popup a.leaflet-popup-close-button {
          color: #94a3b8;
          padding: 12px 12px 0 0;
        }
      `}</style>

    </div>
  );
}

// Skeleton Pemuatan Awal
function MapSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 animate-pulse font-sans">
      <div className="h-16 lg:h-20 bg-white border-b border-slate-200 shrink-0"></div>
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded-md w-64"></div>
          <div className="h-4 bg-slate-200 rounded w-96"></div>
        </div>
        <div className="flex-1 bg-slate-200 rounded-2xl min-h-[500px]"></div>
      </div>
    </div>
  );
}