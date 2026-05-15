// src/pages/physio/PhysioChatPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, Link, useLocation } from "react-router-dom";
import {
  MessageCircle, Send, ChevronLeft, Loader,
  Crown, Paperclip, X, FileText, Film, Download, Camera,
  Menu, LayoutDashboard, LogOut, User, BookOpen
} from "lucide-react";
import {
  getConversations,
  getMessages,
  sendMessage,
  sendFile,
  subscribeToConversation,
} from "../../services/chatService";
import { logout } from "../../services/authService";

// --- Helpers ---
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

function isSameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

// --- PERBAIKAN UTAMA: KOMPONEN MESSAGE BUBBLE ---
function MessageBubble({ msg, isMe }) {
  const type    = msg.type || "text";
  const fileUrl = msg.file_url;
  const text    = msg.body || msg.content || "";

  return (
    // Wrapper w-full memastikan bubble memiliki ruang gerak horizontal yang cukup [cite: 437, 445]
    <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"} mb-1`}>
      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%]`}>
        <div className={`px-4 py-2.5 text-[15px] leading-relaxed w-fit max-w-full rounded-2xl ${
          isMe
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
        }`}>
          {type === "image" && fileUrl && (
            <img
              src={fileUrl}
              alt={msg.file_name || "Gambar"}
              onClick={() => window.open(fileUrl, "_blank")}
              className={`max-w-full max-h-60 rounded-lg block cursor-pointer object-cover ${text ? 'mb-2' : ''} border border-black/10`}
            />
          )}
          
          {type === "video" && fileUrl && (
            <video src={fileUrl} controls className={`max-w-full max-h-52 rounded-lg block bg-black ${text ? 'mb-2' : ''}`} />
          )}

          {type === "file" && fileUrl && (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-2.5 p-2.5 rounded-lg no-underline w-full max-w-sm transition-all active:scale-95 ${
                isMe ? "bg-white/20 text-white hover:bg-white/30" : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
              } ${text ? 'mb-2' : ''}`}>
              <div className={`p-1.5 rounded-md ${isMe ? 'bg-white/20' : 'bg-white border border-slate-200 text-blue-600 shrink-0'}`}>
                <FileText size={18} />
              </div>
              <span className="text-xs font-semibold truncate flex-1">
                {msg.file_name || "File Dokumen"}
              </span>
              <Download size={14} className="shrink-0 opacity-70" />
            </a>
          )}

          {/* Whitespace-pre-wrap menjaga spasi/enter, break-words mencegah overflow [cite: 430, 448] */}
          {text && <span className="whitespace-pre-wrap break-words">{text}</span>}
        </div>
        
        {/* Info waktu diletakkan di luar bubble agar desain lebih bersih [cite: 441, 449] */}
        <div className={`flex items-center gap-1.5 mt-1 text-[10px] font-medium text-slate-400 ${isMe ? "flex-row-reverse" : ""}`}>
          <span>{formatTime(msg.created_at)}</span>
          {msg._optimistic && <span className="text-blue-500 italic">· Mengirim...</span>}
        </div>
      </div>
    </div>
  );
}

