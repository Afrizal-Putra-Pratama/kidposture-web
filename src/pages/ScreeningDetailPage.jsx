import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ScreeningDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk slider
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://kidposture-api.test/api/screenings/${id}`,
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
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p>Memuat...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return <p>Data tidak ditemukan.</p>;

  const { child, score, category, summary, images, created_at, metrics, is_multi_view, total_views } = data;
  
  // PISAHKAN main images (FRONT/SIDE/BACK) vs crops
  const mainImages = images?.filter(img => !img.type.startsWith('CROP_')) || [];
  const cropImages = images?.filter(img => img.type.startsWith('CROP_')) || [];

  const categoryColor =
    category === "GOOD"
      ? "#16a34a"
      : category === "FAIR"
      ? "#f59e0b"
      : "#dc2626";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      {/* Tombol kembali */}
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "6px 12px",
          borderRadius: 6,
          border: "1px solid #e5e7eb",
          background: "white",
          cursor: "pointer",
          fontSize: 13,
          marginBottom: 16,
        }}
      >
        ← Kembali
      </button>

      {/* Header anak */}
      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>{child?.name}</h2>
          <p style={{ margin: "4px 0" }}>
            {child?.age_years != null ? `${child.age_years} tahun` : "-"} •{" "}
            {child?.gender === "M"
              ? "Laki-laki"
              : child?.gender === "F"
              ? "Perempuan"
              : "-"}
          </p>
          <p style={{ margin: "4px 0", fontSize: 14, color: "#666" }}>
            BB {child?.weight ?? "-"} kg • TB {child?.height ?? "-"} cm
          </p>
        </div>
        <div style={{ textAlign: "right", fontSize: 14, color: "#666" }}>
          <p style={{ margin: 0 }}>
            📅 {new Date(created_at).toLocaleDateString()}
          </p>
          {is_multi_view && (
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#10b981", fontWeight: 600 }}>
              ✅ Multi-view ({total_views} foto)
            </p>
          )}
        </div>
      </section>

      {/* Score & Kategori */}
      <section
        style={{
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          background: "#f9fafb",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "0 0 120px", textAlign: "center" }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              border: `4px solid ${categoryColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: "bold",
              color: categoryColor,
            }}
          >
            {score ? score.toFixed(1) : "-"}
          </div>
          <p style={{ marginTop: 8, fontSize: 14 }}>
            {is_multi_view ? "Avg Score" : "Score"}
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: 999,
              background: categoryColor,
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            {category === "GOOD"
              ? "Postur Baik"
              : category === "FAIR"
              ? "Perlu Dipantau"
              : "Perlu Perhatian"}
          </span>
          <p style={{ marginTop: 8, marginBottom: 0 }}>{summary}</p>
        </div>
      </section>

      {/* 🆕 SLIDER MULTI-VIEW IMAGES */}
      {mainImages.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12 }}>
            📸 Foto Analisis Postur 
            {is_multi_view && ` (${mainImages.length} tampak)`}
          </h3>

          {/* Thumbnail Tabs */}
          {mainImages.length > 1 && (
            <div style={{ 
              display: "flex", 
              gap: 8, 
              marginBottom: 12,
              overflowX: "auto",
              paddingBottom: 8,
            }}>
              {mainImages.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(index)}
                  style={{
                    flex: "0 0 auto",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: selectedImageIndex === index 
                      ? "2px solid #3b82f6" 
                      : "1px solid #e5e7eb",
                    background: selectedImageIndex === index 
                      ? "#eff6ff" 
                      : "white",
                    color: selectedImageIndex === index 
                      ? "#1d4ed8" 
                      : "#6b7280",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {img.type}
                </button>
              ))}
            </div>
          )}

          {/* Main Image Display */}
          {mainImages[selectedImageIndex] && (
            <div>
              {mainImages[selectedImageIndex].url_processed ? (
                <>
                  <img
                    src={mainImages[selectedImageIndex].url_processed}
                    alt={`Analisis ${mainImages[selectedImageIndex].type}`}
                    style={{
                      width: "100%",
                      maxHeight: 550,
                      objectFit: "contain",
                      borderRadius: 12,
                      border: "3px solid #10b981",
                      boxShadow: "0 4px 16px rgba(16,185,129,0.25)",
                    }}
                  />
                  <p style={{ 
                    fontSize: 13, 
                    color: "#059669", 
                    marginTop: 10, 
                    fontWeight: 500,
                    background: "#d1fae5",
                    padding: 10,
                    borderRadius: 8,
                  }}>
                    ✅ <strong>{mainImages[selectedImageIndex].type}</strong> — 
                    Full skeleton + garis bahu/panggul + spine reference
                  </p>
                </>
              ) : (
                <>
                  <img
                    src={mainImages[selectedImageIndex].url_original}
                    alt={mainImages[selectedImageIndex].type}
                    style={{
                      width: "100%",
                      maxHeight: 450,
                      objectFit: "contain",
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>
                    📸 {mainImages[selectedImageIndex].type} (Original)
                  </p>
                </>
              )}

              {/* 🆕 RECOMMENDATIONS PER VIEW */}
              {mainImages[selectedImageIndex].recommendations && 
               mainImages[selectedImageIndex].recommendations.length > 0 && (
                <div style={{
                  marginTop: 16,
                  padding: 16,
                  background: "#fefce8",
                  border: "2px solid #eab308",
                  borderRadius: 12,
                }}>
                  <h4 style={{ 
                    margin: "0 0 12px 0", 
                    color: "#854d0e",
                    fontSize: 16,
                  }}>
                    💡 Rekomendasi Latihan untuk {mainImages[selectedImageIndex].type}
                  </h4>
                  
                  {mainImages[selectedImageIndex].recommendations.map((rec, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: 14,
                        background: "white",
                        borderRadius: 10,
                        marginBottom: idx < mainImages[selectedImageIndex].recommendations.length - 1 ? 14 : 0,
                        border: "1px solid #fde047",
                        boxShadow: "0 2px 4px rgba(234,179,8,0.1)",
                      }}
                    >
                      <p style={{ 
                        margin: "0 0 10px 0", 
                        fontWeight: 700,
                        color: "#b45309",
                        fontSize: 15,
                        lineHeight: 1.4,
                      }}>
                        ⚠️ {rec.issue}
                      </p>
                      
                      <div style={{
                        padding: 12,
                        background: "#fef3c7",
                        borderRadius: 8,
                        marginBottom: 10,
                      }}>
                        <p style={{ 
                          margin: 0, 
                          fontSize: 14,
                          color: "#374151",
                          lineHeight: 1.6,
                        }}>
                          <strong>🎯 Latihan:</strong><br/>
                          {rec.exercise}
                        </p>
                      </div>

                      <p style={{ 
                        margin: "0 0 10px 0", 
                        fontSize: 13,
                        color: "#6b7280",
                      }}>
                        <strong>⏱️ Durasi:</strong> {rec.duration}
                      </p>

                      {rec.parent_note && (
                        <div style={{
                          padding: 10,
                          background: "#dbeafe",
                          borderLeft: "3px solid #3b82f6",
                          borderRadius: 6,
                          marginTop: 10,
                        }}>
                          <p style={{ 
                            margin: 0,
                            fontSize: 13,
                            color: "#1e40af",
                            lineHeight: 1.5,
                          }}>
                            {rec.parent_note}
                          </p>
                        </div>
                      )}

                      {rec.video_url && (
                        <a 
                          href={rec.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            marginTop: 12,
                            padding: "8px 16px",
                            background: "#ef4444",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          ▶️ Lihat Video Tutorial
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation Arrows (kalau >1 foto) */}
          {mainImages.length > 1 && (
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: 16, 
              marginTop: 16 
            }}>
              <button
                onClick={() => setSelectedImageIndex(prev => 
                  prev === 0 ? mainImages.length - 1 : prev - 1
                )}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ← Prev
              </button>
              <span style={{ 
                display: "flex", 
                alignItems: "center", 
                fontSize: 14, 
                color: "#6b7280" 
              }}>
                {selectedImageIndex + 1} / {mainImages.length}
              </span>
              <button
                onClick={() => setSelectedImageIndex(prev => 
                  prev === mainImages.length - 1 ? 0 : prev + 1
                )}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      )}

      {/* CROP REGIONS */}
      {cropImages.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12 }}>🔍 Detail Area Bermasalah</h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12 
          }}>
            {cropImages.map((crop) => {
              const regionName = crop.type.replace('CROP_', '');
              const displayName = {
  SHOULDER: '🩺 Bahu',
  HIP: '🩺 Panggul',
  HEAD: '🩺 Kepala',
  NECK: '🩺 Leher',      // ✅ TAMBAH INI
  TORSO: '🩺 Punggung'   // ✅ TAMBAH INI
}[regionName] || regionName;


              return (
                <div 
                  key={crop.id} 
                  style={{
                    background: "#fff7ed",
                    border: "2px solid #fb923c",
                    borderRadius: 10,
                    padding: 12,
                    boxShadow: "0 2px 8px rgba(251,146,60,0.2)"
                  }}
                >
                  <h4 style={{ 
                    margin: "0 0 8px 0", 
                    fontSize: 14, 
                    color: "#ea580c",
                    fontWeight: 600 
                  }}>
                    {displayName}
                  </h4>
                  <img
                    src={crop.url_original}
                    alt={`Crop ${regionName}`}
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid #fb923c"
                    }}
                  />
                  <p style={{ 
                    fontSize: 11, 
                    color: "#c2410c", 
                    marginTop: 8,
                    marginBottom: 0,
                    fontWeight: 500 
                  }}>
                    ⚠️ Deviasi terdeteksi
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Metrik Detail */}
      {metrics && Object.keys(metrics).length > 0 && (
        <section style={{ background: "#f8fafc", padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12 }}>📏 Detail Pengukuran</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {metrics.shoulder_tilt_index !== undefined && (
              <div>
                <strong style={{ fontSize: 14 }}>Kemiringan Bahu</strong>
                <div style={{ fontSize: 28, color: "#059669", marginTop: 4 }}>
                  {metrics.shoulder_tilt_index.toFixed(2)}%
                </div>
                <small style={{ color: "#666" }}>
                  {metrics.shoulder_tilt_index < 2 ? "✅ Normal" : "⚠️ Ada deviasi"}
                </small>
              </div>
            )}
            {metrics.hip_tilt_index !== undefined && (
              <div>
                <strong style={{ fontSize: 14 }}>Kemiringan Panggul</strong>
                <div style={{ fontSize: 28, color: "#059669", marginTop: 4 }}>
                  {metrics.hip_tilt_index.toFixed(2)}%
                </div>
                <small style={{ color: "#666" }}>
                  {metrics.hip_tilt_index < 2 ? "✅ Normal" : "⚠️ Ada deviasi"}
                </small>
              </div>
            )}
            {metrics.forward_head_index !== undefined && (
              <div>
                <strong style={{ fontSize: 14 }}>Kepala Maju</strong>
                <div style={{ fontSize: 28, color: "#059669", marginTop: 4 }}>
                  {metrics.forward_head_index.toFixed(3)}
                </div>
                <small style={{ color: "#666" }}>
                  {metrics.forward_head_index < 0.2 ? "✅ Normal" : "⚠️ Ada kecenderungan"}
                </small>
              </div>
            )}
            {metrics.neck_inclination_deg !== undefined && (
              <div>
                <strong style={{ fontSize: 14 }}>Sudut Leher</strong>
                <div style={{ fontSize: 28, color: "#059669", marginTop: 4 }}>
                  {metrics.neck_inclination_deg.toFixed(1)}°
                </div>
                <small style={{ color: "#666" }}>
                  {metrics.neck_inclination_deg < 15 ? "✅ Normal" : "⚠️ Menunduk"}
                </small>
              </div>
            )}
            {metrics.torso_inclination_deg !== undefined && (
              <div>
                <strong style={{ fontSize: 14 }}>Sudut Punggung</strong>
                <div style={{ fontSize: 28, color: "#059669", marginTop: 4 }}>
                  {metrics.torso_inclination_deg.toFixed(1)}°
                </div>
                <small style={{ color: "#666" }}>
                  {metrics.torso_inclination_deg < 15 ? "✅ Normal" : "⚠️ Membungkuk"}
                </small>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tombol Aksi */}
      <section style={{ 
        display: "flex", 
        gap: 12, 
        paddingTop: 16,
        borderTop: "1px solid #e5e7eb",
        flexWrap: "wrap",
      }}>
        <button
          onClick={() => navigate(`/children/${child?.id}/screenings/new`)}
          style={{
            flex: 1,
            minWidth: 200,
            padding: "12px 16px",
            borderRadius: 8,
            border: "none",
            background: "#3b82f6",
            color: "white",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          📸 Screening Baru
        </button>
        <button
          onClick={() => navigate(`/children/${child?.id}`)}
          style={{
            flex: 1,
            minWidth: 200,
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "white",
            color: "#374151",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          👶 Lihat Profil Anak
        </button>
      </section>
    </div>
  );
}

export default ScreeningDetailPage;
