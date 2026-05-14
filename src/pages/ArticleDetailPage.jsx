import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, Eye, AlertCircle, User } from "lucide-react";
import { articleService } from "../services/articleService";
import { toProxiedUrl } from "../utils/axios";

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
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ----------------------------------------
  // LOADING SKELETON STATE
  // ----------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <div className="w-full h-[400px] md:h-[500px] bg-slate-200 animate-pulse"></div>
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col lg:flex-row gap-10">
          <div className="flex-1 bg-white border border-slate-100 shadow-sm p-8 md:p-12 rounded-2xl">
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-6"></div>
            <div className="h-10 w-3/4 bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse mb-12"></div>
            <div className="space-y-5">
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
              <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-6"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-3 bg-white border border-slate-100 shadow-sm rounded-xl">
                <div className="w-24 h-24 bg-slate-200 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-3 w-2/3 bg-slate-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </aside>
        </main>
      </div>
    );
  }

  // ----------------------------------------
  // ERROR STATE
  // ----------------------------------------
  if (error || !article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 p-10 rounded-2xl shadow-sm text-center max-w-md w-full">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 text-red-500 rounded-full mb-5">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Artikel Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-8 text-sm leading-relaxed">
            Artikel yang Anda cari tidak tersedia, mungkin sudah dihapus atau tautan rusak.
          </p>
          <button 
            onClick={() => navigate("/education")} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all active:scale-95"
          >
            Jelajahi Edukasi Lainnya
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // MAIN RENDER
  // ----------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      
      {/* 1. Header Hero (Lebih Clean & Imersif) */}
      <header className="relative w-full h-[450px] md:h-[550px] bg-slate-900 flex items-end justify-center text-center overflow-hidden">
        {/* Background Image & Soft Gradient Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transform scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: article.thumbnail
              ? `url(${toProxiedUrl(article.thumbnail)})`
              : "none",
            backgroundColor: article.thumbnail ? "transparent" : "#0f172a"
          }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-900/40 via-slate-900/70 to-slate-900/95" />
        
        {/* Hero Content */}
        <div className="relative z-20 w-full max-w-4xl mx-auto px-6 pb-16 md:pb-20 flex flex-col items-center">
          
          {/* Category Badge */}
          {article.category && (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-bold mb-6 backdrop-blur-md">
              {article.category.icon && <span>{article.category.icon}</span>}
              <span className="uppercase tracking-widest">{article.category.name}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-8 drop-shadow-md">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-slate-300 text-sm font-medium">
            {article.author?.name && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <User size={16} className="text-blue-300" />
                <span className="text-white">{article.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              <span>{formatDate(article.published_at || article.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <span>{article.read_time} menit baca</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-slate-400" />
              <span>{article.views} tayangan</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content & Sidebar */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-10">
        
        {/* Article Body (Desain Editorial) */}
        <article className="flex-1 bg-white border border-slate-100 shadow-sm rounded-2xl p-6 sm:p-10 md:p-14 relative -mt-24 z-30">
          
          {/* Excerpt / Highlight */}
          {article.excerpt && (
            <div className="text-xl md:text-2xl text-slate-700 font-medium leading-relaxed mb-10 p-6 bg-slate-50/80 rounded-xl border-l-4 border-blue-500">
              "{article.excerpt}"
            </div>
          )}

          {/* HTML Content (Typography Styling) */}
          <div 
            className="text-slate-700 leading-loose space-y-6 text-lg
            [&>p]:mb-6
            [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-12 [&>h2]:mb-6 
            [&>h3]:text-2xl [&>h3]:font-semibold [&>h3]:text-slate-900 [&>h3]:mt-8 [&>h3]:mb-4 
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2 [&>ul>li]:pl-2
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2 [&>ol>li]:pl-2
            [&>img]:rounded-xl [&>img]:my-10 [&>img]:w-full [&>img]:shadow-md [&>img]:object-cover
            [&>a]:text-blue-600 [&>a]:font-semibold [&>a]:underline hover:[&>a]:text-blue-800
            [&>blockquote]:border-l-4 [&>blockquote]:border-slate-300 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-slate-500 [&>blockquote]:my-8 [&>blockquote]:text-xl"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Author Box Bottom */}
          {article.author && (
            <div className="mt-16 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
                  {article.author.name ? article.author.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Ditulis Oleh</p>
                  <p className="text-lg font-bold text-slate-900">{article.author.name}</p>
                  <p className="text-sm text-slate-500 mt-1">Tim Edukasi Posturely</p>
                </div>
              </div>
            </div>
          )}
        </article>

        {/* Related Articles Sidebar */}
        <aside className="w-full lg:w-[340px] flex-shrink-0 pt-4 lg:pt-0">
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 sticky top-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              Baca Juga
            </h3>
            
            {relatedLoading && (
              <div className="space-y-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-24 h-24 bg-slate-200 rounded-xl flex-shrink-0"></div>
                    <div className="flex-1 space-y-2 py-2">
                      <div className="h-4 w-full bg-slate-200 rounded"></div>
                      <div className="h-4 w-4/5 bg-slate-200 rounded"></div>
                      <div className="h-3 w-1/2 bg-slate-200 rounded mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!relatedLoading && related.length === 0 && (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-sm">
                Belum ada artikel terkait.
              </div>
            )}

            {!relatedLoading && related.length > 0 && (
              <div className="space-y-6">
                {related.map((item) => (
                  <Link 
                    key={item.id} 
                    to={`/education/${item.slug}`} 
                    className="group flex gap-4 items-start"
                  >
                    <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                      {item.thumbnail ? (
                        <img 
                          src={toProxiedUrl(item.thumbnail)} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 uppercase font-bold">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-start">
                      {item.category && (
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1.5 block">
                          {item.category.name}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-3 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <div className="text-[11px] text-slate-500 font-medium mt-2">
                        {formatDate(item.published_at || item.created_at)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => navigate("/education")} 
              className="w-full mt-8 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-xl transition-all active:scale-95 text-sm"
            >
              Lihat Semua Artikel
            </button>
          </div>
        </aside>
      </main>

      {/* 3. Landing Footer (Public Format) */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 py-16 px-6 lg:px-8 mt-auto">
        {/* Menggunakan grid-cols-3 karena Kontak dihilangkan */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          {/* Brand Info (Mengambil 6 kolom / setengah layar di desktop) */}
          <div className="md:col-span-6 lg:col-span-6">
            <div className="flex items-center gap-3 mb-6">
              {/* Logo di Footer */}
              <img 
                src="/logo-favicon-posturely.svg" 
                alt="Posturely Logo" 
                className="w-9 h-9 object-contain"
              />
              <span className="text-2xl font-bold text-white tracking-tight">Posturely</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Platform screening postur anak berbasis AI yang membantu orang tua berkolaborasi dengan fisioterapis untuk tumbuh kembang yang lebih sehat dan optimal.
            </p>
          </div>

          {/* Links: Tentang (Mengambil 3 kolom) */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-white font-bold tracking-wider uppercase text-sm mb-6">Tentang</h4>
            <div className="flex flex-col space-y-3 text-sm font-medium">
              <button onClick={() => navigate("/")} className="text-left text-slate-400 hover:text-white transition-colors">Tentang Posturely</button>
              <button onClick={() => navigate("/")} className="text-left text-slate-400 hover:text-white transition-colors">Cara Kerja</button>
            </div>
          </div>

          {/* Links: Layanan (Mengambil 3 kolom) */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-white font-bold tracking-wider uppercase text-sm mb-6">Layanan</h4>
            <div className="flex flex-col space-y-3 text-sm font-medium">
              <button onClick={() => navigate("/")} className="text-left text-slate-400 hover:text-white transition-colors">Screening Postur Anak</button>
              <button onClick={() => navigate("/education")} className="text-left text-slate-400 hover:text-white transition-colors">Edukasi Postur</button>
              <button onClick={() => navigate("/")} className="text-left text-slate-400 hover:text-white transition-colors">Konsultasi Fisioterapis</button>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 text-center text-sm font-medium text-slate-500 flex justify-center items-center">
          <p>© 2026 Posturely. Semua hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}

export default ArticleDetailPage;