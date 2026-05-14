import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Upload, Camera, Check, AlertCircle, Image as ImageIcon,
  Sparkles, Trash2, X, LayoutDashboard, MessageCircle, BookOpen,
  User, LogOut, Bell, Menu
} from "lucide-react";
import Webcam from "react-webcam";
import { createScreening } from "../services/screeningService.jsx";
import { logout, getCurrentUser } from "../services/authService.jsx";
import { useNotifications } from "../hooks/useNotification.jsx";

const VIEW_LABELS = {
  FRONT: "Depan",
  SIDE: "Samping",
  BACK: "Belakang",
};

const ORDER = ["FRONT", "SIDE", "BACK"];

export default function NewScreeningPage() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  // User & Dashboard States
  const [user, setUser] = useState(null);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // Screening States
  const [images, setImages] = useState({ FRONT: null, SIDE: null, BACK: null });
  const [previews, setPreviews] = useState({ FRONT: null, SIDE: null, BACK: null });
  const [activeView, setActiveView] = useState("FRONT");
  const [useCamera, setUseCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Lightbox Modal State
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getCurrentUser());
    return () => {
      // Cleanup Object URLs to avoid memory leaks
      Object.values(previews).forEach((url) => {
        if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  // Auto-switch to next empty view after taking a photo
  useEffect(() => {
    if (loading) return;
    const firstEmptyView = ORDER.find((view) => images[view] === null);
    if (images[activeView] !== null && firstEmptyView && activeView !== firstEmptyView) {
      const timeout = setTimeout(() => setActiveView(firstEmptyView), 350);
      return () => clearTimeout(timeout);
    }
  }, [images, activeView, loading]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) markAsRead(notif.id);
    if (notif.screening_id) {
      navigate(`/screenings/${notif.screening_id}`);
      setNotifOpen(false);
    }
  };

  // --- Image Handlers ---
  const handleFileUpload = (e, view) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImages((prev) => ({ ...prev, [view]: file }));
    const url = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [view]: url }));
    setError(null);
  };

  const handleCaptureFromCamera = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError("Gagal mengambil gambar dari kamera.");
      return;
    }
    
    // Convert base64 to File
    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], `${activeView.toLowerCase()}_capture.jpg`, { type: mimeString });
    
    setImages((prev) => ({ ...prev, [activeView]: file }));
    setPreviews((prev) => ({ ...prev, [activeView]: imageSrc }));
    setError(null);
    setUseCamera(false);
  };

  const handleRemoveImage = (view) => {
    setImages((prev) => ({ ...prev, [view]: null }));
    if (previews[view] && previews[view].startsWith("blob:")) URL.revokeObjectURL(previews[view]);
    setPreviews((prev) => ({ ...prev, [view]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const uploadedImages = Object.entries(images).filter(([, file]) => file !== null);
    if (uploadedImages.length === 0) {
      setError("Upload minimal 1 foto (Depan, Samping, atau Belakang)");
      return;
    }
    
    const formData = new FormData();
    uploadedImages.forEach(([type, file], index) => {
      formData.append(`images[${index}][type]`, type);
      formData.append(`images[${index}][image]`, file);
    });
    
    try {
      setLoading(true);
      const data = await createScreening(childId, formData);
      if (data.id) navigate(`/screenings/${data.id}`);
      else if (data.data?.id) navigate(`/screenings/${data.data.id}`);
      else navigate(`/children/${childId}/screenings`);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.response?.data?.message || err.message || "Gagal membuat screening. Pastikan koneksi stabil.");
      setLoading(false);
    }
  };

  const videoConstraints = { facingMode: "environment" }; // Gunakan kamera belakang untuk HP
  const uploadedCount = Object.values(images).filter((img) => img !== null).length;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden relative">
      
      {/* === STYLE ANIMASI AI SCANNER (INJECT CSS) === */}
      <style>{`
        @keyframes scan-laser {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .ai-scanner-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #3b82f6, #60a5fa, #3b82f6, transparent);
          box-shadow: 0 0 15px #3b82f6, 0 0 5px #60a5fa;
          animation: scan-laser 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 20;
        }
      `}</style>

      {/* === KAMERA FULLSCREEN OVERLAY (ALL DEVICES) === */}
      {useCamera && (
        <div className="fixed inset-0 z-[120] bg-black flex flex-col items-center justify-center animate-in fade-in duration-200">
          <button 
            onClick={() => setUseCamera(false)} 
            className="absolute top-6 right-6 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors z-50"
          >
            <X size={24} />
          </button>
          
          <div className="relative w-full max-w-3xl h-full max-h-[85vh] flex items-center justify-center overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-contain"
            />
            {/* Outline Guideline (Siluet) */}
            <div className="absolute inset-0 pointer-events-none border-[3px] border-white/20 border-dashed m-10 rounded-2xl flex items-center justify-center">
               <div className="text-white/40 opacity-50"><User size={120} strokeWidth={1} /></div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col items-center gap-6 bg-gradient-to-t from-black/90 to-transparent z-40">
            <div className="bg-black/60 text-white px-6 py-2.5 rounded-full text-sm font-medium border border-white/10 shadow-lg backdrop-blur-sm">
              Posisikan seluruh tubuh untuk foto <strong>{VIEW_LABELS[activeView]}</strong>
            </div>
            <button
              onClick={handleCaptureFromCamera}
              className="w-20 h-20 rounded-full bg-white border-4 border-slate-300 flex items-center justify-center active:scale-95 transition-transform shadow-2xl group hover:border-blue-400"
            >
              <Camera size={32} className="text-slate-900 group-hover:text-blue-600 transition-colors" strokeWidth={2}/>
            </button>
          </div>
        </div>
      )}

      {/* === MODAL LIGHTBOX IMAGE (POP-UP GAMBAR) === */}
      {modalImage && !useCamera && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setModalImage(null)}>
          <button className="absolute top-6 right-6 lg:top-10 lg:right-10 text-white hover:text-slate-300 transition-colors p-2 bg-slate-800/50 rounded-full active:scale-95" onClick={() => setModalImage(null)}>
            <X size={28} />
          </button>
          <div className="flex flex-col items-center max-w-[95%] max-h-[90vh]">
             <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-widest bg-black/50 px-4 py-1.5 rounded-full">Foto {VIEW_LABELS[modalImage.view]}</h3>
             <img 
               src={modalImage.url} 
               alt="Detail" 
               className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-700" 
               onClick={(e) => e.stopPropagation()} 
             />
          </div>
        </div>
      )}

      {/* === SIDEBAR (DESKTOP) === */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-slate-100 sticky top-0 h-screen shrink-0 transition-all duration-300 z-50 ${isSidebarExpanded ? 'w-64' : 'w-[80px]'}`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className={`p-5 flex items-center ${isSidebarExpanded ? 'justify-start px-5' : 'justify-center px-0'} h-16`}>
          <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-7 h-7 shrink-0 object-contain" />
          {isSidebarExpanded && <span className="font-bold text-lg text-slate-800 ml-3 truncate">Posturely</span>}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4 hide-scrollbar overflow-y-auto overflow-x-hidden">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" expanded={isSidebarExpanded} />
          <SidebarLink to="/chat" icon={MessageCircle} label="Konsultasi" expanded={isSidebarExpanded} />
          <SidebarLink to="/education" icon={BookOpen} label="Edukasi" expanded={isSidebarExpanded} />
          <SidebarLink to="/profile" icon={User} label="Profil Saya" expanded={isSidebarExpanded} />
        </nav>

        <div className="p-3 border-t border-slate-100 mt-auto">
          <button onClick={handleLogout} className={`flex items-center w-full rounded-lg transition-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 ${isSidebarExpanded ? 'justify-start px-3 py-2.5 gap-3' : 'justify-center p-2.5'}`}>
            <LogOut size={18} className="shrink-0" /> 
            {isSidebarExpanded && <span className="text-sm truncate">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* === MOBILE SIDEBAR (DRAWER) === */}
      {isSidebarOpenMobile && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpenMobile(false)}></div>
          <div className="absolute inset-y-0 left-0 w-72 bg-white border-r border-slate-100 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-5 flex items-center justify-between border-b border-slate-100 h-16">
               <div className="flex items-center gap-3">
                  <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-7 h-7 shrink-0" />
                  <span className="font-bold text-lg text-slate-800">Posturely</span>
               </div>
               <button onClick={() => setIsSidebarOpenMobile(false)} className="text-slate-500 p-1.5 rounded-md hover:bg-slate-100"><X size={18}/></button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto hide-scrollbar">
              <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/chat" icon={MessageCircle} label="Konsultasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/education" icon={BookOpen} label="Edukasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/profile" icon={User} label="Profil Saya" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
            </nav>
            <div className="p-3 border-t border-slate-100 mt-auto">
               <button onClick={handleLogout} className="flex items-center gap-3 w-full p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"><LogOut size={18}/> Keluar</button>
            </div>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <main className="flex-1 flex flex-col min-w-0 h-full bg-slate-50">
        
        {/* Header Dashboard */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-40 shrink-0">
          <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md active:scale-95 transition-transform" onClick={() => setIsSidebarOpenMobile(true)}>
            <Menu size={20} />
          </button>

          <div className="hidden lg:block text-slate-500 text-sm font-medium">
            AI Screening / Upload Foto
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-0">
            <div className="relative flex items-center">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md relative transition-colors flex items-center justify-center active:scale-95">
                <Bell size={18} strokeWidth={2} />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
              </button>
              {notifOpen && (
                <div className="hidden lg:block">
                  <NotificationPanel notifications={notifications} close={() => setNotifOpen(false)} handleNotifClick={handleNotifClick} markAllAsRead={markAllAsRead} deleteNotification={deleteNotification} unreadCount={unreadCount} />
                </div>
              )}
            </div>
            <Link to="/profile" className="flex items-center md:gap-2 bg-slate-50 hover:bg-slate-100 p-1 md:pr-3 rounded-md border border-slate-100 transition-colors ml-1 shrink-0 active:scale-95">
              <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200">
                <User size={16} />
              </div>
              <span className="hidden md:block text-xs font-semibold text-slate-700 whitespace-nowrap">{user?.name || 'Profil'}</span>
            </Link>
          </div>
        </header>

        {/* Content Scrollable Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto hide-scrollbar">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
            
            {/* === KIRI: KONTROL UPLOAD & TABS === */}
            <div className="w-full lg:w-[450px] shrink-0 flex flex-col gap-5">
              
              {/* Back & Title */}
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight mb-1">
                    Screening AI Baru
                  </h1>
                  <p className="text-sm text-slate-500">Ambil atau unggah foto postur anak.</p>
                </div>
                
                {/* Tombol Khusus ke Riwayat Screening */}
                <button 
                  onClick={() => navigate(`/children/${childId}/screenings`)} 
                  className="w-full sm:w-auto bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-200 shrink-0"
                >
                  <BookOpen size={16} /> Riwayat Screening
                </button>
              </div>

              {/* Tabs Selection */}
              <div className="bg-white p-2 rounded-xl border border-slate-100 flex gap-2 shadow-sm">
                {ORDER.map((view) => (
                  <button
                    key={view}
                    onClick={() => setActiveView(view)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border active:scale-95 ${
                      activeView === view 
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                        : images[view] 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-transparent text-slate-500 border-transparent hover:bg-slate-50"
                    }`}
                  >
                    {VIEW_LABELS[view]}
                    {images[view] && <Check size={14} strokeWidth={2.5} />}
                  </button>
                ))}
              </div>

              {/* Upload Dropzone / Tombol Kamera */}
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4 text-center min-h-[220px]">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
                  {images[activeView] ? <Check size={32} className="text-emerald-500"/> : <Upload size={28} />}
                </div>
                
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    {images[activeView] ? `Foto ${VIEW_LABELS[activeView]} Tersimpan` : `Unggah Foto ${VIEW_LABELS[activeView]}`}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-[250px] mx-auto">
                    {images[activeView] 
                      ? "Silakan lanjutkan ke posisi berikutnya atau mulai analisis." 
                      : "Gunakan foto yang cerah dan pastikan seluruh tubuh anak terlihat jelas."}
                  </p>
                </div>

                <div className="flex flex-col w-full gap-3 mt-2">
                  <button
                    onClick={() => setUseCamera(true)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Camera size={18} strokeWidth={2} />
                    {images[activeView] ? "Foto Ulang Kamera" : "Buka Kamera"}
                  </button>

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, activeView)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 pointer-events-none">
                      <ImageIcon size={18} strokeWidth={2} />
                      {images[activeView] ? "Ganti File Galeri" : "Pilih dari Galeri"}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* === KANAN: PREVIEW HASIL & TOMBOL SUBMIT === */}
            <div className="flex-1 flex flex-col gap-5">
              
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex-1">
                <h2 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-50 pb-3">Preview Foto</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {ORDER.map((view) => {
                    const url = previews[view];
                    return (
                      <div key={view} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{VIEW_LABELS[view]}</span>
                        </div>
                        
                        <div 
                          className={`relative w-full aspect-[3/4] sm:aspect-auto sm:h-56 rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center transition-all ${url ? 'border-blue-200 cursor-pointer hover:border-blue-400 group shadow-sm bg-slate-900' : 'border-dashed border-slate-200 bg-slate-50'}`}
                          onClick={() => url && !loading && setModalImage({ view, url })}
                        >
                          {url ? (
                            <>
                              <img src={url} alt={view} className={`w-full h-full object-contain transition-opacity duration-300 ${loading ? 'opacity-40 blur-[2px]' : 'group-hover:opacity-80'}`} />
                              
                              {/* Overlay Hover Lihat Detail */}
                              {!loading && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">Lihat Detail</div>
                                </div>
                              )}

                              {/* AI SCANNER ANIMATION SAAT LOADING */}
                              {loading && (
                                <>
                                  <div className="ai-scanner-line"></div>
                                  <div className="absolute inset-0 bg-blue-900/20 mix-blend-color-burn"></div>
                                  <div className="absolute inset-0 flex items-center justify-center z-30">
                                    <div className="bg-blue-600/90 text-white px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg backdrop-blur-md flex items-center gap-1.5 animate-pulse">
                                      <Sparkles size={12} /> Memindai...
                                    </div>
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <div className="text-slate-400 flex flex-col items-center gap-2 p-4 text-center">
                              <ImageIcon size={24} strokeWidth={1.5} />
                              <span className="text-[10px] font-semibold">Belum Ada</span>
                            </div>
                          )}
                        </div>

                        {/* Tombol Hapus */}
                        {url && !loading && (
                          <button 
                            onClick={() => handleRemoveImage(view)}
                            className="text-[10px] font-bold text-red-500 hover:text-white border border-red-200 hover:bg-red-500 py-1.5 rounded-md transition-colors w-max px-3 mx-auto flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Hapus
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Area Submit */}
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center gap-2 mb-4">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <button
                    type="submit"
                    disabled={loading || uploadedCount === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles size={18} strokeWidth={2.5} />
                    {loading ? "AI Sedang Menganalisis..." : `Mulai Analisis ${uploadedCount} Foto`}
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-3 font-medium">
                    {uploadedCount === 0 && "Upload setidaknya 1 foto untuk memulai."}
                    {uploadedCount === 1 && "1 foto akan dianalisis oleh sistem AI."}
                    {uploadedCount === 2 && "2 foto akan memberikan hasil analisis yang lebih detail."}
                    {uploadedCount === 3 && "3 foto akan menghasilkan diagnosis postur paling akurat."}
                  </p>
                </form>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Mobile Notification Panel */}
      {notifOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden" onClick={() => setNotifOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"></div>
          <div className="absolute top-14 left-3 right-3 bg-white border border-slate-100 rounded-lg overflow-hidden animate-in slide-in-from-top-2 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <NotificationPanel notifications={notifications} close={() => setNotifOpen(false)} handleNotifClick={handleNotifClick} markAllAsRead={markAllAsRead} deleteNotification={deleteNotification} unreadCount={unreadCount} />
          </div>
        </div>
      )}

    </div>
  );
}

