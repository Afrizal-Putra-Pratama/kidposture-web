// src/pages/physio/PhysiotherapistDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import physioService from '../../services/physioService';

export default function PhysiotherapistDetail() {
  const { id } = useParams();
  const [physio, setPhysio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchPhysio();
  }, [id]);

  const fetchPhysio = async () => {
    try {
      const data = await physioService.getById(id);
      setPhysio(data);
    } catch (error) {
      console.error('Error fetching physio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        Memuat profil...
      </div>
    );
  }

  if (!physio) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">
        Fisioterapis tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/physios"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        ← Kembali ke Direktori
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white">
          <div className="flex items-center gap-6">
            {physio.photo_url ? (
              <img
                src={physio.photo_url}
                alt={physio.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-6xl font-bold text-blue-600">
                {physio.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">{physio.name}</h1>
              <p className="text-blue-100 text-lg">
                {physio.specialty || 'Fisioterapi Umum'}
              </p>
              <p className="text-blue-100">
                {physio.experience_years} tahun pengalaman
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Bio */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Tentang
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {physio.bio_short || 'Belum ada deskripsi.'}
            </p>
          </div>

          {/* Info Klinik */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Informasi Klinik
            </h2>
            <div className="space-y-2 text-gray-700">
              <p>🏥 <strong>Klinik:</strong> {physio.clinic_name || '-'}</p>
              <p>📍 <strong>Lokasi:</strong> {physio.city || '-'}</p>
              <p>📞 <strong>Telepon:</strong> {physio.phone || '-'}</p>
              <p>✉️ <strong>Email:</strong> {physio.email || '-'}</p>
            </div>
          </div>

          {/* CTA Booking (nanti aktif setelah fitur booking) */}
          <div className="mt-8">
            <button
              disabled
              className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
            >
              Booking Konsultasi (Segera Hadir)
            </button>
            <p className="text-center text-sm text-gray-500 mt-2">
              Fitur booking akan segera tersedia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
