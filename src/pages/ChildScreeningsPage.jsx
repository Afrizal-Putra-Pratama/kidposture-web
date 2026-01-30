import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Activity,
  Calendar,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  Filter,
  Plus,
  Eye,
} from "lucide-react";
import { fetchChildScreenings } from "../services/screeningService.jsx";
import "../styles/childScreenings.css";

function ChildScreeningsPage() {
  const { childId } = useParams();
  const [screenings, setScreenings] = useState([]);
  const [filteredScreenings, setFilteredScreenings] = useState([]);
  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterCategory, setFilterCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }

    if (!childId) {
      setError("ID anak tidak ditemukan.");
      setLoading(false);
      return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setMaxDate(`${year}-${month}-${day}`);

    loadScreenings();
  }, [childId]);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [screenings, filterCategory, startDate, endDate]);

  const loadScreenings = async () => {
    try {
      setLoading(true);
      setError(null);

      const json = await fetchChildScreenings(childId);
      const list = Array.isArray(json) ? json : json.data ?? [];
      setScreenings(list);

      if (list.length > 0 && list[0].child) {
        setChildName(list[0].child.name);
      }
    } catch (err) {
      console.error("Error loading screenings:", err);
      setError(err.message || "Gagal mengambil data screening");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...screenings];

    if (filterCategory) {
      filtered = filtered.filter((s) => {
        const cat = s.category?.toLowerCase() || "";
        if (filterCategory === "good") return cat === "good";
        if (filterCategory === "fair") return cat === "fair";
        if (filterCategory === "attention")
          return cat === "needs_attention" || cat === "attention";
        return false;
      });
    }

    if (startDate) {
      filtered = filtered.filter(
        (s) => new Date(s.created_at) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (s) => new Date(s.created_at) <= new Date(endDate + "T23:59:59")
      );
    }

    setFilteredScreenings(filtered);
  };

  const resetFilters = () => {
    setFilterCategory("");
    setStartDate("");
    setEndDate("");
  };

  const latestScreening = screenings.length > 0 ? screenings[0] : null;

  const chartData = useMemo(
    () =>
      filteredScreenings
        .map((s) => ({
          date: new Date(s.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
          }),
          score: s.score,
        }))
        .reverse(),
    [filteredScreenings]
  );

  const getCategoryConfig = (category) => {
    const cat = category?.toUpperCase() || "";
    if (cat === "GOOD") return { label: "Baik", color: "success" };
    if (cat === "FAIR") return { label: "Cukup", color: "warning" };
    return { label: "Perlu Perhatian", color: "danger" };
  };

  const getCategoryColor = (category) => {
    const cat = category?.toUpperCase() || "";
    if (cat === "GOOD") return "#10b981";
    if (cat === "FAIR") return "#f59e0b";
    return "#ef4444";
  };

  const getMetricStatus = (value, type) => {
    let threshold = { good: 2.0, warning: 5.0 };
    if (type === "index") {
      threshold = { good: 0.2, warning: 0.35 };
    }

    const absVal = Math.abs(value);
    if (absVal <= threshold.good) {
      return { color: "#10b981", label: "Normal" };
    } else if (absVal <= threshold.warning) {
      return { color: "#f59e0b", label: "Cukup" };
    } else {
      return { color: "#ef4444", label: "Perhatian" };
    }
  };

  const totalPages = Math.ceil(filteredScreenings.length / rowsPerPage) || 1;
  const paginatedScreenings = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredScreenings.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredScreenings, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="screenings-page">
        <div className="screenings-container">
          <div className="screenings-skeleton">
            <Activity size={48} strokeWidth={1.5} />
            <p>Memuat data screening...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="screenings-page">
        <div className="screenings-container">
          <div className="screenings-error">
            <div className="screenings-error__icon">
              <AlertCircle size={48} strokeWidth={1.5} />
            </div>
            <h2>Gagal Memuat Data</h2>
            <p>{error}</p>
            <button
              onClick={loadScreenings}
              className="screenings-btn screenings-btn--primary"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!screenings.length) {
    return (
      <div className="screenings-page">
        <div className="screenings-container">
          <div className="screenings-header screenings-header--center">
            <div className="screenings-header__title">
              <h1>Data Anak {childName || ""}</h1>
              <p>Belum ada data screening untuk anak ini</p>
            </div>
          </div>

          <div className="screenings-empty">
            <div className="screenings-empty__icon">
              <Activity size={48} strokeWidth={1.5} />
            </div>
            <h3>Belum Ada Screening</h3>
            <p>
              Mulai screening pertama untuk memantau postur dan perkembangan anak.
            </p>
            <button
              onClick={() => navigate(`/children/${childId}/screenings/new`)}
              className="screenings-btn screenings-btn--primary"
            >
              <Plus size={18} strokeWidth={2} />
              Mulai Screening
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screenings-page">
      <div className="screenings-container">
        {/* Header */}
        <div className="screenings-header screenings-header--center">
          <div className="screenings-header__title">
            <h1>Data Anak {childName || ""}</h1>
            <p>Riwayat screening dan perkembangan postur dari waktu ke waktu</p>
          </div>
          <button
            onClick={() => navigate(`/children/${childId}/screenings/new`)}
            className="screenings-btn screenings-btn--primary"
          >
            <Plus size={18} strokeWidth={2} />
            Screening Baru
          </button>
        </div>

        {/* Stats */}
        <div className="screenings-stats">
          <div className="stat-card stat-card--compact stat-card--highlight">
            <div className="stat-card__header">
              <TrendingUp size={18} strokeWidth={1.5} />
              <h3>Status Terbaru</h3>
            </div>
            {latestScreening && (
              <div className="stat-card__content">
                <div className="stat-card__score">
                  <span
                    className="score-value"
                    style={{ color: getCategoryColor(latestScreening.category) }}
                  >
                    {latestScreening.score?.toFixed(1) || "-"}
                  </span>
                  <span className="score-max">/ 100</span>
                </div>
                <span
                  className={`stat-badge stat-badge--${
                    getCategoryConfig(latestScreening.category).color
                  }`}
                >
                  {getCategoryConfig(latestScreening.category).label}
                </span>
                <p className="stat-card__summary">
                  {latestScreening.summary ||
                    "Ringkasan hasil screening akan tampil di sini."}
                </p>
                <div className="stat-card__date">
                  <Calendar size={14} strokeWidth={2} />
                  {new Date(latestScreening.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Detail Analisis - sesuai main.py */}
          {latestScreening?.metrics && (
            <div className="stat-card stat-card--compact">
              <div className="stat-card__header">
                <Activity size={18} strokeWidth={1.5} />
                <h3>Hasil Analisis Postur</h3>
              </div>
              <div className="metrics-list">
                {latestScreening.metrics.shoulder_tilt_index != null && (
                  <MetricColorful
                    label="Kemiringan Bahu"
                    value={latestScreening.metrics.shoulder_tilt_index}
                    unit="%"
                    type="percent"
                    getStatus={getMetricStatus}
                  />
                )}
                {latestScreening.metrics.hip_tilt_index != null && (
                  <MetricColorful
                    label="Kemiringan Panggul"
                    value={latestScreening.metrics.hip_tilt_index}
                    unit="%"
                    type="percent"
                    getStatus={getMetricStatus}
                  />
                )}
                {latestScreening.metrics.forward_head_index != null && (
                  <MetricColorful
                    label="Posisi Kepala Maju"
                    value={latestScreening.metrics.forward_head_index}
                    unit=""
                    type="index"
                    getStatus={getMetricStatus}
                  />
                )}
                {latestScreening.metrics.neck_inclination_deg != null && (
                  <MetricColorful
                    label="Kemiringan Leher"
                    value={latestScreening.metrics.neck_inclination_deg}
                    unit="°"
                    type="degree"
                    getStatus={getMetricStatus}
                  />
                )}
                {latestScreening.metrics.torso_inclination_deg != null && (
                  <MetricColorful
                    label="Kemiringan Badan"
                    value={latestScreening.metrics.torso_inclination_deg}
                    unit="°"
                    type="degree"
                    getStatus={getMetricStatus}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="screenings-chart">
            <h3>Perubahan Skor Dari Hari ke Hari</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: 12 }} />
                <YAxis
                  domain={[0, 100]}
                  stroke="#64748b"
                  style={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => [value, "Skor"]}
                  labelFormatter={(label) => `Tanggal: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#0ea5e9" }}
                  activeDot={{ r: 6 }}
                  name="Skor Postur"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Riwayat */}
        <div className="screenings-section">
          <div className="screenings-section__header">
            <div className="screenings-section__title">
              <h2>Riwayat Screening</h2>
              <span className="screenings-count">
                {filteredScreenings.length} dari {screenings.length}
              </span>
            </div>

            <button
              type="button"
              className="filter-toggle-btn"
              onClick={() => setFiltersOpen((prev) => !prev)}
              aria-expanded={filtersOpen}
            >
              <Filter size={16} strokeWidth={2} />
              <span>Filter</span>
            </button>
          </div>

          {filtersOpen && (
            <div className="screenings-filters">
              <div className="filter-group">
                <label>Kategori</label>
                <div className="select-wrapper">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Semua Kategori</option>
                    <option value="good">Baik</option>
                    <option value="fair">Cukup</option>
                    <option value="attention">Perlu Perhatian</option>
                  </select>
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>

              <div className="filter-group">
                <label>Dari Tanggal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (!e.target.value) {
                      setEndDate("");
                    }
                  }}
                  max={maxDate}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>Sampai Tanggal</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={maxDate}
                  min={startDate || undefined}
                  disabled={!startDate}
                  className="filter-input"
                />
              </div>

              {(filterCategory || startDate || endDate) && (
                <div className="filter-group filter-group--reset">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="reset-filter-btn"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tabel */}
          {filteredScreenings.length === 0 ? (
            <div className="screenings-empty screenings-empty--small">
              <h3>Tidak Ada Hasil</h3>
              <p>Tidak ditemukan screening dengan kriteria filter yang dipilih.</p>
            </div>
          ) : (
            <>
              <div className="screenings-table-wrapper">
                <table className="screenings-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th className="screenings-table__score-col">Skor</th>
                      <th>Kategori</th>
                      <th className="screenings-table__summary-col">Ringkasan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedScreenings.map((scr) => {
                      const categoryConfig = getCategoryConfig(scr.category);
                      const dateObj = new Date(scr.created_at);

                      return (
                        <tr key={scr.id}>
                          <td data-label="Tanggal">
                            <div className="table-date">
                              {dateObj.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                              <span>
                                {dateObj.toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </td>
                          <td
                            data-label="Skor"
                            className="screenings-table__score-col"
                          >
                            <span className="table-score">
                              {scr.score?.toFixed(1) || "-"}
                            </span>
                          </td>
                          <td data-label="Kategori">
                            <span
                              className={`screening-badge screening-badge--${categoryConfig.color}`}
                            >
                              {categoryConfig.label}
                            </span>
                          </td>
                          <td
                            data-label="Ringkasan"
                            className="screenings-table__summary-col"
                          >
                            <span className="table-summary">
                              {scr.summary?.length > 80
                                ? scr.summary.slice(0, 80) + "..."
                                : scr.summary}
                            </span>
                          </td>
                          <td data-label="Aksi">
                            <Link
                              to={`/screenings/${scr.id}`}
                              className="screening-link"
                            >
                              <Eye size={16} strokeWidth={2} />
                              <span>Detail</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </button>
                  <span className="pagination-info">
                    Hal {currentPage} dari {totalPages}
                  </span>
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricColorful({ label, value, unit, type, getStatus }) {
  const status = getStatus(value, type);

  return (
    <div className="metric-colorful">
      <div className="metric-colorful__row">
        <span className="metric-label-compact">{label}</span>
        <div className="metric-colorful__value-group">
          <span className="metric-value-colored" style={{ color: status.color }}>
            {type === "index" || type === "percent"
              ? value.toFixed(2)
              : value.toFixed(1)}
            {unit}
          </span>
          <span
            className="metric-status-badge"
            style={{
              backgroundColor: status.color + "20",
              color: status.color,
            }}
          >
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ChildScreeningsPage;
