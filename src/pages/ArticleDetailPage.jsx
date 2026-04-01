import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, Eye } from "lucide-react";
import { articleService } from "../services/articleService";
import { toProxiedUrl } from "../utils/axios";
import "../styles/articleDetail.css";

function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await articleService.getArticleBySlug(slug);
        console.log('Response:', response); // tambah ini
        console.log('Article:', response?.data); // tambah ini
        if (response.success) {
          setArticle(response.data);
        } else {
          setError("Artikel tidak ditemukan.");
        }
      } catch (err) {
        console.error("Error loading article:", err);
        setError("Gagal memuat artikel.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadArticle();
  }, [slug]);

  useEffect(() => {
    const loadRelated = async () => {
      if (!article) return;
      setRelatedLoading(true);
      try {
        const params = { page: 1, per_page: 6 };
        if (article.category?.id) {
          params.category_id = article.category.id;
        }
        const response = await articleService.getArticles(params);
        if (response.success) {
          const list = (response.data || [])
            .filter((a) => a.id !== article.id)
            .slice(0, 4);
          setRelated(list);
        }
      } catch (err) {
        console.error("Error loading related articles:", err);
      } finally {
        setRelatedLoading(false);
      }
    };

    loadRelated();
  }, [article]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="ad-page ad-page--center">
        <div className="ad-loading">
          <div className="ad-spinner" />
          <p>Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="ad-page ad-page--center">
        <div className="ad-error">
          <div className="ad-error-icon">❌</div>
          <h2>Artikel tidak ditemukan</h2>
          <p>Artikel yang Anda cari tidak tersedia atau sudah dihapus.</p>
          <button onClick={() => navigate("/education")} className="ad-btn-primary">
            Lihat semua artikel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-page">
      {/* Header hero */}
      <header className="ad-hero">
        <div
          className="ad-hero-bg"
          style={{
            backgroundImage: article.thumbnail
              ? `linear-gradient(rgba(15,23,42,0.7), rgba(15,23,42,0.9)), url(${toProxiedUrl(article.thumbnail)})`
              : "linear-gradient(135deg, #38bdf8, #0ea5e9)",
          }}
        >
          <div className="ad-hero-inner">
            {article.category && (
              <div className="ad-category-badge">
                {article.category.icon && (
                  <span className="ad-cat-icon">{article.category.icon}</span>
                )}
                <span>{article.category.name}</span>
              </div>
            )}

            <h1 className="ad-title">{article.title}</h1>

            <div className="ad-meta-row">
              {article.author?.name && (
                <span className="ad-meta-item">👤 {article.author.name}</span>
              )}
              <span className="ad-meta-item">
                <Calendar size={14} strokeWidth={1.7} />
                {formatDate(article.published_at || article.created_at)}
              </span>
              <span className="ad-meta-item">
                <Clock size={14} strokeWidth={1.7} />
                {article.read_time} menit baca
              </span>
              <span className="ad-meta-item">
                <Eye size={14} strokeWidth={1.7} />
                {article.views} kali dibaca
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Konten + related */}
      <main className="ad-main">
        <div className="ad-main-inner">
          <article className="ad-article">
            {article.excerpt && (
              <div className="ad-excerpt">{article.excerpt}</div>
            )}

            <div
              className="ad-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {article.author && (
              <section className="ad-author">
                <div className="ad-author-avatar">
                  {article.author.name
                    ? article.author.name.charAt(0).toUpperCase()
                    : "A"}
                </div>
                <div className="ad-author-info">
                  <p className="ad-author-label">Ditulis oleh</p>
                  <p className="ad-author-name">{article.author.name}</p>
                </div>
              </section>
            )}
          </article>

          {/* Related desktop */}
          <aside className="ad-related ad-related--desktop">
            <h3>Artikel lain yang mungkin Anda suka</h3>
            {relatedLoading && <p className="ad-related-loading">Memuat artikel lain...</p>}
            {!relatedLoading && related.length === 0 && (
              <p className="ad-related-empty">Belum ada artikel lain yang tersedia.</p>
            )}
            {!relatedLoading && related.length > 0 && (
              <div className="ad-related-grid">
                {related.map((item) => (
                  <Link key={item.id} to={`/education/${item.slug}`} className="ad-related-card">
                    <div className="ad-related-thumb">
                      {item.thumbnail ? (
                        <img src={toProxiedUrl(item.thumbnail)} alt={item.title} />
                      ) : (
                        <div className="ad-related-placeholder">
                          <span>Artikel</span>
                        </div>
                      )}
                    </div>
                    <div className="ad-related-body">
                      {item.category && (
                        <span className="ad-related-cat">
                          {item.category.icon && (
                            <span className="ad-cat-icon">{item.category.icon}</span>
                          )}
                          {item.category.name}
                        </span>
                      )}
                      <h4 className="ad-related-title">{item.title}</h4>
                      <div className="ad-related-meta">
                        <span>{formatDate(item.published_at || item.created_at)}</span>
                        <span className="ad-dot">•</span>
                        <span>{item.read_time} menit</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>

        <div className="ad-back-bottom">
          <button onClick={() => navigate("/education")} className="ad-btn-primary">
            Lihat semua artikel
          </button>
        </div>

        {/* Related mobile */}
        <section className="ad-related ad-related--mobile">
          <h3>Artikel lain yang mungkin Anda suka</h3>
          {relatedLoading && <p className="ad-related-loading">Memuat artikel lain...</p>}
          {!relatedLoading && related.length === 0 && (
            <p className="ad-related-empty">Belum ada artikel lain yang tersedia.</p>
          )}
          {!relatedLoading && related.length > 0 && (
            <div className="ad-related-grid ad-related-grid--mobile">
              {related.map((item) => (
                <Link key={item.id} to={`/education/${item.slug}`} className="ad-related-card">
                  <div className="ad-related-thumb">
                    {item.thumbnail ? (
                      <img src={toProxiedUrl(item.thumbnail)} alt={item.title} />
                    ) : (
                      <div className="ad-related-placeholder">
                        <span>Artikel</span>
                      </div>
                    )}
                  </div>
                  <div className="ad-related-body">
                    {item.category && (
                      <span className="ad-related-cat">
                        {item.category.icon && (
                          <span className="ad-cat-icon">{item.category.icon}</span>
                        )}
                        {item.category.name}
                      </span>
                    )}
                    <h4 className="ad-related-title">{item.title}</h4>
                    <div className="ad-related-meta">
                      <span>{formatDate(item.published_at || item.created_at)}</span>
                      <span className="ad-dot">•</span>
                      <span>{item.read_time} menit</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <div className="landing-logo landing-logo--light">
              <img src="/logo-posturely.svg" alt="Posturely Logo" className="brand-logo-img" />
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
              <button onClick={() => navigate("/")}>Screening Postur Anak</button>
              <button onClick={() => navigate("/education")}>Edukasi Postur</button>
              <button onClick={() => navigate("/")}>Konsultasi Fisioterapis</button>
            </div>
            <div className="landing-footer__col">
              <h4>Kontak</h4>
              <button onClick={() => navigate("/login")}>Masuk ke aplikasi</button>
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
    </div>
  );
}

export default ArticleDetailPage;