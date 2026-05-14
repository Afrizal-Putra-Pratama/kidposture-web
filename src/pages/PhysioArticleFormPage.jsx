import { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css"; 
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  AlertCircle,
  Menu,
  LayoutDashboard,
  MessageCircle,
  BookOpen,
  User,
  LogOut,
  Crown,
  X
} from "lucide-react";
import api from "../utils/axios";
import { getConversations } from "../services/chatService";
import { logout } from "../services/authService";

export default function PhysioArticleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const location = useLocation();
  const isEditMode = Boolean(id);

  // Fungsi untuk mendapatkan Waktu Saat Ini (YYYY-MM-DDTHH:mm) sesuai zona waktu lokal
  const getCurrentDateTime = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  // States
  const [form, setForm] = useState({
    title: "",
    category_id: "",
    excerpt: "",
    content: "",
    published_at: getCurrentDateTime(),
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Global UI States 
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const maxDateTime = getCurrentDateTime(); // Batas maksimal hari ini & jam ini

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  useEffect(() => {
    fetchInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      const chatRes = await getConversations();
      const chats = chatRes?.data || chatRes || [];
      setUnreadCount(chats.filter(c => c.unread_count > 0).length);
    } catch (chatErr) {
      console.warn("Gagal memuat notifikasi chat", chatErr);
    }

    try {
      const catRes = await api.get("/categories");
      setCategories(catRes.data?.data || catRes.data || []);

      if (isEditMode) {
        const artRes = await api.get(`/physio/articles/${id}`);
        const article = artRes.data?.data || artRes.data;
        
        // Format tanggal dari backend ke datetime-local (YYYY-MM-DDTHH:mm)
        let formattedDate = getCurrentDateTime();
        if (article.published_at) {
          // Asumsi backend mengirim format YYYY-MM-DD HH:mm:ss atau ISO
          const d = new Date(article.published_at);
          if (!isNaN(d)) {
             formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          }
        }

        setForm({
          title: article.title || "",
          category_id: article.category_id || "",
          excerpt: article.excerpt || "",
          content: article.content || "",
          published_at: formattedDate,
        });

        if (article.thumbnail) {
          setThumbnailPreview(
            article.thumbnail.startsWith("http")
              ? article.thumbnail
              : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || ""}/storage/${article.thumbnail}`
          );
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setError("Error 404: Endpoint API tidak ditemukan.");
      } else {
        setError("Gagal memuat data dari server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // Fungsi generate Slug dari Judul
  const generateSlug = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           
      // eslint-disable-next-line no-useless-escape
      .replace(/[^\w\-]+/g, '')       
      // eslint-disable-next-line no-useless-escape
      .replace(/\-\-+/g, '-')         
      .replace(/^-+/, '')             
      .replace(/-+$/, '');            
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Otomatis buat slug dari title
    const generatedSlug = generateSlug(form.title);

    // Format waktu untuk Laravel (YYYY-MM-DD HH:mm:ss)
    const formattedPublishDate = form.published_at.length === 16 
      ? form.published_at.replace('T', ' ') + ':00' 
      : form.published_at.replace('T', ' ');

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("slug", generatedSlug); // PERBAIKAN: Kirim slug ke backend
    formData.append("category_id", form.category_id);
    formData.append("excerpt", form.excerpt);
    formData.append("content", form.content);
    formData.append("published_at", formattedPublishDate); // PERBAIKAN: Format Jam
    
    if (thumbnail) formData.append("thumbnail", thumbnail);
    if (isEditMode) formData.append("_method", "PUT"); 

    try {
      const url = isEditMode ? `/physio/articles/${id}` : "/physio/articles";
      await api.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/physio/education");
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        setError(firstError);
      } else {
        setError(err.response?.data?.message || "Gagal menyimpan artikel.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* === SIDEBAR (DESKTOP) === */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen shrink-0 transition-all duration-300 z-50 ${isSidebarExpanded ? 'w-64' : 'w-[80px]'}`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className={`p-6 flex items-center ${isSidebarExpanded ? 'justify-start px-6' : 'justify-center px-0'} h-16 lg:h-20`}>
          <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 shrink-0 object-contain" />
          {isSidebarExpanded && <span className="font-bold text-xl text-slate-800 ml-3 truncate">Posturely</span>}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4 hide-scrollbar overflow-y-auto overflow-x-hidden">
          <SidebarLink to="/physio/dashboard" icon={LayoutDashboard} label="Dashboard" expanded={isSidebarExpanded} />
          <SidebarLink to="/physio/chat" icon={MessageCircle} label="Konsultasi" expanded={isSidebarExpanded} badge={unreadCount} />
          <SidebarLink to="/physio/education" icon={BookOpen} label="Kelola Edukasi" active={true} expanded={isSidebarExpanded} />
          <SidebarLink to="/physio/profile" icon={User} label="Profil & Pengaturan" expanded={isSidebarExpanded} />
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <button onClick={handleLogout} className={`flex items-center w-full rounded-md transition-all font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 active:scale-95 ${isSidebarExpanded ? 'justify-start px-4 py-2.5 gap-3' : 'justify-center p-2.5'}`}>
            <LogOut size={20} className="shrink-0" /> 
            {isSidebarExpanded && <span className="text-sm truncate">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* === MOBILE SIDEBAR (DRAWER) === */}
      {isSidebarOpenMobile && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpenMobile(false)}></div>
          <div className="absolute inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 flex items-center justify-between border-b border-slate-100 h-16">
               <div className="flex items-center gap-3">
                  <img src="/logo-favicon-posturely.svg" alt="Logo" className="w-8 h-8 shrink-0" />
                  <span className="font-bold text-lg text-slate-800">Posturely</span>
               </div>
               <button onClick={() => setIsSidebarOpenMobile(false)} className="text-slate-500 p-1.5 rounded-md hover:bg-slate-100 active:scale-95 transition-all"><X size={20}/></button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto hide-scrollbar">
              <SidebarLink to="/physio/dashboard" icon={LayoutDashboard} label="Dashboard" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/chat" icon={MessageCircle} label="Konsultasi" expanded={true} badge={unreadCount} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/education" icon={BookOpen} label="Kelola Edukasi" active={true} expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/profile" icon={User} label="Profil & Pengaturan" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
            </nav>
            <div className="p-4 border-t border-slate-100 mt-auto">
               <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-sm text-red-600 hover:bg-red-50 rounded-md transition-all font-medium active:scale-95"><LogOut size={18}/> Keluar</button>
            </div>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <main className="flex-1 flex flex-col min-w-0 h-full bg-slate-50 relative">
        
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-40">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md active:scale-95 transition-transform" onClick={() => setIsSidebarOpenMobile(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden lg:block text-slate-500 text-sm font-medium">
              Portal Fisioterapis / {isEditMode ? "Edit Artikel" : "Buat Artikel Baru"}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-0">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate("/physio/profile")}>
              <User size={18} />
            </div>
          </div>
        </header>

        {/* Content Area - Responsif scroll untuk mobile, fit-screen untuk desktop */}
        <div className="flex-1 overflow-y-auto lg:overflow-hidden p-4 lg:p-6 w-full max-w-7xl mx-auto flex flex-col">
          
          <div className="flex items-center justify-between shrink-0 mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all active:scale-95">
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-none">
                {isEditMode ? "Edit Artikel" : "Tulis Artikel Baru"}
              </h1>
            </div>
            
            {/* Tombol Simpan di Desktop (Di atas) */}
            <button onClick={handleSubmit} disabled={saving} className="hidden lg:flex bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95 items-center gap-2 shadow-sm disabled:opacity-70">
              <Save size={16} /> {saving ? "Menyimpan..." : "Simpan & Publikasi"}
            </button>
          </div>

          {error && (
            <div className="shrink-0 mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* Form Container */}
          <form className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
            
            {/* Kolom Kiri: Meta Data */}
            <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-visible lg:overflow-y-auto hide-scrollbar">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Artikel</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Masukkan judul..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:bg-white outline-none transition-colors" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</label>
                <select required value={form.category_id} onChange={(e) => setForm({...form, category_id: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:bg-white outline-none cursor-pointer">
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tgl & Jam Publikasi</label>
                <input 
                  type="datetime-local" 
                  required 
                  max={maxDateTime} 
                  value={form.published_at} 
                  onChange={(e) => setForm({...form, published_at: e.target.value})} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:border-blue-500 outline-none cursor-pointer" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ringkasan (Excerpt)</label>
                <textarea rows={3} value={form.excerpt} onChange={(e) => setForm({...form, excerpt: e.target.value})} placeholder="Ringkasan singkat artikel..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:border-blue-500 focus:bg-white outline-none resize-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gambar Utama</label>
                <div className="mt-1 relative rounded-lg overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors h-32 flex flex-col items-center justify-center group">
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <ImageIcon size={24} className="mb-1" />
                      <span className="text-xs font-medium">Unggah Gambar</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Rich Text Editor ala Word */}
            <div className="flex-1 flex flex-col min-w-0 bg-white border border-slate-200 rounded-xl shadow-sm min-h-[500px] lg:min-h-0 overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 shrink-0">
                <h3 className="text-sm font-bold text-slate-700">Isi Artikel</h3>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col relative">
                <style>{`
                  .quill { display: flex; flex-direction: column; height: 100%; }
                  .ql-toolbar { border: none !important; border-bottom: 1px solid #e2e8f0 !important; background: #f8fafc; padding: 12px 16px !important; flex-shrink: 0; }
                  .ql-container { border: none !important; flex: 1; overflow-y: auto; font-family: inherit; font-size: 15px; }
                  .ql-editor { min-height: 100%; padding: 24px; color: #334155; line-height: 1.7; }
                `}</style>
                
                <ReactQuill 
                  theme="snow" 
                  value={form.content} 
                  onChange={(val) => setForm({ ...form, content: val })} 
                  modules={quillModules}
                  placeholder="Mulai menulis artikel Anda di sini..."
                />
              </div>
            </div>

            {/* Tombol Simpan di Mobile (Di bawah) */}
            <div className="lg:hidden shrink-0 mt-2 mb-6">
              <button 
                onClick={handleSubmit} 
                disabled={saving} 
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3.5 rounded-lg text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
              >
                <Save size={18} /> {saving ? "Menyimpan..." : "Simpan & Publikasi"}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}

// Helper Navigation
// eslint-disable-next-line no-unused-vars
function SidebarLink({ to, icon: Icon, label, active, expanded, onClick, badge }) {
  return (
    <Link 
      to={to} 
      onClick={onClick} 
      className={`flex items-center rounded-md font-medium transition-all duration-200 relative active:scale-95 ${expanded ? 'px-4 py-2.5 justify-start gap-3' : 'p-2.5 justify-center'} ${active ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}
    >
      <div className="relative shrink-0">
        <Icon size={20} className={active ? 'text-blue-600' : ''} />
        {badge > 0 && !expanded && (
           <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white"></span>
        )}
      </div>
      {expanded && (
        <div className="flex-1 flex justify-between items-center min-w-0">
          <span className="text-sm truncate">{label}</span>
          {badge > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">{badge}</span>}
        </div>
      )}
    </Link>
  );
}

// Skeleton
function FormSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50 animate-pulse overflow-hidden">
      <div className="w-20 lg:w-64 bg-white border-r border-slate-200 hidden lg:block shrink-0"></div>
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <div className="h-16 lg:h-20 bg-white border-b border-slate-200 shrink-0"></div>
        <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="h-8 w-48 bg-slate-200 rounded"></div>
            <div className="h-10 w-32 bg-slate-200 rounded-lg hidden lg:block"></div>
          </div>
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
            <div className="w-full lg:w-[320px] bg-white rounded-xl border border-slate-200 p-5 space-y-5 shrink-0 h-[400px] lg:h-full">
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-24 bg-slate-100 rounded"></div>
            </div>
            <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col min-h-[400px] lg:min-h-0">
               <div className="h-14 bg-slate-100 border-b border-slate-200 shrink-0"></div>
               <div className="flex-1 p-6 space-y-4">
                 <div className="h-4 bg-slate-100 rounded w-full"></div>
                 <div className="h-4 bg-slate-100 rounded w-5/6"></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}