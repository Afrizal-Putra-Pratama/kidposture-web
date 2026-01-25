import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchChildScreenings } from "../services/screeningService.jsx";

function ChildScreeningsPage() {
  const { childId } = useParams();
  const [screenings, setScreenings] = useState([]);
  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }

    if (!childId) {
      setError("ID anak tidak ditemukan.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const json = await fetchChildScreenings(childId);

        // json bisa {success, data: []} atau langsung array
        const list = Array.isArray(json) ? json : json.data ?? [];
        setScreenings(list);

        if (list.length > 0 && list[0].child) {
          setChildName(list[0].child.name);
        }
      } catch (err) {
        console.error("Error loading screenings:", err);
        setError(err.message || "Gagal mengambil data screening");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [childId]);

  // ---- Utility untuk dashboard ----
  const latestScreening = screenings.length > 0 ? screenings[0] : null;

  const chartData = screenings
    .map((s) => ({
      date: new Date(s.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      }),
      score: s.score,
      category: s.category,
    }))
    .reverse();

  const getCategoryColor = (category) => {
    if (category === "GOOD") return "#16a34a";
    if (category === "FAIR") return "#f59e0b";
    return "#dc2626";
  };

  const getCategoryLabel = (category) => {
    if (category === "GOOD") return "Baik";
    if (category === "FAIR") return "Cukup";
    return "Perlu Perhatian";
  };

  // ---- Render utama ----
  if (loading) return <p>Memuat...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (!screenings.length) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
        <div
          style={{
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "white",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            ← Kembali
          </button>

          <button
            onClick={() =>
              navigate(`/children/${childId}/screenings/new`)
            }
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background: "#16a34a",
              color: "white",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            + Screening baru
          </button>
        </div>

        <h2 style={{ marginBottom: 4 }}>
          Riwayat Screening {childName || `Anak #${childId}`}
        </h2>
        <p style={{ marginTop: 0, fontSize: 13, color: "#666" }}>
          Belum ada screening untuk anak ini. Mulai screening pertama untuk
          memantau postur anak.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      {/* Bar atas: kembali + tombol screening baru */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "center",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          ← Kembali
        </button>

        <div style={{ textAlign: "center", flex: 1 }}>
          <h2 style={{ marginBottom: 4 }}>
            Riwayat Screening {childName || `Anak #${childId}`}
          </h2>
          <p style={{ marginTop: 0, fontSize: 13, color: "#666" }}>
            Ringkasan hasil postur dan tren skor dari waktu ke waktu.
          </p>
        </div>

        <button
          onClick={() =>
            navigate(`/children/${childId}/screenings/new`)
          }
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            background: "#16a34a",
            color: "white",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          + Screening baru
        </button>
      </div>

      {/* Dashboard atas: status terbaru + metrik */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Status terbaru */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 16,
            border: "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: 12,
              fontSize: 15,
              color: "#4b5563",
            }}
          >
            📊 Status Terbaru
          </h3>
          {latestScreening && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    color: getCategoryColor(latestScreening.category),
                  }}
                >
                  {latestScreening.score != null
                    ? latestScreening.score.toFixed(1)
                    : "-"}
                </span>
                <span style={{ fontSize: 14, color: "#9ca3af" }}>
                  / 100
                </span>
              </div>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background:
                    getCategoryColor(latestScreening.category) + "20",
                  color: getCategoryColor(latestScreening.category),
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                {getCategoryLabel(latestScreening.category)}
              </span>
              <p
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  marginTop: 4,
                  marginBottom: 8,
                }}
              >
                {latestScreening.summary}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  margin: 0,
                }}
              >
                📅{" "}
                {new Date(
                  latestScreening.created_at
                ).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </>
          )}
        </div>

        {/* Detail metrik */}
        {latestScreening && latestScreening.metrics && (
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 16,
              border: "1px solid #e5e7eb",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: 12,
                fontSize: 15,
                color: "#4b5563",
              }}
            >
              📏 Detail Metrik
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {latestScreening.metrics.neck_inclination_deg != null && (
                <MetricRow
                  label="Kemiringan Leher"
                  value={`${latestScreening.metrics.neck_inclination_deg.toFixed(
                    1
                  )}°`}
                />
              )}
              {latestScreening.metrics.torso_inclination_deg != null && (
                <MetricRow
                  label="Kemiringan Badan"
                  value={`${latestScreening.metrics.torso_inclination_deg.toFixed(
                    1
                  )}°`}
                />
              )}
              {latestScreening.metrics.hip_tilt_index != null && (
                <MetricRow
                  label="Indeks Pinggul"
                  value={latestScreening.metrics.hip_tilt_index.toFixed(3)}
                />
              )}
              {latestScreening.metrics.shoulder_tilt_index != null && (
                <MetricRow
                  label="Indeks Bahu"
                  value={latestScreening.metrics.shoulder_tilt_index.toFixed(3)}
                />
              )}
              {latestScreening.metrics.forward_head_index != null && (
                <MetricRow
                  label="Indeks Kepala Maju"
                  value={latestScreening.metrics.forward_head_index.toFixed(3)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Grafik tren skor (kalau ada >1 data) */}
      {chartData.length > 1 && (
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 16,
            border: "1px solid #e5e7eb",
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: 16,
              fontSize: 15,
              color: "#111827",
            }}
          >
            📈 Tren Skor Postur
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#6b7280"
                style={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => [value, "Skor"]}
                labelFormatter={(label) => `Tanggal: ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#4e73df"
                strokeWidth={2}
                dot={{ r: 4, fill: "#4e73df" }}
                activeDot={{ r: 6 }}
                name="Skor Postur"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* List screening seperti versi lama */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 16,
          border: "1px solid #e5e7eb",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: 12,
            fontSize: 15,
            color: "#111827",
          }}
        >
          📋 Riwayat Screening
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {screenings.map((scr) => {
            const categoryColor = getCategoryColor(scr.category);

            return (
              <div
                key={scr.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#666",
                      }}
                    >
                      {new Date(scr.created_at).toLocaleString("id-ID")}
                    </p>
                    <p style={{ margin: "4px 0", fontSize: 14 }}>
                      Skor:{" "}
                      <strong>
                        {scr.score != null ? scr.score.toFixed(1) : "-"}
                      </strong>
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#666",
                      }}
                    >
                      {scr.summary?.length > 80
                        ? scr.summary.slice(0, 80) + "..."
                        : scr.summary}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: categoryColor,
                        color: "white",
                        fontSize: 11,
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      {scr.category || "-"}
                    </span>
                    <br />
                    <Link
                      to={`/screenings/${scr.id}`}
                      style={{
                        fontSize: 13,
                        color: "#2563eb",
                        textDecoration: "underline",
                      }}
                    >
                      Lihat detail
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 13,
        paddingBottom: 6,
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ fontWeight: 600, color: "#111827" }}>{value}</span>
    </div>
  );
}

export default ChildScreeningsPage;
