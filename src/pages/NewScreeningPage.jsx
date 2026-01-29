import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Camera,
  Check,
  X,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Trash2,
} from "lucide-react";
import Webcam from "react-webcam";
import { createScreening } from "../services/screeningService.jsx";
import "../styles/screening.css";

function NewScreeningPage() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [images, setImages] = useState({
    FRONT: null,
    SIDE: null,
    BACK: null,
  });
  const [previews, setPreviews] = useState({
    FRONT: null,
    SIDE: null,
    BACK: null,
  });
  const [activeView, setActiveView] = useState("FRONT");
  const [useCamera, setUseCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  // Smart auto-navigate: selalu ke view pertama yang kosong
  useEffect(() => {
    if (loading) return;

    const firstEmptyView = ["FRONT", "SIDE", "BACK"].find(
      (view) => images[view] === null
    );

    if (images[activeView] !== null && firstEmptyView && activeView !== firstEmptyView) {
      const timeout = setTimeout(() => {
        setActiveView(firstEmptyView);
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [images, activeView, loading]);

  const handleFileUpload = (e, view) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImages((prev) => ({ ...prev, [view]: file }));

    const url = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [view]: url }));
    setError(null);
  };

  const handleCaptureFromCamera = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError("Gagal mengambil gambar dari kamera.");
      return;
    }

    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], `${activeView.toLowerCase()}_capture.jpg`, {
      type: mimeString,
    });

    setImages((prev) => ({ ...prev, [activeView]: file }));
    setPreviews((prev) => ({ ...prev, [activeView]: imageSrc }));
    setError(null);
  };

  const handleRemoveImage = (view) => {
    setImages((prev) => ({ ...prev, [view]: null }));
    if (previews[view]) {
      URL.revokeObjectURL(previews[view]);
    }
    setPreviews((prev) => ({ ...prev, [view]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const uploadedImages = Object.entries(images).filter(
      ([, file]) => file !== null
    );

    if (uploadedImages.length === 0) {
      setError("Upload minimal 1 foto (Depan, Samping, atau Belakang)");
      return;
    }

    const formData = new FormData();
    uploadedImages.forEach(([type, file], index) => {
      formData.append(`images[${index}][type]`, type);
      formData.append(`images[${index}][image]`, file);
    });

    try {
      setLoading(true);

      const data = await createScreening(childId, formData);

      if (data.id) {
        navigate(`/screenings/${data.id}`);
      } else if (data.data?.id) {
        navigate(`/screenings/${data.data.id}`);
      } else {
        navigate(`/children/${childId}`);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal membuat screening. Pastikan token valid dan koneksi stabil."
      );
    } finally {
      setLoading(false);
    }
  };

  const videoConstraints = {
    facingMode: "environment",
  };

  const uploadedCount = Object.values(images).filter((img) => img !== null).length;

  const viewLabels = {
    FRONT: "Depan",
    SIDE: "Samping",
    BACK: "Belakang",
  };

  return (
    <div className="screening-page">
      <div className="screening-wrapper">
        {/* Left Side: Form Input (50%) */}
        <div className="screening-left">
          <div className="screening-left__content">
            {/* Header */}
            <div className="screening-header">
              <Link to={`/children/${childId}/screenings`} className="screening-back">
                <ArrowLeft size={16} strokeWidth={2} />
                Kembali
              </Link>

              <div className="screening-header__title">
                <h1>Screening Postur Baru</h1>
                <p>Upload 1-3 foto untuk analisis postur yang lebih akurat</p>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="screening-mode">
              <button
                type="button"
                onClick={() => setUseCamera(false)}
                className={`screening-mode__btn ${!useCamera ? "screening-mode__btn--active" : ""}`}
              >
                <Upload size={16} strokeWidth={2} />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUseCamera(true)}
                className={`screening-mode__btn ${useCamera ? "screening-mode__btn--active" : ""}`}
              >
                <Camera size={16} strokeWidth={2} />
                Gunakan Kamera
              </button>
            </div>

            {/* Status Badge */}
            <div className={`screening-status screening-status--${getStatusType(uploadedCount)}`}>
              <div className="screening-status__icon">
                {uploadedCount === 3 ? (
                  <Check size={16} strokeWidth={2} />
                ) : (
                  <AlertCircle size={16} strokeWidth={2} />
                )}
              </div>
              <div className="screening-status__text">
                <strong>{getStatusTitle(uploadedCount)}</strong>
                <p>{getStatusDesc(uploadedCount)}</p>
              </div>
            </div>

            {/* View Tabs */}
            <div className="screening-tabs">
              {["FRONT", "SIDE", "BACK"].map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setActiveView(view)}
                  className={`screening-tab ${
                    activeView === view ? "screening-tab--active" : ""
                  } ${images[view] ? "screening-tab--uploaded" : ""}`}
                >
                  {viewLabels[view]}
                  {images[view] && <Check size={14} strokeWidth={2} />}
                </button>
              ))}
            </div>

            {/* Upload Area */}
            <div className="screening-upload">
              <div className="screening-upload__header">
                <h3>Upload untuk: {viewLabels[activeView]}</h3>
                <p>Pastikan seluruh tubuh anak terlihat jelas</p>
              </div>

              {useCamera ? (
                <div className="screening-camera">
                  <div className="screening-camera__preview">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCaptureFromCamera}
                    className="screening-btn screening-btn--primary screening-btn--full"
                  >
                    <Camera size={16} strokeWidth={2} />
                    Capture {viewLabels[activeView]}
                  </button>
                </div>
              ) : (
                <div className="screening-file">
                  <label htmlFor={`file-${activeView}`} className="screening-file__label">
                    <div className="screening-file__icon">
                      <Upload size={24} strokeWidth={1.5} />
                    </div>
                    <p className="screening-file__text">Klik untuk upload foto</p>
                    <span className="screening-file__format">JPG, PNG (Max 5MB)</span>
                  </label>
                  <input
                    id={`file-${activeView}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, activeView)}
                    className="screening-file__input"
                  />
                  {images[activeView] && (
                    <div className="screening-file__success">
                      <Check size={14} strokeWidth={2} />
                      {images[activeView].name}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Preview & Submit (50%) */}
        <div className="screening-right">
          <div className="screening-right__content">
            <h2 className="screening-right__title">Hasil Foto</h2>

            {/* Preview Row: 3 kolom, foto portrait pendek */}
            <div className="screening-preview-row">
              {Object.entries(previews).map(([view, url]) => (
                <div key={view} className="screening-preview-cell">
                  <div className="screening-preview-cell__label">
                    <span>{viewLabels[view]}</span>
                    {url && <Check size={12} strokeWidth={2} />}
                  </div>
                  <div
                    className={`screening-preview-cell__box ${
                      url ? "screening-preview-cell__box--uploaded" : ""
                    } ${loading ? "screening-preview-cell__box--scanning" : ""}`}
                    style={{
                      backgroundImage: url ? `url(${url})` : "none",
                    }}
                  >
                    {!url && (
                      <div className="screening-preview-cell__placeholder">
                        <ImageIcon size={28} strokeWidth={1.5} />
                        <p>Belum ada foto</p>
                      </div>
                    )}
                    {loading && url && (
                      <div className="screening-scan-overlay">
                        <div className="screening-scan-line"></div>
                        <div className="screening-scan-text">
                          <Sparkles size={18} strokeWidth={2} />
                          <span>Menganalisis...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {url && !loading && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(view)}
                      className="screening-preview-cell__remove"
                    >
                      <Trash2 size={12} strokeWidth={2} />
                      Hapus
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="screening-error">
                <AlertCircle size={16} strokeWidth={2} />
                {error}
              </div>
            )}

            {/* Submit */}
            <form onSubmit={handleSubmit}>
              <button
                type="submit"
                disabled={loading || uploadedCount === 0}
                className="screening-btn screening-btn--primary screening-btn--full screening-btn--large"
              >
                <Sparkles size={16} strokeWidth={2} />
                {loading ? "Menganalisis..." : `Analisis ${uploadedCount} Foto`}
              </button>

              <p className="screening-submit__note">
                {uploadedCount === 1 && "1 foto akan dianalisis"}
                {uploadedCount === 2 && "2 foto akan dianalisis untuk hasil lebih akurat"}
                {uploadedCount === 3 && "3 foto akan dianalisis untuk hasil maksimal"}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getStatusType(count) {
  if (count === 0) return "warning";
  if (count === 3) return "success";
  return "info";
}

function getStatusTitle(count) {
  if (count === 0) return "Belum ada foto diupload";
  if (count === 1) return "1 foto terupload";
  if (count === 2) return "2 foto terupload";
  return "Lengkap! 3 foto terupload";
}

function getStatusDesc(count) {
  if (count === 0) return "Upload minimal 1 foto untuk memulai analisis";
  if (count === 1) return "Opsional: Tambah Samping atau Belakang untuk akurasi lebih baik";
  if (count === 2) return "Opsional: Tambah 1 foto lagi untuk hasil maksimal";
  return "Analisis akan menghasilkan akurasi maksimal";
}

export default NewScreeningPage;
