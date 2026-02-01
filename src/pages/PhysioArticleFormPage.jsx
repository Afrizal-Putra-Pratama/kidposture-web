// src/pages/PhysioArticleFormPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  X,
  AlertCircle,
} from "lucide-react";
import physioArticleService from "../services/physioArticleService";
import { articleService } from "../services/articleService"; // ← pakai named import
import "../styles/physioArticleForm.css";

function PhysioArticleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category_id: "",
    excerpt: "",
    content: "",
    thumbnail: null,
    published_at: "",
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadArticle();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await articleService.getCategories();
      const data = response?.data ?? response;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadArticle = async () => {
    setLoading(true);
    setError(null);
    try {
      const article = await physioArticleService.getById(id);

      setFormData({
        title: article.title || "",
        slug: article.slug || "",
        category_id: article.category_id || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        thumbnail: null,
        published_at: article.published_at
          ? new Date(article.published_at).toISOString().slice(0, 16)
          : "",
      });

      if (article.thumbnail) {
        setThumbnailPreview(article.thumbnail);
      }
    } catch (err) {
      console.error("Error loading article:", err);
      setError("Gagal memuat artikel.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug dari title
    if (name === "title" && !isEdit) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, thumbnail: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, thumbnail: null }));
    setThumbnailPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("slug", formData.slug);
      payload.append("category_id", formData.category_id);
      payload.append("excerpt", formData.excerpt);
      payload.append("content", formData.content);
      if (formData.published_at) {
        payload.append("published_at", formData.published_at);
      }
      if (formData.thumbnail instanceof File) {
        payload.append("thumbnail", formData.thumbnail);
      }

      if (isEdit) {
        await physioArticleService.update(id, payload);
      } else {
        await physioArticleService.create(payload);
      }

      navigate("/physio/education");
    } catch (err) {
      console.error("Error saving article:", err);
      setError(
        err.response?.data?.message ||
          "Gagal menyimpan artikel. Periksa kembali data Anda."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="physio-form-page physio-form-page--center">
        <div className="physio-form-loading">
          <div className="physio-form-spinner" />
          <p>Memuat artikel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="physio-form-page">
      <div className="physio-form-container">
        {/* Header */}
        <header className="physio-form-header">
          <button
            type="button"
            onClick={() => navigate("/physio/education")}
            className="physio-form-back-btn"
          >
            <ArrowLeft size={20} />
            <span>Kembali</span>
          </button>

          <h1>{isEdit ? "Edit Artikel" : "Buat Artikel Baru"}</h1>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="physio-form-alert physio-form-alert--error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="physio-form">
          <div className="physio-form-grid">
            {/* Left Column */}
            <div className="physio-form-main">
              {/* Title */}
              <div className="physio-form-group">
                <label htmlFor="title" className="physio-form-label">
                  Judul Artikel <span className="physio-form-required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="physio-form-input"
                  placeholder="Masukkan judul artikel"
                />
              </div>

              {/* Slug */}
              <div className="physio-form-group">
                <label htmlFor="slug" className="physio-form-label">
                  Slug (URL) <span className="physio-form-required">*</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="physio-form-input"
                  placeholder="judul-artikel-anda"
                />
                <small className="physio-form-hint">
                  URL artikel: /education/{formData.slug || "..."}
                </small>
              </div>

              {/* Excerpt */}
              <div className="physio-form-group">
                <label htmlFor="excerpt" className="physio-form-label">
                  Ringkasan
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  className="physio-form-textarea"
                  placeholder="Ringkasan singkat artikel (opsional)"
                />
              </div>

              {/* Content */}
              <div className="physio-form-group">
                <label htmlFor="content" className="physio-form-label">
                  Konten Artikel <span className="physio-form-required">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={12}
                  className="physio-form-textarea"
                  placeholder="Tulis konten artikel di sini..."
                />
              </div>
            </div>

            {/* Right Column (Sidebar) */}
            <aside className="physio-form-sidebar">
              {/* Category */}
              <div className="physio-form-group">
                <label htmlFor="category_id" className="physio-form-label">
                  Kategori <span className="physio-form-required">*</span>
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="physio-form-select"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Published At */}
              <div className="physio-form-group">
                <label htmlFor="published_at" className="physio-form-label">
                  Tanggal Publikasi
                </label>
                <input
                  type="datetime-local"
                  id="published_at"
                  name="published_at"
                  value={formData.published_at}
                  onChange={handleChange}
                  className="physio-form-input"
                />
                <small className="physio-form-hint">
                  Kosongkan untuk draft
                </small>
              </div>

              {/* Thumbnail */}
              <div className="physio-form-group">
                <label className="physio-form-label">Gambar Thumbnail</label>

                {thumbnailPreview ? (
                  <div className="physio-form-thumbnail-preview">
                    <img src={thumbnailPreview} alt="Preview" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="physio-form-thumbnail-remove"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="physio-form-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="physio-form-upload-input"
                    />
                    <div className="physio-form-upload-label">
                      <ImageIcon size={32} />
                      <span>Pilih gambar</span>
                      <small>PNG, JPG, max 2MB</small>
                    </div>
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="physio-form-submit"
              >
                {saving ? (
                  <>
                    <div className="physio-form-spinner physio-form-spinner--sm" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>{isEdit ? "Update Artikel" : "Simpan Artikel"}</span>
                  </>
                )}
              </button>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PhysioArticleFormPage;
