import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  MapPin,
  Phone,
  DollarSign,
  Clock,
  Image as ImageIcon,
  Save,
  ShieldCheck,
  ShieldAlert,
  Hourglass,
  LogOut,
  User,
  Building2,
  FileText,
  Briefcase,
  Menu,
  LayoutDashboard,
  MessageCircle,
  BookOpen,
  Crown,
  X
} from "lucide-react";
import api from "../../utils/axios";
import { getConversations } from "../../services/chatService";
import { logout } from "../../services/authService";
import MapPicker from "../../components/MapPicker";


const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || ""
).replace(/\/api\/?$/, "");

export default function PhysioProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    clinic_name: "",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    specialty: "",
    bio: "",
    consultation_fee: "",
    is_accepting_consultations: true,
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Global UI States
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load Profile Data
      const res = await api.get("/physio/profile");
      const data = res.data.data;
      setProfile(data);
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        clinic_name: data.clinic_name || "",
        city: data.city || "",
        address: data.address || "",
        latitude: data.latitude || "",
        longitude: data.longitude || "",
        specialty: data.specialty || "",
        bio: data.bio || "",
        consultation_fee: data.consultation_fee || "",
        is_accepting_consultations: data.is_accepting_consultations ?? true,
      });

      if (data.photo) {
        const normalized = data.photo.startsWith("http")
          ? data.photo
          : `${API_BASE_URL}/storage/${data.photo}`;
        setPhotoPreview(normalized);
      }

      // Load Unread Chats
      const chatRes = await getConversations();
      const chats = chatRes?.data || chatRes || [];
      const unread = chats.filter(c => c.unread_count > 0).length;
      setUnreadCount(unread);

    } catch (err) {
      console.error("Load data error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null && form[key] !== "") {
        formData.append(key, form[key]);
      }
    });
    if (photo) {
      formData.append("photo", photo);
    }

    try {
      await api.post("/physio/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadData();
    } catch (err) {
      console.error("Save profile error:", err.response?.data || err);
      alert(
        "Gagal menyimpan profil: " +
          (err.response?.data?.message || "Periksa kembali isian Anda.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLocationChange = (position) => {
    if (position && Array.isArray(position) && position.length === 2) {
      setForm((prev) => ({
        ...prev,
        latitude: position[0],
        longitude: position[1],
      }));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const renderStatus = () => {
    if (!profile) return null;

    if (!profile.is_verified) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
          <Hourglass size={14} strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-wide">Menunggu Verifikasi</span>
        </div>
      );
    }

    if (profile.is_verified && profile.is_active) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
          <ShieldCheck size={14} strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-wide">Terverifikasi & Aktif</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-md">
        <ShieldAlert size={14} strokeWidth={2} />
        <span className="text-xs font-bold uppercase tracking-wide">Dinonaktifkan</span>
      </div>
    );
  };

  if (loading) return <PhysioProfileSkeleton />;

  const mapPosition =
    form.latitude && form.longitude
      ? [parseFloat(form.latitude), parseFloat(form.longitude)]
      : null;

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
          <SidebarLink to="/physio/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/physio/dashboard'} expanded={isSidebarExpanded} />
          <SidebarLink to="/physio/chat" icon={MessageCircle} label="Konsultasi" active={location.pathname === '/physio/chat'} expanded={isSidebarExpanded} badge={unreadCount} />
          <SidebarLink to="/physio/education" icon={BookOpen} label="Kelola Edukasi" active={location.pathname === '/physio/education'} expanded={isSidebarExpanded} />
          <SidebarLink to="/physio/profile" icon={User} label="Profil & Pengaturan" active={location.pathname === '/physio/profile'} expanded={isSidebarExpanded} />
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
              <SidebarLink to="/physio/education" icon={BookOpen} label="Kelola Edukasi" expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
              <SidebarLink to="/physio/profile" icon={User} label="Profil & Pengaturan" active={true} expanded={true} onClick={() => setIsSidebarOpenMobile(false)} />
            </nav>
            <div className="p-4 border-t border-slate-100 mt-auto">
               <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-sm text-red-600 hover:bg-red-50 rounded-md transition-all font-medium active:scale-95"><LogOut size={18}/> Keluar</button>
            </div>
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md active:scale-95 transition-transform" onClick={() => setIsSidebarOpenMobile(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden lg:block text-slate-500 text-sm font-medium">
              Portal Fisioterapis
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto lg:ml-0">
            <button 
              onClick={() => navigate("/physio/chat")}
              className="hidden sm:flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md transition-colors active:scale-95"
            >
              <Crown size={16} strokeWidth={2.5}/>
              <span className="text-xs font-bold uppercase tracking-wide">Daftar Premium</span>
            </button>
            
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 shrink-0 border border-slate-200 ml-2">
              <User size={18} />
            </div>
          </div>
        </header>

        {/* Content Area (Scrollable) */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto hide-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Top Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Profil & Pengaturan</h1>
                <p className="text-slate-500 mt-1 text-sm">Kelola informasi publik Anda sebagai fisioterapis dan atur layanan konsultasi.</p>
              </div>
            </div>

            {/* Alert Success */}
            {success && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-md text-sm font-semibold flex items-center gap-2 animate-in fade-in">
                <ShieldCheck size={18} /> Profil berhasil diperbarui.
              </div>
            )}

            {/* Profile Form Card */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col shadow-sm">
              
              {/* Cover Clean */}
              <div className="h-28 bg-slate-50 relative border-b border-slate-100">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
              </div>

              <div className="px-6 pb-6 relative">
                <form onSubmit={handleSubmit} className="flex flex-col">
                  
                  {/* Avatar & Status Row */}
                  <div className="flex justify-between items-end mb-8">
                    <div className="-mt-12 relative z-10">
                      <div className="w-24 h-24 bg-white rounded-lg p-1.5 shadow-sm border border-slate-200">
                        <div className="w-full h-full bg-slate-50 text-slate-400 rounded-md flex items-center justify-center border border-slate-100 overflow-hidden">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={32} strokeWidth={1.5} />
                          )}
                        </div>
                      </div>
                      <label htmlFor="photo" className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md cursor-pointer active:scale-95 transition-all shadow-sm border-2 border-white">
                        <ImageIcon size={14} />
                      </label>
                      <input type="file" id="photo" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </div>
                    
                    <div className="hidden sm:block">
                      {renderStatus()}
                    </div>
                  </div>

                  <div className="sm:hidden mb-6">
                    {renderStatus()}
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Kolom 1 */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Informasi Pribadi</h3>
                      <FormInput icon={User} label="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                      <FormInput icon={Phone} label="Nomor Telepon" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                      <FormInput icon={Briefcase} label="Spesialisasi" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Cth: Fisioterapi Anak, Postur" />
                      
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <FileText size={14} /> Bio Profil
                        </label>
                        <textarea
                          value={form.bio}
                          onChange={(e) => setForm({ ...form, bio: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-md text-sm outline-none transition-all resize-none"
                          rows={3}
                          placeholder="Ceritakan pengalaman dan keahlian Anda"
                        />
                      </div>
                    </div>

                    {/* Kolom 2 */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Data Klinik & Layanan</h3>
                      <FormInput icon={Building2} label="Nama Klinik / Praktik" value={form.clinic_name} onChange={(e) => setForm({ ...form, clinic_name: e.target.value })} required />
                      <FormInput icon={MapPin} label="Kota" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                      
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <MapPin size={14} /> Alamat Lengkap
                        </label>
                        <textarea
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-md text-sm outline-none transition-all resize-none"
                          rows={2}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormInput icon={DollarSign} label="Tarif (Rp)" type="number" value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} placeholder="50000" />
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <Clock size={14} /> Status Konsultasi
                          </label>
                          <select
                            value={String(form.is_accepting_consultations)}
                            onChange={(e) => setForm({ ...form, is_accepting_consultations: e.target.value === "true" })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-md text-sm outline-none transition-all cursor-pointer"
                          >
                            <option value="true">Menerima</option>
                            <option value="false">Tidak Menerima</option>
                          </select>
                        </div>
                      </div>

                    </div>
                    
                    {/* Area Peta - Full Width */}
                    <div className="md:col-span-2 space-y-1.5 mt-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <MapPin size={14} /> Pin Lokasi Peta (MapPicker)
                      </label>
                      <div className="rounded-md overflow-hidden border border-slate-200 shadow-sm relative z-0">
                        <MapPicker
                          value={mapPosition}
                          onChange={handleLocationChange}
                        />
                      </div>
                    </div>

                  </div>

                  <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
                    <button type="submit" disabled={saving} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70">
                      <Save size={16} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// =====================================
// KOMPONEN PENDUKUNG (HELPERS)
// =====================================

// eslint-disable-next-line no-unused-vars
function FormInput({ icon: Icon, label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        <Icon size={14} /> {label}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-md text-sm outline-none transition-all placeholder:text-slate-400"
      />
    </div>
  );
}

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

// Skeleton untuk Loading State (Diperbaiki h-screen & overflow-hidden)
function PhysioProfileSkeleton() {
  return (
    <div className="flex h-screen bg-slate-50 animate-pulse font-sans overflow-hidden">
      <div className="w-20 lg:w-64 bg-white border-r border-slate-200 hidden lg:block shrink-0"></div>
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <div className="h-16 lg:h-20 bg-white border-b border-slate-200 shrink-0"></div>
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto hide-scrollbar">
          <div className="max-w-4xl w-full mx-auto space-y-6">
            <div className="space-y-2"><div className="h-8 bg-slate-200 rounded w-48"></div><div className="h-4 bg-slate-200 rounded w-72"></div></div>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
              <div className="h-28 bg-slate-100 border-b border-slate-200"></div>
              <div className="px-6 pb-6">
                 <div className="-mt-12 mb-6 w-24 h-24 bg-slate-200 rounded-lg border-4 border-white"></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="space-y-4">
                      <div className="h-10 bg-slate-100 rounded-md"></div>
                      <div className="h-10 bg-slate-100 rounded-md"></div>
                      <div className="h-10 bg-slate-100 rounded-md"></div>
                   </div>
                   <div className="space-y-4">
                      <div className="h-10 bg-slate-100 rounded-md"></div>
                      <div className="h-10 bg-slate-100 rounded-md"></div>
                      <div className="h-10 bg-slate-100 rounded-md"></div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}