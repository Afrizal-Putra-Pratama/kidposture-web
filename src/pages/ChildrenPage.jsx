import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ChildrenPage() {
  const [children, setChildren] = useState([]);
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

    const fetchChildren = async () => {
      try {
        const res = await fetch("http://kidposture-api.test/api/children", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Gagal mengambil data anak");
        }

        const json = await res.json();
        setChildren(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  if (loading) return <p>Memuat...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (!children.length) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
        <h2>Data Anak</h2>
        <p>Belum ada data anak. Silakan tambah anak melalui aplikasi / backend.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 16 }}>Data Anak</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {children.map((child) => (
          <div
            key={child.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 12,
              cursor: "pointer",
            }}
            onClick={() =>
              navigate(`/children/${child.id}/screenings`)
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{child.name}</h3>
                <p style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
                  {child.age_years != null ? `${child.age_years} tahun` : "-"} •{" "}
                  {child.gender === "M"
                    ? "Laki-laki"
                    : child.gender === "F"
                    ? "Perempuan"
                    : "-"}
                </p>
                <p style={{ margin: "4px 0", fontSize: 13, color: "#777" }}>
                  BB {child.weight ?? "-"} kg • TB {child.height ?? "-"} cm
                </p>
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: "#2563eb",
                  textDecoration: "underline",
                }}
              >
                Lihat riwayat screening
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChildrenPage;
