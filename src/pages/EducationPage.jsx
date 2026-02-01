import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Eye,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { articleService } from "../services/articleService";
import "../styles/education.css";

// BASE URL backend (harus sama dengan APP_URL Laravel, set di VITE_API_URL)
// Ambil base URL dan potong /api kalau ada
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "")
  .replace(/\/api\/?$/, ""); // hapus /api di akhir kalau ada

function EducationPage() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // load kategori
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await articleService.getCategories();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  // load artikel
  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage };
        if (selectedCategory) params.category_id = selectedCategory;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const response = await articleService.getArticles(params);
        if (response.success) {
          const list = response.data || [];
          setArticles(list);
          setPagination(response.pagination);

          if (list.length > 0) setFeatured(list[0]);
          else setFeatured(null);
        }
      } catch (error) {
        console.error("Error loading articles:", error);
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, [selectedCategory, searchQuery, currentPage]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const otherArticles = featured
    ? articles.filter((a) => a.id !== featured.id)
    : articles;

  return (
    <div className="edu-page">
      <div className="edu-container">
        {/* Header */}
        <header className="edu-header">
          <div className="edu-header-title">
            <h1>Edukasi Postur Anak</h1>
            <p>
              Artikel dan panduan singkat seputar kesehatan postur tubuh anak.
            </p>
          </div>

          {/* Search bar desktop */}
          <form
            className="edu-search-bar desktop-only"
            onSubmit={handleSearchSubmit}
          >
            <input
              type="text"
              placeholder="Cari artikel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="edu-search-input"
            />
            <button type="submit" className="edu-search-btn">
              <Search size={16} strokeWidth={2} />
            </button>
          </form>
        </header>

        {/* Search bar mobile */}
        <form
          className="edu-search-bar mobile-only"
          onSubmit={handleSearchSubmit}
        >
          <input
            type="text"
            placeholder="Cari artikel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="edu-search-input"
          />
          <button type="submit" className="edu-search-btn">
            <Search size={16} strokeWidth={2} />
          </button>
        </form>

        {/* Filter bar */}
        <section className="edu-filter-row">
          <div className="edu-category-bar desktop-only">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`edu-cat-chip ${
                selectedCategory === null ? "edu-cat-chip--active" : ""
              }`}
            >
              Semua
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`edu-cat-chip ${
                  selectedCategory === category.id ? "edu-cat-chip--active" : ""
                }`}
              >
                {category.icon && (
                  <span className="edu-cat-icon">{category.icon}</span>
                )}
                {category.name}
              </button>
            ))}
          </div>

          {/* Tombol Filter mobile */}
          <button
            className="edu-filter-mobile-btn mobile-only"
            onClick={() => setMobileFilterOpen(true)}
          >
            <Filter size={16} strokeWidth={2} />
            Filter Kategori
          </button>
        </section>

        {/* Loading */}
        {loading && (
          <div className="edu-loading">
            <div className="edu-spinner" />
            <p>Memuat artikel...</p>
          </div>
        )}

        {!loading && (
          <>
            {articles.length > 0 && (
              <>
                {/* Featured + sidebar */}
                <section className="edu-main-layout">
                  {featured && (
                    <Link
                      to={`/education/${featured.slug}`}
                      className="edu-featured-card"
                    >
                      <div className="edu-featured-image-wrapper">
                        {featured.thumbnail ? (
                          <img
                            src={
                              featured.thumbnail.startsWith("http")
                                ? featured.thumbnail
                                : `${API_BASE_URL}${featured.thumbnail}`
                            }
                            alt={featured.title}
                            className="edu-featured-image"
                          />
                        ) : (
                          <div className="edu-featured-placeholder">
                            <span>Artikel</span>
                          </div>
                        )}
                      </div>
                      <div className="edu-featured-content">
                        <div className="edu-featured-category">
                          {featured.category?.icon && (
                            <span className="edu-cat-icon">
                              {featured.category.icon}
                            </span>
                          )}
                          <span>{featured.category?.name}</span>
                        </div>
                        <h2 className="edu-featured-title">
                          {featured.title}
                        </h2>
                        {featured.excerpt && (
                          <p className="edu-featured-excerpt">
                            {featured.excerpt.substring(0, 180)}...
                          </p>
                        )}
                        <div className="edu-meta-row">
                          <span className="edu-meta-item">
                            <Calendar size={14} strokeWidth={1.7} />
                            {formatDate(
                              featured.published_at || featured.created_at
                            )}
                          </span>
                          <span className="edu-meta-item">
                            <Clock size={14} strokeWidth={1.7} />
                            {featured.read_time} menit baca
                          </span>
                          <span className="edu-meta-item">
                            <Eye size={14} strokeWidth={1.7} />
                            {featured.views} kali dibaca
                          </span>
                        </div>
                      </div>
                    </Link>
                  )}

                  {otherArticles.length > 0 && (
                    <aside className="edu-sidebar-list">
                      <h3>Artikel Terbaru</h3>
                      <div className="edu-sidebar-items">
                        {otherArticles.slice(0, 5).map((article) => (
                          <Link
                            key={article.id}
                            to={`/education/${article.slug}`}
                            className="edu-sidebar-item"
                          >
                            <div className="edu-sidebar-thumb">
                              {article.thumbnail ? (
                                <img
                                  src={
                                    article.thumbnail.startsWith("http")
                                      ? article.thumbnail
                                      : `${API_BASE_URL}${article.thumbnail}`
                                  }
                                  alt={article.title}
                                />
                              ) : (
                                <div className="edu-sidebar-placeholder" />
                              )}
                            </div>
                            <div className="edu-sidebar-text">
                              <p className="edu-sidebar-title">
                                {article.title}
                              </p>
                              <div className="edu-sidebar-meta">
                                <span>
                                  {formatDate(
                                    article.published_at ||
                                      article.created_at
                                  )}
                                </span>
                                <span className="edu-sep-dot">•</span>
                                <span>{article.read_time} menit</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </aside>
                  )}
                </section>

                {/* Grid artikel */}
                {otherArticles.length > 0 && (
                  <section className="edu-grid-section">
                    <h3 className="edu-grid-title">Semua Artikel</h3>
                    <div className="edu-article-grid">
                      {otherArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {articles.length === 0 && (
              <div className="edu-empty">
                <h3>Belum ada artikel</h3>
                <p>Artikel untuk kategori ini akan segera hadir.</p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="edu-pagination">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="edu-page-nav"
                >
                  <ChevronLeft size={14} strokeWidth={2} />
                </button>

                <div className="edu-page-numbers">
                  {Array.from({ length: pagination.last_page }).map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`edu-page-pill ${
                          currentPage === page
                            ? "edu-page-pill--active"
                            : ""
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(pagination.last_page, prev + 1)
                    )
                  }
                  disabled={currentPage === pagination.last_page}
                  className="edu-page-nav"
                >
                  <ChevronRight size={14} strokeWidth={2} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer sama seperti landing */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <div className="landing-logo landing-logo--light">
              <span className="landing-logo__dot" />
              <span>Posturely</span>
            </div>
            <p>
              Posturely adalah platform screening postur anak berbasis AI yang
              membantu orang tua berkolaborasi dengan fisioterapis untuk tumbuh
              kembang yang lebih sehat.
            </p>
          </div>

          <div className="landing-footer__cols">
            <div className="landing-footer__col">
              <h4>Tentang</h4>
              <button onClick={() => navigate("/")}>Tentang Posturely</button>
              <button onClick={() => navigate("/")}>Cara Kerja</button>
            </div>
            <div className="landing-footer__col">
              <h4>Layanan</h4>
              <button onClick={() => navigate("/")}>
                Screening Postur Anak
              </button>
              <button onClick={() => navigate("/education")}>
                Edukasi Postur
              </button>
              <button onClick={() => navigate("/")}>
                Konsultasi Fisioterapis
              </button>
            </div>
            <div className="landing-footer__col">
              <h4>Kontak</h4>
              <button onClick={() => navigate("/login")}>
                Masuk ke aplikasi
              </button>
              <button onClick={() => navigate("/register/physio")}>
                Bergabung sebagai Fisioterapis
              </button>
            </div>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <p>© 2026 Posturely. Semua hak cipta dilindungi.</p>
        </div>
      </footer>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div
          className="edu-filter-drawer-backdrop"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="edu-filter-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="edu-filter-drawer-header">
              <h3>Filter Kategori</h3>
              <button
                className="edu-filter-close"
                onClick={() => setMobileFilterOpen(false)}
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <div className="edu-filter-drawer-body">
              <div className="edu-filter-group">
                <div className="edu-filter-chips">
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`edu-cat-chip ${
                      selectedCategory === null ? "edu-cat-chip--active" : ""
                    }`}
                  >
                    Semua
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`edu-cat-chip ${
                        selectedCategory === category.id
                          ? "edu-cat-chip--active"
                          : ""
                      }`}
                    >
                      {category.icon && (
                        <span className="edu-cat-icon">{category.icon}</span>
                      )}
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="edu-filter-drawer-footer">
              <button
                className="edu-filter-apply"
                onClick={() => setMobileFilterOpen(false)}
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article }) {
  const snippet = article.excerpt
    ? article.excerpt.substring(0, 120) + "..."
    : "";

  const thumbnailUrl = article.thumbnail
    ? article.thumbnail.startsWith("http")
      ? article.thumbnail
      : `${API_BASE_URL}${article.thumbnail}`
    : null;

  return (
    <Link to={`/education/${article.slug}`} className="edu-card-link">
      <article className="edu-article-card">
        <div className="edu-card-thumb">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={article.title} />
          ) : (
            <div className="edu-card-placeholder">
              <span>Artikel</span>
            </div>
          )}
        </div>
        <div className="edu-card-body">
          <div className="edu-card-category">
            {article.category?.icon && (
              <span className="edu-cat-icon">{article.category.icon}</span>
            )}
            <span>{article.category?.name}</span>
          </div>
          <h4 className="edu-card-title">{article.title}</h4>
          {snippet && <p className="edu-card-excerpt">{snippet}</p>}
        </div>
        <div className="edu-card-footer">
          <span className="edu-meta-item">
            <Clock size={13} strokeWidth={1.7} />
            {article.read_time} menit
          </span>
          <span className="edu-meta-item">
            <Eye size={13} strokeWidth={1.7} />
            {article.views}
          </span>
        </div>
      </article>
    </Link>
  );
}

export default EducationPage;
