// src/pages/ChatPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  MessageCircle, Send, ChevronLeft, Crown,
  Loader, Paperclip, X, FileText, Film, Download, Camera
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
import "../styles/chat.css";

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

function MessageBubble({ msg, isMe }) {
  const type    = msg.type || "text";
  const fileUrl = msg.file_url;
  const text    = msg.body || msg.content || "";

  return (
    <div className="chat-msg__bubble">
      {type === "image" && fileUrl && (
        <img
          src={fileUrl}
          alt={msg.file_name || "Gambar"}
          onClick={() => window.open(fileUrl, "_blank")}
          style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 8, display: "block", cursor: "pointer", objectFit: "cover", marginBottom: text ? "8px" : 0 }}
        />
      )}
      {type === "video" && fileUrl && (
        <video
          src={fileUrl}
          controls
          style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, display: "block", background: "#000", marginBottom: text ? "8px" : 0 }}
        />
      )}
      {type === "file" && fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px",
            background: isMe ? "rgba(255,255,255,0.2)" : "#f3f4f6",
            borderRadius: 8, textDecoration: "none", color: isMe ? "white" : "#374151",
            marginBottom: text ? "8px" : 0,
            maxWidth: "100%",
            boxSizing: "border-box"
          }}
        >
          <FileText size={18} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {msg.file_name || "File"}
          </span>
          <Download size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
        </a>
      )}
      {text && <span style={{ display: "block", wordBreak: "break-word" }}>{text}</span>}
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
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "8px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, padding: isImage ? "6px" : "8px 12px", maxWidth: 240 }}>
      {isImage && preview && <img src={preview} alt="preview" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />}
      {isVideo && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Film size={20} color="#4f7aff" />
          <span style={{ fontSize: "12px", color: "#374151", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
        </div>
      )}
      {!isImage && !isVideo && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <FileText size={20} color="#4f7aff" />
          <span style={{ fontSize: "12px", color: "#374151", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
        </div>
      )}
      <button onClick={onRemove} style={{ position: "absolute", top: -8, right: -8, background: "#ef4444", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
        <X size={12} strokeWidth={3} />
      </button>
    </div>
  );
}

export default function ChatPage() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const [searchParams] = useSearchParams();

  const physioIdParam = searchParams.get("physio_id") || location.state?.physiotherapistId || null;
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

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

  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const textareaRef    = useRef(null);
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        if (physioIdParam) {
          const res = await getAccessStatus(physioIdParam);
          setIsPremium(res?.has_access === true || res?.is_premium === true);
        } else {
          const res = await getSubscriptionStatus();
          const anyActive = res?.is_premium === true || (res?.subscription?.status === "active" && res?.subscription?.expired_at && new Date(res.subscription.expired_at) > new Date());
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
          const existing = list.find((c) => String(c.physio?.physiotherapist?.id || "") === String(physioIdParam) || String(c.physio_id || "") === String(physioIdParam) || String(c.physiotherapist_id || "") === String(physioIdParam));
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

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { return () => { unsubscribeRef.current?.(); }; }, []);

  const openConversation = useCallback(async (conv) => {
    setActiveConv(conv);
    setLoadingMsgs(true);
    unsubscribeRef.current?.();
    try {
      const res = await getMessages(conv.id);
      setMessages(res?.data || res || []);
    } catch (err) {
      console.error("error:", err);
    } finally {
      setLoadingMsgs(false);
    }
    const unsub = subscribeToConversation(conv.id, (newMsg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });
    unsubscribeRef.current = unsub;
  }, []);

  const handleCloseConversation = () => {
    setActiveConv(null);
  };

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

  const handleSend = async () => {
    const text = inputText.trim();
    if ((!text && !selectedFile) || !activeConv || sending) return;

    setSending(true);
    const capturedFile = selectedFile;
    setInputText("");
    setSelectedFile(null);

    const guessType = capturedFile ? (capturedFile.type.startsWith("image/") ? "image" : capturedFile.type.startsWith("video/") ? "video" : "file") : "text";

    const optimistic = {
      id: `opt-${Date.now()}`,
      body: text || capturedFile?.name || "File",
      type: guessType,
      file_url: capturedFile ? URL.createObjectURL(capturedFile) : null,
      file_name: capturedFile?.name || null,
      sender_id: currentUser.id,
      created_at: new Date().toISOString(),
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
      setMessages((prev) => prev.map((m) => (m._optimistic ? sent : m)));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => !m._optimistic));
      setInputText(text);
      setSelectedFile(capturedFile);
      alert("Gagal mengirim. Silakan coba lagi.");
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

  if (isPremium === null) {
    return (
      <div className="chat-wrapper" style={{ justifyContent: "center", alignItems: "center" }}>
        <div className="chat-loading"><Loader className="chat-spinner" /> Memeriksa akses...</div>
      </div>
    );
  }

  if (isPremium === false) {
    return (
      <div className="chat-locked-overlay">
        <div className="chat-locked-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Crown size={32} />
            </div>
          </div>
          <h3 style={{ fontSize: 20, marginBottom: 12 }}>Akses Chat Terkunci</h3>
          <p style={{ color: '#6b7280', lineHeight: 1.5 }}>
            {physioIdParam ? "Lakukan pembayaran terlebih dahulu untuk memulai konsultasi." : "Konsultasi tersedia setelah melakukan pembayaran ke fisioterapis pilihan Anda."}
          </p>
          <button className="chat-locked-card__btn" onClick={() => physioIdParam ? setShowPremiumModal(true) : navigate("/physiotherapists")}>
            {physioIdParam ? "Bayar Sekarang" : "Pilih Fisioterapis"}
          </button>
        </div>
        {showPremiumModal && (
          <PremiumModal physioId={physioIdParam} onClose={() => setShowPremiumModal(false)} onSuccess={() => { setIsPremium(true); setShowPremiumModal(false); }} />
        )}
      </div>
    );
  }

  const activePhysio = activeConv?.physio || activeConv?.physiotherapist || null;
  const isMobileChatActive = activeConv !== null;

  return (
    <div className="chat-wrapper">
      <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" style={{ display: "none" }} onChange={handleFileChange} />
      
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileChange} />
      <aside className={`chat-sidebar ${isMobileChatActive ? 'hide-on-mobile' : ''}`}>
        <div className="chat-sidebar__header">
          <button className="chat-sidebar__back" onClick={() => navigate("/dashboard")}>
            <ChevronLeft size={16} /> Kembali ke Dashboard
          </button>
          <div className="chat-sidebar__title">
            <MessageCircle size={24} color="#4f7aff" />
            <h2>Pesan</h2>
          </div>
        </div>

        <div className="chat-sidebar__list">
          {loadingConvs ? (
            <div className="chat-loading"><Loader size={18} className="chat-spinner" /> Memuat...</div>
          ) : conversations.length === 0 ? (
            <div className="chat-empty-state">
              <p>Belum ada percakapan.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const physio   = conv.physio || conv.physiotherapist || null;
              const lastMsg  = conv.last_message || conv.latest_message;
              const isActive = activeConv?.id === conv.id;
              const preview  = lastMsg?.type === "image" ? "Gambar" : lastMsg?.type === "video" ? "Video" : lastMsg?.type === "file" ? "File" : (lastMsg?.body || lastMsg?.content || "Mulai obrolan...");

              return (
                <div key={conv.id} className={`chat-conv-item ${isActive ? "chat-conv-item--active" : ""}`} onClick={() => openConversation(conv)}>
                  <div className="chat-conv-item__avatar">{getInitials(physio?.name || "?")}</div>
                  <div className="chat-conv-item__info">
                    <div className="chat-conv-item__name">{physio?.name || "Fisioterapis"}</div>
                    <div className="chat-conv-item__preview">{preview}</div>
                  </div>
                  <div className="chat-conv-item__meta">
                    <span className="chat-conv-item__time">{lastMsg ? formatTime(lastMsg.created_at) : ""}</span>
                    {conv.unread_count > 0 && <div className="chat-conv-item__unread" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <main className={`chat-main ${!isMobileChatActive ? 'hide-on-mobile' : ''}`}>
        {activeConv ? (
          <>
            <div className="chat-header">
              <button className="chat-header__mobile-back" onClick={handleCloseConversation}>
                <ChevronLeft size={24} />
              </button>
              <div className="chat-header__avatar">{getInitials(activePhysio?.name || "?")}</div>
              <div className="chat-header__info">
                <div className="chat-header__name">{activePhysio?.name || "Fisioterapis"}</div>
                <div className="chat-header__status">{activePhysio?.clinic_name || "Online"}</div>
              </div>
            </div>

            <div className="chat-messages">
              {loadingMsgs ? (
                <div className="chat-loading"><Loader size={18} className="chat-spinner" /> Memuat pesan...</div>
              ) : messages.length === 0 ? (
                <div className="chat-empty-state">
                  <MessageCircle size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
                  <p>Mulai percakapan dengan {activePhysio?.name || "fisioterapis"}</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = String(msg.sender_id) === String(currentUser.id);
                  const showDateDivider = i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at);

                  return (
                    <div key={msg.id} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                      {showDateDivider && (
                        <div className="chat-date-divider">
                          <div className="chat-date-divider__line" />
                          <span className="chat-date-divider__text">{formatDateLabel(msg.created_at)}</span>
                          <div className="chat-date-divider__line" />
                        </div>
                      )}
                      <div className={`chat-msg ${isMe ? "chat-msg--me" : "chat-msg--other"}`} style={{ opacity: msg._optimistic ? 0.6 : 1 }}>
                        <div>
                          <MessageBubble msg={msg} isMe={isMe} />
                          <div className="chat-msg__meta">
                            <span>{formatTime(msg.created_at)}</span>
                            {msg._optimistic && <span>· Mengirim</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              {selectedFile && (
                <FilePreview file={selectedFile} onRemove={() => setSelectedFile(null)} />
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden", marginBottom: "8px" }}>
                  <div style={{ height: "100%", width: `${uploadProgress}%`, background: "#4f7aff", transition: "width 0.3s ease" }} />
                </div>
              )}
              <div className="chat-input-controls">
                <button onClick={() => fileInputRef.current?.click()} disabled={sending} className="chat-attach-btn" title="Lampirkan file">
                  <Paperclip size={20} />
                </button>
                <button onClick={() => cameraInputRef.current?.click()} disabled={sending} className="chat-attach-btn" title="Ambil foto">
                  <Camera size={20} />
                </button>
                <div className="chat-input-wrap">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ketik pesan..."
                  />
                </div>
                <button className="chat-send-btn" onClick={handleSend} disabled={(!inputText.trim() && !selectedFile) || sending} title="Kirim pesan">
                  {sending ? <Loader size={18} className="chat-spinner" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="chat-empty-state">
            <MessageCircle size={64} style={{ opacity: 0.1, marginBottom: 16 }} />
            <h3>Ruang Konsultasi</h3>
            <p>Pilih percakapan dari daftar di sebelah kiri.</p>
          </div>
        )}
      </main>
    </div>
  );
}