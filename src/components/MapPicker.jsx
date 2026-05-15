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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      return 'Belum ada lokasi yang dipilih';
    }
    
    const lat = parseFloat(position[0]);
    const lng = parseFloat(position[1]);
    
    if (isNaN(lat) || isNaN(lng)) {
      return 'Koordinat tidak valid';
    }
    
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* HEADER & LABEL */}
      <div className="flex items-center justify-between relative">
        {label && (
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        
        {/* Tooltip Wrapper */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors active:scale-95"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={(e) => {
              e.preventDefault();
              setShowTooltip(!showTooltip);
            }}
          >
            <Info size={14} strokeWidth={2.5} />
            <span>Panduan Peta</span>
          </button>

          {showTooltip && (
            <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-slate-900 text-white p-4 rounded-xl shadow-xl z-[60] animate-in fade-in zoom-in-95 pointer-events-none">
              <h4 className="font-bold text-sm mb-2 text-blue-300">Cara Memilih Lokasi</h4>
              <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-300 mb-3 leading-relaxed">
                <li>Klik tombol <strong>Buka Peta</strong> di bawah.</li>
                <li>Gunakan <em>scroll</em> atau cubit layar untuk <em>zoom in/out</em> peta.</li>
                <li>Geser peta untuk mencari area tempat praktik Anda.</li>
                <li>Klik tepat pada titik lokasi klinik untuk memasang Pin.</li>
              </ol>
              <p className="text-[10px] text-slate-400 bg-slate-800 p-2 rounded-lg leading-relaxed">
                <strong className="text-amber-400">Tips:</strong> Lakukan zoom hingga nama jalan terlihat untuk mendapatkan akurasi maksimal.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* COORDINATE DISPLAY */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
          <MapPin size={16} strokeWidth={2.5} />
        </div>
        <span className="truncate">{formatCoordinates()}</span>
      </div>

      {/* TOGGLE BUTTON */}
      <button
        type="button"
        onClick={handleToggleMap}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-blue-300 rounded-xl text-sm font-bold text-slate-700 transition-all active:scale-[0.98] shadow-sm"
      >
        <div className="flex items-center gap-2">
          <MapPin size={18} className={isMapExpanded ? "text-blue-600" : "text-slate-400"} />
          <span>{isMapExpanded ? 'Tutup Peta' : 'Buka Peta untuk Memilih Lokasi'}</span>
        </div>
        {isMapExpanded ? (
          <ChevronUp size={18} className="text-slate-400" />
        ) : (
          <ChevronDown size={18} className="text-slate-400" />
        )}
      </button>

      {/* MAP CONTAINER */}
      {isMapExpanded && (
        <div className="relative w-full h-[300px] sm:h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0 animate-in slide-in-from-top-2">
          <MapContainer
            center={mapCenter}
            zoom={position ? 15 : 12}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker
              position={position}
              onPositionChange={handlePositionChange}
            />
            <MapController mapRef={mapRef} />
          </MapContainer>
          
          {/* Instruction Overlay */}
          <div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg pointer-events-none" 
            style={{ zIndex: 400 }}
          >
            <MapPin size={14} className="text-blue-400" />
            <span>Klik pada peta untuk pasang pin lokasi</span>
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