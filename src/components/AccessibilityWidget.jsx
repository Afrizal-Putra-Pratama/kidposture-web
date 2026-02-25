import { useState, useEffect } from 'react';
import { Accessibility, Moon, Link2, Palette, X } from 'lucide-react';
import '../styles/AccessibilityWidget.css';

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    invertColors: false,
    highlightLinks: false,
    desaturate: false,
  });

  // ✅ FIX: Load settings SAAT MOUNT (no cascading)
  useEffect(() => {
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      } catch (e) {
        console.error('Failed to load accessibility settings');
      }
    }
  }, []); // ✅ Empty deps = run once

  // ✅ FIX: Apply settings ke HTML root (bukan body)
  useEffect(() => {
    const html = document.documentElement;

    // Apply CSS filters
    const filters = [];
    if (settings.invertColors) filters.push('invert(1) hue-rotate(180deg)');
    if (settings.desaturate) filters.push('grayscale(1)');

    html.style.filter = filters.join(' ');

    // Apply highlight links
    if (settings.highlightLinks) {
      html.classList.add('accessibility-highlight-links');
    } else {
      html.classList.remove('accessibility-highlight-links');
    }

    // Save to localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  // ✅ FIX: HANYA 1 yang bisa aktif (radio behavior)
  const toggleSetting = (key) => {
    setSettings({
      invertColors: false,
      highlightLinks: false,
      desaturate: false,
      [key]: true, // Hanya yang diklik jadi true
    });
  };

  // Reset semua
  const resetSettings = () => {
    setSettings({
      invertColors: false,
      highlightLinks: false,
      desaturate: false,
    });
  };

  const hasActiveSettings = Object.values(settings).some((v) => v === true);

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`accessibility-toggle ${hasActiveSettings ? 'accessibility-toggle--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility Options"
        title="Opsi Aksesibilitas"
      >
        <Accessibility size={24} strokeWidth={2} />
      </button>

      {/* Widget Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="accessibility-backdrop"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="accessibility-panel">
            <div className="accessibility-header">
              <h3>Opsi Aksesibilitas</h3>
              <button
                className="accessibility-close"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className="accessibility-options">
              {/* Invert Colors */}
              <button
                className={`accessibility-option ${
                  settings.invertColors ? 'active' : ''
                }`}
                onClick={() => toggleSetting('invertColors')}
              >
                <div className="accessibility-option-icon">
                  <Moon size={20} strokeWidth={2} />
                </div>
                <div className="accessibility-option-content">
                  <span className="accessibility-option-title">Invert Colors</span>
                  <span className="accessibility-option-desc">
                    Mode negatif seperti film analog
                  </span>
                </div>
              </button>

              {/* Highlight Links */}
              <button
                className={`accessibility-option ${
                  settings.highlightLinks ? 'active' : ''
                }`}
                onClick={() => toggleSetting('highlightLinks')}
              >
                <div className="accessibility-option-icon">
                  <Link2 size={20} strokeWidth={2} />
                </div>
                <div className="accessibility-option-content">
                  <span className="accessibility-option-title">
                    Highlight Links
                  </span>
                  <span className="accessibility-option-desc">
                    Tampilkan semua link dengan jelas
                  </span>
                </div>
              </button>

              {/* Desaturate */}
              <button
                className={`accessibility-option ${
                  settings.desaturate ? 'active' : ''
                }`}
                onClick={() => toggleSetting('desaturate')}
              >
                <div className="accessibility-option-icon">
                  <Palette size={20} strokeWidth={2} />
                </div>
                <div className="accessibility-option-content">
                  <span className="accessibility-option-title">
                    Desaturate
                  </span>
                  <span className="accessibility-option-desc">
                    Hilangkan warna (grayscale)
                  </span>
                </div>
              </button>

              {/* Reset Button */}
              {hasActiveSettings && (
                <button
                  className="accessibility-reset"
                  onClick={resetSettings}
                >
                  Reset ke Normal
                </button>
              )}
            </div>

            <p className="accessibility-footer-note">
              Hanya 1 opsi dapat aktif • Pengaturan tersimpan otomatis
            </p>
          </div>
        </>
      )}
    </>
  );
}
