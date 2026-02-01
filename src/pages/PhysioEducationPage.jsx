// src/pages/PhysioEducationPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Tag,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import physioArticleService from "../services/physioArticleService";
import "../styles/physioEducation.css";

function PhysioEducationPage() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredArticles(articles);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredArticles(
        articles.filter(
          (a) =>
            a.title?.toLowerCase().includes(query) ||
            a.category?.name?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, articles]);

  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await physioArticleService.getAll();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading articles:", err);
      setError("Gagal memuat artikel.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus artikel ini?")) return;

    try {
      await physioArticleService.delete(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting article:", err);
      alert("Gagal menghapus artikel.");
    }
  };

  if (loading) {
    return (
      <div className="physio-edu-page physio-edu-page--center">
        <div className="physio-edu-loading">
          <div className="physio-edu-spinner" />
          <p>Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="physio-edu-page physio-edu-page--center">
        <div className="physio-edu-error">
          <AlertCircle size={32} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="physio-edu-page">
      <div className="physio-edu-container">
        {/* Header */}
        <header className="physio-edu-header">
          <button
            type="button"
            onClick={() => navigate("/physio/dashboard")}
            className="physio-edu-back-btn"
          >
            <ArrowLeft size={20} />
            <span>Kembali</span>
          </button>

          <div className="physio-edu-header-content">
            <div className="physio-edu-header-text">
              <h1>Kelola Artikel Edukasi</h1>
              <p>Buat dan kelola artikel edukasi untuk orang tua.</p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/physio/education/create")}
              className="physio-edu-btn-primary"
            >
              <Plus size={20} />
              <span>Buat Artikel Baru</span>
            </button>
          </div>
        </header>

        {/* Search */}
        <div className="physio-edu-search-wrapper">
          <Search className="physio-edu-search-icon" size={20} />
          <input
            type="text"
            placeholder="Cari artikel berdasarkan judul atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="physio-edu-search-input"
          />
        </div>

        {/* List */}
        {filteredArticles.length === 0 ? (
          <div className="physio-edu-empty">
            <div className="physio-edu-empty-icon">
              <Eye size={48} strokeWidth={1.5} />
            </div>
            <h3>
              {searchQuery
                ? "Tidak ada artikel yang cocok"
                : "Belum ada artikel"}
            </h3>
            <p>
              {searchQuery
                ? "Coba kata kunci lain."
                : "Mulai menulis artikel edukasi untuk membantu orang tua."}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={() => navigate("/physio/education/create")}
                className="physio-edu-btn-primary"
                style={{ marginTop: "1rem" }}
              >
                <Plus size={18} />
                <span>Buat Artikel Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="physio-edu-grid">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onEdit={() =>
                  navigate(`/physio/education/${article.id}/edit`)
                }
                onDelete={() => handleDelete(article.id)}
                onView={() => navigate(`/education/${article.slug}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleCard({ article, onEdit, onDelete, onView }) {
  return (
    <div className="physio-edu-card">
      {article.thumbnail && (
        <div className="physio-edu-card-img">
          <img src={article.thumbnail} alt={article.title} />
        </div>
      )}

      <div className="physio-edu-card-body">
        <div className="physio-edu-card-meta">
          {article.category?.name && (
            <span className="physio-edu-card-category">
              <Tag size={14} />
              {article.category.name}
            </span>
          )}
          {article.published_at && (
            <span className="physio-edu-card-date">
              <Calendar size={14} />
              {new Date(article.published_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <h3 className="physio-edu-card-title">{article.title}</h3>

        {article.excerpt && (
          <p className="physio-edu-card-excerpt">{article.excerpt}</p>
        )}

        <div className="physio-edu-card-actions">
          <button
            type="button"
            onClick={onView}
            className="physio-edu-card-btn physio-edu-card-btn--view"
          >
            <Eye size={16} />
            <span>Lihat</span>
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="physio-edu-card-btn physio-edu-card-btn--edit"
          >
            <Edit2 size={16} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="physio-edu-card-btn physio-edu-card-btn--delete"
          >
            <Trash2 size={16} />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PhysioEducationPage;