// =====================================
// KOMPONEN PENDUKUNG (HELPERS)
// =====================================

// eslint-disable-next-line no-unused-vars
function SidebarLink({ to, icon: Icon, label, active, expanded, onClick, badge }) {
  return (
    <Link to={to} onClick={onClick} className={`flex items-center rounded-lg font-medium transition-all duration-200 relative active:scale-95 ${expanded ? 'px-3 py-2.5 justify-start gap-3' : 'p-2.5 justify-center'} ${active ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-inner' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}>
      <div className="relative shrink-0">
        <Icon size={20} className={active ? 'text-blue-600' : ''} />
        {badge > 0 && !expanded && <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white"></span>}
      </div>
      {expanded && (
        <div className="flex-1 flex justify-between items-center min-w-0">
          <span className="text-sm truncate">{label}</span>
          {badge > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{badge}</span>}
        </div>
      )}
    </Link>
  );
}

// eslint-disable-next-line no-unused-vars
function NotificationPanel({ notifications, close, unreadCount, markAllAsRead, handleNotifClick, deleteNotification }) {
  return (
    <div className="lg:absolute lg:top-12 lg:right-0 w-full lg:w-80 bg-white lg:border border-slate-100 rounded-lg lg:z-50 overflow-hidden lg:shadow-xl">
      <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-sm flex justify-between items-center">
        <span className="text-slate-800">Notifikasi</span>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <button onClick={markAllAsRead} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-100/50 px-2 py-1 rounded border border-blue-100">Dibaca</button>}
          <button onClick={close} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"><X size={16}/></button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto hide-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">Belum ada notifikasi</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} onClick={() => handleNotifClick(n)} className={`p-3 border-b border-slate-50 transition-colors cursor-pointer flex gap-2.5 group ${!n.is_read ? 'bg-blue-50/30 hover:bg-blue-50' : 'hover:bg-slate-50'}`}>
              <div className={`mt-0.5 shrink-0 ${!n.is_read ? 'text-blue-500' : 'text-slate-400'}`}><Bell size={14} /></div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${!n.is_read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'} truncate`}>{n.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}