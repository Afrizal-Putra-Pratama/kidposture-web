import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchScreeningDetail, referScreeningToPhysio } from "../services/screeningService.jsx";
import physioService from "../services/physioService.jsx";

function ScreeningDetailPage() {
  const { screeningId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // modal rujuk
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [physios, setPhysios] = useState([]);
  const [loadingPhysios, setLoadingPhysios] = useState(false);
  const [submittingRefer, setSubmittingRefer] = useState(false);
  const [referError, setReferError] = useState(null);

  // DEBUG: cek params
  // console.log("PARAMS =>", useParams());
  // console.log("screeningId =>", screeningId);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }

    // kalau memang belum ada param (kasus ekstrem), tetap coba nanti saat ada
    if (!screeningId) {
      setError("ID screening tidak ditemukan di URL.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const json = await fetchScreeningDetail(screeningId);
        setData(json.data ?? json);
      } catch (err) {
        setError(err.message || "Gagal mengambil data screening");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [screeningId]);

  const openReferModal = async () => {
    setIsReferModalOpen(true);
    setReferError(null);
    setLoadingPhysios(true);
    try {
      const list = await physioService.getAll();
      setPhysios(list);
    } catch (err) {
      setReferError(err.message || "Gagal memuat daftar fisioterapis");
    } finally {
      setLoadingPhysios(false);
    }
  };

  const handleRefer = async (physioId) => {
    if (!window.confirm("Kirim screening ini ke fisioterapis yang dipilih?")) return;
    setSubmittingRefer(true);
    setReferError(null);
    try {
      const res = await referScreeningToPhysio(screeningId, physioId);
      const updated = res.data ?? res;
      setData(updated);
      setIsReferModalOpen(false);
    } catch (err) {
      setReferError(
        err.response?.data?.message || err.message || "Gagal mengirim rujukan"
      );
    } finally {
      setSubmittingRefer(false);
    }
  };

  // ---- RENDER STATE UMUM ----
  if (loading) return <p>Memuat...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return <p>Data tidak ditemukan.</p>;

  const {
    child,
    score,
    category,
    summary,
    images,
    created_at,
    metrics,
    is_multi_view,
    total_views,
    manualRecommendations,
    referral_status,
    physiotherapist,
  } = data;

  const mainImages = images?.filter((img) => !img.type.startsWith("CROP_")) || [];
  const cropImages = images?.filter((img) => img.type.startsWith("CROP_")) || [];

  const categoryColor =
    category === "GOOD"
      ? "#16a34a"
      : category === "FAIR"
      ? "#f59e0b"
      : "#dc2626";

  const canRefer =
    (category === "FAIR" || category === "ATTENTION") &&
    referral_status === "none" &&
    !physiotherapist;

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
            📅 {created_at ? new Date(created_at).toLocaleDateString() : "-"}
          </p>
          {is_multi_view && (
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: 13,
                color: "#10b981",
                fontWeight: 600,
              }}
            >
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
            {score != null ? Number(score).toFixed(1) : "-"}
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

      {/* STATUS RUJUKAN */}
      <section
        style={{
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          background: "#eef2ff",
          border: "1px solid #c7d2fe",
        }}
      >
        <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>
          🧑‍⚕️ Status Konsultasi Fisioterapis
        </h3>

        {physiotherapist ? (
          <p style={{ margin: "4px 0", fontSize: 14 }}>
            Fisioterapis: <strong>{physiotherapist.name}</strong>
            {physiotherapist.clinic_name && ` · ${physiotherapist.clinic_name}`}
            {physiotherapist.city && ` · ${physiotherapist.city}`}
          </p>
        ) : (
          <p style={{ margin: "4px 0", fontSize: 14 }}>
            Belum ada fisioterapis yang dipilih.
          </p>
        )}

        <p style={{ margin: "4px 0", fontSize: 13, color: "#4b5563" }}>
          Status:{" "}
          <strong>
            {referral_status === "none" && "Belum ada konsultasi"}
            {referral_status === "requested" && "Menunggu konfirmasi fisioterapis"}
            {referral_status === "accepted" && "Sedang dalam penanganan"}
            {referral_status === "completed" && "Selesai konsultasi"}
            {referral_status === "cancelled" && "Dibatalkan"}
          </strong>
        </p>

        {canRefer && (
          <button
            onClick={openReferModal}
            style={{
              marginTop: 8,
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#6366f1",
              color: "white",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            💬 Konsultasi dengan Fisioterapis
          </button>
        )}

        {referError && (
          <p style={{ marginTop: 8, color: "red", fontSize: 13 }}>{referError}</p>
        )}
      </section>

      {/* SLIDER GAMBAR */}
      {mainImages.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12 }}>
            📸 Foto Analisis Postur
            {is_multi_view && ` (${mainImages.length} tampak)`}
          </h3>

          {mainImages.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 12,
                overflowX: "auto",
                paddingBottom: 8,
              }}
            >
              {mainImages.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(index)}
                  style={{
                    flex: "0 0 auto",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border:
                      selectedImageIndex === index
                        ? "2px solid #3b82f6"
                        : "1px solid #e5e7eb",
                    background:
                      selectedImageIndex === index ? "#eff6ff" : "white",
                    color: selectedImageIndex === index ? "#1d4ed8" : "#6b7280",
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
                  <p
                    style={{
                      fontSize: 13,
                      color: "#059669",
                      marginTop: 10,
                      fontWeight: 500,
                      background: "#d1fae5",
                      padding: 10,
                      borderRadius: 8,
                    }}
                  >
                    ✅ <strong>{mainImages[selectedImageIndex].type}</strong> — full
                    skeleton + garis bahu/panggul + spine reference
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

              {mainImages[selectedImageIndex].recommendations &&
                mainImages[selectedImageIndex].recommendations.length > 0 && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: 16,
                      background: "#fefce8",
                      border: "2px solid #eab308",
                      borderRadius: 12,
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 12px 0",
                        color: "#854d0e",
                        fontSize: 16,
                      }}
                    >
                      💡 Rekomendasi Latihan (AI)
                    </h4>

                    {mainImages[selectedImageIndex].recommendations.map(
                      (rec, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: 14,
                            background: "white",
                            borderRadius: 10,
                            marginBottom:
                              idx <
                              mainImages[selectedImageIndex].recommendations
                                .length -
                                1
                                ? 14
                                : 0,
                            border: "1px solid #fde047",
                            boxShadow: "0 2px 4px rgba(234,179,8,0.1)",
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 10px 0",
                              fontWeight: 700,
                              color: "#b45309",
                              fontSize: 15,
                              lineHeight: 1.4,
                            }}
                          >
                            ⚠️ {rec.issue}
                          </p>

                          <div
                            style={{
                              padding: 12,
                              background: "#fef3c7",
                              borderRadius: 8,
                              marginBottom: 10,
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: 14,
                                color: "#374151",
                                lineHeight: 1.6,
                              }}
                            >
                              <strong>🎯 Latihan:</strong>
                              <br />
                              {rec.exercise}
                            </p>
                          </div>

                          <p
                            style={{
                              margin: "0 0 10px 0",
                              fontSize: 13,
                              color: "#6b7280",
                            }}
                          >
                            <strong>⏱️ Durasi:</strong> {rec.duration}
                          </p>

                          {rec.parent_note && (
                            <div
                              style={{
                                padding: 10,
                                background: "#dbeafe",
                                borderLeft: "3px solid #3b82f6",
                                borderRadius: 6,
                                marginTop: 10,
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  color: "#1e40af",
                                  lineHeight: 1.5,
                                }}
                              >
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
                      )
                    )}
                  </div>
                )}
            </div>
          )}

          {mainImages.length > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
                marginTop: 16,
              }}
            >
              <button
                onClick={() =>
                  setSelectedImageIndex((prev) =>
                    prev === 0 ? mainImages.length - 1 : prev - 1
                  )
                }
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
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 14,
                  color: "#6b7280",
                }}
              >
                {selectedImageIndex + 1} / {mainImages.length}
              </span>
              <button
                onClick={() =>
                  setSelectedImageIndex((prev) =>
                    prev === mainImages.length - 1 ? 0 : prev + 1
                  )
                }
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

      {/* Rekomendasi dari Fisioterapis */}
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>🧑‍⚕️ Rekomendasi dari Fisioterapis</h3>
        {manualRecommendations && manualRecommendations.length > 0 ? (
          <ul style={{ paddingLeft: 18 }}>
            {manualRecommendations.map((rec) => (
              <li key={rec.id} style={{ marginBottom: 12 }}>
                <strong>{rec.title}</strong> <em>({rec.type})</em>
                <br />
                {rec.content}
                <br />
                <small style={{ color: "#6b7280" }}>
                  oleh {rec.physio?.name || "Fisioterapis"} pada{" "}
                  {rec.created_at
                    ? new Date(rec.created_at).toLocaleDateString("id-ID")
                    : "-"}
                </small>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            Belum ada catatan khusus dari fisioterapis.
          </p>
        )}
      </section>

      {/* Crop regions */}
      {cropImages.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12 }}>🔍 Detail Area Bermasalah</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {cropImages.map((crop) => {
              const regionName = crop.type.replace("CROP_", "");
              const displayName =
                {
                  SHOULDER: "🩺 Bahu",
                  HIP: "🩺 Panggul",
                  HEAD: "🩺 Kepala",
                  NECK: "🩺 Leher",
                  TORSO: "🩺 Punggung",
                }[regionName] || regionName;

              return (
                <div
                  key={crop.id}
                  style={{
                    background: "#fff7ed",
                    border: "2px solid #fb923c",
                    borderRadius: 10,
                    padding: 12,
                    boxShadow: "0 2px 8px rgba(251,146,60,0.2)",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: 14,
                      color: "#ea580c",
                      fontWeight: 600,
                    }}
                  >
                    {displayName}
                  </h4>
                  <img
                    src={crop.url_original}
                    alt={`Crop ${regionName}`}
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid #fb923c",
                    }}
                  />
                  <p
                    style={{
                      fontSize: 11,
                      color: "#c2410c",
                      marginTop: 8,
                      marginBottom: 0,
                      fontWeight: 500,
                    }}
                  >
                    ⚠️ Deviasi terdeteksi
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Metrics */}
      {metrics && Object.keys(metrics).length > 0 && (
        <section
          style={{
            background: "#f8fafc",
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <h3 style={{ marginBottom: 12 }}>📏 Detail Pengukuran</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {metrics.shoulder_tilt_index !== undefined && (
              <div>
                <strong style={{ fontSize: 14 }}>Kemiringan Bahu</strong>
                <div style={{ fontSize: 28, color: "#059669", marginTop: 4 }}>
                  {metrics.shoulder_tilt_index.toFixed(2)}%
                </div>
                <small style={{ color: "#666" }}>
                  {metrics.shoulder_tilt_index < 2
                    ? "✅ Normal"
                    : "⚠️ Ada deviasi"}
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
                  {metrics.hip_tilt_index < 2
                    ? "✅ Normal"
                    : "⚠️ Ada deviasi"}
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
                  {metrics.forward_head_index < 0.2
                    ? "✅ Normal"
                    : "⚠️ Ada kecenderungan"}
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
                  {metrics.neck_inclination_deg < 15
                    ? "✅ Normal"
                    : "⚠️ Menunduk"}
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
                  {metrics.torso_inclination_deg < 15
                    ? "✅ Normal"
                    : "⚠️ Membungkuk"}
                </small>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tombol aksi */}
      <section
        style={{
          display: "flex",
          gap: 12,
          paddingTop: 16,
          borderTop: "1px solid #e5e7eb",
          flexWrap: "wrap",
        }}
      >
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
          onClick={() => navigate(`/children/${child?.id}/screenings`)}
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
          📋 Lihat Riwayat Screening
        </button>
      </section>

      {/* MODAL PILIH FISIOTERAPIS */}
      {isReferModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 20,
              maxWidth: 600,
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18 }}>Pilih Fisioterapis</h3>
              <button
                onClick={() => setIsReferModalOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {loadingPhysios ? (
              <p>Memuat daftar fisioterapis...</p>
            ) : physios.length === 0 ? (
              <p style={{ fontSize: 14, color: "#6b7280" }}>
                Belum ada fisioterapis yang tersedia.
              </p>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {physios.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div>
                      <strong>{p.name}</strong>
                      <p
                        style={{
                          margin: "4px 0",
                          fontSize: 13,
                          color: "#4b5563",
                        }}
                      >
                        {p.clinic_name || "-"} · {p.city || "-"}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        Spesialisasi: {p.specialty || "-"}{" "}
                        {p.experience_years != null &&
                          `· ${p.experience_years} tahun pengalaman`}
                      </p>
                    </div>
                    <button
                      disabled={submittingRefer}
                      onClick={() => handleRefer(p.id)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: "#22c55e",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {submittingRefer ? "Mengirim..." : "Pilih"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ScreeningDetailPage;
