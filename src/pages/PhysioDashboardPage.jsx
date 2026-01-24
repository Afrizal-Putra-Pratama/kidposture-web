import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

function PhysioDashboardPage() {
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadScreenings();
  }, []);

  const loadScreenings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/physio/screenings");
      console.log("✅ Physio screenings:", response.data);

      if (response.data.success && Array.isArray(response.data.data)) {
        setScreenings(response.data.data);
      } else {
        setScreenings([]);
      }
    } catch (err) {
      console.error("❌ Error loading physio screenings:", err);
      setError("Gagal memuat data screening untuk fisioterapis.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ padding: 16 }}>Memuat dashboard fisioterapis...</p>;
  if (error) return <p style={{ padding: 16, color: "red" }}>{error}</p>;

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "2rem 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1rem" }}>
        <header style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ margin: 0, fontSize: "2rem", color: "#111827" }}>
            🧑‍⚕️ Dashboard Fisioterapis
          </h1>
          <p style={{ marginTop: 8, color: "#6b7280" }}>
            Daftar screening anak yang perlu perhatian dan siap dianalisis.
          </p>
        </header>

        {/* Stats sederhana */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <StatCard
            label="Total Screening Perlu Perhatian"
            value={screenings.length}
            icon="⚠️"
            color="#f97316"
          />
        </div>

        {/* List screening */}
        {screenings.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: "2rem",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📭</div>
            <h3 style={{ margin: 0, color: "#111827", marginBottom: "0.5rem" }}>
              Belum ada screening yang perlu perhatian
            </h3>
            <p style={{ margin: 0, color: "#6b7280" }}>
              Screening baru yang butuh analisis akan muncul di sini.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead style={{ background: "#f9fafb" }}>
                <tr>
                  <Th> Anak </Th>
                  <Th> Orang Tua </Th>
                  <Th> Skor </Th>
                  <Th> Kategori </Th>
                  <Th> Tanggal </Th>
                  <Th> Aksi </Th>
                </tr>
              </thead>
              <tbody>
                {screenings.map((s) => (
                  <tr key={s.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <Td>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{s.child.name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {s.child.age_years != null ? `${s.child.age_years} tahun` : "-"}
                      </div>
                    </Td>
                    <Td>
                      <div style={{ fontSize: 13, color: "#374151" }}>{s.parent.name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{s.parent.email}</div>
                    </Td>
                    <Td style={{ fontWeight: 600, color: "#111827" }}>{s.score ?? "-"}</Td>
                    <Td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 10px",
                          borderRadius: 999,
                          background: "#fee2e2",
                          color: "#b91c1c",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {s.category || "Perlu perhatian"}
                      </span>
                    </Td>
                    <Td>
                      {new Date(s.created_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => navigate(`/physio/screenings/${s.id}`)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #3b82f6",
                          background: "white",
                          color: "#3b82f6",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
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
    <div
      style={{
        background: "white",
        borderRadius: 12,
        padding: "1.25rem 1.5rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{value}</div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            backgroundColor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            color: "white",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "0.75rem 1rem",
        fontSize: 12,
        fontWeight: 600,
        color: "#6b7280",
        textTransform: "uppercase",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td
      style={{
        padding: "0.75rem 1rem",
        verticalAlign: "top",
      }}
    >
      {children}
    </td>
  );
}

export default PhysioDashboardPage;
