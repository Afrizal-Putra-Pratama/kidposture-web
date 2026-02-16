import { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Info, ChevronDown, ChevronUp } from 'lucide-react';
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

function MapController({ mapRef }) {
  const map = useMapEvents({});
  
  useEffect(() => {
    if (map && mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);

  return null;
}

MapController.propTypes = {
  mapRef: PropTypes.object.isRequired,
};

export default function MapPicker({ value, onChange, label }) {
  const mapRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [position, setPosition] = useState(null);
  
  // Initialize position from value prop
  useEffect(() => {
    if (!value) {
      setPosition((prev) => prev === null ? prev : null);
      return;
    }
    
    let lat, lng;
    
    if (Array.isArray(value)) {
      lat = parseFloat(value[0]);
      lng = parseFloat(value[1]);
    } else if (typeof value === 'object' && value.lat && value.lng) {
      lat = parseFloat(value.lat);
      lng = parseFloat(value.lng);
    }
    
    if (!isNaN(lat) && !isNaN(lng)) {
      const newPos = [lat, lng];
      setPosition((prev) => {
        if (!prev) return newPos;
        if (prev[0] === newPos[0] && prev[1] === newPos[1]) return prev;
        return newPos;
      });
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

  // Toggle map
  const handleToggleMap = () => {
    setIsMapExpanded((prev) => {
      const newState = !prev;
      
      if (newState && mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 100);
      }
      
      return newState;
    });
  };

  const defaultCenter = [-7.5505, 110.8282];
  const mapCenter = position || defaultCenter;

  const formatCoordinates = () => {
    if (!position || !Array.isArray(position)) {
      return 'Belum ada lokasi dipilih';
    }
    
    const lat = parseFloat(position[0]);
    const lng = parseFloat(position[1]);
    
    if (isNaN(lat) || isNaN(lng)) {
      return 'Koordinat tidak valid';
    }
    
    return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
  };

  return (
    <div className="map-picker">
      {/* HEADER */}
      <div className="map-picker-header">
        <div className="map-picker-label-group">
          {label && <label className="map-picker-label">{label}</label>}
          
          {/* Tooltip */}
          <div className="map-picker-tooltip-wrapper">
            <button
              type="button"
              className="map-picker-tooltip-trigger"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={(e) => {
                e.preventDefault();
                setShowTooltip(!showTooltip);
              }}
            >
              <Info size={16} strokeWidth={2} />
              <span>Lihat Panduan</span>
            </button>

            {showTooltip && (
              <div className="map-picker-tooltip">
                <div className="map-picker-tooltip-content">
                  <h4>Cara Menentukan Lokasi Klinik</h4>
                  <ol>
                    <li>Klik tombol &quot;Buka Peta&quot; di bawah untuk membuka tampilan peta</li>
                    <li>Gunakan scroll mouse untuk zoom in/out peta</li>
                    <li>Drag peta untuk navigasi ke area klinik Anda</li>
                    <li>Klik langsung pada titik lokasi klinik di peta</li>
                  </ol>
                  <p className="map-picker-tooltip-note">
                    <strong>Tips:</strong> Zoom hingga level jalan untuk akurasi maksimal. Koordinat akan otomatis tersimpan setelah diklik.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COORDINATE DISPLAY */}
      <div className="map-picker-coordinates-box">
        <MapPin size={16} strokeWidth={2} />
        <span>{formatCoordinates()}</span>
      </div>

      {/* TOGGLE BUTTON */}
      <button
        type="button"
        onClick={handleToggleMap}
        className="map-picker-toggle-btn"
      >
        <MapPin size={18} strokeWidth={2} />
        <span>{isMapExpanded ? 'Tutup Peta' : 'Buka Peta untuk Memilih Lokasi'}</span>
        {isMapExpanded ? (
          <ChevronUp size={18} strokeWidth={2} />
        ) : (
          <ChevronDown size={18} strokeWidth={2} />
        )}
      </button>

      {/* MAP CONTAINER */}
      {isMapExpanded && (
        <div className="map-picker-container">
          <MapContainer
            center={mapCenter}
            zoom={position ? 15 : 12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <LocationMarker
              position={position}
              onPositionChange={handlePositionChange}
            />
            <MapController mapRef={mapRef} />
          </MapContainer>
          
          {/* Instruction Overlay */}
          <div className="map-picker-instruction">
            <MapPin size={14} strokeWidth={2} />
            <span>Klik pada peta untuk menentukan lokasi klinik</span>
          </div>
        </div>
      )}
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
