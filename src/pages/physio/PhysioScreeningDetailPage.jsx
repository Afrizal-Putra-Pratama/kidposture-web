import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchScreeningDetail,
  createManualRecommendation,
} from "../../services/screeningService.jsx";

function PhysioScreeningDetailPage() {
  const { screeningId } = useParams();
  const [screening, setScreening] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formType, setFormType] = useState("note");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formMedia, setFormMedia] = useState("");

  useEffect(() => {
    if (!screeningId) return;

    const load = async () => {
      try {
        setLoading(true);
        const json = await fetchScreeningDetail(screeningId);
        setScreening(json.data ?? json);
      } catch (err) {
        console.error("Error loading screening detail:", err);
        alert("Gagal memuat detail screening");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [screeningId]); // eslint bisa kasih warning, tapi aman secara runtime

  const handleSubmitRecommendation = async (e) => {
    e.preventDefault();
    try {
      await createManualRecommendation(screeningId, {
        type: formType,
        title: formTitle,
        content: formContent,
        media_url: formMedia || null,
      });
      alert("Rekomendasi berhasil disimpan");

      // reload data setelah simpan
      const json = await fetchScreeningDetail(screeningId);
      setScreening(json.data ?? json);

      setFormType("note");
      setFormTitle("");
      setFormContent("");
      setFormMedia("");
    } catch (err) {
      console.error("Error saving recommendation:", err);
      alert("Gagal menyimpan rekomendasi");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!screening) return <p>Data tidak ditemukan</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Detail Screening - {screening.child?.name}</h2>
      <p>
        Skor: {screening.score} | Kategori:{" "}
        <strong>{screening.category}</strong>
      </p>
      <p>
        Tanggal:{" "}
        {screening.created_at
          ? new Date(screening.created_at).toLocaleDateString("id-ID")
          : "-"}
      </p>

      <hr />

      <h3>Hasil Analisis Gambar</h3>
      {screening.images?.map((img) => (
        <div
          key={img.id}
          style={{
            marginBottom: "20px",
            border: "1px solid #ddd",
            padding: "10px",
          }}
        >
          <h4>{img.type}</h4>
          <img
            src={img.url_processed || img.url_original}
            alt={img.type}
            style={{ maxWidth: "300px" }}
          />
          {img.recommendations && img.recommendations.length > 0 && (
            <ul>
              {img.recommendations.map((rec, idx) => (
                <li key={idx}>
                  <strong>{rec.issue}</strong>: {rec.exercise}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <hr />

      <h3>Rekomendasi Fisioterapis</h3>
      {screening.manualRecommendations &&
      screening.manualRecommendations.length > 0 ? (
        <ul>
          {screening.manualRecommendations.map((rec) => (
            <li key={rec.id}>
              <strong>{rec.title}</strong> <em>({rec.type})</em>
              <br />
              {rec.content}
              <br />
              <small>
                oleh {rec.physio?.name || "Fisioterapis"} pada{" "}
                {rec.created_at
                  ? new Date(rec.created_at).toLocaleDateString("id-ID")
                  : "-"}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p>Belum ada rekomendasi dari fisioterapis.</p>
      )}

      <hr />

      <h3>Tambah Rekomendasi Manual</h3>
      <form onSubmit={handleSubmitRecommendation} style={{ maxWidth: "600px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label>Tipe:</label>
          <br />
          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
          >
            <option value="note">Catatan</option>
            <option value="exercise">Latihan</option>
            <option value="education">Edukasi</option>
            <option value="referral">Rujukan</option>
          </select>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Judul:</label>
          <br />
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Isi Rekomendasi:</label>
          <br />
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            required
            rows={5}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Link Video/Gambar (opsional):</label>
          <br />
          <input
            type="url"
            value={formMedia}
            onChange={(e) => setFormMedia(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#28a745",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Simpan Rekomendasi
        </button>
      </form>
    </div>
  );
}

export default PhysioScreeningDetailPage;
