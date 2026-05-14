import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle, X, ChevronLeft, AlertCircle, Loader, Activity } from "lucide-react";
import api from "../../utils/axios";

export default function RegisterParentPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  
  const [error, setError] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Efek Loading Awal (Skeleton)
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsPageLoading(false);
    }, 600);
    return () => clearTimeout(loadTimer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.password_confirmation) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: "parent",
      });

      setShowSuccessModal(true);
    } catch (err) {
      if (err.response?.data?.errors) {
        const msgs = Object.values(err.response.data.errors).flat();
        setError(msgs.join(", "));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) {
    return <RegisterSkeleton />;
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-800 overflow-hidden relative">
      
      {/* --- POP-UP LOADING OVERLAY SAAT SUBMIT --- */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-4 animate-in zoom-in-95">
            <Loader size={36} className="animate-spin text-blue-600" />
            <p className="text-slate-800 font-bold text-sm">Membuat akun Anda...</p>
          </div>
        </div>
      )}

      {/* --- MODAL SUKSES --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={(e) => { if (e.target === e.currentTarget) navigate("/login"); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-8 relative shadow-2xl border border-slate-100 flex flex-col items-center gap-4 animate-in zoom-in-95 slide-in-from-bottom-4">
            
            <button onClick={() => navigate("/login")} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-lg transition-colors active:scale-95">
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mt-2 border border-emerald-100 shadow-inner">
              <CheckCircle size={32} strokeWidth={2} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Registrasi Berhasil!</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Akun Anda telah berhasil dibuat. Silakan masuk menggunakan email dan kata sandi yang baru saja didaftarkan.
              </p>
            </div>

            <button onClick={() => navigate("/login")} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition-all active:scale-[0.98] shadow-sm">
              Masuk Sekarang
            </button>
          </div>
        </div>
      )}

      {/* KIRI: Area Informasi (Hanya Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-center items-center p-12 overflow-hidden border-r border-slate-800 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-slate-900 opacity-90 z-0"></div>
        <div className="absolute inset-0 opacity-[0.04] z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

        <div className="relative z-10 max-w-md w-full text-center animate-in fade-in duration-700">
          <div className="w-16 h-16 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-blue-400 mb-8 backdrop-blur-sm shadow-xl mx-auto">
            <Activity size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Pantau Postur Anak Anda Sejak Dini</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Bergabunglah dengan orang tua lainnya. Dapatkan analisis cerdas dan rekomendasi langsung dari fisioterapis profesional.
          </p>
        </div>
      </div>

      {/* KANAN: Area Form Registrasi (Muncul seolah menutupi Slider Login) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-start sm:justify-center px-6 sm:px-16 lg:px-24 xl:px-32 relative h-screen overflow-y-auto hide-scrollbar z-10 bg-white animate-in slide-in-from-right-8 fade-in duration-500 py-12 sm:py-0">
        
        {/* Tombol Kembali (Desktop Kanan Atas) */}
        <Link 
          to="/login" 
          className="hidden lg:flex absolute top-10 right-10 xl:right-16 text-sm font-semibold text-slate-400 hover:text-slate-800 transition-colors items-center gap-1.5 active:scale-95"
        >
          <ChevronLeft size={16} /> Batal
        </Link>

        {/* Logo */}
        <div className="mb-10 sm:mb-12 cursor-pointer transition-transform active:scale-95" onClick={() => navigate("/")}>
          <img src="/logo-posturely.svg" alt="Posturely Logo" className="h-10 sm:h-12 object-contain" />
        </div>

        <div className="max-w-sm w-full mx-auto lg:mx-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Daftar Akun</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Buat akun Orang Tua untuk mulai memantau postur tubuh anak Anda dengan AI.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Nama */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Masukkan nama Anda"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 shadow-inner"
              />
            </div>

            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="email@contoh.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 shadow-inner"
              />
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Kata Sandi</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Minimal 8 karakter"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 shadow-inner"
              />
            </div>

            {/* Input Konfirmasi Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Konfirmasi Kata Sandi</label>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                placeholder="Ketik ulang kata sandi"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 shadow-inner"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium flex items-start gap-2 animate-in fade-in mt-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {/* Tombol Submit */}
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-70 mt-4 shadow-sm"
            >
              Daftar Sekarang
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex flex-col gap-3 text-center sm:text-left">
              <p className="text-sm text-slate-600">
                Sudah punya akun?{" "}
                <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                  Masuk di sini
                </Link>
              </p>
              <p className="text-sm text-slate-600">
                Fisioterapis?{" "}
                <Link to="/register/physio" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                  Daftar sebagai Fisioterapis
                </Link>
              </p>
            </div>

            {/* Tombol Kembali (Mobile Bawah) */}
            <div className="pt-8 flex justify-center lg:hidden">
              <Link to="/login" className="text-sm text-slate-500 font-semibold hover:text-slate-800 transition-colors flex items-center gap-1 active:scale-95">
                <ChevronLeft size={16} /> Batal & Kembali
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// Komponen Loading Skeleton
// ==========================================
function RegisterSkeleton() {
  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden animate-pulse">
      
      {/* Kiri - Skeleton Branding (Hanya Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-slate-800 relative flex-col justify-center items-center p-12">
        <div className="max-w-md w-full flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-700 rounded-2xl mb-8"></div>
          <div className="h-8 bg-slate-700 w-3/4 rounded mb-4"></div>
          <div className="h-4 bg-slate-700 w-full rounded mb-2"></div>
          <div className="h-4 bg-slate-700 w-5/6 rounded"></div>
        </div>
      </div>

      {/* Kanan - Form Area Skeleton */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 lg:px-24 xl:px-32 relative">
        <div className="hidden lg:block absolute top-10 right-10 xl:right-16 w-20 h-6 bg-slate-100 rounded-md"></div>
        
        <div className="max-w-sm w-full mx-auto lg:mx-0">
          <div className="w-32 h-10 sm:h-12 bg-slate-200 rounded-md mb-10 sm:mb-12"></div>
          
          <div className="mb-8">
            <div className="h-8 bg-slate-200 w-48 mb-3 rounded-md"></div>
            <div className="h-4 bg-slate-100 w-full mb-1 rounded"></div>
            <div className="h-4 bg-slate-100 w-4/5 rounded"></div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5"><div className="h-4 bg-slate-200 w-24 rounded"></div><div className="h-12 bg-slate-100 w-full rounded-lg"></div></div>
            <div className="space-y-1.5"><div className="h-4 bg-slate-200 w-16 rounded"></div><div className="h-12 bg-slate-100 w-full rounded-lg"></div></div>
            <div className="space-y-1.5"><div className="h-4 bg-slate-200 w-20 rounded"></div><div className="h-12 bg-slate-100 w-full rounded-lg"></div></div>
            <div className="space-y-1.5"><div className="h-4 bg-slate-200 w-32 rounded"></div><div className="h-12 bg-slate-100 w-full rounded-lg"></div></div>
            <div className="h-12 bg-slate-200 w-full rounded-lg mt-4"></div>
          </div>
        </div>
      </div>

    </div>
  );
}