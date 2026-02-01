// src/pages/PhysioDashboardPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Stethoscope, 
  Clock, 
  CheckCircle, 
  Settings,
  BookOpen,
  UserCog
} from "lucide-react";
import { fetchPhysioReferrals } from "../services/screeningService";
import "../styles/physioDashboard.css";

function PhysioDashboardPage() {
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("requested");
  const navigate = useNavigate();

  useEffect(() => {
    loadScreenings();
  }, []);

  const loadScreenings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPhysioReferrals();
      const list = data?.data ?? data;
      setScreenings(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error loading physio referrals:", err);
      setError("Gagal memuat data rujukan untuk fisioterapis.");
    } finally {
      setLoading(false);
    }
  };

  const onlyReferred = screenings.filter(
    (s) => s.referral_status && s.referral_status !== "none"
  );

  const filteredScreenings = onlyReferred.filter(
    (s) => s.referral_status === activeTab
  );

  const countByStatus = (status) =>
    onlyReferred.filter((s) => s.referral_status === status).length;

  if (loading) {
    return (
      <div className="physio-page physio-page--center">
        <div className="physio-loading">
          <div className="physio-spinner" />
          <p>Memuat dashboard fisioterapis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="physio-page physio-page--center">
        <div className="physio-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="physio-page">
      <div className="physio-container">
        {/* Header */}
        <header className="physio-header">
          <div className="physio-header-left">
            <div className="physio-header-text">
              <h1>
                <UserCog className="physio-header-icon" size={28} />
                Dashboard Fisioterapis
              </h1>
              <p>Screening anak yang dirujuk kepada Anda.</p>
            </div>
          </div>

          <div className="physio-header-actions">
            <button
              type="button"
              onClick={() => navigate("/physio/education")}
              className="physio-btn-cta"
            >
              <BookOpen size={18} />
              <span>Kelola Artikel</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/physio/profile")}
              className="physio-btn-outline"
            >
              <Settings size={18} />
              <span>Pengaturan</span>
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="physio-stats">
          <StatCard
            label="Menunggu Konfirmasi"
            value={countByStatus("requested")}
            icon={<Clock size={24} />}
            color="#f59e0b"
          />
          <StatCard
            label="Sedang Ditangani"
            value={countByStatus("accepted")}
            icon={<Stethoscope size={24} />}
            color="#3b82f6"
          />
          <StatCard
            label="Selesai"
            value={countByStatus("completed")}
            icon={<CheckCircle size={24} />}
            color="#10b981"
          />
        </div>

        {/* Tabs */}
        <div className="physio-tabs">
          {[
            { key: "requested", label: "Menunggu Konfirmasi" },
            { key: "accepted", label: "Sedang Ditangani" },
            { key: "completed", label: "Selesai" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`physio-tab ${
                activeTab === tab.key ? "physio-tab--active" : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List atau empty */}
        {filteredScreenings.length === 0 ? (
          <div className="physio-empty">
            <div className="physio-empty-icon">
              <Stethoscope size={48} strokeWidth={1.5} />
            </div>
            <h3>Belum ada screening di tab ini</h3>
            <p>Screening rujukan baru akan muncul di tab "Menunggu Konfirmasi".</p>
          </div>
        ) : (
          <div className="physio-table-wrapper">
            <table className="physio-table">
              <thead>
                <tr>
                  <Th>Anak</Th>
                  <Th>Orang Tua</Th>
                  <Th>Skor</Th>
                  <Th>Kategori</Th>
                  <Th>Tanggal</Th>
                  <Th>Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {filteredScreenings.map((s) => (
                  <tr key={s.id}>
                    <Td>
                      <div className="physio-child-name">{s.child?.name}</div>
                      <div className="physio-child-age">
                        {s.child?.age_years != null
                          ? `${s.child.age_years} tahun`
                          : "-"}
                      </div>
                    </Td>
                    <Td>
                      <div className="physio-parent-name">{s.parent?.name}</div>
                      <div className="physio-parent-email">{s.parent?.email}</div>
                    </Td>
                    <Td className="physio-score">{s.score ?? "-"}</Td>
                    <Td>
                      <span
                        className={`physio-badge physio-badge--${
                          s.category === "GOOD"
                            ? "good"
                            : s.category === "FAIR"
                            ? "fair"
                            : "poor"
                        }`}
                      >
                        {s.category || "Perlu perhatian"}
                      </span>
                    </Td>
                    <Td>
                      {new Date(s.created_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => navigate(`/physio/screenings/${s.id}`)}
                        className="physio-btn-link"
                      >
                        Lihat Detail
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="physio-stat-card">
      <div className="physio-stat-info">
        <div className="physio-stat-label">{label}</div>
        <div className="physio-stat-value">{value}</div>
      </div>
      <div className="physio-stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="physio-th">{children}</th>;
}

function Td({ children, className = "" }) {
  return <td className={`physio-td ${className}`}>{children}</td>;
}

export default PhysioDashboardPage;
