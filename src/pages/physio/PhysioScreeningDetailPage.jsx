import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/axios.js';

function PhysioScreeningDetailPage() {
  const { screeningId } = useParams();
  const [screening, setScreening] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state untuk rekomendasi baru
  const [formType, setFormType] = useState('note');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formMedia, setFormMedia] = useState('');

  useEffect(() => {
    if (!screeningId) return; // jangan call API kalau belum ada param
    loadScreeningDetail();
  }, [screeningId]);

  const loadScreeningDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/screenings/${screeningId}`);
      // backend: { success: true, data: {...} }
      setScreening(res.data.data);
    } catch (err) {
      console.error('Error loading screening detail:', err);
      alert('Gagal memuat detail screening');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRecommendation = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/screenings/${screeningId}/recommendations`, {
        type: formType,
        title: formTitle,
        content: formContent,
        media_url: formMedia || null,
      });
      alert('Rekomendasi berhasil disimpan');
      // Reload data
      loadScreeningDetail();
      // Reset form
      setFormType('note');
      setFormTitle('');
      setFormContent('');
      setFormMedia('');
    } catch (err) {
      console.error('Error saving recommendation:', err);
      alert('Gagal menyimpan rekomendasi');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!screening) return <p>Data tidak ditemukan</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Detail Screening - {screening.child?.name}</h2>
      <p>
        Skor: {screening.score} | Kategori:{' '}
        <strong>{screening.category}</strong>
      </p>
      <p>
        Tanggal:{' '}
        {screening.created_at
          ? new Date(screening.created_at).toLocaleDateString('id-ID')
          : '-'}
      </p>

      <hr />

      {/* Tampilan gambar & rekomendasi otomatis */}
      <h3>Hasil Analisis Gambar</h3>
      {screening.images?.map((img) => (
        <div
          key={img.id}
          style={{
            marginBottom: '20px',
            border: '1px solid #ddd',
            padding: '10px',
          }}
        >
          <h4>{img.type}</h4>
          {/* backend show() sudah memberi url_original & url_processed */}
          <img
            src={img.url_processed || img.url_original}
            alt={img.type}
            style={{ maxWidth: '300px' }}
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

      {/* Rekomendasi manual dari fisioterapis */}
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
                oleh {rec.physio?.name || 'Fisioterapis'} pada{' '}
                {rec.created_at
                  ? new Date(rec.created_at).toLocaleDateString('id-ID')
                  : '-'}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p>Belum ada rekomendasi dari fisioterapis.</p>
      )}

      <hr />

      {/* Form tambah rekomendasi (hanya untuk fisio) */}
      <h3>Tambah Rekomendasi Manual</h3>
      <form onSubmit={handleSubmitRecommendation} style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '10px' }}>
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
        <div style={{ marginBottom: '10px' }}>
          <label>Judul:</label>
          <br />
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Isi Rekomendasi:</label>
          <br />
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            required
            rows={5}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Link Video/Gambar (opsional):</label>
          <br />
          <input
            type="url"
            value={formMedia}
            onChange={(e) => setFormMedia(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            background: '#28a745',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Simpan Rekomendasi
        </button>
      </form>
    </div>
  );
}

export default PhysioScreeningDetailPage;
