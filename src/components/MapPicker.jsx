import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function LocationMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      onPositionChange(newPosition);
    },
  });

  return position ? <Marker position={position} /> : null;
}

LocationMarker.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  onPositionChange: PropTypes.func.isRequired,
};

export default function MapPicker({ value, onChange, label }) {
  // Validasi dan normalize initial position
  const getInitialPosition = () => {
    if (!value) return null;
    
    // Jika value adalah array
    if (Array.isArray(value)) {
      const lat = parseFloat(value[0]);
      const lng = parseFloat(value[1]);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
    
    // Jika value adalah object dengan lat/lng
    if (typeof value === 'object' && value.lat && value.lng) {
      const lat = parseFloat(value.lat);
      const lng = parseFloat(value.lng);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
    
    return null;
  };

  const [position, setPosition] = useState(getInitialPosition);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Update position when value prop changes
  useEffect(() => {
    const newPosition = getInitialPosition();
    if (newPosition) {
      setPosition(newPosition);
    }
  }, [value]);

  const handlePositionChange = useCallback(
    (newPosition) => {
      setPosition(newPosition);
      if (onChange) {
        onChange(newPosition);
      }
    },
    [onChange]
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPosition = [parseFloat(lat), parseFloat(lon)];
        handlePositionChange(newPosition);
      } else {
        alert('Lokasi tidak ditemukan. Coba kata kunci lain.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Gagal mencari lokasi. Silakan coba lagi.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Default center (Indonesia)
  const defaultCenter = [-2.5489, 118.0149];
  const mapCenter = position || defaultCenter;

  // Format koordinat untuk ditampilkan
  const formatCoordinates = () => {
    if (!position || !Array.isArray(position)) return 'Klik pada peta untuk memilih lokasi';
    
    const lat = parseFloat(position[0]);
    const lng = parseFloat(position[1]);
    
    if (isNaN(lat) || isNaN(lng)) return 'Koordinat tidak valid';
    
    return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
  };

  return (
    <div className="map-picker">
      {label && <label className="map-picker-label">{label}</label>}

      {/* Search Box */}
      <div className="map-picker-search">
        <input
          type="text"
          placeholder="Cari lokasi (contoh: Jakarta, Indonesia)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="map-picker-search-input"
          disabled={isSearching}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="map-picker-search-btn"
        >
          {isSearching ? 'Mencari...' : 'Cari'}
        </button>
      </div>

      {/* Map Container */}
      <div className="map-picker-container">
        <MapContainer
          center={mapCenter}
          zoom={position ? 13 : 5}
          style={{ height: '100%', width: '100%' }}
          key={`${mapCenter[0]}-${mapCenter[1]}`}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <LocationMarker
            position={position}
            onPositionChange={handlePositionChange}
          />
        </MapContainer>
      </div>

      {/* Coordinate Display */}
      <div className="map-picker-info">
        <p className="map-picker-coordinates">{formatCoordinates()}</p>
        <p className="map-picker-hint">
          Klik pada peta untuk memilih lokasi atau gunakan pencarian di atas
        </p>
      </div>
    </div>
  );
}

MapPicker.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.shape({
      lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      lng: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  ]),
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
};

MapPicker.defaultProps = {
  value: null,
  label: '',
};
