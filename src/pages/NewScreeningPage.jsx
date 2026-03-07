import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Camera,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Webcam from "react-webcam";
import { createScreening } from "../services/screeningService.jsx";
import "../styles/screening.css";

const VIEW_LABELS = {
  FRONT: "Depan",
  SIDE: "Samping",
  BACK: "Belakang",
};

const ORDER = ["FRONT", "SIDE", "BACK"];

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
  const [modalImage, setModalImage] = useState(null);
  const [mainMobileView, setMainMobileView] = useState("FRONT");

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  useEffect(() => {
    if (loading) return;

    const firstEmptyView = ORDER.find((view) => images[view] === null);

    if (
      images[activeView] !== null &&
      firstEmptyView &&
      activeView !== firstEmptyView
    ) {
      const timeout = setTimeout(() => {
        setActiveView(firstEmptyView);
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [images, activeView, loading]);

  const ensureMainMobileView = () => {
    if (previews[mainMobileView]) return;
    const firstWithImage = ORDER.find((v) => previews[v]);
    setMainMobileView(firstWithImage || "FRONT");
  };

  const handleFileUpload = (e, view) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImages((prev) => ({ ...prev, [view]: file }));

    const url = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [view]: url }));
    setError(null);
    setMainMobileView(view);
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
    setMainMobileView(activeView);
  };

  const handleRemoveImage = (view) => {
    setImages((prev) => ({ ...prev, [view]: null }));
    if (previews[view] && previews[view].startsWith("blob:")) {
      URL.revokeObjectURL(previews[view]);
    }
    setPreviews((prev) => ({ ...prev, [view]: null }));
    if (mainMobileView === view) {
      ensureMainMobileView();
    }
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
          "Gagal membuat screening. Pastikan koneksi stabil."
      );
    } finally {
      setLoading(false);
    }
  };

  const videoConstraints = {
    facingMode: "environment",
  };

  const uploadedCount = Object.values(images).filter(
    (img) => img !== null
  ).length;

  return (
    <div className="screening-page">
      <div className="screening-wrapper">
        {/* LEFT */}
        <div className="screening-left">
          <div className="screening-left__content">
            <div className="screening-header">
              <Link
                to={`/children/${childId}/screenings`}
                className="screening-back"
              >
                <ArrowLeft size={16} strokeWidth={2} />
                Kembali
              </Link>

              <div className="screening-header__title">
                <h1>Screening Postur Baru</h1>
                <p>Upload 1-3 foto untuk analisis postur yang lebih akurat</p>
              </div>
            </div>

            {/* Mode */}
            <div className="screening-mode">
              <button
                type="button"
                onClick={() => setUseCamera(false)}
                className={`screening-mode__btn ${
                  !useCamera ? "screening-mode__btn--active" : ""
                }`}
              >
                <Upload size={16} strokeWidth={2} />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUseCamera(true)}
                className={`screening-mode__btn ${
                  useCamera ? "screening-mode__btn--active" : ""
                }`}
              >
                <Camera size={16} strokeWidth={2} />
                Gunakan Kamera
              </button>
            </div>

            {/* Tabs desktop */}
            <div className="screening-tabs screening-tabs--desktop">
              {ORDER.map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setActiveView(view)}
                  className={`screening-tab ${
                    activeView === view ? "screening-tab--active" : ""
                  } ${images[view] ? "screening-tab--uploaded" : ""}`}
                >
                  {VIEW_LABELS[view]}
                  {images[view] && <Check size={14} strokeWidth={2} />}
                </button>
              ))}
            </div>

            {/* Tabs mobile */}
            <div className="screening-tabs screening-tabs--mobile">
              {["FRONT", "SIDE"].map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setActiveView(view)}
                  className={`screening-tab ${
                    activeView === view ? "screening-tab--active" : ""
                  } ${images[view] ? "screening-tab--uploaded" : ""}`}
                >
                  {VIEW_LABELS[view]}
                  {images[view] && <Check size={14} strokeWidth={2} />}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setActiveView("BACK")}
                className={`screening-tab screening-tab--full ${
                  activeView === "BACK" ? "screening-tab--active" : ""
                } ${images["BACK"] ? "screening-tab--uploaded" : ""}`}
              >
                {VIEW_LABELS["BACK"]}
                {images["BACK"] && <Check size={14} strokeWidth={2} />}
              </button>
            </div>

            {/* Upload area */}
            <div className="screening-upload">
              <div className="screening-upload__header">
                <h3>Upload untuk: {VIEW_LABELS[activeView]}</h3>
                <p>Pastikan seluruh tubuh anak terlihat jelas.</p>
              </div>

              {useCamera ? (
                <div className="screening-camera screening-camera--fullscreen">
  <div className="screening-camera__preview">
    <Webcam
      ref={webcamRef}
      audio={false}
      screenshotFormat="image/jpeg"
      videoConstraints={videoConstraints}
      className="screening-camera__video"
    />
    <div className="screening-camera__overlay">
      <div className="screening-camera__guide">
        <span>Pastikan seluruh tubuh terlihat</span>
      </div>
      <button
        type="button"
        onClick={handleCaptureFromCamera}
        className="screening-camera__shutter"
      >
        <Camera size={28} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => setUseCamera(false)}
        className="screening-camera__close"
      >
        <X size={20} strokeWidth={2} />
      </button>
    </div>
  </div>
</div>
              ) : (
                <div className="screening-file">
                  <label
                    htmlFor={`file-${activeView}`}
                    className="screening-file__label"
                  >
                    <div className="screening-file__icon">
                      <Upload size={24} strokeWidth={1.5} />
                    </div>
                    <p className="screening-file__text">
                      Klik untuk upload foto
                    </p>
                    <span className="screening-file__format">
                      JPG, PNG (Max 5MB)
                    </span>
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

        {/* RIGHT */}
        <div className="screening-right">
          <div className="screening-right__content">
            <h2 className="screening-right__title">Hasil Foto</h2>

            {/* DESKTOP: 3 sejajar */}
            <div className="screening-preview-wrapper screening-preview-wrapper--desktop">
              <div className="screening-preview-row">
                {ORDER.map((view) => {
                  const url = previews[view];
                  return (
                    <div key={view} className="screening-preview-cell">
                      <div className="screening-preview-cell__label">
                        <span>{VIEW_LABELS[view]}</span>
                        {url && <Check size={12} strokeWidth={2} />}
                      </div>
                      <div
                        className={`screening-preview-cell__box ${
                          url ? "screening-preview-cell__box--uploaded" : ""
                        } ${
                          loading
                            ? "screening-preview-cell__box--scanning"
                            : ""
                        }`}
                        style={{
                          backgroundImage: url ? `url(${url})` : "none",
                        }}
                        onClick={() => url && setModalImage({ view, url })}
                      >
                        {!url && (
                          <div className="screening-preview-cell__placeholder">
                            <ImageIcon size={24} strokeWidth={1.5} />
                            <p>Belum ada foto</p>
                          </div>
                        )}
                        {loading && url && (
                          <div className="screening-scan-overlay">
                            <div className="screening-scan-line"></div>
                            <div className="screening-scan-text">
                              <Sparkles size={16} strokeWidth={2} />
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
                  );
                })}
              </div>
            </div>

            {/* MOBILE: 1 besar + 3 kecil */}
            <div className="screening-preview-wrapper screening-preview-wrapper--mobile">
              <div className="screening-preview-main-mobile">
                <div className="screening-preview-main-mobile__box">
                  {previews[mainMobileView] ? (
                    <div
                      className="screening-preview-main-mobile__image"
                      style={{
                        backgroundImage: `url(${previews[mainMobileView]})`,
                      }}
                    />
                  ) : (
                    <div className="screening-preview-main-mobile__placeholder">
                      <ImageIcon size={24} strokeWidth={1.5} />
                      <p>Belum ada foto</p>
                    </div>
                  )}
                </div>
                <p className="screening-preview-main-mobile__label">
                  {VIEW_LABELS[mainMobileView]}
                </p>
              </div>

              <div className="screening-preview-thumbs-mobile">
                {ORDER.map((view) => (
                  <div key={view} className="screening-thumb-mobile">
                    <div
                      className="screening-thumb-mobile__box"
                      style={{
                        backgroundImage: previews[view]
                          ? `url(${previews[view]})`
                          : "none",
                      }}
                      onClick={() =>
                        previews[view] &&
                        setMainMobileView(view) &&
                        setModalImage(null)
                      }
                    >
                      {!previews[view] && (
                        <div className="screening-thumb-mobile__placeholder">
                          <ImageIcon size={18} strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <span className="screening-thumb-mobile__label">
                      {VIEW_LABELS[view]}
                    </span>
                    {previews[view] && !loading && (
                      <button
                        type="button"
                        className="screening-thumb-mobile__remove"
                        onClick={() => handleRemoveImage(view)}
                      >
                        <Trash2 size={11} strokeWidth={2} />
                        Hapus
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="screening-error">
                <AlertCircle size={16} strokeWidth={2} />
                {error}
              </div>
            )}

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
                {uploadedCount === 2 &&
                  "2 foto akan dianalisis untuk hasil lebih akurat"}
                {uploadedCount === 3 &&
                  "3 foto akan dianalisis untuk hasil maksimal"}
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL PREVIEW */}
      {modalImage && (
        <div
          className="screening-modal"
          onClick={() => setModalImage(null)}
        >
          <div
            className="screening-modal__content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="screening-modal__close"
              onClick={() => setModalImage(null)}
              type="button"
            >
              <X size={18} strokeWidth={2} />
            </button>
            <h3 className="screening-modal__title">
              Foto {VIEW_LABELS[modalImage.view]}
            </h3>
            <img
              src={modalImage.url}
              alt={VIEW_LABELS[modalImage.view]}
              className="screening-modal__image"
            />
            <button
              type="button"
              className="screening-btn screening-btn--full screening-btn--secondary"
              onClick={() => setModalImage(null)}
            >
              Kembali
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewScreeningPage;