// --- Komponen Preview File sebelum kirim ---
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
    <div className={`relative inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg max-w-[240px] mb-2 ${isImage ? 'p-1.5' : 'py-2 px-3'}`}>
      {isImage && preview && <img src={preview} alt="preview" className="w-14 h-14 object-cover rounded-md border border-slate-200" />}
      {isVideo && (
        <div className="flex items-center gap-2">
          <Film size={20} className="text-blue-600" />
          <span className="text-xs text-slate-700 max-w-[120px] truncate font-medium">{file.name}</span>
        </div>
      )}
      {!isImage && !isVideo && (
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-blue-600" />
          <span className="text-xs text-slate-700 max-w-[120px] truncate font-medium">{file.name}</span>
        </div>
      )}
      <button type="button" onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 border-2 border-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer text-white hover:bg-red-600 active:scale-95 transition-all">
        <X size={10} strokeWidth={3} />
      </button>
    </div>
  );
}

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function PhysioChatPage() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const [searchParams]  = useSearchParams();
  const convIdParam     = searchParams.get("conversation_id");
  const currentUser     = JSON.parse(localStorage.getItem("user") || "{}");

  const [conversations,  setConversations]  = useState([]);
  const [activeConv,     setActiveConv]     = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [inputText,      setInputText]      = useState("");
  const [sending,        setSending]        = useState(false);
  const [loadingConvs,   setLoadingConvs]   = useState(true);
  const [loadingMsgs,    setLoadingMsgs]    = useState(false);
  const [selectedFile,   setSelectedFile]   = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarExpanded,   setIsSidebarExpanded]   = useState(false);

  const messagesEndRef  = useRef(null);
  const unsubscribeRef  = useRef(null);
  const textareaRef     = useRef(null);
  const fileInputRef    = useRef(null);
  const cameraInputRef  = useRef(null);
  const activeConvIdRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoadingConvs(true);
      try {
        const res  = await getConversations();
        const list = res?.data || res || [];
        setConversations(list);
        if (convIdParam) {
          const target = list.find((c) => String(c.id) === String(convIdParam));
          if (target) openConversation(target);
        }
      } catch (err) {
        console.error("getConversations error:", err);
      } finally {
        setLoadingConvs(false);
      }
    })();
  }, [convIdParam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => { unsubscribeRef.current?.(); };
  }, []);

  const openConversation = useCallback(async (conv) => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;

    setActiveConv(conv);
    activeConvIdRef.current = conv.id;
    setLoadingMsgs(true);
    setMessages([]);

    const unsub = subscribeToConversation(conv.id, (newMsg) => {
      if (activeConvIdRef.current !== conv.id) return;

      setMessages((prev) => {
        const isDuplicate = prev.some((m) => !m._optimistic && m.id === newMsg.id);
        if (isDuplicate) return prev;

        if (String(newMsg.sender_id) === String(currentUser.id)) {
          const hasOptimistic = prev.some((m) => m._optimistic);
          if (hasOptimistic) return prev;
        }

        return [...prev, newMsg];
      });

      setConversations((prevConvs) =>
        prevConvs.map((c) =>
          c.id === conv.id
            ? { ...c, last_message: newMsg, latest_message: newMsg }
            : c
        )
      );
    });
    unsubscribeRef.current = unsub;

    try {
      const res = await getMessages(conv.id);
      if (activeConvIdRef.current === conv.id) {
        setMessages(res?.data || res || []);
      }
    } catch (err) {
      console.error("getMessages error:", err);
    } finally {
      if (activeConvIdRef.current === conv.id) {
        setLoadingMsgs(false);
      }
    }
  }, []);

  const handleCloseConversation = () => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    activeConvIdRef.current = null;
    setActiveConv(null);
    setMessages([]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { alert("Ukuran file maksimal 50MB."); return; }
    setSelectedFile(file);
    e.target.value = "";
    textareaRef.current?.focus();
  };

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

      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? { ...sent, _optimistic: false } : m))
      );

      setConversations((prevConvs) =>
        prevConvs.map((c) =>
          c.id === activeConv.id
            ? { ...c, last_message: sent, latest_message: sent }
            : c
        )
      );
    } catch (err) {
      console.error("send error:", err);
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

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const getParentInfo = (conv) => {
    if (!conv) return null;
    return conv.parent || (conv.participants || []).find((p) => p.id !== currentUser.id) || null;
  };

  const activeParent       = getParentInfo(activeConv);
  const isMobileChatActive = activeConv !== null;
  const totalUnread        = conversations.filter((c) => c.unread_count > 0).length;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">

      <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" className="hidden" onChange={handleFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

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
          <SidebarLink to="/physio/dashboard" icon={LayoutDashboard} label="Dashboard"          active={location.pathname === '/physio/dashboard'} expanded={isSidebarExpanded} />
          <SidebarLink to="/physio/chat"      icon={MessageCircle}   label="Konsultasi"         active={location.pathname === '/physio/chat'} expanded={isSidebarExpanded} badge={totalUnread} />
          <SidebarLink to="/physio/education" icon={BookOpen}        label="Kelola Edukasi"     active={location.pathname === '/physio/education'} expanded={isSidebarExpanded} />
          <SidebarLink to="/physio/profile"   icon={User}            label="Profil & Pengaturan" active={location.pathname === '/physio/profile'} expanded={isSidebarExpanded} />
        </nav>
        <div className="p-4 border-t border-slate-100 mt-auto">
          <button type="button" onClick={handleLogout}
            className={`flex items-center w-full rounded-md transition-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 active:scale-95 ${isSidebarExpanded ? 'justify-start px-4 py-2.5 gap-3' : 'justify-center p-2.5'}`}>
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
              <button type="button" onClick={() => setIsSidebarOpenMobile(false)} className="text-slate-500 p-1.5 rounded-md hover:bg-slate-100 active:scale-95 transition-all">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto hide-scrollbar">
              <SidebarLink to="/physio/dashboard" icon={LayoutDashboard} label="Dashboard"          expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/chat"      icon={MessageCircle}   label="Konsultasi"         active={true} expanded={true} badge={totalUnread} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/education" icon={BookOpen}        label="Kelola Edukasi"     expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/profile"   icon={User}            label="Profil & Pengaturan" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
            </nav>
            <div className="p-4 border-t border-slate-100 mt-auto">
              <button type="button" onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-sm text-red-600 hover:bg-red-50 rounded-md transition-all font-medium active:scale-95">
                <LogOut size={18} /> Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <main className="flex-1 flex flex-col min-w-0 h-full bg-white overflow-hidden">
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button type="button" className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md active:scale-95 transition-transform" onClick={() => setIsSidebarOpenMobile(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden lg:block text-slate-500 text-sm font-medium">Portal Fisioterapis</div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-0">
            <div className="hidden sm:flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md cursor-default">
              <Crown size={16} strokeWidth={2.5} />
              <span className="text-xs font-bold uppercase tracking-wide">Daftar Premium</span>
            </div>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200 ml-2 cursor-pointer active:scale-95 transition-transform"
              onClick={() => navigate("/physio/profile")}>
              <User size={18} />
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden bg-white">
          {/* Kolom Kiri: List Percakapan */}
          <div className={`${isMobileChatActive ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-[360px] flex-col border-r border-slate-200 shrink-0 bg-white`}>
            <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MessageCircle size={22} className="text-blue-600" /> Konsultasi
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              {loadingConvs ? (
                <ChatSidebarSkeleton />
              ) : conversations.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <MessageCircle size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Belum ada konsultasi dari pasien.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {conversations.map((conv) => {
                    const parent    = getParentInfo(conv);
                    const lastMsg   = conv.last_message || conv.latest_message;
                    const isActive  = activeConv?.id === conv.id;
                    const isPremium = conv.is_premium || parent?.is_premium;
                    const preview   = lastMsg?.type === "image" ? "📷 Mengirim Gambar"
                      : lastMsg?.type === "video" ? "🎥 Mengirim Video"
                      : lastMsg?.type === "file"  ? "📄 Mengirim Dokumen"
                      : (lastMsg?.body || lastMsg?.content || "Mulai percakapan...");

                    const baseClass    = isActive ? "bg-blue-50" : "bg-white hover:bg-slate-50";
                    const premiumBorder = isPremium && !isActive
                      ? "border-l-4 border-l-amber-400"
                      : isActive
                      ? "border-l-4 border-l-blue-600"
                      : "border-l-4 border-l-transparent";

                    return (
                      <div key={conv.id}
                        className={`p-3.5 cursor-pointer flex gap-3 transition-all active:scale-[0.98] ${baseClass} ${premiumBorder}`}
                        onClick={() => openConversation(conv)}>
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${isPremium ? 'bg-amber-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
                          {getInitials(parent?.name || "?")}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                {parent?.name || "Pasien"}
                              </span>
                              {isPremium && <Crown size={12} className="text-amber-600 fill-amber-100 shrink-0" />}
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">
                              {lastMsg ? formatTime(lastMsg.created_at) : ""}
                            </span>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <p className={`text-xs truncate ${conv.unread_count > 0 ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                              {preview}
                            </p>
                            {conv.unread_count > 0 && (
                              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Area Percakapan Aktif */}
          <div className={`${!isMobileChatActive ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-slate-50/50 min-w-0 relative`}>
            {activeConv ? (
              <>
                <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center gap-3 shrink-0 sticky top-0 z-10">
                  <button type="button" className="md:hidden p-1.5 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md active:scale-95 transition-all" onClick={handleCloseConversation}>
                    <ChevronLeft size={24} />
                  </button>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${activeConv?.is_premium || activeParent?.is_premium ? 'bg-amber-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
                    {getInitials(activeParent?.name || "?")}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm truncate">{activeParent?.name || "Pasien"}</span>
                      {(activeConv?.is_premium || activeParent?.is_premium) && (
                        <span className="flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                          <Crown size={10} /> Pro
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 truncate">{activeParent?.email || "Pengguna Aplikasi"}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F8FAFC]">
                  {loadingMsgs ? (
                    <ChatMessagesSkeleton />
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                      <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-4">
                        <MessageCircle size={32} />
                      </div>
                      <h3 className="text-slate-700 font-bold mb-1">Mulai Konsultasi</h3>
                      <p className="text-slate-500 text-sm max-w-sm">Kirim pesan, foto, atau video untuk memulai sesi konsultasi dengan pasien ini.</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = String(msg.sender_id) === String(currentUser.id);
                      const showDateDivider = i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at);
                      return (
                        <div key={msg.id} className="flex flex-col w-full">
                          {showDateDivider && (
                            <div className="flex items-center justify-center my-5">
                              <div className="h-px bg-slate-200 flex-1" />
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 bg-[#F8FAFC]">
                                {formatDateLabel(msg.created_at)}
                              </span>
                              <div className="h-px bg-slate-200 flex-1" />
                            </div>
                          )}
                          <div className={`w-full mt-2 ${msg._optimistic ? "opacity-60" : "opacity-100"}`}>
                            <MessageBubble msg={msg} isMe={isMe} />
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} className="h-2" />
                </div>

                {/* Input Area */}
                <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 z-10">
                  {selectedFile && <FilePreview file={selectedFile} onRemove={() => setSelectedFile(null)} />}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                  <div className="flex items-end gap-2 sm:gap-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={sending}
                      className="w-[44px] h-[44px] flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95 disabled:opacity-50 shrink-0">
                      <Paperclip size={20} />
                    </button>
                    <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={sending}
                      className="w-[44px] h-[44px] hidden sm:flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95 disabled:opacity-50 shrink-0">
                      <Camera size={20} />
                    </button>
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm transition-all flex items-end">
                      <textarea ref={textareaRef} rows={1} value={inputText} onChange={handleInputChange} onKeyDown={handleKeyDown}
                        placeholder={selectedFile ? "Tambahkan keterangan (opsional)..." : "Ketik pesan..."}
                        className="w-full bg-transparent max-h-32 overflow-y-auto px-4 py-3 text-sm text-slate-800 focus:outline-none resize-none placeholder:text-slate-400"
                        style={{ minHeight: '44px' }} />
                    </div>
                    <button type="button"
                      className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0 ${(!inputText.trim() && !selectedFile) || sending ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      onClick={handleSend} disabled={(!inputText.trim() && !selectedFile) || sending}>
                      {sending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex h-full flex-col items-center justify-center text-center p-8 bg-slate-50/50">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 border border-slate-100">
                  <MessageCircle size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Portal Konsultasi Fisio</h3>
                <p className="text-slate-500 text-sm max-w-sm">Pilih percakapan dari daftar di sebelah kiri untuk melihat detail pesan dan memberikan respons kepada pasien.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- KOMPONEN PENDUKUNG ---
function SidebarLink({ to, icon: Icon, label, active, expanded, onClick, badge }) {
  return (
    <Link to={to} onClick={onClick}
      className={`flex items-center rounded-md font-medium transition-all duration-200 relative active:scale-95 ${expanded ? 'px-4 py-2.5 justify-start gap-3' : 'p-2.5 justify-center'} ${active ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}>
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

function ChatSidebarSkeleton() {
  return (
    <div className="divide-y divide-slate-100 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="p-3.5 flex gap-3 items-center bg-white">
          <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0"></div>
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-slate-200 rounded w-24"></div>
              <div className="h-2.5 bg-slate-100 rounded w-10"></div>
            </div>
            <div className="h-3 bg-slate-100 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatMessagesSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex w-full justify-start">
        <div className="flex flex-col items-start gap-1.5">
          <div className="h-12 w-48 bg-slate-200 rounded-2xl rounded-tl-sm"></div>
          <div className="h-2.5 w-12 bg-slate-200 rounded ml-1"></div>
        </div>
      </div>
      <div className="flex w-full justify-end">
        <div className="flex flex-col items-end gap-1.5">
          <div className="h-12 w-64 bg-blue-200/60 rounded-2xl rounded-tr-sm"></div>
          <div className="h-2.5 w-12 bg-slate-200 rounded mr-1"></div>
        </div>
      </div>
    </div>
  );
}