import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchScreeningDetail,
  acceptReferralByPhysio,
  completeReferralByPhysio,
  createManualRecommendation,
} from "../../services/screeningService";

function PhysioScreeningDetailPage() {
  const { screeningId } = useParams();
  const navigate = useNavigate();

  const [screening, setScreening] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [recForm, setRecForm] = useState({
    type: "exercise",
    title: "",
    content: "",
    media_url: "",
  });
  const [submittingRec, setSubmittingRec] = useState(false);

  useEffect(() => {
    if (!screeningId) {
      setError("ID screening tidak ditemukan di URL.");
      setLoading(false);
      return;
    }
    loadDetail();
  }, [screeningId]);

  const loadDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchScreeningDetail(screeningId);
      setScreening(res?.data ?? res);
    } catch (err) {
      console.error("Error loading screening detail:", err);
      setError("Gagal memuat detail screening.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReferral = async () => {
    if (!window.confirm("Terima rujukan ini?")) return;
    try {
      await acceptReferralByPhysio(screeningId);
      alert("Rujukan diterima!");
      await loadDetail();
    } catch (err) {
      console.error(err);
      alert("Gagal menerima rujukan.");
    }
  };

  const handleCompleteReferral = async () => {
    if (!window.confirm("Tandai konsultasi selesai?")) return;
    try {
      await completeReferralByPhysio(screeningId);
      alert("Konsultasi selesai!");
      await loadDetail();
    } catch (err) {
      console.error(err);
      alert("Gagal menyelesaikan konsultasi.");
    }
  };

  const handleSubmitRecommendation = async (e) => {
    e.preventDefault();
    setSubmittingRec(true);
    try {
      await createManualRecommendation(screeningId, recForm);
      alert("Rekomendasi berhasil disimpan!");
      setRecForm({
        type: "exercise",
        title: "",
        content: "",
        media_url: "",
      });
      setShowRecommendationForm(false);
      await loadDetail();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan rekomendasi.");
    } finally {
      setSubmittingRec(false);
    }
  };

  if (loading) return <p style={{ padding: 16 }}>Memuat detail...</p>;
  if (error) return <p style={{ padding: 16, color: "red" }}>{error}</p>;
  if (!screening) return <p style={{ padding: 16 }}>Data tidak ditemukan.</p>;

  const { child, images, manualRecommendations, referral_status } = screening;

  const canEditRecommendation = referral_status === "accepted";
  const isBeforeAccepted = referral_status === "requested";
  const isAfterCompleted = referral_status === "completed";

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "2rem 0" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1rem" }}>
        <button
          onClick={() => navigate("/physio/dashboard")}
          style={{
            marginBottom: "1rem",
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            background: "white",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Kembali ke Dashboard
        </button>

        <header style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.75rem", color: "#111827" }}>
            Detail Screening: {child?.name}
          </h1>
          <p style={{ marginTop: 4, color: "#6b7280", fontSize: 14 }} />
        </header>

        {/* Data anak */}
        <section
          style={{
            background: "white",
            borderRadius: 12,
            padding: "1.5rem",
            marginBottom: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ margin: 0, marginBottom: "0.75rem", fontSize: "1.25rem" }}>
            Data Anak
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
              fontSize: 14,
            }}
          >
            <div>
              <strong>Nama:</strong> {child?.name}
            </div>
            <div>
              <strong>Usia:</strong>{" "}
              {child?.age_years ? `${child.age_years} tahun` : "-"}
            </div>
            <div>
              <strong>Jenis Kelamin:</strong> {child?.gender || "-"}
            </div>
            <div>
              <strong>Berat Badan:</strong>{" "}
              {child?.weight ? `${child.weight} kg` : "-"}
            </div>
            <div>
              <strong>Tinggi Badan:</strong>{" "}
              {child?.height ? `${child.height} cm` : "-"}
            </div>
          </div>
        </section>

        {/* Hasil screening */}
        <section
          style={{
            background: "white",
            borderRadius: 12,
            padding: "1.5rem",
            marginBottom: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ margin: 0, marginBottom: "0.75rem", fontSize: "1.25rem" }}>
            Hasil Screening
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
              fontSize: 14,
            }}
          >
            <div>
              <strong>Skor:</strong> {screening.score ?? "-"}
            </div>
            <div>
              <strong>Kategori:</strong>{" "}
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 6,
                  background:
                    screening.category === "GOOD" ? "#d1fae5" : "#fee2e2",
                  color:
                    screening.category === "GOOD" ? "#065f46" : "#b91c1c",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {screening.category || "Perlu perhatian"}
              </span>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <strong>Ringkasan:</strong>
              <p style={{ margin: "0.5rem 0 0", color: "#374151" }}>
                {screening.summary || "Tidak ada ringkasan."}
              </p>
            </div>
          </div>
        </section>

        {/* Gambar utama */}
        {images && images.length > 0 && (
          <section
            style={{
              background: "white",
              borderRadius: 12,
              padding: "1.5rem",
              marginBottom: "1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ margin: 0, marginBottom: "0.75rem", fontSize: "1.25rem" }}>
              Gambar Screening
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              {images
                .filter((img) => !img.type.startsWith("CROP_"))
                .map((img) => (
                  <div key={img.id}>
                    <img
                      src={img.url_processed || img.url_original}
                      alt={img.type}
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        marginBottom: 4,
                      }}
                    />
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: "#6b7280",
                        textAlign: "center",
                      }}
                    >
                      {img.type}
                    </p>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Rekomendasi AI (perbaikan di sini) */}
        {images && images.some((img) => img.recommendations?.length > 0) && (
          <section
            style={{
              background: "white",
              borderRadius: 12,
              padding: "1.5rem",
              marginBottom: "1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ margin: 0, marginBottom: "0.75rem", fontSize: "1.25rem" }}>
              Rekomendasi AI
            </h2>
            {images.map(
              (img) =>
                img.recommendations?.length > 0 && (
                  <div key={img.id} style={{ marginBottom: "1rem" }}>
                    <h3
                      style={{
                        fontSize: "1rem",
                        margin: 0,
                        marginBottom: "0.5rem",
                        color: "#374151",
                      }}
                    >
                      {img.type}
                    </h3>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "1.25rem",
                        fontSize: 14,
                        color: "#4b5563",
                      }}
                    >
                      {img.recommendations.map((rec, idx) => {
                        if (typeof rec === "string") {
                          return <li key={idx}>{rec}</li>;
                        }

                        const issue = rec.issue ?? rec.problem ?? "";
                        const duration = rec.duration ?? "";
                        const exercise = rec.exercise ?? "";
                        const videoUrl = rec.video_url ?? rec.videoUrl ?? "";
                        const parentNote = rec.parent_note ?? "";

                        return (
                          <li key={idx} style={{ marginBottom: 4 }}>
                            {issue && (
                              <span>
                                <strong>Keluhan:</strong> {issue}{" "}
                              </span>
                            )}
                            {duration && (
                              <span>
                                <strong>Durasi:</strong> {duration}{" "}
                              </span>
                            )}
                            {exercise && (
                              <span>
                                <strong>Latihan:</strong> {exercise}{" "}
                              </span>
                            )}
                            {parentNote && (
                              <span>
                                <strong>Catatan:</strong> {parentNote}{" "}
                              </span>
                            )}
                            {videoUrl && (
                              <a
                                href={videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#3b82f6", fontSize: 13 }}
                              >
                                Video
                              </a>
                            )}
                            {!issue &&
                              !duration &&
                              !exercise &&
                              !videoUrl &&
                              !parentNote && (
                                <span>
                                  {JSON.stringify(rec, null, 2)}
                                </span>
                              )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )
            )}
          </section>
        )}

        {/* Tombol aksi rujukan */}
        {referral_status === "requested" && (
          <button
            onClick={handleAcceptReferral}
            style={{
              padding: "10px 16px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            ✅ Terima Rujukan
          </button>
        )}

        {referral_status === "accepted" && (
          <button
            onClick={handleCompleteReferral}
            style={{
              padding: "10px 16px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            🏁 Selesaikan Konsultasi
          </button>
        )}

        {/* Rekomendasi manual */}
        <section
          style={{
            background: "white",
            borderRadius: 12,
            padding: "1.5rem",
            marginBottom: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
              Rekomendasi Manual Anda
            </h2>
            <button
              onClick={() => {
                if (!canEditRecommendation) return;
                setShowRecommendationForm((prev) => !prev);
              }}
              disabled={!canEditRecommendation}
              style={{
                padding: "8px 12px",
                background: canEditRecommendation ? "#3b82f6" : "#9ca3af",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: canEditRecommendation ? "pointer" : "not-allowed",
                fontSize: 13,
                fontWeight: 600,
                opacity: canEditRecommendation ? 1 : 0.7,
              }}
            >
              + Tambah Rekomendasi
            </button>
          </div>

          {isBeforeAccepted && (
            <p
              style={{
                marginTop: 0,
                marginBottom: "0.75rem",
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              Terima rujukan terlebih dahulu untuk dapat menambahkan
              rekomendasi.
            </p>
          )}
          {isAfterCompleted && (
            <p
              style={{
                marginTop: 0,
                marginBottom: "0.75rem",
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              Konsultasi sudah selesai, rekomendasi baru tidak dapat
              ditambahkan.
            </p>
          )}

          {showRecommendationForm && (
            <form
              onSubmit={handleSubmitRecommendation}
              style={{
                background: "#f9fafb",
                padding: "1rem",
                borderRadius: 8,
                marginBottom: "1rem",
                opacity: canEditRecommendation ? 1 : 0.6,
                pointerEvents: canEditRecommendation ? "auto" : "none",
              }}
            >
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Tipe
                </label>
                <select
                  value={recForm.type}
                  onChange={(e) =>
                    setRecForm({ ...recForm, type: e.target.value })
                  }
                  disabled={!canEditRecommendation}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                >
                  <option value="exercise">Latihan</option>
                  <option value="education">Edukasi</option>
                  <option value="note">Catatan</option>
                  <option value="referral">Rujukan</option>
                </select>
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Judul
                </label>
                <input
                  type="text"
                  value={recForm.title}
                  onChange={(e) =>
                    setRecForm({ ...recForm, title: e.target.value })
                  }
                  required
                  disabled={!canEditRecommendation}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Konten
                </label>
                <textarea
                  value={recForm.content}
                  onChange={(e) =>
                    setRecForm({ ...recForm, content: e.target.value })
                  }
                  required
                  rows={4}
                  disabled={!canEditRecommendation}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  URL Media (opsional)
                </label>
                <input
                  type="url"
                  value={recForm.media_url}
                  onChange={(e) =>
                    setRecForm({ ...recForm, media_url: e.target.value })
                  }
                  disabled={!canEditRecommendation}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingRec || !canEditRecommendation}
                style={{
                  padding: "8px 16px",
                  background: canEditRecommendation ? "#10b981" : "#9ca3af",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor:
                    submittingRec || !canEditRecommendation
                      ? "not-allowed"
                      : "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {submittingRec ? "Menyimpan..." : "Simpan Rekomendasi"}
              </button>
            </form>
          )}

          {manualRecommendations && manualRecommendations.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {manualRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    background: "#f9fafb",
                    padding: "1rem",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: "#dbeafe",
                        color: "#1e40af",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {rec.type}
                    </span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      {new Date(rec.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <h4
                    style={{
                      margin: 0,
                      marginBottom: "0.5rem",
                      fontSize: "1rem",
                      color: "#111827",
                    }}
                  >
                    {rec.title}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#4b5563",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {typeof rec.content === "string"
                      ? rec.content
                      : JSON.stringify(rec.content, null, 2)}
                  </p>
                  {rec.media_url && (
                    <a
                      href={rec.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 13,
                        color: "#3b82f6",
                        marginTop: "0.5rem",
                        display: "inline-block",
                      }}
                    >
                      Lihat Media
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
              Belum ada rekomendasi manual.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default PhysioScreeningDetailPage;
