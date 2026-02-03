import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, CheckCircle } from "lucide-react";
import {
  fetchScreeningDetail,
  acceptReferralByPhysio,
  completeReferralByPhysio,
  createManualRecommendation,
} from "../../services/screeningService";
import "./../../styles/PhysioScreeningDetailPage.css";

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

  // Modal konfirmasi terima rujukan
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptingReferral, setAcceptingReferral] = useState(false);

  // Modal konfirmasi selesaikan konsultasi
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingReferral, setCompletingReferral] = useState(false);

  // Modal sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
    setAcceptingReferral(true);
    try {
      await acceptReferralByPhysio(screeningId);
      setShowAcceptModal(false);
      setSuccessMessage("Rujukan berhasil diterima.");
      setShowSuccessModal(true);
      await loadDetail();
    } catch (err) {
      console.error(err);
      alert("Gagal menerima rujukan.");
    } finally {
      setAcceptingReferral(false);
    }
  };

  const handleCompleteReferral = async () => {
    setCompletingReferral(true);
    try {
      await completeReferralByPhysio(screeningId);
      setShowCompleteModal(false);
      setSuccessMessage("Konsultasi berhasil diselesaikan.");
      setShowSuccessModal(true);
      await loadDetail();
    } catch (err) {
      console.error(err);
      alert("Gagal menyelesaikan konsultasi.");
    } finally {
      setCompletingReferral(false);
    }
  };

  const handleSubmitRecommendation = async (e) => {
    e.preventDefault();
    setSubmittingRec(true);
    try {
      await createManualRecommendation(screeningId, recForm);
      setSuccessMessage("Rekomendasi berhasil disimpan.");
      setShowSuccessModal(true);
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

  if (loading) {
    return (
      <div className="physio-screening-page">
        <div className="physio-screening-container">
          <p className="loading-text">Memuat detail...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="physio-screening-page">
        <div className="physio-screening-container">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  if (!screening) {
    return (
      <div className="physio-screening-page">
        <div className="physio-screening-container">
          <p className="loading-text">Data tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  const { child, images, manualRecommendations, referral_status } = screening;

  const canEditRecommendation = referral_status === "accepted";
  const isBeforeAccepted = referral_status === "requested";
  const isAfterCompleted = referral_status === "completed";

  return (
    <div className="physio-screening-page">
      <div className="physio-screening-container">
        <button
          onClick={() => navigate("/physio/dashboard")}
          className="back-button"
        >
          <span className="back-arrow">←</span>
          <span>Kembali ke dashboard</span>
        </button>

        <header className="screening-header">
          <h1 className="screening-title">Detail screening: {child?.name}</h1>
        </header>

        {/* Data anak */}
        <section className="card-section">
          <h2 className="card-title">Data anak</h2>
          <div className="card-grid">
            <div>
              <strong>Nama:</strong> {child?.name}
            </div>
            <div>
              <strong>Usia:</strong>{" "}
              {child?.age_years ? `${child.age_years} tahun` : "-"}
            </div>
            <div>
              <strong>Jenis kelamin:</strong> {child?.gender || "-"}
            </div>
            <div>
              <strong>Berat badan:</strong>{" "}
              {child?.weight ? `${child.weight} kg` : "-"}
            </div>
            <div>
              <strong>Tinggi badan:</strong>{" "}
              {child?.height ? `${child.height} cm` : "-"}
            </div>
          </div>
        </section>

        {/* Hasil screening */}
        <section className="card-section">
          <h2 className="card-title">Hasil screening</h2>
          <div className="card-grid">
            <div>
              <strong>Skor:</strong> {screening.score ?? "-"}
            </div>
            <div>
              <strong>Kategori:</strong>{" "}
              <span
                className={
                  screening.category === "GOOD"
                    ? "badge badge--good"
                    : "badge badge--alert"
                }
              >
                {screening.category || "Perlu perhatian"}
              </span>
            </div>
            <div className="card-grid-full">
              <strong>Ringkasan:</strong>
              <p className="summary-text">
                {screening.summary || "Tidak ada ringkasan."}
              </p>
            </div>
          </div>
        </section>

        {/* Gambar screening */}
        {images && images.length > 0 && (
          <section className="card-section">
            <h2 className="card-title">Gambar screening</h2>
            <div className="image-grid">
              {images
                .filter((img) => !img.type.startsWith("CROP_"))
                .map((img) => (
                  <div key={img.id} className="image-item">
                    <img
                      src={img.url_processed || img.url_original}
                      alt={img.type}
                      className="screening-image"
                    />
                    <p className="image-caption">{img.type}</p>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Rekomendasi AI */}
        {images && images.some((img) => img.recommendations?.length > 0) && (
          <section className="card-section">
            <h2 className="card-title">Rekomendasi AI</h2>
            {images.map(
              (img) =>
                img.recommendations?.length > 0 && (
                  <div key={img.id} className="ai-rec-block">
                    <h3 className="ai-rec-title">{img.type}</h3>
                    <ul className="ai-rec-list">
                      {img.recommendations.map((rec, idx) => {
                        if (typeof rec === "string") {
                          return <li key={idx}>{rec}</li>;
                        }

                        const issue = rec.issue ?? rec.problem ?? "";
                        const duration = rec.duration ?? "";
                        const exercise = rec.exercise ?? "";
                        const videoUrl = rec.video_url ?? rec.videoUrl ?? "";
                        const parentNote = rec.parent_note ?? "";

                        const isEmptyStructured =
                          !issue &&
                          !duration &&
                          !exercise &&
                          !videoUrl &&
                          !parentNote;

                        return (
                          <li key={idx} className="ai-rec-item">
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
                                className="link-inline"
                              >
                                Video
                              </a>
                            )}
                            {isEmptyStructured && (
                              <span className="ai-rec-raw">
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
        <div className="referral-actions">
          {referral_status === "requested" && (
            <button
              onClick={() => setShowAcceptModal(true)}
              className="btn btn-accept"
            >
              Terima rujukan
            </button>
          )}

          {referral_status === "accepted" && (
            <button
              onClick={() => setShowCompleteModal(true)}
              className="btn btn-complete"
            >
              Selesaikan konsultasi
            </button>
          )}
        </div>

        {/* Rekomendasi manual */}
        <section className="card-section">
          <div className="manual-rec-header">
            <h2 className="card-title">Rekomendasi manual</h2>
            <button
              onClick={() => {
                if (!canEditRecommendation) return;
                setShowRecommendationForm((prev) => !prev);
              }}
              disabled={!canEditRecommendation}
              className={`btn btn-add ${
                !canEditRecommendation ? "btn-disabled" : ""
              }`}
            >
              Tambah rekomendasi
            </button>
          </div>

          {isBeforeAccepted && (
            <p className="info-text">
              Terima rujukan terlebih dahulu untuk dapat menambahkan rekomendasi.
            </p>
          )}

          {isAfterCompleted && (
            <p className="info-text">
              Konsultasi sudah selesai, rekomendasi baru tidak dapat ditambahkan.
            </p>
          )}

          {showRecommendationForm && (
            <form
              onSubmit={handleSubmitRecommendation}
              className={`manual-rec-form ${
                !canEditRecommendation ? "manual-rec-form--disabled" : ""
              }`}
            >
              <div className="form-group">
                <label className="form-label">Tipe</label>
                <select
                  value={recForm.type}
                  onChange={(e) =>
                    setRecForm({ ...recForm, type: e.target.value })
                  }
                  disabled={!canEditRecommendation}
                  className="form-input"
                >
                  <option value="exercise">Latihan</option>
                  <option value="education">Edukasi</option>
                  <option value="note">Catatan</option>
                  <option value="referral">Rujukan</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Judul</label>
                <input
                  type="text"
                  value={recForm.title}
                  onChange={(e) =>
                    setRecForm({ ...recForm, title: e.target.value })
                  }
                  required
                  disabled={!canEditRecommendation}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Konten</label>
                <textarea
                  value={recForm.content}
                  onChange={(e) =>
                    setRecForm({ ...recForm, content: e.target.value })
                  }
                  required
                  rows={4}
                  disabled={!canEditRecommendation}
                  className="form-input form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL media (opsional)</label>
                <input
                  type="url"
                  value={recForm.media_url}
                  onChange={(e) =>
                    setRecForm({ ...recForm, media_url: e.target.value })
                  }
                  disabled={!canEditRecommendation}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={submittingRec || !canEditRecommendation}
                className={`btn btn-save ${
                  submittingRec || !canEditRecommendation ? "btn-disabled" : ""
                }`}
              >
                {submittingRec ? "Menyimpan..." : "Simpan rekomendasi"}
              </button>
            </form>
          )}

          {manualRecommendations && manualRecommendations.length > 0 ? (
            <div className="manual-rec-list">
              {manualRecommendations.map((rec) => (
                <div key={rec.id} className="manual-rec-item">
                  <div className="manual-rec-meta">
                    <span className="manual-rec-type">{rec.type}</span>
                    <span className="manual-rec-date">
                      {new Date(rec.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <h4 className="manual-rec-title">{rec.title}</h4>
                  <p className="manual-rec-content">
                    {typeof rec.content === "string"
                      ? rec.content
                      : JSON.stringify(rec.content, null, 2)}
                  </p>
                  {rec.media_url && (
                    <a
                      href={rec.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-inline"
                    >
                      Lihat media
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="info-text">Belum ada rekomendasi manual.</p>
          )}
        </section>
      </div>

      {/* Modal Konfirmasi Terima Rujukan */}
      {showAcceptModal && (
        <div className="sd-modal-overlay" onClick={() => setShowAcceptModal(false)}>
          <div
            className="sd-modal sd-modal--small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sd-modal__header">
              <h3>Terima Rujukan</h3>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="sd-modal__close"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            <div className="sd-modal__body">
              <p style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
                Apakah Anda yakin ingin menerima rujukan screening untuk{" "}
                <strong>{child?.name}</strong>?
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="sd-btn sd-btn--secondary"
                  style={{ flex: 1 }}
                >
                  Batal
                </button>
                <button
                  onClick={handleAcceptReferral}
                  disabled={acceptingReferral}
                  className="sd-btn sd-btn--primary"
                  style={{ flex: 1 }}
                >
                  {acceptingReferral ? "Memproses..." : "Ya, Terima"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Selesaikan Konsultasi */}
      {showCompleteModal && (
        <div
          className="sd-modal-overlay"
          onClick={() => setShowCompleteModal(false)}
        >
          <div
            className="sd-modal sd-modal--small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sd-modal__header">
              <h3>Selesaikan Konsultasi</h3>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="sd-modal__close"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            <div className="sd-modal__body">
              <p style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
                Apakah Anda yakin konsultasi untuk <strong>{child?.name}</strong>{" "}
                sudah selesai? Setelah diselesaikan, Anda tidak dapat menambahkan
                rekomendasi baru.
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="sd-btn sd-btn--secondary"
                  style={{ flex: 1 }}
                >
                  Batal
                </button>
                <button
                  onClick={handleCompleteReferral}
                  disabled={completingReferral}
                  className="sd-btn sd-btn--primary"
                  style={{ flex: 1 }}
                >
                  {completingReferral ? "Memproses..." : "Ya, Selesaikan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses */}
      {showSuccessModal && (
        <div
          className="sd-modal-overlay"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="sd-modal sd-modal--small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sd-modal__header">
              <h3>Berhasil</h3>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="sd-modal__close"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            <div className="sd-modal__body" style={{ textAlign: "center" }}>
              <CheckCircle
                size={48}
                strokeWidth={2}
                style={{ color: "#16a34a", margin: "0 auto 1rem" }}
              />
              <p style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
                {successMessage}
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="sd-btn sd-btn--primary"
                style={{ width: "100%" }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhysioScreeningDetailPage;
