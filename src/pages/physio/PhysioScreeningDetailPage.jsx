import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
  X, CheckCircle, MessageCircle, Crown, ChevronLeft, LayoutDashboard,
  BookOpen, User, LogOut, Menu, AlertCircle, Plus, Save, FileQuestion, CheckCircle2
} from "lucide-react";
import {
  fetchScreeningDetail,
  acceptReferralByPhysio,
  completeReferralByPhysio,
  createManualRecommendation,
} from "../../services/screeningService";
import { getConversations } from "../../services/chatService";
import { logout } from "../../services/authService";

export default function PhysioScreeningDetailPage() {
  const { screeningId } = useParams();
  const navigate = useNavigate();

  // Data States
  const [screening, setScreening] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lightbox Image State
  const [selectedImage, setSelectedImage] = useState(null);

  // Recommendations States
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [recForm, setRecForm] = useState({ type: "exercise", title: "", content: "", media_url: "" });
  const [submittingRec, setSubmittingRec] = useState(false);

  // Modals States
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptingReferral, setAcceptingReferral] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingReferral, setCompletingReferral] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Chat & Dashboard UI States
  const [parentConvId, setParentConvId] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    if (!screeningId) {
      setError("ID screening tidak ditemukan di URL.");
      setLoading(false);
      return;
    }
    loadData();
  }, [screeningId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchScreeningDetail(screeningId);
      setScreening(res?.data ?? res);

      const chatRes = await getConversations();
      const list = chatRes?.data || chatRes || [];
      setParentConvId(list);
      setUnreadCount(list.filter(c => c.unread_count > 0).length);

    } catch (err) {
      console.error("Error loading data:", err);
      setError("Gagal memuat detail screening.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // --- Handlers Aksi ---
  const handleAcceptReferral = async () => {
    setAcceptingReferral(true);
    try {
      await acceptReferralByPhysio(screeningId);
      setShowAcceptModal(false);
      setSuccessMessage("Rujukan berhasil diterima.");
      setShowSuccessModal(true);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menerima rujukan.");
    } finally {
      setAcceptingReferral(false);
    }
  };

  const handleCompleteReferral = async () => {
    setCompletingReferral(true);
    try {
      await completeReferralByPhysio(screeningId);
      setShowCompleteModal(false);
      setSuccessMessage("Konsultasi berhasil diselesaikan.");
      setShowSuccessModal(true);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menyelesaikan konsultasi.");
    } finally {
      setCompletingReferral(false);
    }
  };

  const handleSubmitRecommendation = async (e) => {
    e.preventDefault();
    setSubmittingRec(true);
    try {
      await createManualRecommendation(screeningId, recForm);
      setSuccessMessage("Rekomendasi berhasil disimpan.");
      setShowSuccessModal(true);
      setRecForm({ type: "exercise", title: "", content: "", media_url: "" });
      setShowRecommendationForm(false);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan rekomendasi.");
    } finally {
      setSubmittingRec(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error || !screening) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-red-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Gagal Memuat</h2>
          <p className="text-slate-500 mb-6">{error || "Data tidak ditemukan."}</p>
          <button onClick={() => navigate("/physio/dashboard")} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all active:scale-95">Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  const { child, images, manualRecommendations, referral_status, parent } = screening;
  const canEditRecommendation = referral_status === "accepted";
  const isBeforeAccepted = referral_status === "requested";
  const isAfterCompleted = referral_status === "completed";

  const convList = Array.isArray(parentConvId) ? parentConvId : [];
  const parentConv = convList.find(c => (c.parent?.id || c.parent_id) === (parent?.id || screening.parent_id));
  const isParentPremium = parent?.is_premium === true || screening.is_premium === true;

  // Komponen Helper Tombol Aksi agar tidak duplikasi kode (Desktop atas, Mobile bawah)
  const ActionCard = () => (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-3 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Status Rujukan</h2>
      
      {referral_status === "requested" && (
        <button onClick={() => setShowAcceptModal(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-sm">
          Terima Rujukan Fisioterapi
        </button>
      )}
      {referral_status === "accepted" && (
        <button onClick={() => setShowCompleteModal(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2">
          <CheckCircle size={18}/> Selesaikan Konsultasi
        </button>
      )}
      {referral_status === "completed" && (
        <div className="w-full bg-slate-100 text-slate-500 font-bold py-3 rounded-xl text-center flex items-center justify-center gap-2">
          <CheckCircle size={18}/> Konsultasi Selesai
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* === MODAL LIGHTBOX IMAGE (POP-UP GAMBAR) === */}
      {selectedImage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 lg:top-10 lg:right-10 text-white hover:text-slate-300 transition-colors p-2 bg-slate-800/50 rounded-full" onClick={() => setSelectedImage(null)}>
            <X size={28} />
          </button>
          <img 
            src={selectedImage} 
            alt="Detail Postur" 
            className="max-w-[95%] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      {/* === SIDEBAR (DESKTOP) === */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen shrink-0 transition-all duration-300 z-50 ${isSidebarExpanded ? 'w-64' : 'w-[80px]'}`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className={`p-6 flex items-center ${isSidebarExpanded ? 'justify-start px-6' : 'justify-center px-0'} h-16 lg:h-20`}>
          <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 shrink-0 object-contain" />
          {isSidebarExpanded && <span className="font-bold text-xl text-slate-800 ml-3 truncate">Posturely</span>}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4 hide-scrollbar overflow-y-auto overflow-x-hidden">
          <SidebarLink to="/physio/dashboard" icon={LayoutDashboard} label="Dashboard" active={true} expanded={isSidebarExpanded} />
          <SidebarLink to="/physio/chat" icon={MessageCircle} label="Konsultasi" expanded={isSidebarExpanded} badge={unreadCount} />
          <SidebarLink to="/physio/education" icon={BookOpen} label="Kelola Edukasi" expanded={isSidebarExpanded} />
          <SidebarLink to="/physio/profile" icon={User} label="Profil & Pengaturan" expanded={isSidebarExpanded} />
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <button onClick={handleLogout} className={`flex items-center w-full rounded-md transition-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 active:scale-95 ${isSidebarExpanded ? 'justify-start px-4 py-2.5 gap-3' : 'justify-center p-2.5'}`}>
            <LogOut size={20} className="shrink-0" /> 
            {isSidebarExpanded && <span className="text-sm truncate">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* === MOBILE SIDEBAR (DRAWER) === */}
      {isSidebarOpenMobile && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpenMobile(false)}></div>
          <div className="absolute inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 flex items-center justify-between border-b border-slate-100 h-16">
               <div className="flex items-center gap-3">
                  <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 shrink-0" />
                  <span className="font-bold text-lg text-slate-800">Posturely</span>
               </div>
               <button onClick={() => setIsSidebarOpenMobile(false)} className="text-slate-500 p-1.5 rounded-md hover:bg-slate-100 active:scale-95 transition-all"><X size={20}/></button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto hide-scrollbar">
              <SidebarLink to="/physio/dashboard" icon={LayoutDashboard} label="Dashboard" active={true} expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/chat" icon={MessageCircle} label="Konsultasi" expanded={true} badge={unreadCount} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/education" icon={BookOpen} label="Kelola Edukasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/profile" icon={User} label="Profil & Pengaturan" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
            </nav>
            <div className="p-4 border-t border-slate-100 mt-auto">
               <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-sm text-red-600 hover:bg-red-50 rounded-md transition-all font-medium active:scale-95"><LogOut size={18}/> Keluar</button>
            </div>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <main className="flex-1 flex flex-col min-w-0 h-full bg-slate-50 relative overflow-hidden">
        
        {/* Header Atas */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-40">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md active:scale-95 transition-transform" onClick={() => setIsSidebarOpenMobile(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden lg:block text-slate-500 text-sm font-medium">
              Portal Fisioterapis / Detail Screening
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-0">
            <button onClick={() => navigate("/physio/chat")} className="hidden sm:flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md transition-colors active:scale-95">
              <Crown size={16} strokeWidth={2.5}/>
              <span className="text-xs font-bold uppercase tracking-wide">Daftar Premium</span>
            </button>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200 ml-2 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate("/physio/profile")}>
              <User size={18} />
            </div>
          </div>
        </header>

        {/* CONTAINER UTAMA (Menangani scroll. Desktop: kolomnya yang scroll, Mobile: parent yang scroll) */}
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6 flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden">
          
          {/* Top Bar: Back & Title (Tetap di atas, tidak ikut scroll di desktop) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/physio/dashboard")} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                <ChevronLeft size={18} />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-none truncate">
                Detail Screening: {child?.name}
              </h1>
            </div>

            {isParentPremium && (
              <button
                onClick={() => navigate(parentConv ? `/physio/chat?conversation_id=${parentConv.id}` : "/physio/chat")}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border border-amber-200 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm shrink-0"
              >
                <Crown size={16} className="text-amber-600" /> Chat dengan {parent?.name || "Parent"}
              </button>
            )}
          </div>

          {/* === DUA KOLOM DENGAN SCROLL INDEPENDEN (DI DESKTOP) === */}
          <div className="flex flex-col lg:flex-row gap-6 items-start flex-1 min-h-0">
            
            {/* === KOLOM KIRI === */}
            {/* Di desktop: Scroll independen (overflow-y-auto), Di mobile: Mengikuti scroll parent */}
            <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6 lg:overflow-y-auto lg:h-full hide-scrollbar lg:pb-10">
              
              {/* Tombol Aksi - Desktop (Di atas) */}
              <div className="hidden lg:block">
                <ActionCard />
              </div>

              {/* Data Anak */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Data Anak</h2>
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                  <div className="text-slate-500">Nama</div><div className="font-semibold text-slate-800 text-right">{child?.name}</div>
                  <div className="text-slate-500">Usia</div><div className="font-semibold text-slate-800 text-right">{child?.age_years ? `${child.age_years} tahun` : "-"}</div>
                  <div className="text-slate-500">Gender</div><div className="font-semibold text-slate-800 text-right">{child?.gender === 'M' ? 'Laki-laki' : child?.gender === 'F' ? 'Perempuan' : '-'}</div>
                  <div className="text-slate-500">Berat</div><div className="font-semibold text-slate-800 text-right">{child?.weight ? `${child.weight} kg` : "-"}</div>
                  <div className="text-slate-500">Tinggi</div><div className="font-semibold text-slate-800 text-right">{child?.height ? `${child.height} cm` : "-"}</div>
                </div>
              </div>

              {/* Hasil Screening */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Hasil AI Screening</h2>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-500 text-sm">Skor Keseluruhan:</span>
                  <span className="font-extrabold text-2xl text-slate-900">{screening.score ?? "-"}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 text-sm">Kategori:</span>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${screening.category === "GOOD" ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {screening.category || "Perlu Perhatian"}
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed shadow-inner">
                  <strong className="text-slate-800">Ringkasan:</strong> <br/><span className="mt-1 block">{screening.summary || "Tidak ada ringkasan."}</span>
                </div>
              </div>

              {/* Gambar Screening (Clickable) */}
              {images && images.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Foto Postur (Ketuk untuk perbesar)</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {images.filter((img) => !img.type.startsWith("CROP_")).map((img) => (
                      <div 
                        key={img.id} 
                        onClick={() => setSelectedImage(img.url_processed || img.url_original)}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square cursor-pointer hover:border-blue-400 transition-colors shadow-sm"
                      >
                        <img src={img.url_processed || img.url_original} alt={img.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-sm p-1.5 text-center">
                          <p className="text-[10px] text-white font-bold uppercase tracking-wider">{img.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tombol Aksi - Mobile (Dipindah ke bawah gambar khusus di HP) */}
              <div className="block lg:hidden">
                <ActionCard />
              </div>
            </div>

            {/* === KOLOM KANAN === */}
            {/* Di desktop: Scroll independen (overflow-y-auto), Di mobile: Mengikuti scroll parent */}
            <div className="flex-1 w-full flex flex-col gap-6 lg:overflow-y-auto lg:h-full hide-scrollbar lg:pb-10">
              
              {/* Premium Banner (Dalam scrollable area) */}
              {isParentPremium && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                    <Crown size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-amber-900 block text-sm mb-1">Status: Pasien Premium</span>
                    <span className="text-amber-700 text-xs leading-relaxed">Orang tua pasien berlangganan fitur premium. Anda diharapkan memberikan respon dan panduan maksimal melalui chat.</span>
                  </div>
                </div>
              )}

              {/* Rekomendasi AI */}
              {images && images.some((img) => img.recommendations?.length > 0) && (
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div> Detail Analisis & Saran AI
                  </h2>
                  <div className="space-y-4">
                    {images.map((img) =>
                      img.recommendations?.length > 0 && (
                        <div key={img.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">{img.type}</h3>
                          <ul className="space-y-3">
                            {img.recommendations.map((rec, idx) => {
                              if (typeof rec === "string") return <li key={idx} className="text-sm text-slate-600 flex gap-2"><span className="text-blue-500">•</span>{rec}</li>;
                              
                              const issue = rec.issue ?? rec.problem ?? "";
                              const duration = rec.duration ?? "";
                              const exercise = rec.exercise ?? "";
                              const videoUrl = rec.video_url ?? rec.videoUrl ?? "";
                              const parentNote = rec.parent_note ?? "";
                              
                              if (!issue && !duration && !exercise && !videoUrl && !parentNote) return null;

                              return (
                                <li key={idx} className="bg-white p-4 rounded-xl border border-slate-200 text-sm flex flex-col gap-2 shadow-sm">
                                  {issue && <div><strong className="text-slate-800">Masalah:</strong> <span className="text-slate-600">{issue}</span></div>}
                                  {exercise && <div><strong className="text-slate-800">Latihan:</strong> <span className="text-slate-600">{exercise}</span></div>}
                                  {duration && <div><strong className="text-slate-800">Durasi:</strong> <span className="text-slate-600">{duration}</span></div>}
                                  {parentNote && <div><strong className="text-slate-800">Catatan:</strong> <span className="text-slate-600">{parentNote}</span></div>}
                                  {videoUrl && (
                                    <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-bold text-xs mt-2 inline-flex items-center gap-1 w-max bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                                      Lihat Video Panduan
                                    </a>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Rekomendasi Manual Fisio */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div> Catatan & Resep Latihan Fisio
                  </h2>
                  <button
                    onClick={() => { if (canEditRecommendation) setShowRecommendationForm(!showRecommendationForm); }}
                    disabled={!canEditRecommendation}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${canEditRecommendation ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-sm' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                    <Plus size={14} strokeWidth={2.5}/> Tambah Catatan
                  </button>
                </div>

                {isBeforeAccepted && <p className="text-sm text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6 font-medium flex items-center gap-2"><AlertCircle size={18}/> Terima rujukan di panel kiri terlebih dahulu untuk dapat menambahkan resep/catatan.</p>}
                {isAfterCompleted && <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 font-medium flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500"/> Konsultasi sudah diselesaikan. Arsip catatan dikunci.</p>}

                {/* Form Tambah Rekomendasi */}
                {showRecommendationForm && canEditRecommendation && (
                  <form onSubmit={handleSubmitRecommendation} className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 mb-6 animate-in slide-in-from-top-2">
                    <h3 className="font-bold text-slate-800 mb-4 text-sm">Form Tambah Latihan / Catatan Medis</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe</label>
                        <select value={recForm.type} onChange={(e) => setRecForm({ ...recForm, type: e.target.value })} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none shadow-inner">
                          <option value="exercise">Latihan / Olahraga</option>
                          <option value="education">Edukasi Ortu</option>
                          <option value="note">Catatan Medis</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Pendek</label>
                        <input type="text" value={recForm.title} onChange={(e) => setRecForm({ ...recForm, title: e.target.value })} required placeholder="Cth: Peregangan Leher" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none shadow-inner" />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 mb-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instruksi Detail</label>
                      <textarea value={recForm.content} onChange={(e) => setRecForm({ ...recForm, content: e.target.value })} required rows={4} placeholder="Jelaskan cara melakukannya..." className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none resize-none shadow-inner" />
                    </div>

                    <div className="space-y-1.5 mb-6">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Link Video (Opsional)</label>
                      <input type="url" value={recForm.media_url} onChange={(e) => setRecForm({ ...recForm, media_url: e.target.value })} placeholder="https://youtube.com/..." className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none shadow-inner" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-blue-100">
                      <button type="button" onClick={() => setShowRecommendationForm(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Batal</button>
                      <button type="submit" disabled={submittingRec} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95 disabled:opacity-70 shadow-sm">
                        {submittingRec ? "Menyimpan..." : "Simpan Resep"}
                      </button>
                    </div>
                  </form>
                )}

                {/* List Rekomendasi Manual */}
                {manualRecommendations && manualRecommendations.length > 0 ? (
                  <div className="space-y-4">
                    {manualRecommendations.map((rec) => (
                      <div key={rec.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded uppercase tracking-wider">{rec.type}</span>
                          <span className="text-xs text-slate-400 font-medium">{new Date(rec.created_at).toLocaleDateString("id-ID")}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">{rec.title}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mt-1">{typeof rec.content === "string" ? rec.content : JSON.stringify(rec.content, null, 2)}</p>
                        {rec.media_url && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <a href={rec.media_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                              Lihat Panduan Media ↗
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                    Belum ada rekomendasi atau catatan tambahan yang Anda berikan.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* --- MODALS BARU YANG LEBIH MODERN --- */}
      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowAcceptModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm mx-4 p-8 shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-blue-100">
              <FileQuestion size={32} strokeWidth={2} />
            </div>
            <h3 className="font-bold text-xl text-slate-900 text-center mb-2">Terima Rujukan?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed text-center">Apakah Anda bersedia menangani dan memberikan panduan medis untuk pasien <strong>{child?.name}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowAcceptModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors active:scale-95">Batal</button>
              <button onClick={handleAcceptReferral} disabled={acceptingReferral} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm">
                {acceptingReferral ? "Memproses..." : "Ya, Terima"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowCompleteModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm mx-4 p-8 shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100">
              <CheckCircle2 size={32} strokeWidth={2} />
            </div>
            <h3 className="font-bold text-xl text-slate-900 text-center mb-2">Selesaikan Konsultasi?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed text-center">Apakah sesi fisioterapi untuk <strong>{child?.name}</strong> sudah tuntas? Anda tidak bisa menambah catatan setelah ini.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCompleteModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors active:scale-95">Batal</button>
              <button onClick={handleCompleteReferral} disabled={completingReferral} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm">
                {completingReferral ? "Memproses..." : "Selesaikan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowSuccessModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm mx-4 p-8 shadow-2xl text-center animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100 shadow-inner">
              <CheckCircle size={32} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Berhasil!</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">{successMessage}</p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-sm">Tutup</button>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// Komponen Pendukung
// ==========================================

// eslint-disable-next-line no-unused-vars
function SidebarLink({ to, icon: Icon, label, active, expanded, onClick, badge }) {
  return (
    <Link 
      to={to} 
      onClick={onClick} 
      className={`flex items-center rounded-md font-medium transition-all duration-200 relative active:scale-95 ${expanded ? 'px-4 py-2.5 justify-start gap-3' : 'p-2.5 justify-center'} ${active ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}
    >
      <div className="relative shrink-0">
        <Icon size={20} className={active ? 'text-blue-600' : ''} />
        {badge > 0 && !expanded && (
           <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white"></span>
        )}
      </div>
      {expanded && (
        <div className="flex-1 flex justify-between items-center min-w-0">
          <span className="text-sm truncate">{label}</span>
          {badge > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">{badge}</span>}
        </div>
      )}
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50 animate-pulse overflow-hidden">
      <div className="w-20 lg:w-64 bg-white border-r border-slate-200 hidden lg:block shrink-0"></div>
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <div className="h-16 lg:h-20 bg-white border-b border-slate-200 shrink-0"></div>
        <div className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col">
          <div className="h-10 w-64 bg-slate-200 rounded-lg shrink-0 mb-6"></div>
          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
             <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0 lg:overflow-y-auto hide-scrollbar lg:pb-10">
               <div className="h-40 bg-white rounded-2xl border border-slate-200 shrink-0"></div>
               <div className="h-64 bg-white rounded-2xl border border-slate-200 shrink-0"></div>
             </div>
             <div className="flex-1 flex flex-col gap-6 lg:overflow-y-auto hide-scrollbar lg:pb-10">
               <div className="h-96 bg-white rounded-2xl border border-slate-200 shrink-0"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}