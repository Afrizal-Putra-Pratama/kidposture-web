import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { articleService } from "../services/articleService";

function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
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
          setError("Article not found");
        }
      } catch (err) {
        console.error("Error loading article:", err);
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadArticle();
    }
  }, [slug]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
          <p style={{ color: "#6c757d", fontSize: "1.1rem" }}>
            Loading article...
          </p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: "3rem",
            textAlign: "center",
            maxWidth: 400,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
          <h2 style={{ color: "#2c3e50", marginBottom: "0.5rem" }}>
            Article Not Found
          </h2>
          <p style={{ color: "#6c757d", marginBottom: "1.5rem" }}>
            The article you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/education")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#4e73df",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "1rem",
            }}
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        paddingBottom: "3rem",
      }}
    >
      {/* Header with Thumbnail */}
      <div
        style={{
          background: article.thumbnail
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${article.thumbnail})`
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "3rem 0",
          color: "white",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{ maxWidth: 900, margin: "0 auto", padding: "0 1rem" }}
        >
          {/* Back Button */}
          <Link
            to="/education"
            style={{
              display: "inline-flex",
              alignItems: "center",
              color: "white",
              textDecoration: "none",
              marginBottom: "2rem",
              fontSize: "0.95rem",
              opacity: 0.9,
            }}
          >
            ← Back to Articles
          </Link>

          {/* Category Badge */}
          <div style={{ marginBottom: "1rem" }}>
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                padding: "0.5rem 1rem",
                borderRadius: 20,
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              {article.category.icon} {article.category.name}
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              lineHeight: 1.2,
            }}
          >
            {article.title}
          </h1>

          {/* Meta Info */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
              fontSize: "0.95rem",
              opacity: 0.9,
            }}
          >
            <span>👤 {article.author.name}</span>
            <span>📅 {article.published_at}</span>
            <span>⏱ {article.read_time} min read</span>
            <span>👁 {article.views} views</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div
        style={{ maxWidth: 900, margin: "0 auto", padding: "0 1rem" }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: "2.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {/* Excerpt */}
          {article.excerpt && (
            <div
              style={{
                background: "#f8f9fa",
                border: "2px solid #e9ecef",
                borderRadius: 8,
                padding: "1.25rem",
                marginBottom: "2rem",
                fontStyle: "italic",
                color: "#495057",
                fontSize: "1.1rem",
                lineHeight: 1.6,
              }}
            >
              {article.excerpt}
            </div>
          )}

          {/* Article Body */}
          <div
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.8,
              color: "#2c3e50",
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Author Info */}
          <div
            style={{
              marginTop: "3rem",
              paddingTop: "2rem",
              borderTop: "2px solid #e9ecef",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {article.author.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#2c3e50",
                    marginBottom: "0.25rem",
                  }}
                >
                  Written by
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    color: "#4e73df",
                    fontWeight: 600,
                  }}
                >
                  {article.author.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Articles Button */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link
            to="/education"
            style={{
              display: "inline-block",
              padding: "0.75rem 2rem",
              background: "#4e73df",
              color: "white",
              textDecoration: "none",
              borderRadius: 8,
              fontWeight: 500,
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#2e59d9")}
            onMouseLeave={(e) => (e.target.style.background = "#4e73df")}
          >
            ← Back to All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ArticleDetailPage;
