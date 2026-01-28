import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Filter,
} from "lucide-react";
import api from "../../utils/axios";

function AdminPhysioManagementPage() {
  const [filteredPhysios, setFilteredPhysios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPhysio, setSelectedPhysio] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadPhysios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/physiotherapists", {
        params: { status: statusFilter },
      });
      const data = res.data.data || [];
      setFilteredPhysios(data);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data fisioterapis");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadPhysios();
  }, [loadPhysios]);

  const handleApprove = async (id) => {
    if (!window.confirm("Setujui fisioterapis ini?")) return;
    try {
      await api.patch(`/admin/physiotherapists/${id}/approve`);
      alert("Fisioterapis berhasil disetujui");
      loadPhysios();
    } catch (err) {
      console.error(err);
      alert("Gagal menyetujui fisioterapis");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Tolak fisioterapis ini?")) return;
    try {
      await api.patch(`/admin/physiotherapists/${id}/reject`);
      alert("Fisioterapis ditolak");
      loadPhysios();
    } catch (err) {
      console.error(err);
      alert("Gagal menolak fisioterapis");
    }
  };

  const openDetailModal = (physio) => {
    setSelectedPhysio(physio);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: "#fef3c7", border: "#fcd34d", color: "#92400e" },
      active: { bg: "#d1fae5", border: "#6ee7b7", color: "#065f46" },
      rejected: { bg: "#fee2e2", border: "#fecaca", color: "#b91c1c" },
    };
    const style = styles[status] || styles.pending;
    return (
      <span
        style={{
          padding: "0.375rem 0.75rem",
          background: style.bg,
          border: `1px solid ${style.border}`,
          color: style.color,
          borderRadius: 6,
          fontSize: "0.8rem",
          fontWeight: 500,
          textTransform: "capitalize",
        }}
      >
        {status === "pending" ? "Pending" : status === "active" ? "Aktif" : "Ditolak"}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={pageStyles.page}>
        <div style={pageStyles.container}>
          <p style={pageStyles.loadingText}>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.container}>
        <div style={pageStyles.header}>
          <h1 style={pageStyles.title}>Manajemen Fisioterapis</h1>
          <div style={pageStyles.filterGroup}>
            <Filter size={18} strokeWidth={1.5} color="#6b7280" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={pageStyles.filterSelect}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="active">Aktif</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>

        {filteredPhysios.length === 0 ? (
          <p style={pageStyles.emptyText}>Tidak ada data</p>
        ) : (
          <div style={pageStyles.tableWrapper}>
            <table style={pageStyles.table}>
              <thead>
                <tr style={pageStyles.tableHeader}>
                  <th style={pageStyles.th}>Nama</th>
                  <th style={pageStyles.th}>Email</th>
                  <th style={pageStyles.th}>Klinik</th>
                  <th style={pageStyles.th}>Kota</th>
                  <th style={pageStyles.th}>Status</th>
                  <th style={pageStyles.th}>Tanggal Daftar</th>
                  <th style={pageStyles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPhysios.map((physio) => (
                  <tr key={physio.id} style={pageStyles.tableRow}>
                    <td style={pageStyles.td}>
                      <div style={pageStyles.nameCell}>
                        {physio.photo ? (
                          <img
                            src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${physio.photo}`}
                            alt={physio.name}
                            style={pageStyles.avatar}
                          />
                        ) : (
                          <div style={pageStyles.avatarPlaceholder}>
                            {physio.name?.charAt(0) || "F"}
                          </div>
                        )}
                        <span>{physio.name}</span>
                      </div>
                    </td>
                    <td style={pageStyles.td}>{physio.email}</td>
                    <td style={pageStyles.td}>{physio.clinic_name}</td>
                    <td style={pageStyles.td}>{physio.city}</td>
                    <td style={pageStyles.td}>{getStatusBadge(physio.status)}</td>
                    <td style={pageStyles.td}>
                      {new Date(physio.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td style={pageStyles.td}>
                      <div style={pageStyles.actionGroup}>
                        <button
                          onClick={() => openDetailModal(physio)}
                          style={pageStyles.detailButton}
                        >
                          <FileText size={16} strokeWidth={1.5} />
                        </button>
                        {physio.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(physio.id)}
                              style={pageStyles.approveButton}
                            >
                              <CheckCircle size={16} strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => handleReject(physio.id)}
                              style={pageStyles.rejectButton}
                            >
                              <XCircle size={16} strokeWidth={1.5} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && selectedPhysio && (
          <div style={pageStyles.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={pageStyles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={pageStyles.modalHeader}>
                <h2 style={pageStyles.modalTitle}>Detail Fisioterapis</h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={pageStyles.closeButton}
                >
                  ✕
                </button>
              </div>

              <div style={pageStyles.modalBody}>
                <div style={pageStyles.modalSection}>
                  <div style={pageStyles.modalPhoto}>
                    {selectedPhysio.photo ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${selectedPhysio.photo}`}
                        alt={selectedPhysio.name}
                        style={pageStyles.modalPhotoImg}
                      />
                    ) : (
                      <div style={pageStyles.modalPhotoPlaceholder}>
                        <User size={48} strokeWidth={1.5} color="#9ca3af" />
                      </div>
                    )}
                  </div>
                  <div style={pageStyles.modalInfo}>
                    <h3 style={pageStyles.modalName}>{selectedPhysio.name}</h3>
                    {getStatusBadge(selectedPhysio.status)}
                  </div>
                </div>

                <div style={pageStyles.modalGrid}>
                  <div style={pageStyles.infoRow}>
                    <Mail size={18} strokeWidth={1.5} color="#6b7280" />
                    <span>{selectedPhysio.email}</span>
                  </div>
                  <div style={pageStyles.infoRow}>
                    <Phone size={18} strokeWidth={1.5} color="#6b7280" />
                    <span>{selectedPhysio.phone || "-"}</span>
                  </div>
                  <div style={pageStyles.infoRow}>
                    <MapPin size={18} strokeWidth={1.5} color="#6b7280" />
                    <span>
                      {selectedPhysio.clinic_name}, {selectedPhysio.city}
                    </span>
                  </div>
                  <div style={pageStyles.infoRow}>
                    <FileText size={18} strokeWidth={1.5} color="#6b7280" />
                    <span>{selectedPhysio.specialty || "-"}</span>
                  </div>
                </div>

                {selectedPhysio.bio && (
                  <div style={pageStyles.bioSection}>
                    <strong style={pageStyles.bioLabel}>Bio:</strong>
                    <p style={pageStyles.bioText}>{selectedPhysio.bio}</p>
                  </div>
                )}

                {selectedPhysio.certificate_path && (
                  <div style={pageStyles.certificateSection}>
                    <strong style={pageStyles.bioLabel}>Sertifikat:</strong>
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${selectedPhysio.certificate_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={pageStyles.certificateLink}
                    >
                      <FileText size={16} strokeWidth={1.5} />
                      Lihat Sertifikat
                    </a>
                  </div>
                )}

                {selectedPhysio.status === "pending" && (
                  <div style={pageStyles.modalActions}>
                    <button
                      onClick={() => {
                        handleApprove(selectedPhysio.id);
                        setShowModal(false);
                      }}
                      style={pageStyles.modalApproveButton}
                    >
                      <CheckCircle size={18} strokeWidth={1.5} />
                      Setujui
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedPhysio.id);
                        setShowModal(false);
                      }}
                      style={pageStyles.modalRejectButton}
                    >
                      <XCircle size={18} strokeWidth={1.5} />
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const pageStyles = {
  page: {
    minHeight: "100vh",
    background: "#fafafa",
    padding: "2rem 1rem",
  },
  container: {
    maxWidth: 1400,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  title: {
    margin: 0,
    fontSize: "1.75rem",
    fontWeight: 600,
    color: "#111827",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.5rem 1rem",
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
  },
  filterSelect: {
    border: "none",
    outline: "none",
    fontSize: "0.9rem",
    color: "#111827",
    cursor: "pointer",
  },
  loadingText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "1rem",
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "1rem",
    marginTop: "2rem",
  },
  tableWrapper: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  th: {
    padding: "0.875rem 1rem",
    textAlign: "left",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#374151",
  },
  tableRow: {
    borderBottom: "1px solid #f3f4f6",
    transition: "background 0.2s",
  },
  td: {
    padding: "0.875rem 1rem",
    fontSize: "0.875rem",
    color: "#4b5563",
  },
  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 6,
    objectFit: "cover",
    border: "1px solid #e5e7eb",
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 6,
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#6b7280",
  },
  actionGroup: {
    display: "flex",
    gap: "0.5rem",
  },
  detailButton: {
    padding: "0.5rem",
    background: "white",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 0.2s",
    color: "#6b7280",
  },
  approveButton: {
    padding: "0.5rem",
    background: "#d1fae5",
    border: "1px solid #6ee7b7",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 0.2s",
    color: "#065f46",
  },
  rejectButton: {
    padding: "0.5rem",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 0.2s",
    color: "#b91c1c",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modal: {
    background: "white",
    borderRadius: 8,
    maxWidth: 600,
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem",
    borderBottom: "1px solid #e5e7eb",
  },
  modalTitle: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#111827",
  },
  closeButton: {
    background: "transparent",
    border: "none",
    fontSize: "1.5rem",
    color: "#6b7280",
    cursor: "pointer",
    padding: "0.25rem",
    lineHeight: 1,
  },
  modalBody: {
    padding: "1.5rem",
  },
  modalSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
    paddingBottom: "1.5rem",
    borderBottom: "1px solid #e5e7eb",
  },
  modalPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  modalPhotoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  modalPhotoPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f3f4f6",
  },
  modalInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  modalName: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#111827",
  },
  modalGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "0.875rem",
    color: "#4b5563",
  },
  bioSection: {
    marginBottom: "1.5rem",
  },
  bioLabel: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "0.5rem",
  },
  bioText: {
    margin: 0,
    fontSize: "0.875rem",
    color: "#4b5563",
    lineHeight: 1.6,
  },
  certificateSection: {
    marginBottom: "1.5rem",
  },
  certificateLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    background: "#dbeafe",
    border: "1px solid #93c5fd",
    borderRadius: 6,
    color: "#1e40af",
    fontSize: "0.875rem",
    textDecoration: "none",
    transition: "all 0.2s",
    marginTop: "0.5rem",
  },
  modalActions: {
    display: "flex",
    gap: "1rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #e5e7eb",
  },
  modalApproveButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.75rem",
    background: "#10b981",
    border: "none",
    borderRadius: 6,
    color: "white",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  modalRejectButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.75rem",
    background: "#ef4444",
    border: "none",
    borderRadius: 6,
    color: "white",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

export default AdminPhysioManagementPage;
