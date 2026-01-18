import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Webcam from "react-webcam";

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

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      Object.values(previews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Upload file untuk view tertentu
  const handleFileUpload = (e, view) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImages(prev => ({ ...prev, [view]: file }));
    
    // Buat preview
    const url = URL.createObjectURL(file);
    setPreviews(prev => ({ ...prev, [view]: url }));
    setError(null);
  };

  // Capture dari webcam
  const handleCaptureFromCamera = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError("Gagal mengambil gambar dari kamera.");
      return;
    }

    // Convert base64 → Blob → File
    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], `${activeView.toLowerCase()}_capture.jpg`, { type: mimeString });

    setImages(prev => ({ ...prev, [activeView]: file }));
    setPreviews(prev => ({ ...prev, [activeView]: imageSrc }));
    setError(null);
  };

  // Hapus foto
  const handleRemoveImage = (view) => {
    setImages(prev => ({ ...prev, [view]: null }));
    if (previews[view]) {
      URL.revokeObjectURL(previews[view]);
    }
    setPreviews(prev => ({ ...prev, [view]: null }));
  };

  // Submit multi-view
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Silakan login terlebih dahulu.");
      return;
    }

    // Filter yang sudah diupload
    // eslint-disable-next-line no-unused-vars
    const uploadedImages = Object.entries(images).filter(([_, file]) => file !== null);


    if (uploadedImages.length === 0) {
      setError("Upload minimal 1 foto (FRONT, SIDE, atau BACK)");
      return;
    }

    const formData = new FormData();
    
    uploadedImages.forEach(([type, file], index) => {
      formData.append(`images[${index}][type]`, type);
      formData.append(`images[${index}][image]`, file);
    });

    try {
      setLoading(true);

      const res = await fetch(
        `http://kidposture-api.test/api/children/${childId}/screenings`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.message || "Gagal membuat screening");
      }

      // Redirect ke hasil
      if (body.id) {
        navigate(`/screenings/${body.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const videoConstraints = {
    facingMode: "environment",
  };

  const uploadedCount = Object.values(images).filter(img => img !== null).length;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 16 }}>
      {/* Header */}
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

      <h2 style={{ marginBottom: 8 }}>📸 Screening Postur Baru</h2>
      <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
        Upload <strong>1-3 foto</strong> (FRONT, SIDE, BACK). Semakin banyak foto, analisis semakin akurat!
      </p>

      {/* Info Badge */}
      <div style={{
        padding: 12,
        background: uploadedCount === 3 ? "#dcfce7" : "#fef3c7",
        borderRadius: 8,
        marginBottom: 16,
        border: `1px solid ${uploadedCount === 3 ? "#16a34a" : "#f59e0b"}`,
      }}>
        <p style={{ margin: 0, fontSize: 14, color: uploadedCount === 3 ? "#166534" : "#92400e" }}>
          {uploadedCount === 0 && "⚠️ Belum ada foto diupload"}
          {uploadedCount === 1 && "✅ 1 foto terupload (opsional: tambah SIDE/BACK)"}
          {uploadedCount === 2 && "✅ 2 foto terupload (opsional: tambah 1 lagi)"}
          {uploadedCount === 3 && "🎉 Lengkap! 3 foto terupload (analisis maksimal)"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Toggle Camera / Upload */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setUseCamera(false)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 8,
                border: useCamera ? "1px solid #e5e7eb" : "1px solid #2563eb",
                background: useCamera ? "white" : "#eff6ff",
                color: useCamera ? "#374151" : "#1d4ed8",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              📁 Upload File
            </button>
            <button
              type="button"
              onClick={() => setUseCamera(true)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 8,
                border: useCamera ? "1px solid #16a34a" : "1px solid #e5e7eb",
                background: useCamera ? "#dcfce7" : "white",
                color: useCamera ? "#166534" : "#374151",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              📷 Gunakan Kamera
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["FRONT", "SIDE", "BACK"].map(view => (
            <button
              key={view}
              type="button"
              onClick={() => setActiveView(view)}
              style={{
                flex: 1,
                padding: "12px",
                background: activeView === view 
                  ? (images[view] ? "#10b981" : "#3b82f6") 
                  : (images[view] ? "#d1fae5" : "#f3f4f6"),
                color: activeView === view 
                  ? "white" 
                  : (images[view] ? "#065f46" : "#6b7280"),
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {view}
              {images[view] && " ✅"}
            </button>
          ))}
        </div>

        {/* Upload Section */}
        <div style={{ 
          background: "#f9fafb", 
          padding: 16, 
          borderRadius: 12, 
          border: "2px dashed #d1d5db",
          marginBottom: 16 
        }}>
          <h4 style={{ marginTop: 0, marginBottom: 12, color: "#374151" }}>
            Upload untuk: <strong>{activeView}</strong>
          </h4>

          {useCamera ? (
            <div>
              <div style={{
                borderRadius: 8,
                overflow: "hidden",
                marginBottom: 12,
                border: "1px solid #d1d5db",
              }}>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  style={{ width: "100%", display: "block" }}
                />
              </div>
              <button
                type="button"
                onClick={handleCaptureFromCamera}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#10b981",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📸 Capture {activeView}
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, activeView)}
                style={{ 
                  display: "block", 
                  marginBottom: 8,
                  width: "100%",
                  padding: 8,
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                }}
              />
              {images[activeView] && (
                <p style={{ fontSize: 13, color: "#10b981", margin: 0 }}>
                  ✅ {images[activeView].name}
                </p>
              )}
            </div>
          )}

          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8, marginBottom: 0 }}>
            💡 Pastikan seluruh tubuh anak terlihat jelas
          </p>
        </div>

        {/* Preview Grid */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ marginBottom: 12 }}>Preview Foto:</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {Object.entries(previews).map(([view, url]) => (
              <div key={view} style={{ position: "relative" }}>
                <div style={{
  width: "100%",
  height: 150,
  backgroundColor: url ? "transparent" : "#e5e7eb",  // ✅ Gunakan backgroundColor
  backgroundImage: url ? `url(${url})` : "none",     // ✅ Gunakan backgroundImage
  backgroundSize: "cover",
  backgroundPosition: "center",
  borderRadius: 8,
  border: "2px solid " + (url ? "#10b981" : "#d1d5db"),
}} />

                <p style={{ 
                  textAlign: "center", 
                  fontSize: 12, 
                  marginTop: 6,
                  color: url ? "#10b981" : "#9ca3af",
                  fontWeight: 600,
                }}>
                  {view}
                </p>
                {url && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(view)}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: "none",
                      background: "#ef4444",
                      color: "white",
                      fontSize: 12,
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p style={{ 
            color: "#dc2626", 
            background: "#fee2e2", 
            padding: 12, 
            borderRadius: 8,
            fontSize: 14,
            marginBottom: 16,
          }}>
            ⚠️ {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || uploadedCount === 0}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 8,
            border: "none",
            background: (loading || uploadedCount === 0) ? "#d1d5db" : "#3b82f6",
            color: "white",
            fontSize: 16,
            fontWeight: 600,
            cursor: (loading || uploadedCount === 0) ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "🔄 Menganalisis..." : `🚀 Analisis ${uploadedCount} Foto`}
        </button>

        <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", marginTop: 12 }}>
          {uploadedCount === 1 && "1 foto akan dianalisis"}
          {uploadedCount === 2 && "2 foto akan dianalisis (rata-rata score)"}
          {uploadedCount === 3 && "3 foto akan dianalisis (rata-rata score maksimal akurat!)"}
        </p>
      </form>
    </div>
  );
}

export default NewScreeningPage;
