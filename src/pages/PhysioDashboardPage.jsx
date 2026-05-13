// src/pages/PhysioDashboardPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Clock,
  CheckCircle,
  Settings,
  BookOpen,
  UserCog,
  MessageCircle,
  Crown,
  Bell,
  X,
} from "lucide-react";
import { fetchPhysioReferrals } from "../services/screeningService";
import { getConversations } from "../services/chatService";
import "../styles/physioDashboard.css";
import "../styles/chat.css";

function PhysioDashboardPage() {
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("requested");
  const [conversations, setConversations] = useState([]);
  const [showChatNotif, setShowChatNotif] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadScreenings();
    loadConversations();
  }, []);

  const loadScreenings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPhysioReferrals();
      const list = data?.data ?? data;
      setScreenings(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error loading physio referrals:", err);
      setError("Gagal memuat data rujukan untuk fisioterapis.");
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await getConversations();
      const list = res?.data || res || [];
      setConversations(list);
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  };

  const unreadChats = conversations.filter((c) => c.unread_count > 0);
  const totalUnread = unreadChats.length;

  const onlyReferred = screenings.filter(
    (s) => s.referral_status && s.referral_status !== "none"
  );

  const filteredScreenings = onlyReferred.filter(
    (s) => s.referral_status === activeTab
  );

  // Pisahkan premium dari non-premium dalam tab aktif
  const premiumScreenings = filteredScreenings.filter(
    (s) => s.parent?.is_premium === true || s.is_premium === true
  );
  const regularScreenings = filteredScreenings.filter(
    (s) => !s.parent?.is_premium && !s.is_premium
  );

  const countByStatus = (status) =>
    onlyReferred.filter((s) => s.referral_status === status).length;

  if (loading) {
    return (
      <div className="physio-page physio-page--center">
        <div className="physio-loading">
          <div className="physio-spinner" />
          <p>Memuat dashboard fisioterapis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="physio-page physio-page--center">
        <div className="physio-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="physio-page">
      <div className="physio-container">

        {/* ── Header ── */}
        <header className="physio-header">
          <div className="physio-header-left">
            <div className="physio-header-text">
              <h1>
                <UserCog className="physio-header-icon" size={28} />
                Dashboard Fisioterapis
              </h1>
              <p>Screening anak yang dirujuk kepada Anda.</p>
            </div>
          </div>

          <div className="physio-header-actions">
            {/* Notifikasi Chat */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowChatNotif((p) => !p)}
                className="physio-btn-outline"
                style={{ position: "relative" }}
              >
                <Bell size={18} />
                <span>Pesan</span>
                {totalUnread > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      background: "#ef4444",
                      color: "white",
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {totalUnread}
                  </span>
                )}
              </button>

              {/* Dropdown notifikasi chat */}
              {showChatNotif && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    width: 300,
                    zIndex: 200,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "0.875rem 1rem",
                      borderBottom: "1px solid #f3f4f6",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      Pesan Masuk
                    </span>
                    <button
                      onClick={() => setShowChatNotif(false)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#6b7280",
                        padding: 2,
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ maxHeight: 280, overflowY: "auto" }}>
                    {conversations.length === 0 ? (
                      <div
                        style={{
                          padding: "1.5rem",
                          textAlign: "center",
                          color: "#9ca3af",
                          fontSize: "0.85rem",
                        }}
                      >
                        Belum ada pesan masuk
                      </div>
                    ) : (
                      conversations.map((conv) => {
                        const parent =
                          conv.parent ||
                          (conv.participants || []).find(
                            (p) => p.role !== "physio"
                          );
                        const isPremium =
                          conv.is_premium || parent?.is_premium;
                        const hasUnread = conv.unread_count > 0;

                        return (
                          <div
                            key={conv.id}
                            onClick={() => {
                              setShowChatNotif(false);
                              navigate(
                                `/physio/chat?conversation_id=${conv.id}`
                              );
                            }}
                            style={{
                              padding: "0.75rem 1rem",
                              borderBottom: "1px solid #f9fafb",
                              cursor: "pointer",
                              background: hasUnread ? "#eff6ff" : "white",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.625rem",
                              transition: "background 0.15s",
                            }}
                          >
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #4f7aff, #818cf8)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: 700,
                                fontSize: "0.8rem",
                                flexShrink: 0,
                              }}
                            >
                              {(parent?.name || "?")[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: hasUnread ? 700 : 500,
                                    fontSize: "0.85rem",
                                    color: "#111827",
                                  }}
                                >
                                  {parent?.name || "Parent"}
                                </span>
                                {isPremium && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 2,
                                      background: "#fef3c7",
                                      color: "#d97706",
                                      borderRadius: 4,
                                      padding: "1px 5px",
                                      fontSize: "0.6rem",
                                      fontWeight: 700,
                                    }}
                                  >
                                    <Crown size={8} /> PRO
                                  </span>
                                )}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#6b7280",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {conv.last_message?.content ||
                                  "Mulai percakapan..."}
                              </div>
                            </div>
                            {hasUnread && (
                              <div
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: "#4f7aff",
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div
                    style={{
                      padding: "0.625rem 1rem",
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    <button
                      onClick={() => {
                        setShowChatNotif(false);
                        navigate("/physio/chat");
                      }}
                      style={{
                        width: "100%",
                        background: "#4f7aff",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        padding: "0.5rem",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <MessageCircle size={14} />
                      Buka Semua Pesan
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate("/physio/education")}
              className="physio-btn-cta"
            >
              <BookOpen size={18} />
              <span>Kelola Artikel</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/physio/profile")}
              className="physio-btn-outline"
            >
              <Settings size={18} />
              <span>Pengaturan</span>
            </button>
          </div>
        </header>

        {/* ── Stats ── */}
        <div className="physio-stats">
          <StatCard
            label="Menunggu Konfirmasi"
            value={countByStatus("requested")}
            icon={<Clock size={24} />}
            color="#f59e0b"
          />
          <StatCard
            label="Sedang Ditangani"
            value={countByStatus("accepted")}
            icon={<Stethoscope size={24} />}
            color="#3b82f6"
          />
          <StatCard
            label="Selesai"
            value={countByStatus("completed")}
            icon={<CheckCircle size={24} />}
            color="#10b981"
          />
          {/* ✅ Stat khusus pesan premium */}
          <StatCard
            label="Pesan Premium"
            value={totalUnread}
            icon={<Crown size={24} />}
            color="#f59e0b"
            onClick={() => navigate("/physio/chat")}
            clickable
          />
        </div>

        {/* ✅ Banner highlight pasien premium di tab aktif */}
        {premiumScreenings.length > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
              border: "1.5px solid #fde68a",
              borderRadius: 14,
              padding: "1rem 1.25rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "#f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Crown size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: "#92400e",
                  fontSize: "0.9rem",
                  marginBottom: 2,
                }}
              >
                {premiumScreenings.length} Pasien Premium
              </div>
              <div style={{ fontSize: "0.8rem", color: "#b45309" }}>
                Pasien berikut berlangganan premium dan dapat menghubungi Anda
                via chat langsung.
              </div>
            </div>
            <button
              onClick={() => navigate("/physio/chat")}
              style={{
                background: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "0.5rem 0.875rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                whiteSpace: "nowrap",
              }}
            >
              <MessageCircle size={14} />
              Buka Chat
            </button>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="physio-tabs">
          {[
            { key: "requested", label: "Menunggu Konfirmasi" },
            { key: "accepted", label: "Sedang Ditangani" },
            { key: "completed", label: "Selesai" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`physio-tab ${
                activeTab === tab.key ? "physio-tab--active" : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tabel ── */}
        {filteredScreenings.length === 0 ? (
          <div className="physio-empty">
            <div className="physio-empty-icon">
              <Stethoscope size={48} strokeWidth={1.5} />
            </div>
            <h3>Belum ada screening di tab ini</h3>
            <p>
              Screening rujukan baru akan muncul di tab "Menunggu Konfirmasi".
            </p>
          </div>
        ) : (
          <div className="physio-table-wrapper">
            {/* ── Bagian Premium (ditampilkan duluan) ── */}
            {premiumScreenings.length > 0 && (
              <>
                {/* Label section premium */}
                <div
                  style={{
                    background: "#fffbeb",
                    borderBottom: "1px solid #fde68a",
                    padding: "0.5rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Crown size={14} color="#d97706" />
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#92400e",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Pasien Premium · Tampil Prioritas
                  </span>
                </div>
                <table className="physio-table">
                  <thead>
                    <tr>
                      <Th>Anak</Th>
                      <Th>Orang Tua</Th>
                      <Th>Skor</Th>
                      <Th>Kategori</Th>
                      <Th>Tanggal</Th>
                      <Th>Chat</Th>
                      <Th>Aksi</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {premiumScreenings.map((s) => (
                      <ScreeningRow
                        key={s.id}
                        s={s}
                        isPremium
                        onDetail={() =>
                          navigate(`/physio/screenings/${s.id}`)
                        }
                        onChat={() =>
                          navigate(
                            `/physio/chat?conversation_id=${
                              conversations.find(
                                (c) =>
                                  (c.parent?.id || c.parent_id) ===
                                  (s.parent?.id || s.parent_id)
                              )?.id || ""
                            }`
                          )
                        }
                        hasConversation={conversations.some(
                          (c) =>
                            (c.parent?.id || c.parent_id) ===
                            (s.parent?.id || s.parent_id)
                        )}
                      />
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {/* ── Bagian Regular ── */}
            {regularScreenings.length > 0 && (
              <>
                {premiumScreenings.length > 0 && (
                  <div
                    style={{
                      background: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                      borderTop: "1px solid #e5e7eb",
                      padding: "0.5rem 1rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Pasien Lainnya
                    </span>
                  </div>
                )}
                <table className="physio-table">
                  <thead>
                    <tr>
                      <Th>Anak</Th>
                      <Th>Orang Tua</Th>
                      <Th>Skor</Th>
                      <Th>Kategori</Th>
                      <Th>Tanggal</Th>
                      <Th>Aksi</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {regularScreenings.map((s) => (
                      <ScreeningRow
                        key={s.id}
                        s={s}
                        isPremium={false}
                        onDetail={() =>
                          navigate(`/physio/screenings/${s.id}`)
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Row komponen ──────────────────────────────────────────────────────────────

function ScreeningRow({ s, isPremium, onDetail, onChat, hasConversation }) {
  return (
    <tr
      style={
        isPremium
          ? { background: "#fffef7" }
          : {}
      }
    >
      <Td>
        <div className="physio-child-name">{s.child?.name}</div>
        <div className="physio-child-age">
          {s.child?.age_years != null ? `${s.child.age_years} tahun` : "-"}
        </div>
      </Td>
      <Td>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div>
            <div className="physio-parent-name">{s.parent?.name}</div>
            <div className="physio-parent-email">{s.parent?.email}</div>
          </div>
          {isPremium && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                background: "#fef3c7",
                color: "#d97706",
                border: "1px solid #fde68a",
                borderRadius: 5,
                padding: "2px 6px",
                fontSize: "0.65rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              <Crown size={9} /> Premium
            </span>
          )}
        </div>
      </Td>
      <Td className="physio-score">{s.score ?? "-"}</Td>
      <Td>
        <span
          className={`physio-badge physio-badge--${
            s.category === "GOOD"
              ? "good"
              : s.category === "FAIR"
              ? "fair"
              : "poor"
          }`}
        >
          {s.category || "Perlu perhatian"}
        </span>
      </Td>
      <Td>
        {new Date(s.created_at).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </Td>

      {/* Kolom Chat hanya untuk premium */}
      {isPremium && (
        <Td>
          <button
            type="button"
            onClick={onChat}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              background: hasConversation ? "#eff6ff" : "#f0fdf4",
              color: hasConversation ? "#3b82f6" : "#16a34a",
              border: `1px solid ${hasConversation ? "#bfdbfe" : "#bbf7d0"}`,
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <MessageCircle size={13} />
            {hasConversation ? "Balas" : "Chat"}
          </button>
        </Td>
      )}

      <Td>
        <button
          type="button"
          onClick={onDetail}
          className="physio-btn-link"
        >
          Lihat Detail
        </button>
      </Td>
    </tr>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color, onClick, clickable }) {
  return (
    <div
      className="physio-stat-card"
      onClick={onClick}
      style={clickable ? { cursor: "pointer" } : {}}
    >
      <div className="physio-stat-info">
        <div className="physio-stat-label">{label}</div>
        <div className="physio-stat-value">{value}</div>
      </div>
      <div className="physio-stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="physio-th">{children}</th>;
}

function Td({ children, className = "" }) {
  return <td className={`physio-td ${className}`}>{children}</td>;
}

export default PhysioDashboardPage;