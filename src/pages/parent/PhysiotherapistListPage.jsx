import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone, DollarSign, Clock, Search, Filter } from "lucide-react";
import api from "../../utils/axios";

function PhysiotherapistListPage() {
  const navigate = useNavigate();
  const [physios, setPhysios] = useState([]);
  const [filteredPhysios, setFilteredPhysios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [searchSpecialty, setSearchSpecialty] = useState("");

  useEffect(() => {
    loadPhysios();
  }, []);

  useEffect(() => {
    filterPhysios();
  }, [searchCity, searchSpecialty, physios]);

  const loadPhysios = async () => {
    setLoading(true);
    try {
      const res = await api.get("/physiotherapists");
      setPhysios(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterPhysios = () => {
    let filtered = [...physios];

    if (searchCity) {
      filtered = filtered.filter((p) =>
        p.city?.toLowerCase().includes(searchCity.toLowerCase())
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

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <p style={styles.loadingText}>Memuat daftar fisioterapis...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Daftar Fisioterapis</h1>
          <p style={styles.subtitle}>
            Pilih fisioterapis untuk konsultasi postur anak Anda
          </p>
        </div>

        <div style={styles.filterSection}>
          <div style={styles.searchGroup}>
            <Search size={18} strokeWidth={1.5} color="#6b7280" />
            <input
              type="text"
              placeholder="Cari berdasarkan kota..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.searchGroup}>
            <Filter size={18} strokeWidth={1.5} color="#6b7280" />
            <input
              type="text"
              placeholder="Filter spesialisasi..."
              value={searchSpecialty}
              onChange={(e) => setSearchSpecialty(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {filteredPhysios.length === 0 ? (
          <p style={styles.emptyText}>
            Tidak ada fisioterapis yang sesuai filter
          </p>
        ) : (
          <div style={styles.grid}>
            {filteredPhysios.map((physio) => (
              <div key={physio.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  {physio.photo_url ? (
  <img
    src={physio.photo_url}
    alt={physio.name}
    style={styles.avatar}
  />
) : (
                    <div style={styles.avatarPlaceholder}>
                      {physio.name?.charAt(0) || "F"}
                    </div>
                  )}
                  <div style={styles.cardInfo}>
                    <h3 style={styles.cardName}>{physio.name}</h3>
                    <p style={styles.cardClinic}>{physio.clinic_name}</p>
                  </div>
                </div>

                {physio.specialty && (
                  <div style={styles.specialtyBadge}>{physio.specialty}</div>
                )}

                {physio.bio && (
                  <p style={styles.bio}>
                    {physio.bio.length > 120
                      ? physio.bio.substring(0, 120) + "..."
                      : physio.bio}
                  </p>
                )}

                <div style={styles.infoRow}>
                  <MapPin size={16} strokeWidth={1.5} color="#6b7280" />
                  <span style={styles.infoText}>
                    {physio.city || "Kota tidak tersedia"}
                  </span>
                </div>

                {physio.phone && (
                  <div style={styles.infoRow}>
                    <Phone size={16} strokeWidth={1.5} color="#6b7280" />
                    <span style={styles.infoText}>{physio.phone}</span>
                  </div>
                )}

                <div style={styles.infoRow}>
                  <DollarSign size={16} strokeWidth={1.5} color="#6b7280" />
                  <span style={styles.infoText}>
                    {formatFee(physio.consultation_fee)}
                  </span>
                </div>

                {physio.latitude && physio.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${physio.latitude},${physio.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.mapLink}
                  >
                    <MapPin size={16} strokeWidth={1.5} />
                    Lihat di Maps
                  </a>
                )}

                <button
                  onClick={() => navigate(`/physiotherapists/${physio.id}`)}
                  style={styles.detailButton}
                >
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fafafa",
    padding: "2rem 1rem",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  header: {
    marginBottom: "2rem",
  },
  title: {
    margin: 0,
    fontSize: "1.75rem",
    fontWeight: 600,
    color: "#111827",
  },
  subtitle: {
    margin: "0.5rem 0 0",
    color: "#6b7280",
    fontSize: "0.95rem",
  },
  filterSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "2rem",
  },
  searchGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.625rem 1rem",
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "0.9rem",
    color: "#111827",
  },
  loadingText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "1rem",
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "1rem",
    marginTop: "2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "all 0.2s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 8,
    objectFit: "cover",
    border: "1px solid #e5e7eb",
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#6b7280",
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    margin: 0,
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#111827",
  },
  cardClinic: {
    margin: "0.25rem 0 0",
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  specialtyBadge: {
    display: "inline-block",
    padding: "0.375rem 0.75rem",
    background: "#dbeafe",
    color: "#1e40af",
    fontSize: "0.8rem",
    fontWeight: 500,
    borderRadius: 6,
    marginBottom: "0.75rem",
  },
  bio: {
    margin: "0 0 1rem",
    fontSize: "0.875rem",
    color: "#4b5563",
    lineHeight: 1.5,
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  infoText: {
    fontSize: "0.875rem",
    color: "#4b5563",
  },
  mapLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "0.75rem",
    fontSize: "0.875rem",
    color: "#3b82f6",
    textDecoration: "none",
    transition: "all 0.2s",
  },
  detailButton: {
    width: "100%",
    padding: "0.625rem",
    marginTop: "1rem",
    background: "white",
    border: "1px solid #3b82f6",
    borderRadius: 6,
    color: "#3b82f6",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

export default PhysiotherapistListPage;
