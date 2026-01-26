import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import physioService from '../../services/physioService';

export default function PhysiotherapistList() {
  const [physios, setPhysios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', specialty: '' });

  useEffect(() => {
    fetchPhysios();
  }, []);

  const fetchPhysios = async () => {
    setLoading(true);
    try {
      const data = await physioService.getAll(filters);
      setPhysios(data);
    } catch (error) {
      console.error('Error fetching physios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchPhysios();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Direktori Fisioterapis Anak
      </h1>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-4">
        <input
          type="text"
          name="city"
          placeholder="Cari berdasarkan kota..."
          value={filters.city}
          onChange={handleFilterChange}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="specialty"
          placeholder="Spesialisasi..."
          value={filters.specialty}
          onChange={handleFilterChange}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Cari
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12">Memuat...</div>
      ) : physios.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Tidak ada fisioterapis ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {physios.map((physio) => (
            <div
              key={physio.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {/* Avatar */}
              <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                {physio.photo_url ? (
                  <img
                    src={physio.photo_url}
                    alt={physio.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-blue-600">
                    {physio.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {physio.name}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  📍 {physio.city || 'Lokasi tidak tersedia'}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  🏥 {physio.clinic_name || '-'}
                </p>
                <p className="text-sm text-blue-600 font-medium mb-3">
                  {physio.specialty || 'Fisioterapi Umum'}
                </p>

                <Link
                  to={`/physios/${physio.id}`}
                  className="block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Lihat Profil
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
