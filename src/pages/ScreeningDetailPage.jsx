import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar, AlertCircle, User, Camera, FileText, LayoutDashboard, BookOpen,
  ChevronLeft, ChevronRight, X, Sparkles, Plus, AlertTriangle, 
  MessageCircle, Download, Activity, Bell, Menu, LogOut, CheckCircle2
} from "lucide-react";
import { fetchScreeningDetail, referScreeningToPhysio } from "../services/screeningService.jsx";
import physioService from "../services/physioService.jsx";
import { logout, getCurrentUser } from "../services/authService.jsx";
import { useNotifications } from "../hooks/useNotification.jsx";
import ConsultationModal from "../components/ConsultationModal.jsx";
import { exportScreeningPDF } from "../utils/exportScreeningPDF.js";

export default function ScreeningDetailPage() {
  const { screeningId } = useParams();
  const navigate = useNavigate();

  // Data States
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Global UI States (Dashboard)
  const [user, setUser] = useState(null);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // Modals & Interactivity States
  const [lightboxImage, setLightboxImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showDeviationModal, setShowDeviationModal] = useState(false);

  // Refer Flow States
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [physios, setPhysios] = useState([]);
  const [loadingPhysios, setLoadingPhysios] = useState(false);
  const [submittingRefer, setSubmittingRefer] = useState(false);
  const [referError, setReferError] = useState(null);
  const [confirmReferModal, setConfirmReferModal] = useState({ show: false, physioId: null, physioName: "" });
  const [consultModal, setConsultModal] = useState({ open: false, physio: null });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setError("Silakan login terlebih dahulu."); setLoading(false); return; }
    if (!screeningId) { setError("ID screening tidak ditemukan di URL."); setLoading(false); return; }

    setUser(getCurrentUser());
    loadDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screeningId]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const json = await fetchScreeningDetail(screeningId);
      setData(json.data ?? json);
    } catch (err) {
      setError(err.message || "Gagal mengambil data screening");
    } finally {
      setLoading(false);
    }
  };

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

  const openReferModal = async () => {
    setIsReferModalOpen(true);
    setReferError(null);
    setLoadingPhysios(true);
    try {
      const list = await physioService.getAll();
      setPhysios(list);
    } catch (err) {
      setReferError(err.message || "Gagal memuat daftar fisioterapis");
    } finally {
      setLoadingPhysios(false);
    }
  };

  const handleRefer = async (physioId) => {
    setSubmittingRefer(true);
    setReferError(null);
    try {
      const res = await referScreeningToPhysio(screeningId, physioId);
      const updated = res.data ?? res;
      setData(updated);
      setIsReferModalOpen(false);
      setConfirmReferModal({ show: false, physioId: null, physioName: "" });
    } catch (err) {
      setReferError(err.response?.data?.message || err.message || "Gagal mengirim rujukan");
    } finally {
      setSubmittingRefer(false);
    }
  };

  const handleSelectFree = () => {
    setConfirmReferModal({
      show: true,
      physioId: consultModal.physio?.id,
      physioName: consultModal.physio?.name,
    });
    setConsultModal({ open: false, physio: null });
  };

  const handleOpenChat = (physio) => {
    navigate(`/chat?physio_id=${physio.id}`);
  };

  // Render Conditions
  if (loading) return <DetailSkeleton />;

  if (error || !data) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg border border-red-100 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Gagal Memuat</h2>
          <p className="text-slate-500 mb-6">{error || "Data tidak ditemukan."}</p>
          <button onClick={() => navigate(-1)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-md transition-all active:scale-95">Kembali</button>
        </div>
      </div>
    );
  }

  const {
    child, score, category, summary, images, created_at,
    metrics, is_multi_view, total_views, manualRecommendations,
    referral_status, physiotherapist,
  } = data;

  const mainImages = images?.filter((img) => !img.type.startsWith("CROP_")) || [];
  const cropImages = images?.filter((img) => img.type.startsWith("CROP_")) || [];

  const categoryConfig = {
    GOOD: { label: "Postur Baik", color: "emerald" },
    FAIR: { label: "Perlu Dipantau", color: "amber" },
    ATTENTION: { label: "Perlu Perhatian", color: "red" },
  };
  const currentCat = categoryConfig[category] || categoryConfig.GOOD;

  const canRefer = (category === "FAIR" || category === "ATTENTION") && referral_status === "none" && !physiotherapist;
  const canChat = physiotherapist && (referral_status === "accepted" || referral_status === "requested");

  const prevImage = () => setSelectedImageIndex((p) => (p === 0 ? mainImages.length - 1 : p - 1));
  const nextImage = () => setSelectedImageIndex((p) => (p === mainImages.length - 1 ? 0 : p + 1));

  const currentImage = mainImages[selectedImageIndex];
  const hasAIRec = currentImage?.recommendations?.length > 0;

  const shoulderDeviated = metrics?.shoulder_tilt_index !== undefined && metrics.shoulder_tilt_index >= 2;
  const hipDeviated = metrics?.hip_tilt_index !== undefined && metrics.hip_tilt_index >= 2;
  const headDeviated = metrics?.forward_head_index !== undefined && metrics.forward_head_index >= 0.2;
  const neckDeviated = metrics?.neck_inclination_deg !== undefined && metrics.neck_inclination_deg >= 15;
  const torsoDeviated = metrics?.torso_inclination_deg !== undefined && metrics.torso_inclination_deg >= 15;
  const hasAnyDeviation = shoulderDeviated || hipDeviated || headDeviated || neckDeviated || torsoDeviated;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden relative">
      
      {/* === MODAL LIGHTBOX IMAGE === */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-6 right-6 lg:top-10 lg:right-10 text-white hover:text-slate-300 transition-colors p-2 bg-slate-800/50 rounded-full active:scale-95" onClick={() => setLightboxImage(null)}>
            <X size={28} />
          </button>
          <img 
            src={lightboxImage} 
            alt="Detail Postur" 
            className="max-w-[95%] max-h-[90vh] object-contain rounded-lg animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()} 
          />
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
          <button onClick={handleLogout} className={`flex items-center w-full rounded-md transition-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 active:scale-95 ${isSidebarExpanded ? 'justify-start px-3 py-2.5 gap-3' : 'justify-center p-2.5'}`}>
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
               <button onClick={() => setIsSidebarOpenMobile(false)} className="text-slate-500 p-1.5 rounded-md hover:bg-slate-100 active:scale-95 transition-all"><X size={18}/></button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto hide-scrollbar">
              <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/chat" icon={MessageCircle} label="Konsultasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/education" icon={BookOpen} label="Edukasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/profile" icon={User} label="Profil Saya" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
            </nav>
            <div className="p-3 border-t border-slate-100 mt-auto">
               <button onClick={handleLogout} className="flex items-center gap-3 w-full p-2.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-all font-medium active:scale-95"><LogOut size={18}/> Keluar</button>
            </div>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50 relative">
        
        {/* Header Atas */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md active:scale-95 transition-transform" onClick={() => setIsSidebarOpenMobile(true)}>
              <Menu size={20} />
            </button>
            <div className="hidden lg:block text-slate-500 text-sm font-medium">
              Hasil Screening / Detail
            </div>
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

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 w-full max-w-6xl mx-auto hide-scrollbar">
          
          {/* Top Bar: Navigasi & Aksi */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2.5">
              <button onClick={() => navigate(`/children/${child?.id}/screenings`)} className="p-1.5 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-all active:scale-95">
                <ChevronLeft size={16} />
              </button>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-none truncate">
                Screening: {child?.name}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => navigate(`/children/${child?.id}/screenings/new`)} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-md text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5">
                <Plus size={14} /> Screening
              </button>
              {/* Tombol PDF di Desktop (Tersembunyi di Mobile) */}
              <button onClick={() => exportScreeningPDF(data)} className="hidden lg:flex bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-md text-xs font-bold transition-all active:scale-95 items-center gap-1.5">
                <Download size={14} /> Simpan PDF
              </button>
            </div>
          </div>

          {/* Info Card Utama */}
          <div className="bg-white rounded-lg border border-slate-100 p-4 lg:p-5 mb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              
              <div className="flex flex-col gap-3">
                {/* Lencana Mobile Responsive */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[11px]"><User size={12}/> {child?.name} ({child?.age_years ? `${child.age_years}thn` : "-"})</span>
                  <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[11px]"><Activity size={12}/> {child?.weight ? `${child.weight}kg` : "-"} / {child?.height ? `${child.height}cm` : "-"}</span>
                  <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[11px]"><Calendar size={12}/> {created_at ? new Date(created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}</span>
                  {is_multi_view && <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-md text-[11px] font-semibold">Multi-view ({total_views} foto)</span>}
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-3xl">{summary}</p>
              </div>

              <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg border border-slate-100 shrink-0 min-w-[120px]">
                <div className={`text-3xl font-black text-${currentCat.color}-600 mb-1 leading-none`}>
                  {score != null ? Number(score).toFixed(1) : "-"}
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-${currentCat.color}-50 text-${currentCat.color}-700 border-${currentCat.color}-200`}>
                  {currentCat.label}
                </div>
              </div>

            </div>
          </div>

          {/* === LAYOUT GRID: KOLOM OTOMATIS BERUBAH URUTAN DI MOBILE === */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-5 lg:items-start">
            
            {/* 1. Indeks Analisis Postur */}
            <div className="order-1 lg:col-start-1 lg:row-start-1 bg-white rounded-lg border border-slate-100 p-4 lg:p-5">
              <div className="flex flex-wrap items-center justify-between mb-4 border-b border-slate-50 pb-3 gap-2">
                <h3 className="font-bold text-slate-800 text-sm">Indeks Analisis Postur</h3>
                <div className="flex items-center gap-2">
                  {/* Tombol PDF pindah ke sini untuk tampilan mobile */}
                  <button onClick={() => exportScreeningPDF(data)} className="lg:hidden text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1.5 rounded-md transition-colors flex items-center gap-1 active:scale-95 border border-blue-100">
                    <Download size={12}/> Simpan PDF
                  </button>
                  {hasAnyDeviation && (
                    <button onClick={() => setShowDeviationModal(true)} className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1.5 rounded-md transition-colors flex items-center gap-1 active:scale-95 border border-red-100">
                      <AlertTriangle size={12}/> Cek Deviasi
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                {metrics?.shoulder_tilt_index !== undefined && <MetricRow label="Kemiringan Bahu" value={metrics.shoulder_tilt_index} unit="%" threshold={2} />}
                {metrics?.hip_tilt_index !== undefined && <MetricRow label="Kemiringan Panggul" value={metrics.hip_tilt_index} unit="%" threshold={2} />}
                {metrics?.forward_head_index !== undefined && <MetricRow label="Forward Head" value={metrics.forward_head_index} unit="" threshold={0.2} isIndex />}
                {metrics?.neck_inclination_deg !== undefined && <MetricRow label="Kemiringan Leher" value={metrics.neck_inclination_deg} unit="°" threshold={15} />}
                {metrics?.torso_inclination_deg !== undefined && <MetricRow label="Kemiringan Punggung" value={metrics.torso_inclination_deg} unit="°" threshold={15} />}
              </div>
            </div>

            {/* 2. Foto Deteksi */}
            <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-slate-800">
                <h3 className="text-white font-bold text-xs flex items-center gap-1.5"><Camera size={14}/> Foto Deteksi</h3>
                {mainImages.length > 1 && (
                  <div className="flex gap-1.5">
                    {mainImages.map((img, index) => (
                      <button 
                        key={img.id} 
                        onClick={() => setSelectedImageIndex(index)}
                        className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${selectedImageIndex === index ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                      >
                        {img.type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative w-full h-[300px] lg:h-[350px] flex items-center justify-center p-3 bg-slate-950">
                {currentImage ? (
                  <img 
                    src={currentImage.url_processed || currentImage.url_original} 
                    alt={currentImage.type} 
                    onClick={() => setLightboxImage(currentImage.url_processed || currentImage.url_original)}
                    className="max-w-full max-h-full object-contain rounded cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                  />
                ) : (
                  <span className="text-slate-600 text-xs">Belum ada foto</span>
                )}
                
                {mainImages.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-3 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors backdrop-blur-sm"><ChevronLeft size={16}/></button>
                    <button onClick={nextImage} className="absolute right-3 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors backdrop-blur-sm"><ChevronRight size={16}/></button>
                  </>
                )}
              </div>

              {hasAIRec && (
                <div className="p-3 bg-slate-800 border-t border-slate-700">
                  <button onClick={() => setShowAIModal(true)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 text-xs">
                    <Sparkles size={14}/> Rekomendasi Latihan (AI)
                  </button>
                </div>
              )}
            </div>

            {/* 3. Status Rujukan / Konsultasi */}
            {category !== "GOOD" && (
              <div className="order-3 lg:col-start-1 lg:row-start-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-4 lg:p-5">
                <h3 className="font-bold text-blue-900 mb-3 text-sm flex items-center gap-1.5"><User size={16}/> Penanganan Medis</h3>
                
                {physiotherapist ? (
                  <div className="bg-white p-3 rounded-md border border-blue-100 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                        {physiotherapist.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{physiotherapist.name}</p>
                        <p className="text-[10px] text-slate-500">{physiotherapist.clinic_name || "-"} · {physiotherapist.city || "-"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/60 p-2.5 rounded-md border border-blue-100/50 mb-3 text-xs text-slate-500 font-medium">
                    Belum ada fisioterapis yang menangani.
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] text-blue-700 font-semibold uppercase tracking-wider">Status:</span>
                  <span className="text-[10px] font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-blue-100">
                    {referral_status === "none" && "Belum dikonsultasikan"}
                    {referral_status === "requested" && "Menunggu respon fisio"}
                    {referral_status === "accepted" && "Sedang ditangani"}
                    {referral_status === "completed" && "Selesai"}
                    {referral_status === "cancelled" && "Dibatalkan"}
                  </span>
                </div>

                {canRefer && (
                  <button onClick={openReferModal} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-md transition-all active:scale-95 text-xs">
                    Konsultasikan ke Fisioterapis
                  </button>
                )}

                {canChat && (
                  <button onClick={() => handleOpenChat(physiotherapist)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-md transition-all active:scale-95 flex items-center justify-center gap-1.5 text-xs">
                    <MessageCircle size={14}/> Chat Fisioterapis
                  </button>
                )}

                {referError && <p className="text-[10px] text-red-600 mt-2 font-semibold">{referError}</p>}
              </div>
            )}

            {/* 4. Catatan Fisioterapis Manual */}
            <div className="order-4 lg:col-start-1 lg:row-start-3 bg-white rounded-lg border border-slate-100 p-4 lg:p-5">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5"><FileText size={16} className="text-blue-600"/> Catatan Fisioterapis</h3>
              {manualRecommendations && manualRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {manualRecommendations.map((rec) => (
                    <div key={rec.id} className="bg-slate-50 p-3 rounded-md border border-slate-100">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-100/50 px-1.5 py-0.5 rounded uppercase">{rec.type}</span>
                        <span className="text-[9px] text-slate-400">{rec.created_at ? new Date(rec.created_at).toLocaleDateString("id-ID") : "-"}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs mb-1">{rec.title}</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">{rec.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-md border border-slate-100 border-dashed">Belum ada catatan khusus.</p>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* --- MODALS --- */}
      {/* Modal AI Rekomendasi */}
      {showAIModal && hasAIRec && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in p-4" onClick={() => setShowAIModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5"><Sparkles size={16} className="text-blue-600"/> Latihan AI</h3>
              <button onClick={() => setShowAIModal(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded transition-colors"><X size={16}/></button>
            </div>
            <div className="p-5 overflow-y-auto hide-scrollbar space-y-3">
              {currentImage.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-xs font-bold text-red-600 mb-1.5">Masalah: {rec.issue}</p>
                  <div className="mb-1.5"><strong className="text-slate-800 text-[11px] block mb-0.5">Latihan disarankan:</strong><p className="text-[11px] text-slate-600 leading-relaxed">{rec.exercise}</p></div>
                  <p className="text-[10px] text-slate-500 mb-2"><strong>Durasi:</strong> {rec.duration}</p>
                  {rec.parent_note && <div className="bg-amber-50 p-2 rounded-md border border-amber-100 text-[10px] text-amber-800 font-medium mb-2">{rec.parent_note}</div>}
                  {rec.video_url && <a href={rec.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded text-[10px] font-bold hover:bg-blue-100 transition-colors">Video Tutorial ↗</a>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Area Deviasi */}
      {showDeviationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in p-4" onClick={() => setShowDeviationModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5"><AlertTriangle size={16} className="text-red-500"/> Area Deviasi</h3>
              <button onClick={() => setShowDeviationModal(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded transition-colors"><X size={16}/></button>
            </div>
            <div className="p-5 overflow-y-auto hide-scrollbar space-y-2">
              {hasAnyDeviation ? (
                <>
                  {shoulderDeviated && <DeviationCard label="Bahu" val={metrics.shoulder_tilt_index.toFixed(1)+"%"} note="Bahu kiri & kanan tidak sejajar." />}
                  {hipDeviated && <DeviationCard label="Panggul" val={metrics.hip_tilt_index.toFixed(1)+"%"} note="Panggul asimetris." />}
                  {headDeviated && <DeviationCard label="Forward Head" val={metrics.forward_head_index.toFixed(2)} note="Kepala condong ke depan." />}
                  {neckDeviated && <DeviationCard label="Leher" val={metrics.neck_inclination_deg.toFixed(1)+"°"} note="Leher terlalu menunduk." />}
                  {torsoDeviated && <DeviationCard label="Punggung" val={metrics.torso_inclination_deg.toFixed(1)+"°"} note="Punggung membungkuk." />}
                  
                  {cropImages.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Visual AI Crop</p>
                      <div className="grid grid-cols-3 gap-2">
                        {cropImages.map((crop) => (
                          <div key={crop.id} className="relative rounded-md overflow-hidden border border-slate-200 aspect-square group cursor-pointer" onClick={() => setLightboxImage(crop.url_original)}>
                            <img src={crop.url_original} alt="Crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5">{crop.type.replace("CROP_", "")}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">Tidak ada deviasi bermakna.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Pilih Fisioterapis */}
      {isReferModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in p-4" onClick={() => setIsReferModalOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm text-slate-900">Pilih Fisioterapis</h3>
              <button onClick={() => setIsReferModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded transition-colors"><X size={16}/></button>
            </div>
            <div className="p-5 overflow-y-auto hide-scrollbar">
              {loadingPhysios ? (
                <div className="text-center py-6 text-slate-500 animate-pulse font-medium text-xs">Memuat data fisioterapis...</div>
              ) : physios.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">Belum ada fisioterapis tersedia.</div>
              ) : (
                <div className="space-y-2">
                  {physios.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 p-3 border border-slate-100 rounded-lg hover:border-blue-200 bg-slate-50 hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 shrink-0 text-xs">
                          {p.photo_url ? <img src={p.photo_url} alt="Fisio" className="w-full h-full rounded-full object-cover"/> : p.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{p.clinic_name || "-"} · {p.city || "-"}</p>
                          <p className="text-[9px] text-blue-600 font-bold uppercase mt-0.5">{p.specialty || "Umum"}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setIsReferModalOpen(false); setConsultModal({ open: true, physio: p }); }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[10px] font-bold transition-all active:scale-95 shrink-0"
                      >
                        Pilih
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Konsultasi (Tampilan Harga/Rujukan) */}
      {consultModal.open && (
        <ConsultationModal
          physio={consultModal.physio}
          onClose={() => setConsultModal({ open: false, physio: null })}
          onSelectFree={handleSelectFree}
        />
      )}

      {/* Modal Konfirmasi Rujukan */}
      {confirmReferModal.show && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in p-4" onClick={() => setConfirmReferModal({ show: false, physioId: null, physioName: "" })}>
          <div className="bg-white rounded-xl w-full max-w-xs shadow-2xl animate-in zoom-in-95 p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1.5">Kirim Rujukan?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Kirimkan hasil analisis postur ke <strong>{confirmReferModal.physioName}</strong>?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmReferModal({ show: false, physioId: null, physioName: "" })} className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md font-bold text-xs transition-colors active:scale-95">Batal</button>
              <button onClick={() => handleRefer(confirmReferModal.physioId)} disabled={submittingRefer} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold text-xs transition-all active:scale-95 disabled:opacity-70">
                {submittingRefer ? "Mengirim..." : "Kirim"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// =====================================
// KOMPONEN PENDUKUNG (HELPERS)
// =====================================

function MetricRow({ label, value, unit, threshold, isIndex = false }) {
  const isDanger = value >= threshold;
  return (
    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-100">
      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-extrabold text-slate-900">
          {isIndex ? value.toFixed(2) : value.toFixed(1)}{unit}
        </span>
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${isDanger ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
          {isDanger ? 'Deviasi' : 'Normal'}
        </span>
      </div>
    </div>
  );
}

function DeviationCard({ label, val, note }) {
  return (
    <div className="bg-red-50/50 border border-red-100 p-3 rounded-md flex flex-col gap-1">
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-black text-red-600">{val}</span>
      </div>
      <p className="text-[10px] text-red-700">{note}</p>
    </div>
  );
}

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

function DetailSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50 animate-pulse overflow-hidden">
      <div className="w-20 lg:w-64 bg-white border-r border-slate-100 hidden lg:block shrink-0"></div>
      <div className="flex-1 min-w-0 h-full flex flex-col">
        <div className="h-16 bg-white border-b border-slate-100 shrink-0"></div>
        <div className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col">
          <div className="h-10 w-64 bg-slate-200 rounded-md shrink-0 mb-5"></div>
          <div className="h-24 bg-white rounded-lg border border-slate-100 shrink-0 mb-5"></div>
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-5 flex-1 min-h-0">
             <div className="h-64 bg-white rounded-lg border border-slate-100"></div>
             <div className="h-[350px] bg-slate-200 rounded-lg border border-slate-300 lg:row-span-3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}