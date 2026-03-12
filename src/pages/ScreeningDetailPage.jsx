import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  AlertCircle,
  User,
  Camera,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Plus,
  History,
  AlertTriangle,
} from "lucide-react";
import {
  fetchScreeningDetail,
  referScreeningToPhysio,
} from "../services/screeningService.jsx";
import physioService from "../services/physioService.jsx";
import { toProxiedUrl } from "../utils/axios";
import "../styles/screeningDetail.css";

function ScreeningDetailPage() {
  const { screeningId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [showAIModal, setShowAIModal] = useState(false);
  const [showDeviationModal, setShowDeviationModal] = useState(false);

  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [physios, setPhysios] = useState([]);
  const [loadingPhysios, setLoadingPhysios] = useState(false);
  const [submittingRefer, setSubmittingRefer] = useState(false);
  const [referError, setReferError] = useState(null);

  const [confirmReferModal, setConfirmReferModal] = useState({
    show: false,
    physioId: null,
    physioName: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }

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
    setSubmittingRefer(true);
    setReferError(null);
    try {
      const res = await referScreeningToPhysio(screeningId, physioId);
      const updated = res.data ?? res;
      setData(updated);
      setIsReferModalOpen(false);
      setConfirmReferModal({ show: false, physioId: null, physioName: "" });
    } catch (err) {
      setReferError(
        err.response?.data?.message || err.message || "Gagal mengirim rujukan"
      );
    } finally {
      setSubmittingRefer(false);
    }
  };

  if (loading) {
    return (
      <div className="sd-page">
        <div className="sd-container">
          <div className="sd-loading">Memuat data screening...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-page">
        <div className="sd-container">
          <div className="sd-error">
            <AlertCircle size={48} strokeWidth={1.5} />
            <h2>Terjadi Kesalahan</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="sd-btn sd-btn--secondary">
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="sd-page">
        <div className="sd-container">
          <p className="sd-no-data">Data tidak ditemukan.</p>
        </div>
      </div>
    );
  }

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

  const categoryConfig = {
    GOOD: { label: "Postur Baik", color: "#16a34a", bg: "#dcfce7" },
    FAIR: { label: "Perlu Dipantau", color: "#f59e0b", bg: "#fef3c7" },
    ATTENTION: { label: "Perlu Perhatian", color: "#dc2626", bg: "#fee2e2" },
  };

  const currentCat = categoryConfig[category] || categoryConfig.GOOD;

  const canRefer =
    (category === "FAIR" || category === "ATTENTION") &&
    referral_status === "none" &&
    !physiotherapist;

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? mainImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev === mainImages.length - 1 ? 0 : prev + 1));
  };

  const currentImage = mainImages[selectedImageIndex];
  const hasAIRec =
    currentImage?.recommendations && currentImage.recommendations.length > 0;

  const shoulderDeviated =
    metrics?.shoulder_tilt_index !== undefined &&
    metrics.shoulder_tilt_index >= 2;
  const hipDeviated =
    metrics?.hip_tilt_index !== undefined &&
    metrics.hip_tilt_index >= 2;
  const headDeviated =
    metrics?.forward_head_index !== undefined &&
    metrics.forward_head_index >= 0.2;
  const neckDeviated =
    metrics?.neck_inclination_deg !== undefined &&
    metrics.neck_inclination_deg >= 15;
  const torsoDeviated =
    metrics?.torso_inclination_deg !== undefined &&
    metrics.torso_inclination_deg >= 15;

  const hasAnyDeviation =
    shoulderDeviated || hipDeviated || headDeviated || neckDeviated || torsoDeviated;

  return (
    <div className="sd-page">
      <div className="sd-container">
        {/* Top Actions */}
        <div className="sd-top-actions">
          <button
            onClick={() => navigate(`/children/${child?.id}/screenings/new`)}
            className="sd-top-btn sd-top-btn--primary"
          >
            <Plus size={16} strokeWidth={2} />
            Screening Baru
          </button>
          <button
            onClick={() => navigate(`/children/${child?.id}/screenings`)}
            className="sd-top-btn sd-top-btn--secondary"
          >
            <History size={16} strokeWidth={2} />
            Riwayat
          </button>
        </div>

        {/* Info + Score Row */}
        <section className="sd-info-score-row">
          <div className="sd-info-col">
            <div className="sd-info-name">
              <User size={20} strokeWidth={1.5} />
              <span>{child?.name || "Anak"}</span>
            </div>
            <div className="sd-info-meta">
              {child?.age_years > 0 && <span>{child.age_years} tahun</span>}
              {child?.age_years > 0 && <span className="sd-separator">·</span>}
              <span>
                {child?.gender === "M"
                  ? "Laki-laki"
                  : child?.gender === "F"
                  ? "Perempuan"
                  : "-"}
              </span>
            </div>
            <div className="sd-info-meta">
              <span>BB {child?.weight ?? "-"} kg</span>
              <span className="sd-separator">·</span>
              <span>TB {child?.height ?? "-"} cm</span>
            </div>
            <div className="sd-date-row">
              <Calendar size={14} strokeWidth={2} />
              <span>
                {created_at ? new Date(created_at).toLocaleDateString("id-ID") : "-"}
              </span>
              {is_multi_view && (
                <>
                  <span className="sd-separator">·</span>
                  <span className="sd-multi-label">{total_views} foto</span>
                </>
              )}
            </div>
          </div>

          <div className="sd-score-col">
            <div className="sd-circle" style={{ borderColor: currentCat.color }}>
              <span style={{ color: currentCat.color }}>
                {score != null ? Number(score).toFixed(1) : "-"}
              </span>
            </div>
            <span className="sd-badge" style={{ backgroundColor: currentCat.color }}>
              {currentCat.label}
            </span>
          </div>
        </section>

        <p className="sd-summary">{summary}</p>

        {/* Main Layout 2 Kolom */}
        <div className="sd-main-layout">
          {/* LEFT */}
          <div className="sd-left-panel">
            {metrics && Object.keys(metrics).length > 0 && (
              <section className="sd-metrics-table">
                <div className="sd-metrics-header">
                  <h3>Detail Pengukuran</h3>
                  {hasAnyDeviation && (
                    <button
                      className="sd-deviation-cta"
                      onClick={() => setShowDeviationModal(true)}
                    >
                      <AlertTriangle size={14} strokeWidth={2} />
                      Lihat Area Deviasi
                    </button>
                  )}
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Area</th>
                      <th>Nilai</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.shoulder_tilt_index !== undefined && (
                      <tr>
                        <td>Kemiringan Bahu</td>
                        <td>{metrics.shoulder_tilt_index.toFixed(1)}%</td>
                        <td>
                          <span className={metrics.shoulder_tilt_index < 2 ? "status-ok" : "status-warn"}>
                            {metrics.shoulder_tilt_index < 2 ? "Normal" : "Deviasi"}
                          </span>
                        </td>
                      </tr>
                    )}
                    {metrics.hip_tilt_index !== undefined && (
                      <tr>
                        <td>Kemiringan Panggul</td>
                        <td>{metrics.hip_tilt_index.toFixed(1)}%</td>
                        <td>
                          <span className={metrics.hip_tilt_index < 2 ? "status-ok" : "status-warn"}>
                            {metrics.hip_tilt_index < 2 ? "Normal" : "Deviasi"}
                          </span>
                        </td>
                      </tr>
                    )}
                    {metrics.forward_head_index !== undefined && (
                      <tr>
                        <td>Forward Head Posture</td>
                        <td>{metrics.forward_head_index.toFixed(2)}</td>
                        <td>
                          <span className={metrics.forward_head_index < 0.2 ? "status-ok" : "status-warn"}>
                            {metrics.forward_head_index < 0.2 ? "Normal" : "Forward Head"}
                          </span>
                        </td>
                      </tr>
                    )}
                    {metrics.neck_inclination_deg !== undefined && (
                      <tr>
                        <td>Kemiringan Leher</td>
                        <td>{metrics.neck_inclination_deg.toFixed(1)}°</td>
                        <td>
                          <span className={metrics.neck_inclination_deg < 15 ? "status-ok" : "status-warn"}>
                            {metrics.neck_inclination_deg < 15 ? "Normal" : "Deviasi"}
                          </span>
                        </td>
                      </tr>
                    )}
                    {metrics.torso_inclination_deg !== undefined && (
                      <tr>
                        <td>Kemiringan Punggung</td>
                        <td>{metrics.torso_inclination_deg.toFixed(1)}°</td>
                        <td>
                          <span className={metrics.torso_inclination_deg < 15 ? "status-ok" : "status-warn"}>
                            {metrics.torso_inclination_deg < 15 ? "Normal" : "Deviasi"}
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            )}

            {category !== "GOOD" && (
              <section className="sd-referral-card">
                <h3>
                  <User size={16} strokeWidth={1.5} />
                  Status Konsultasi Fisioterapis
                </h3>
                {physiotherapist ? (
                  <p className="sd-physio-line">
                    <strong>{physiotherapist.name}</strong>
                    {physiotherapist.clinic_name && ` · ${physiotherapist.clinic_name}`}
                    {physiotherapist.city && ` · ${physiotherapist.city}`}
                  </p>
                ) : (
                  <p className="sd-no-physio">Belum ada fisioterapis yang dipilih.</p>
                )}
                <p className="sd-referral-status">
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
                  <button onClick={openReferModal} className="sd-cta sd-cta--outline">
                    Konsultasi dengan Fisioterapis
                  </button>
                )}
                {referError && <p className="sd-refer-error">{referError}</p>}
              </section>
            )}
          </div>

          {/* RIGHT: Foto */}
          <div className="sd-right-panel">
            {mainImages.length > 0 && (
              <section className="sd-image-card">
                <div className="sd-image-card-header">
                  <h3>
                    <Camera size={16} strokeWidth={1.5} />
                    Foto Analisis Postur
                  </h3>
                </div>

                {mainImages.length > 1 && (
                  <div className="sd-view-tabs">
                    {mainImages.map((img, index) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`sd-view-tab ${selectedImageIndex === index ? "sd-view-tab--active" : ""}`}
                      >
                        {img.type}
                      </button>
                    ))}
                  </div>
                )}

                {currentImage && (
                  <div className="sd-image-wrapper">
                    <img
                      src={toProxiedUrl(currentImage.url_processed || currentImage.url_original)}
                      alt={currentImage.type}
                      className="sd-image"
                    />
                  </div>
                )}

                {mainImages.length > 1 && (
                  <div className="sd-image-controls">
                    <button onClick={prevImage} className="sd-nav-btn">
                      <ChevronLeft size={16} strokeWidth={2} />
                    </button>
                    <span className="sd-image-count">
                      {selectedImageIndex + 1} / {mainImages.length}
                    </span>
                    <button onClick={nextImage} className="sd-nav-btn">
                      <ChevronRight size={16} strokeWidth={2} />
                    </button>
                  </div>
                )}
              </section>
            )}

            {hasAIRec && (
              <button
                className="sd-cta sd-cta--primary-fill"
                onClick={() => setShowAIModal(true)}
              >
                <Sparkles size={16} strokeWidth={2} />
                Lihat Rekomendasi AI
              </button>
            )}
          </div>
        </div>

        {/* Rekomendasi dari Fisioterapis */}
        <section id="sd-fisio-section" className="sd-manual-rec">
          <h3>
            <FileText size={18} strokeWidth={1.5} />
            Rekomendasi dari Fisioterapis
          </h3>
          {manualRecommendations && manualRecommendations.length > 0 ? (
            <ul className="sd-manual-list">
              {manualRecommendations.map((rec) => (
                <li key={rec.id}>
                  <strong>{rec.title}</strong> <em>({rec.type})</em>
                  <p>{rec.content}</p>
                  <small>
                    oleh {rec.physio?.name || "Fisioterapis"} pada{" "}
                    {rec.created_at ? new Date(rec.created_at).toLocaleDateString("id-ID") : "-"}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sd-no-manual">Belum ada catatan khusus dari fisioterapis.</p>
          )}
        </section>
      </div>

      {/* Modal Rekomendasi AI */}
      {showAIModal && hasAIRec && (
        <div className="sd-modal-overlay" onClick={() => setShowAIModal(false)}>
          <div className="sd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sd-modal__header">
              <h3>Rekomendasi Latihan (AI)</h3>
              <button onClick={() => setShowAIModal(false)} className="sd-modal__close">
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            <div className="sd-modal__body">
              {currentImage.recommendations.map((rec, idx) => (
                <div key={idx} className="sd-rec-item">
                  <p className="sd-rec-issue">{rec.issue}</p>
                  <div className="sd-rec-exercise">
                    <strong>Latihan</strong>
                    <p>{rec.exercise}</p>
                  </div>
                  <p className="sd-rec-duration">
                    <strong>Durasi:</strong> {rec.duration}
                  </p>
                  {rec.parent_note && <div className="sd-rec-note">{rec.parent_note}</div>}
                  {rec.video_url && (
                    <a href={rec.video_url} target="_blank" rel="noopener noreferrer" className="sd-rec-video-link">
                      Lihat Video Tutorial
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Deviasi */}
      {showDeviationModal && (
        <div className="sd-modal-overlay" onClick={() => setShowDeviationModal(false)}>
          <div className="sd-modal sd-modal--small" onClick={(e) => e.stopPropagation()}>
            <div className="sd-modal__header">
              <h3>Detail Area Deviasi</h3>
              <button onClick={() => setShowDeviationModal(false)} className="sd-modal__close">
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            <div className="sd-modal__body">
              {hasAnyDeviation ? (
                <div className="sd-deviation-list">
                  {shoulderDeviated && (
                    <DeviationRow label="Kemiringan Bahu" metric={metrics.shoulder_tilt_index.toFixed(1) + "%"} note="Bahu kiri-kanan tidak sejajar." />
                  )}
                  {hipDeviated && (
                    <DeviationRow label="Kemiringan Panggul" metric={metrics.hip_tilt_index.toFixed(1) + "%"} note="Panggul kiri-kanan tidak sejajar." />
                  )}
                  {headDeviated && (
                    <DeviationRow label="Forward Head Posture" metric={metrics.forward_head_index.toFixed(2)} note="Kepala terlalu maju ke depan." />
                  )}
                  {neckDeviated && (
                    <DeviationRow label="Kemiringan Leher" metric={metrics.neck_inclination_deg.toFixed(1) + "°"} note="Leher cenderung menunduk." />
                  )}
                  {torsoDeviated && (
                    <DeviationRow label="Kemiringan Punggung" metric={metrics.torso_inclination_deg.toFixed(1) + "°"} note="Punggung cenderung membungkuk." />
                  )}

                  {cropImages.length > 0 && (
                    <div className="sd-deviation-crops">
                      <p className="sd-deviation-crops-title">Gambaran visual:</p>
                      <div className="sd-deviation-crops-grid">
                        {cropImages.map((crop) => {
                          const regionName = crop.type.replace("CROP_", "");
                          const displayName = {
                            SHOULDER: "Bahu",
                            HIP: "Panggul",
                            HEAD: "Kepala",
                            NECK: "Leher",
                            TORSO: "Punggung",
                          }[regionName] || regionName;

                          return (
                            <div key={crop.id} className="sd-deviation-thumb">
                              <img src={toProxiedUrl(crop.url_original)} alt={`Crop ${regionName}`} />
                              <span>{displayName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="sd-modal__empty">Tidak ada deviasi bermakna yang terdeteksi.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Pilih Fisioterapis */}
      {isReferModalOpen && (
        <div className="sd-modal-overlay" onClick={() => setIsReferModalOpen(false)}>
          <div className="sd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sd-modal__header">
              <h3>Pilih Fisioterapis</h3>
              <button onClick={() => setIsReferModalOpen(false)} className="sd-modal__close">
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            <div className="sd-modal__body">
              {loadingPhysios ? (
                <p className="sd-modal__loading">Memuat daftar fisioterapis...</p>
              ) : physios.length === 0 ? (
                <p className="sd-modal__empty">Belum ada fisioterapis yang tersedia.</p>
              ) : (
                <div className="sd-physio-list">
                  {physios.map((p) => (
                    <div key={p.id} className="sd-physio-item">
                      <div className="sd-physio-item__info">
                        <strong>{p.name}</strong>
                        <p>{p.clinic_name || "-"} · {p.city || "-"}</p>
                        <p className="sd-physio-specialty">
                          Spesialisasi: {p.specialty || "-"}
                          {p.experience_years != null && ` · ${p.experience_years} tahun pengalaman`}
                        </p>
                      </div>
                      <button
                        disabled={submittingRefer}
                        onClick={() => setConfirmReferModal({ show: true, physioId: p.id, physioName: p.name })}
                        className="sd-physio-item__btn"
                      >
                        {submittingRefer ? "Mengirim..." : "Pilih"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Rujukan */}
      {confirmReferModal.show && (
        <div className="sd-modal-overlay" onClick={() => setConfirmReferModal({ show: false, physioId: null, physioName: "" })}>
          <div className="sd-modal sd-modal--small" onClick={(e) => e.stopPropagation()}>
            <div className="sd-modal__header">
              <h3>Konfirmasi Rujukan</h3>
              <button onClick={() => setConfirmReferModal({ show: false, physioId: null, physioName: "" })} className="sd-modal__close">
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            <div className="sd-modal__body">
              <p style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
                Apakah Anda yakin ingin mengirimkan hasil screening ini ke{" "}
                <strong>{confirmReferModal.physioName}</strong> untuk konsultasi lebih lanjut?
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => setConfirmReferModal({ show: false, physioId: null, physioName: "" })}
                  className="sd-btn sd-btn--secondary"
                  style={{ flex: 1 }}
                >
                  Batal
                </button>
                <button
                  onClick={() => handleRefer(confirmReferModal.physioId)}
                  disabled={submittingRefer}
                  className="sd-btn sd-btn--primary"
                  style={{ flex: 1 }}
                >
                  {submittingRefer ? "Mengirim..." : "Ya, Kirim"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeviationRow({ label, metric, note }) {
  return (
    <div className="sd-deviation-row">
      <div className="sd-deviation-main">
        <span className="sd-deviation-label">{label}</span>
        <span className="sd-deviation-metric">{metric}</span>
      </div>
      <p className="sd-deviation-note">{note}</p>
    </div>
  );
}

export default ScreeningDetailPage;