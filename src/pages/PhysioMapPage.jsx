import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Phone, Search, Filter, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import physioService from "../services/physioService";
import "../styles/PhysioMapPage.css";

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function PhysioMapPage() {
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
    const load = async () => {
      try {
        const list = await physioService.getAll();
        // Filter hanya yang terverifikasi dan punya koordinat
        const physiosWithCoords = list.filter(
          (p) => p.latitude && p.longitude && p.is_verified === true && p.is_active === true
        );
        setAllPhysios(physiosWithCoords);
        setFilteredPhysios(physiosWithCoords);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Apply filters setiap ada perubahan
  useEffect(() => {
    let result = [...allPhysios];

    // Filter by name
    if (searchName.trim()) {
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by city
    if (filterCity) {
      result = result.filter((p) =>
        p.city?.toLowerCase().includes(filterCity.toLowerCase())
      );
    }

    // Filter by specialty
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

  if (loading) {
    return (
      <div className="physio-map-page">
        <div className="physio-map-container">
          <p className="physio-map-loading">Memuat peta...</p>
        </div>
      </div>
    );
  }

  const center =
    filteredPhysios.length > 0
      ? [filteredPhysios[0].latitude, filteredPhysios[0].longitude]
      : allPhysios.length > 0
      ? [allPhysios[0].latitude, allPhysios[0].longitude]
      : [-6.2, 106.8];

  const activeFiltersCount = [searchName, filterCity, filterSpecialty].filter(
    Boolean
  ).length;

  return (
    <div className="physio-map-page">
      <div className="physio-map-container">
        <div className="physio-map-header">
          <button onClick={() => navigate(-1)} className="physio-map-back">
            <ChevronLeft size={18} strokeWidth={2} />
            <span>Kembali</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="physio-map-filter-toggle"
          >
            <Filter size={18} strokeWidth={2} />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="physio-map-filter-badge">{activeFiltersCount}</span>
            )}
          </button>
        </div>

        <div className="physio-map-title-section">
          <h1 className="physio-map-title">Peta Fisioterapis Terverifikasi</h1>
          <p className="physio-map-subtitle">
            Klik marker untuk lihat detail fisioterapis ({filteredPhysios.length} dari{" "}
            {allPhysios.length} tersedia)
          </p>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="physio-map-filters">
            <div className="physio-map-filters-header">
              <h3>Filter Pencarian</h3>
              <div className="physio-map-filters-actions">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="physio-map-filter-reset physio-map-filter-reset--mobile"
                  >
                    <X size={16} strokeWidth={2} />
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="physio-map-filters-close"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="physio-map-filters-body">
              {/* Search by name */}
              <div className="physio-map-filter-group">
                <label className="physio-map-filter-label">
                  <Search size={16} strokeWidth={2} />
                  Cari Nama Fisioterapis
                </label>
                <div className="physio-map-filter-input-wrapper">
                  <Search size={18} strokeWidth={2} className="physio-map-filter-icon" />
                  <input
                    type="text"
                    placeholder="Masukkan nama..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="physio-map-filter-input"
                  />
                </div>
              </div>

              {/* Filter by city */}
              <div className="physio-map-filter-group">
                <label className="physio-map-filter-label">
                  <MapPin size={16} strokeWidth={2} />
                  Kota
                </label>
                <div className="physio-map-filter-select-wrapper">
                  <MapPin size={18} strokeWidth={2} className="physio-map-filter-icon" />
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="physio-map-filter-select"
                  >
                    <option value="">Semua Kota</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter by specialty */}
              <div className="physio-map-filter-group">
                <label className="physio-map-filter-label">
                  <Filter size={16} strokeWidth={2} />
                  Spesialisasi
                </label>
                <div className="physio-map-filter-select-wrapper">
                  <Filter size={18} strokeWidth={2} className="physio-map-filter-icon" />
                  <select
                    value={filterSpecialty}
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    className="physio-map-filter-select"
                  >
                    <option value="">Semua Spesialisasi</option>
                    {specialties.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reset button - Desktop only */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="physio-map-filter-reset physio-map-filter-reset--desktop"
                >
                  <X size={16} strokeWidth={2} />
                  Reset Filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="physio-map-wrapper">
          {filteredPhysios.length === 0 ? (
            <div className="physio-map-empty">
              <p>Tidak ada fisioterapis yang sesuai dengan filter Anda.</p>
              <button onClick={handleResetFilters} className="physio-map-empty-btn">
                Reset Filter
              </button>
            </div>
          ) : (
            <MapContainer
              center={center}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              {filteredPhysios.map((p) => (
                <Marker key={p.id} position={[p.latitude, p.longitude]}>
                  <Popup>
                    <div className="physio-map-popup">
                      <h3 className="physio-map-popup-name">{p.name}</h3>

                      <span className="physio-map-popup-badge">
                        ✓ Terverifikasi
                      </span>

                      <div className="physio-map-popup-info">
                        <MapPin size={14} strokeWidth={1.5} />
                        <span>{p.clinic_name || "Praktik fisioterapi"}</span>
                      </div>

                      <div className="physio-map-popup-info">
                        <MapPin size={14} strokeWidth={1.5} />
                        <span>{p.city || "-"}</span>
                      </div>

                      {p.specialty && (
                        <div className="physio-map-popup-info">
                          <span className="physio-map-popup-label">
                            Spesialisasi:
                          </span>
                          <span>{p.specialty}</span>
                        </div>
                      )}

                      {p.phone && (
                        <div className="physio-map-popup-info">
                          <Phone size={14} strokeWidth={1.5} />
                          <span>{p.phone}</span>
                        </div>
                      )}

                      {p.consultation_fee && (
                        <div className="physio-map-popup-info">
                          <span className="physio-map-popup-label">
                            Tarif Konsultasi:
                          </span>
                          <span>
                            Rp {Number(p.consultation_fee).toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => navigate(`/physiotherapists/${p.id}`)}
                        className="physio-map-popup-btn"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="physio-map-footer">
        <div className="physio-map-footer__inner">
          <div className="physio-map-footer__brand">
            <div className="physio-map-footer__logo">
              <span className="physio-map-footer__logo-dot" />
              <span>Posturely</span>
            </div>
            <p>
              Platform screening postur anak berbasis AI yang membantu orang tua
              berkolaborasi dengan fisioterapis untuk tumbuh kembang yang lebih sehat.
            </p>
          </div>

          <div className="physio-map-footer__cols">
            <div className="physio-map-footer__col">
              <h4>Tentang</h4>
              <button onClick={() => scrollToSection("about")}>
                Tentang Posturely
              </button>
              <button onClick={() => scrollToSection("how-it-works")}>
                Cara Kerja
              </button>
            </div>
            <div className="physio-map-footer__col">
              <h4>Layanan</h4>
              <button onClick={() => scrollToSection("why-posture")}>
                Screening Postur Anak
              </button>
              <button onClick={() => scrollToSection("education")}>
                Edukasi Postur
              </button>
              <button onClick={() => scrollToSection("for-whom")}>
                Konsultasi Fisioterapis
              </button>
            </div>
            <div className="physio-map-footer__col">
              <h4>Kontak</h4>
              <button onClick={() => navigate("/login")}>
                Masuk ke aplikasi
              </button>
              <button onClick={() => navigate("/register/physio")}>
                Bergabung sebagai Fisioterapis
              </button>
            </div>
          </div>
        </div>

        <div className="physio-map-footer__bottom">
          <p>© 2026 Posturely. Semua hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}

export default PhysioMapPage;
