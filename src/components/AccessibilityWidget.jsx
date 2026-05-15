import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Accessibility, Moon, Link2, Palette, X, RotateCcw } from 'lucide-react';

export default function AccessibilityWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    invertColors: false,
    highlightLinks: false,
    desaturate: false,
  });

  // Menyembunyikan widget jika berada di halaman chat atau dashboard (parent & physio)
  const hideWidget = location.pathname.includes('/chat') || location.pathname.includes('/dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings(parsed);
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        console.error('Failed to load accessibility settings');
      }
    }
  }, []);

  // Terapkan filter ke elemen HTML
  useEffect(() => {
    const html = document.documentElement;
    const filters = [];
    
    if (settings.invertColors) filters.push('invert(1) hue-rotate(180deg)');
    if (settings.desaturate) filters.push('grayscale(1)');

    html.style.filter = filters.join(' ');
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  const toggleSetting = (key) => {
    setSettings({
      invertColors: false,
      highlightLinks: false,
      desaturate: false,
      [key]: true,
    });
  };

  const resetSettings = () => {
    setSettings({
      invertColors: false,
      highlightLinks: false,
      desaturate: false,
    });
  };

  // Jangan render apapun jika di halaman yang dilarang
  if (hideWidget) {
    return null;
  }

  const hasActiveSettings = Object.values(settings).some((v) => v === true);

  return (
    <>
      {/* Inject Style Khusus untuk Highlight Links agar tidak butuh file CSS */}
      {settings.highlightLinks && (
        <style>{`
          a, button {
            text-decoration: underline !important;
            text-decoration-thickness: 2px !important;
            text-underline-offset: 4px !important;
            outline: 2px dashed #fbbf24 !important;
            outline-offset: 2px !important;
          }
        `}</style>
      )}

      {/* Trigger Button (Pojok Kanan Bawah) - DIBUAT SANGAT TERLIHAT */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[100] p-4 rounded-full shadow-2xl transition-all duration-300 active:scale-95 flex items-center justify-center ${
          hasActiveSettings 
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/40' 
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/40'
        }`}
        aria-label="Opsi Aksesibilitas"
        title="Aksesibilitas"
      >
        <Accessibility size={26} strokeWidth={2.5} />
        
        {/* Titik Merah Animasi (Berdenyut jika aktif) */}
        {hasActiveSettings && (
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Panel & Backdrop */}
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <div 
            className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Main Panel */}
          <div className="fixed bottom-24 right-6 sm:right-6 z-[120] w-[calc(100vw-3rem)] max-w-[340px] bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 flex flex-col gap-5 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Accessibility size={20} className="text-blue-600" /> Aksesibilitas
              </h3>
              <button
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <OptionButton 
                icon={Moon} 
                title="Invert Colors" 
                desc="Mode negatif kontras tinggi" 
                active={settings.invertColors} 
                onClick={() => toggleSetting('invertColors')} 
              />
              <OptionButton 
                icon={Link2} 
                title="Highlight Links" 
                desc="Tandai semua link & tombol" 
                active={settings.highlightLinks} 
                onClick={() => toggleSetting('highlightLinks')} 
              />
              <OptionButton 
                icon={Palette} 
                title="Desaturate" 
                desc="Hilangkan warna (Grayscale)" 
                active={settings.desaturate} 
                onClick={() => toggleSetting('desaturate')} 
              />

              {hasActiveSettings && (
                <button
                  className="mt-3 w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  onClick={resetSettings}
                >
                  <RotateCcw size={16} strokeWidth={2.5} /> Reset ke Normal
                </button>
              )}
            </div>

            <p className="text-[10px] text-center font-medium text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-50">
              Hanya 1 opsi dapat aktif
            </p>
          </div>
        </>
      )}
    </>
  );
}

// Komponen Pembantu untuk Tombol Opsi
// eslint-disable-next-line no-unused-vars
function OptionButton({ icon: Icon, title, desc, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left active:scale-[0.98] ${
        active 
          ? 'bg-blue-50 border-blue-200 shadow-sm' 
          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
        active ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'
      }`}>
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      </div>
      <div className="flex-1 min-w-0 mt-0.5">
        <h4 className={`text-sm font-bold mb-0.5 ${active ? 'text-blue-900' : 'text-slate-800'}`}>{title}</h4>
        <p className={`text-[11px] leading-relaxed ${active ? 'text-blue-700' : 'text-slate-500'}`}>{desc}</p>
      </div>
    </button>
  );
}