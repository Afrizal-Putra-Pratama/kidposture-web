import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  ChevronLeft, 
  AlertCircle, 
  Loader, 
  Stethoscope 
} from "lucide-react";
import api from "../../utils/axios"; // Sesuaikan path jika berbeda

export default function RegisterPhysioPage() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    clinic_name: "",
    city: "",
    specialty: "",
  });
  
  const [certificate, setCertificate] = useState(null);
  
  // UI States
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Skeleton Loading Simulator
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsPageLoading(false);
    }, 600);
    return () => clearTimeout(loadTimer);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file maksimal 5MB");
        return;
      }
      setCertificate(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.password_confirmation) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    if (certificate) {
      formData.append("certificate", certificate);
    }

    try {
      await api.post("/register/physio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowSuccessModal(true);
    } catch (err) {
      if (err.response?.data?.errors) {
        const msgs = Object.values(err.response.data.errors).flat();
        setError(msgs.join(", "));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Gagal mendaftar. Periksa kembali data Anda.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) {
    return <PhysioRegisterSkeleton />;
  }

  return (
    <div className="flex h-screen bg-white font-sans text-slate-800 overflow-hidden relative">
      
      {/* --- POP-UP OVERLAY LOADING SAAT SUBMIT --- */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-4 animate-in zoom-in-95">
            <Loader size={36} className="animate-spin text-blue-600" />
            <p className="text-slate-800 font-bold text-sm">Mendaftarkan akun...</p>
          </div>
        </div>
      )}

      {/* --- MODAL SUKSES --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-8 relative shadow-2xl border border-slate-100 flex flex-col items-center gap-4 animate-in zoom-in-95 slide-in-from-bottom-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mt-2 border border-emerald-100 shadow-inner">
              <CheckCircle size={32} strokeWidth={2} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Pendaftaran Berhasil!</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Akun Anda sedang diverifikasi oleh admin. Anda akan menerima notifikasi atau dapat mencoba masuk setelah akun disetujui.
              </p>
            </div>

            <button 
              onClick={() => navigate("/login")} 
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition-all active:scale-[0.98] shadow-sm"
            >
              Kembali ke Halaman Login
            </button>
          </div>
        </div>
      )}

      {/* KIRI: Area Informasi Banner (Hanya Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-center items-center p-12 overflow-hidden border-r border-slate-800 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-slate-900 opacity-90 z-0"></div>
        <div className="absolute inset-0 opacity-[0.04] z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

        <div className="relative z-10 max-w-md w-full text-center animate-in fade-in duration-700">
          <div className="w-16 h-16 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-blue-400 mb-8 backdrop-blur-sm shadow-xl mx-auto">
            <Stethoscope size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Bergabung Sebagai Mitra Fisioterapis</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Perluas jangkauan praktik Anda. Bantu lebih banyak anak-anak untuk mencapai postur tubuh yang optimal bersama platform kami.
          </p>
        </div>
      </div>

      {/* KANAN: Area Form Registrasi (Scrollable) */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 sm:px-16 lg:px-24 xl:px-32 relative h-full overflow-y-auto hide-scrollbar z-10 bg-white pt-10 sm:pt-16 pb-12">
        
        {/* Tombol Batal/Kembali (Desktop Kanan Atas) */}
        <Link 
          to="/login" 
          className="hidden lg:flex absolute top-10 right-10 xl:right-16 text-sm font-semibold text-slate-400 hover:text-slate-800 transition-colors items-center gap-1.5 active:scale-95"
        >
          <ChevronLeft size={16} /> Batal
        </Link>

        {/* Logo */}
        <div className="mb-8 cursor-pointer transition-transform active:scale-95 flex-shrink-0" onClick={() => navigate("/")}>
          <img src="/logo-posturely.svg" alt="Posturely Logo" className="h-10 sm:h-12 object-contain" />
        </div>

        <div className="max-w-md w-full mx-auto lg:mx-0 flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Daftar Fisioterapis</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Lengkapi data diri dan izin praktik Anda untuk mulai bergabung.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Nama Anda" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 shadow-inner" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="email@contoh.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 shadow-inner" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Kata Sandi</label>
                <input type="password" name="password" required minLength={8} value={form.password} onChange={handleChange} placeholder="Min. 8 Karakter" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 shadow-inner" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Konfirmasi Sandi</label>
                <input type="password" name="password_confirmation" required minLength={8} value={form.password_confirmation} onChange={handleChange} placeholder="Ketik ulang sandi" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 shadow-inner" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nomor Telepon</label>
              <input type="tel" name="phone" required value={form.phone} onChange={handleChange} placeholder="08123456789" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 shadow-inner" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nama Klinik/Praktik</label>
                <input type="text" name="clinic_name" required value={form.clinic_name} onChange={handleChange} placeholder="Klinik Sehat" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 shadow-inner" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Kota</label>
                <input type="text" name="city" required value={form.city} onChange={handleChange} placeholder="Jakarta" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 shadow-inner" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Spesialisasi</label>
              <input type="text" name="specialty" required value={form.specialty} onChange={handleChange} placeholder="Cth. Fisioterapi Anak, Rehabilitasi" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 shadow-inner" />
            </div>

            {/* File Upload Area */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Sertifikat / Izin Praktik</label>
              <input type="file" id="certificate" accept=".pdf,.jpg,.jpeg,.png" required onChange={handleFileChange} className="hidden" />
              <label 
                htmlFor="certificate" 
                className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 bg-slate-50 rounded-xl cursor-pointer transition-all"
              >
                {certificate ? (
                  <>
                    <FileText size={28} className="text-blue-500 mb-2" />
                    <span className="text-sm font-semibold text-slate-700 truncate px-4 max-w-full">{certificate.name}</span>
                    <span className="text-xs text-slate-400 mt-1">Ketuk untuk mengganti file</span>
                  </>
                ) : (
                  <>
                    <Upload size={28} className="text-slate-400 mb-2" />
                    <span className="text-sm font-semibold text-slate-700">Unggah Dokumen (PDF/Image)</span>
                    <span className="text-xs text-slate-400 mt-1">Maksimal ukuran file 5MB</span>
                  </>
                )}
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium flex items-start gap-2 animate-in fade-in">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {/* Tombol Submit */}
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-70 mt-4 shadow-sm"
            >
              Daftar Sekarang
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
            <span className="text-sm text-slate-400 font-medium">Sudah punya akun?</span>
            <Link 
              to="/login"
              className="mt-1 text-blue-600 font-bold hover:text-blue-700 text-base py-2 transition-all active:scale-95"
            >
              Kembali Masuk ke Akun
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// Komponen Loading Skeleton
// ==========================================
function PhysioRegisterSkeleton() {
  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden animate-pulse">
      
      {/* Kiri - Skeleton Branding (Hanya Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-slate-800 relative flex-col justify-center items-center p-12">
        <div className="max-w-md w-full flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-700 rounded-2xl mb-8"></div>
          <div className="h-8 bg-slate-700 w-3/4 rounded mb-4"></div>
          <div className="h-4 bg-slate-700 w-full rounded mb-2"></div>
          <div className="h-4 bg-slate-700 w-5/6 rounded"></div>
        </div>
      </div>

      {/* Kanan - Form Area Skeleton (Scrollable Box) */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 sm:px-16 lg:px-24 xl:px-32 relative h-full pt-10 sm:pt-16">
        <div className="hidden lg:block absolute top-10 right-10 xl:right-16 w-20 h-6 bg-slate-100 rounded-md"></div>
        
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <div className="w-32 h-10 sm:h-12 bg-slate-200 rounded-md mb-8"></div>
          
          <div className="mb-8">
            <div className="h-8 bg-slate-200 w-56 mb-3 rounded-md"></div>
            <div className="h-4 bg-slate-100 w-full mb-1 rounded"></div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
              <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
              <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
            </div>
            <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
              <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
            </div>
            <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
            <div className="h-28 bg-slate-100 w-full rounded-xl mt-2"></div>
            
            <div className="h-12 bg-slate-200 w-full rounded-lg mt-6"></div>
          </div>
        </div>
      </div>

    </div>
  );
}