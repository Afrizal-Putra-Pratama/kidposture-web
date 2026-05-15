/* eslint-disable no-unused-vars */
// src/pages/ChatPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import {
  MessageCircle, Send, ChevronLeft, Crown,
  Loader, Paperclip, X, FileText, Film, Download, Camera,
  LayoutDashboard, BookOpen, User, LogOut, Bell, Menu, Search,
  CheckCircle, Activity, Trash2
} from "lucide-react";
import {
  getConversations,
  getOrCreateConversation,
  getPhysioUserId,
  getMessages,
  sendMessage,
  sendFile,
  subscribeToConversation,
} from "../services/chatService";
import { getAccessStatus, getSubscriptionStatus } from "../services/paymentService";
import PremiumModal from "../components/PremiumModal";
import { logout, getCurrentUser } from "../services/authService";
import { useNotifications } from "../hooks/useNotification";

// =====================================
// UTILITIES & HELPERS
// =====================================
function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hari ini";
  if (d.toDateString() === yesterday.toDateString()) return "Kemarin";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatNotifTime(timestamp) {
  if (!timestamp) return "";
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} mnt lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID");
}

function isSameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

// =====================================
// CHAT MICRO-COMPONENTS
// =====================================
function MessageBubble({ msg, isMe, onImageClick }) {
  const type    = msg.type || "text";
  const fileUrl = msg.file_url;
  const text    = msg.body || msg.content || "";

  return (
    <div className={`flex flex-col gap-1.5 min-w-0 max-w-[85%] md:max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
      <div
        className={`px-4 py-2.5 text-[15px] leading-relaxed w-fit max-w-full overflow-hidden rounded-2xl ${
          isMe
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
        }`}
        style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
      >
        {type === "image" && fileUrl && (
          <div className="cursor-zoom-in overflow-hidden rounded-xl bg-black/5" onClick={() => onImageClick(fileUrl)}>
            <img
              src={fileUrl}
              alt={msg.file_name || "Lampiran"}
              className={`max-w-[240px] sm:max-w-[280px] w-full object-cover transition-opacity hover:opacity-90 ${text ? 'mb-2' : ''}`}
              style={{ maxHeight: "280px" }}
            />
          </div>
        )}
        {type === "video" && fileUrl && (
          <video src={fileUrl} controls className={`max-w-[240px] sm:max-w-[280px] w-full rounded-xl bg-black ${text ? 'mb-2' : ''}`} style={{ maxHeight: "240px" }} />
        )}
        {type === "file" && fileUrl && (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${isMe ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'} ${text ? 'mb-2' : ''}`}>
            <div className={`p-2 rounded-lg shrink-0 ${isMe ? 'bg-white/20' : 'bg-white border border-slate-200'}`}>
              <FileText size={20} className="text-current" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold truncate hover:underline underline-offset-2">{msg.file_name || 'Dokumen Terlampir'}</span>
              <span className={`text-[10px] uppercase tracking-wider font-bold mt-0.5 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>Unduh File</span>
            </div>
            <Download size={16} className={`shrink-0 ml-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`} />
          </a>
        )}
        {text && (
          <span className="block whitespace-pre-wrap" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {text}
          </span>
        )}
      </div>
      <div className={`flex items-center gap-1.5 text-[11px] font-medium text-slate-400 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        <span>{formatTime(msg.created_at)}</span>
        {msg._optimistic && <span className="text-blue-500">Mengirim...</span>}
      </div>
    </div>
  );
}

function FilePreview({ file, onRemove }) {
  const [preview, setPreview] = useState(null);
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  useEffect(() => {
    if (isImage || isVideo) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isImage, isVideo]);

  return (
    <div className="p-2 mb-3 bg-white border border-slate-200 rounded-xl inline-flex items-center gap-3 w-max max-w-xs">
      <div className="relative group shrink-0">
        {isImage && preview ? (
          <img src={preview} alt="preview" className="h-14 w-14 object-cover rounded-lg border border-slate-100" />
        ) : isVideo ? (
          <div className="h-14 w-14 flex flex-col items-center justify-center bg-indigo-50 text-indigo-500 rounded-lg border border-indigo-100"><Film size={20} /></div>
        ) : (
          <div className="h-14 w-14 flex flex-col items-center justify-center bg-blue-50 text-blue-500 rounded-lg border border-blue-100"><FileText size={20} /></div>
        )}
        <button type="button" onClick={onRemove} className="absolute -top-2 -right-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full p-1 transition-transform active:scale-95 z-10 border border-slate-600">
          <X size={12} strokeWidth={3} />
        </button>
      </div>
      <div className="flex flex-col justify-center min-w-0 pr-3">
        <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{file.name}</span>
        <span className="text-[11px] font-medium text-slate-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
      </div>
    </div>
  );
}

function getNotifIcon(type) {
  if (type === "referral_accepted") return <CheckCircle size={16} />;
  if (type === "referral_completed") return <Activity size={16} />;
  if (type === "new_recommendation") return <BookOpen size={16} />;
  return <Bell size={16} />;
}

// =====================================
// MAIN PAGE COMPONENT
// =====================================
export default function ChatPage() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const [searchParams] = useSearchParams();

  const [user, setUser] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const physioIdParam = searchParams.get("physio_id") || location.state?.physiotherapistId || null;
  const currentUser   = JSON.parse(localStorage.getItem("user") || "{}");

  const [isPremium,        setIsPremium]        = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [conversations,    setConversations]    = useState([]);
  const [activeConv,       setActiveConv]       = useState(null);
  const [messages,         setMessages]         = useState([]);
  const [inputText,        setInputText]        = useState("");
  const [sending,          setSending]          = useState(false);
  const [loadingConvs,     setLoadingConvs]     = useState(true);
  const [loadingMsgs,      setLoadingMsgs]      = useState(false);
  const [selectedFile,     setSelectedFile]     = useState(null);
  const [uploadProgress,   setUploadProgress]   = useState(0);
  const [selectedImage,    setSelectedImage]    = useState(null);

  const messagesEndRef  = useRef(null);
  const unsubscribeRef  = useRef(null);
  const textareaRef     = useRef(null);
  const fileInputRef    = useRef(null);
  const cameraInputRef  = useRef(null);
  // FIX: simpan activeConvId di ref agar handler Pusher selalu baca nilai terbaru
  const activeConvIdRef = useRef(null);

  useEffect(() => {
    const currUser = getCurrentUser();
    if (currUser) setUser(currUser);

    (async () => {
      try {
        if (physioIdParam) {
          const res = await getAccessStatus(physioIdParam);
          setIsPremium(res?.has_access === true || res?.is_premium === true);
        } else {
          const res = await getSubscriptionStatus();
          const anyActive = res?.is_premium === true ||
            (res?.subscription?.status === "active" &&
              res?.subscription?.expired_at &&
              new Date(res.subscription.expired_at) > new Date());
          setIsPremium(anyActive);
        }
      } catch {
        setIsPremium(false);
      }
    })();
  }, [physioIdParam]);

  useEffect(() => {
    if (isPremium !== true) return;
    (async () => {
      setLoadingConvs(true);
      try {
        const res  = await getConversations();
        const list = res?.data || res || [];
        setConversations(list);
        if (physioIdParam) {
          const existing = list.find(
            (c) =>
              String(c.physio?.physiotherapist?.id || "") === String(physioIdParam) ||
              String(c.physio_id || "") === String(physioIdParam) ||
              String(c.physiotherapist_id || "") === String(physioIdParam)
          );
          if (existing) openConversation(existing);
          else await createNewConv(physioIdParam);
        }
      } catch (err) {
        console.error("error:", err);
      } finally {
        setLoadingConvs(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium, physioIdParam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup saat komponen unmount
  useEffect(() => {
    return () => { unsubscribeRef.current?.(); };
  }, []);

  /**
   * openConversation — FIX REALTIME:
   * 1. Unsubscribe channel lama SEBELUM subscribe yang baru
   * 2. Subscribe Pusher dilakukan segera (tidak perlu tunggu getMessages selesai)
   * 3. Pesan baru dari Pusher hanya diterima jika cocok dengan activeConvId (via ref)
   */
  const openConversation = useCallback(async (conv) => {
    // Unsubscribe channel lama
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;

    setActiveConv(conv);
    activeConvIdRef.current = conv.id;
    setLoadingMsgs(true);
    setMessages([]);

    // Subscribe Pusher dulu — agar tidak ada gap antara getMessages & subscribe
    const unsub = subscribeToConversation(conv.id, (newMsg) => {
      // Hanya proses jika masih di conversation yang sama
      if (activeConvIdRef.current !== conv.id) return;

      setMessages((prev) => {
        // Hindari duplikat: cek ID atau ganti optimistic message yang cocok
        const isDuplicate = prev.some((m) => !m._optimistic && m.id === newMsg.id);
        if (isDuplicate) return prev;

        // Ganti optimistic message milik sender yang sama jika ada
        // (pesan yang dikirim sendiri sudah ada sebagai optimistic)
        const hasOptimistic = prev.some((m) => m._optimistic && String(m.sender_id) === String(newMsg.sender_id));
        if (hasOptimistic && String(newMsg.sender_id) === String(currentUser.id)) {
          // Biarkan handleSend yang replace optimistic — jangan tambahkan duplikat
          return prev;
        }

        return [...prev, newMsg];
      });

      // Update preview pesan terakhir di list conversation
      setConversations((prevConvs) =>
        prevConvs.map((c) =>
          c.id === conv.id
            ? { ...c, last_message: newMsg, latest_message: newMsg }
            : c
        )
      );
    });
    unsubscribeRef.current = unsub;

    // Load riwayat pesan
    try {
      const res = await getMessages(conv.id);
      // Hanya set jika masih di conversation yang sama
      if (activeConvIdRef.current === conv.id) {
        setMessages(res?.data || res || []);
      }
    } catch (err) {
      console.error("error getMessages:", err);
    } finally {
      if (activeConvIdRef.current === conv.id) {
        setLoadingMsgs(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCloseConversation = () => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    activeConvIdRef.current = null;
    setActiveConv(null);
    setMessages([]);
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const createNewConv = async (physioId) => {
    try {
      const physioUserId = await getPhysioUserId(physioId);
      if (!physioUserId) throw new Error("user_id physio tidak ditemukan");
      const res  = await getOrCreateConversation(physioUserId);
      const conv = res?.data || res;
      setConversations((prev) => prev.find((c) => c.id === conv.id) ? prev : [conv, ...prev]);
      openConversation(conv);
    } catch (err) {
      console.error("error:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { alert("Ukuran file maksimal 50MB."); return; }
    setSelectedFile(file);
    e.target.value = "";
  };

  /**
   * handleSend — FIX OPTIMISTIC:
   * Menyimpan optimisticId unik dan menggantinya dengan pesan server yang benar,
   * bukan mengganti SEMUA pesan optimistic.
   */
  const handleSend = async () => {
    const text = inputText.trim();
    if ((!text && !selectedFile) || !activeConv || sending) return;

    setSending(true);
    const capturedFile = selectedFile;
    setInputText("");
    setSelectedFile(null);

    const guessType = capturedFile
      ? capturedFile.type.startsWith("image/") ? "image"
        : capturedFile.type.startsWith("video/") ? "video"
        : "file"
      : "text";

    // ID unik untuk pesan optimistic ini
    const optimisticId = `opt-${Date.now()}-${Math.random()}`;

    const optimistic = {
      id:          optimisticId,
      body:        text || capturedFile?.name || "File",
      type:        guessType,
      file_url:    capturedFile ? URL.createObjectURL(capturedFile) : null,
      file_name:   capturedFile?.name || null,
      sender_id:   currentUser.id,
      created_at:  new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      let res;
      if (capturedFile) {
        setUploadProgress(20);
        res = await sendFile(activeConv.id, capturedFile, text);
        setUploadProgress(100);
      } else {
        res = await sendMessage(activeConv.id, text);
      }
      const sent = res?.data || res;

      // FIX: ganti hanya pesan dengan optimisticId yang cocok, bukan semua _optimistic
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? { ...sent, _optimistic: false } : m))
      );

      // Update preview conversation di sidebar
      setConversations((prevConvs) =>
        prevConvs.map((c) =>
          c.id === activeConv.id
            ? { ...c, last_message: sent, latest_message: sent }
            : c
        )
      );
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setInputText(text);
      setSelectedFile(capturedFile);
      alert("Gagal mengirim pesan. Silakan coba lagi.");
    } finally {
      setSending(false);
      setUploadProgress(0);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !selectedFile) { e.preventDefault(); handleSend(); }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) markAsRead(notif.id);
    setNotifOpen(false);
    if (notif.screening_id) navigate(`/screenings/${notif.screening_id}`);
  };

  // =====================================
  // RENDER PENGUNCIAN AKSES
  // =====================================
  if (isPremium === null) {
    return (
      <div className="flex h-screen w-full bg-slate-50 items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-slate-500 font-medium bg-white px-6 py-4 rounded-xl border border-slate-200">
          <Loader className="animate-spin text-blue-600" size={24} /> Memeriksa akses...
        </div>
      </div>
    );
  }

  if (isPremium === false) {
    return (
      <div className="flex h-screen w-full bg-slate-50/80 items-center justify-center p-4 font-sans backdrop-blur-sm">
        <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 text-center max-w-md w-full animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 border border-amber-100">
            <Crown size={36} strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Akses Chat Terkunci</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            {physioIdParam
              ? "Lakukan pembayaran terlebih dahulu untuk memulai konsultasi eksklusif dengan fisioterapis Anda."
              : "Konsultasi tersedia setelah melakukan pembayaran ke fisioterapis pilihan Anda."}
          </p>
          <button
            type="button"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-95"
            onClick={() => physioIdParam ? setShowPremiumModal(true) : navigate("/physiotherapists")}
          >
            {physioIdParam ? "Bayar Sekarang" : "Pilih Fisioterapis"}
          </button>
        </div>
        {showPremiumModal && (
          <PremiumModal
            physioId={physioIdParam}
            onClose={() => setShowPremiumModal(false)}
            onSuccess={() => { setIsPremium(true); setShowPremiumModal(false); }}
          />
        )}
      </div>
    );
  }

  const activePhysio       = activeConv?.physio || activeConv?.physiotherapist || null;
  const isMobileChatActive = activeConv !== null;

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 font-sans overflow-hidden">

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={handleFileChange} />
      <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

      {/* === SIDEBAR DESKTOP === */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen shrink-0 transition-all duration-300 z-50 ${isSidebarExpanded ? 'w-64' : 'w-[80px]'}`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className={`p-6 flex items-center ${isSidebarExpanded ? 'justify-start px-6' : 'justify-center px-0'} h-20`}>
          <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 shrink-0 object-contain" />
          {isSidebarExpanded && <span className="font-bold text-xl text-slate-800 ml-3 truncate">Posturely</span>}
        </div>
        <nav className="flex-1 px-3 space-y-2 mt-4 hide-scrollbar overflow-y-auto overflow-x-hidden">
          <SidebarLink to="/dashboard"  icon={LayoutDashboard} label="Dashboard"   expanded={isSidebarExpanded} />
          <SidebarLink to="/chat"       icon={MessageCircle}   label="Konsultasi"  active={true} expanded={isSidebarExpanded} />
          <SidebarLink to="/education"  icon={BookOpen}        label="Edukasi"     expanded={isSidebarExpanded} />
          <SidebarLink to="/profile"    icon={User}            label="Profil Saya" expanded={isSidebarExpanded} />
        </nav>
        <div className="p-4 border-t border-slate-100 mt-auto">
          <button type="button" onClick={handleLogout}
            className={`flex items-center w-full rounded-xl transition-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 ${isSidebarExpanded ? 'justify-start px-4 py-3 gap-3' : 'justify-center p-3'}`}>
            <LogOut size={22} className="shrink-0" />
            {isSidebarExpanded && <span className="truncate">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* === SIDEBAR MOBILE (DRAWER) === */}
      {isSidebarOpenMobile && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpenMobile(false)}></div>
          <div className="absolute inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 shrink-0" />
                <span className="font-bold text-lg text-slate-800">Posturely</span>
              </div>
              <button type="button" onClick={() => setIsSidebarOpenMobile(false)} className="text-slate-500 p-1 rounded-md hover:bg-slate-100"><X size={24} /></button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto hide-scrollbar">
              <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard"   expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/chat"      icon={MessageCircle}   label="Konsultasi"  active={true} expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/education" icon={BookOpen}        label="Edukasi"     expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/profile"   icon={User}            label="Profil Saya" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
            </nav>
            <div className="p-4 border-t border-slate-100 mt-auto">
              <button type="button" onClick={handleLogout} className="flex items-center gap-3 w-full p-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium">
                <LogOut size={20} /> Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MAIN COLUMN === */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">

        {/* HEADER */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-50">
          <div className="flex items-center gap-4">
            <button type="button" className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md" onClick={() => setIsSidebarOpenMobile(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-lg lg:text-xl font-bold text-slate-800">Konsultasi Fisioterapi</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifikasi */}
            <div className="relative flex items-center">
              <button type="button" onClick={() => setNotifOpen((v) => !v)}
                className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full relative transition-colors flex items-center justify-center">
                <Bell size={22} strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white pointer-events-none"></span>
                )}
              </button>
              {/* Desktop panel */}
              {notifOpen && (
                <div className="hidden lg:block absolute top-12 right-0 w-96 bg-white border border-slate-200 rounded-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 shadow-2xl">
                  <NotifPanelContent notifications={notifications} close={() => setNotifOpen(false)}
                    handleNotifClick={handleNotifClick} markAllAsRead={markAllAsRead}
                    deleteNotification={deleteNotification} unreadCount={unreadCount} />
                </div>
              )}
            </div>
            {/* Profil */}
            <Link to="/profile" className="flex items-center md:gap-3 hover:bg-slate-50 p-1 md:pr-4 rounded-full border border-transparent md:border-slate-200 transition-colors ml-1 shrink-0">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200">
                <User size={18} />
              </div>
              <span className="hidden md:block text-sm font-semibold text-slate-700 whitespace-nowrap">{user?.name || 'Profil'}</span>
            </Link>
          </div>
        </header>

        {/* === AREA CHAT === */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* Daftar Percakapan */}
          <aside className={`${isMobileChatActive ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 shrink-0 h-full z-20`}>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Cari percakapan..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-1">
              {loadingConvs ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4 border border-slate-100">
                    <MessageCircle size={28} />
                  </div>
                  <p className="text-slate-500 font-medium text-sm">Belum ada percakapan aktif.</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const physio  = conv.physio || conv.physiotherapist || null;
                  const lastMsg = conv.last_message || conv.latest_message;
                  const isActive = activeConv?.id === conv.id;
                  const preview = lastMsg?.type === "image" ? "📷 Gambar"
                    : lastMsg?.type === "video" ? "🎥 Video"
                    : lastMsg?.type === "file"  ? "📄 Dokumen"
                    : (lastMsg?.body || lastMsg?.content || "Mulai obrolan...");

                  return (
                    <div key={conv.id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all border ${isActive ? "bg-blue-50/80 border-blue-100" : "border-transparent hover:bg-slate-50"}`}
                      onClick={() => openConversation(conv)}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 ${isActive ? 'bg-blue-600' : 'bg-slate-800'}`}>
                        {getInitials(physio?.name || "?")}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-bold truncate text-[15px] pr-2 ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                            {physio?.name || "Fisioterapis"}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400'}`}>
                            {lastMsg ? formatTime(lastMsg.created_at) : ""}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm truncate pr-2 ${isActive ? 'text-blue-700 font-medium' : 'text-slate-500'}`}>{preview}</span>
                          {conv.unread_count > 0 && (
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                              {conv.unread_count}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Ruang Chat Aktif */}
          <section className={`${!isMobileChatActive ? 'hidden md:flex' : 'flex'} flex-1 flex-col h-full relative min-w-0 overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]`}>
            {activeConv ? (
              <>
                {/* Header Ruang Chat */}
                <header className="h-[68px] bg-white/90 backdrop-blur-sm border-b border-slate-200 flex items-center px-4 lg:px-6 shrink-0 gap-4 z-10 sticky top-0">
                  <button type="button" className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" onClick={handleCloseConversation}>
                    <ChevronLeft size={24} />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold shrink-0">
                    {getInitials(activePhysio?.name || "?")}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-slate-900 truncate">{activePhysio?.name || "Fisioterapis"}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-semibold text-emerald-600 truncate uppercase tracking-wider">{activePhysio?.clinic_name || "Tersedia"}</span>
                    </div>
                  </div>
                </header>

                {/* Pesan Chat */}
                <div className="flex-1 overflow-y-auto hide-scrollbar p-4 lg:p-6 space-y-6">
                  {loadingMsgs ? (
                    <div className="flex flex-col gap-6 animate-pulse mt-4">
                      <div className="flex justify-start"><div className="w-48 h-12 bg-slate-200 rounded-2xl rounded-bl-sm"></div></div>
                      <div className="flex justify-end"><div className="w-64 h-16 bg-blue-100 rounded-2xl rounded-br-sm"></div></div>
                      <div className="flex justify-start"><div className="w-56 h-10 bg-slate-200 rounded-2xl rounded-bl-sm"></div></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-200 rotate-12">
                        <MessageCircle size={36} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">Ruang Konsultasi Aman</h3>
                      <p className="text-slate-500 text-sm max-w-sm">Kirimkan keluhan, foto postur tubuh, atau dokumen hasil screening untuk dianalisis oleh fisioterapis.</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = String(msg.sender_id) === String(currentUser.id);
                      const showDateDivider = i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at);
                      return (
                        <div key={msg.id} className="flex flex-col w-full">
                          {showDateDivider && (
                            <div className="flex items-center justify-center my-6">
                              <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {formatDateLabel(msg.created_at)}
                              </span>
                            </div>
                          )}
                          <div className={`flex w-full min-w-0 ${isMe ? "justify-end" : "justify-start"} ${msg._optimistic ? "opacity-60" : "opacity-100"} transition-opacity`}>
                            <MessageBubble msg={msg} isMe={isMe} onImageClick={setSelectedImage} />
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} className="h-1" />
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-slate-200 p-3 lg:p-4 shrink-0 z-10">
                  {selectedFile && <FilePreview file={selectedFile} onRemove={() => setSelectedFile(null)} />}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3 border border-slate-200">
                      <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                  <div className="flex items-end gap-2 max-w-5xl mx-auto">
                    <div className="flex items-center gap-1 shrink-0 pb-1">
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={sending}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50" title="Lampirkan Dokumen">
                        <Paperclip size={22} strokeWidth={2} />
                      </button>
                      <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={sending}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50" title="Kirim Foto">
                        <Camera size={22} strokeWidth={2} />
                      </button>
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl flex items-center overflow-hidden transition-colors focus-within:border-blue-400 focus-within:bg-white">
                      <textarea ref={textareaRef} rows={1} value={inputText} onChange={handleInputChange} onKeyDown={handleKeyDown}
                        placeholder="Tulis keluhan atau pertanyaan..."
                        className="w-full bg-transparent border-none outline-none resize-none px-4 py-3 text-[15px] text-slate-800 placeholder:text-slate-400 hide-scrollbar"
                        style={{ maxHeight: "120px" }} />
                    </div>
                    <button type="button"
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 transition-all ${(!inputText.trim() && !selectedFile) || sending ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'}`}
                      onClick={handleSend} disabled={(!inputText.trim() && !selectedFile) || sending}>
                      {sending ? <Loader size={20} className="animate-spin" /> : <Send size={18} strokeWidth={2.5} className="-translate-x-[2px] translate-y-[1px]" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-slate-300 mb-6 border border-slate-200 rotate-12">
                  <MessageCircle size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Pilih Obrolan</h2>
                <p className="text-slate-500 max-w-md leading-relaxed">Silakan pilih salah satu percakapan di bilah kiri untuk mulai berkonsultasi dengan fisioterapis Anda.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Notifikasi Overlay */}
      {notifOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden" onClick={() => setNotifOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"></div>
          <div className="absolute top-16 left-4 right-4 bg-white border border-slate-200 rounded-2xl overflow-hidden animate-in slide-in-from-top-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <NotifPanelContent notifications={notifications} close={() => setNotifOpen(false)}
              handleNotifClick={handleNotifClick} markAllAsRead={markAllAsRead}
              deleteNotification={deleteNotification} unreadCount={unreadCount} />
          </div>
        </div>
      )}

      {/* Lightbox gambar */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}>
          <button type="button" onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-red-500 text-white flex items-center justify-center rounded-full transition-colors border border-white/20 z-50">
            <X size={24} strokeWidth={2.5} />
          </button>
          <img src={selectedImage} alt="Preview"
            className="max-w-full max-h-[85vh] object-contain rounded-xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

// =====================================
// SHARED COMPONENTS
// =====================================
function SidebarLink({ to, icon: Icon, label, active, expanded, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      className={`flex items-center rounded-xl font-medium transition-all duration-200 ${expanded ? 'px-4 py-3 justify-start gap-3' : 'p-3 justify-center'} ${active ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}>
      <Icon size={22} className={`shrink-0 ${active ? 'text-blue-600' : ''}`} />
      {expanded && <span className="truncate flex-1">{label}</span>}
    </Link>
  );
}

function NotifPanelContent({ notifications, close, unreadCount, markAllAsRead, handleNotifClick, deleteNotification }) {
  const safeNotifs = Array.isArray(notifications) ? notifications : [];
  return (
    <>
      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
        <span className="text-sm font-bold text-slate-800">Notifikasi</span>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button type="button" onClick={markAllAsRead}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-100/50 px-2 py-1 rounded border border-blue-100">
              Tandai Dibaca
            </button>
          )}
          <button type="button" onClick={close} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto hide-scrollbar">
        {safeNotifs.length === 0 ? (
          <div className="p-10 text-center text-slate-400 bg-slate-50/50">
            <Bell size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Belum ada notifikasi</p>
          </div>
        ) : (
          safeNotifs.map((n) => (
            <div key={n.id} onClick={() => handleNotifClick(n)}
              className={`p-4 border-b border-slate-50 transition-colors cursor-pointer flex gap-3 group ${!n.is_read ? 'bg-blue-50/30 hover:bg-blue-50' : 'hover:bg-slate-50'}`}>
              <div className={`mt-0.5 shrink-0 ${!n.is_read ? 'text-blue-500' : 'text-slate-400'}`}>{getNotifIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${!n.is_read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{n.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-2">{formatNotifTime(n.created_at)}</p>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1 rounded hover:bg-slate-100 shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}