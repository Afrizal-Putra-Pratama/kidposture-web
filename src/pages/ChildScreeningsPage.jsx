import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

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

    const fetchScreenings = async () => {
      try {
        const res = await fetch(
          `http://kidposture-api.test/api/children/${childId}/screenings`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Gagal mengambil data screening");
        }

        const json = await res.json();
        setScreenings(json);

        if (json.length > 0 && json[0].child) {
          setChildName(json[0].child.name);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScreenings();
  }, [childId]);

  if (loading) return <p>Memuat...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      {/* Bar atas: kembali + tombol screening baru */}
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
        Pilih salah satu untuk melihat hasil lengkap.
      </p>

      {!screenings.length && (
        <p>Belum ada screening untuk anak ini.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {screenings.map((scr) => {
          const categoryColor =
            scr.category === "GOOD"
              ? "#16a34a"
              : scr.category === "FAIR"
              ? "#f59e0b"
              : "#dc2626";

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
                    {new Date(scr.created_at).toLocaleString()}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: 14 }}>
                    Skor:{" "}
                    <strong>
                      {scr.score ? scr.score.toFixed(1) : "-"}
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
  );
}

export default ChildScreeningsPage;
