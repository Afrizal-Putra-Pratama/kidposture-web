import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Activity, 
  Brain, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Loader,
  CheckCircle,
  X,
  FileText,
  Upload
} from "lucide-react";
import { login } from "../../services/authService.jsx";
import api from "../../utils/axios";

export default function LoginPage() {
  const navigate = useNavigate();
  
  // --- UI States ---
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isProcessing, setIsSubmitting] = useState(false); // Global processing state
  const [activeView, setActiveView] = useState("login"); // 'login', 'register_parent', or 'register_physio'
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successType, setSuccessType] = useState(""); // 'parent' or 'physio'

  // --- Login Form State ---
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState(null);

  // --- Register Parent Form State ---
  const [regParentData, setRegParentData] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [regParentError, setRegParentError] = useState(null);

  // --- Register Physio Form State ---
  const [regPhysioData, setRegPhysioData] = useState({
    name: "", email: "", password: "", password_confirmation: "",
    phone: "", clinic_name: "", city: "", specialty: ""
  });
  const [certificate, setCertificate] = useState(null);
  const [regPhysioError, setRegPhysioError] = useState(null);

  // --- Slider States ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderIntervalRef = useRef(null);
  const slides = [
    { icon: Activity, title: "Deteksi Postur AI", text: "Analisis postur anak dengan kecerdasan buatan dalam hitungan detik." },
    { icon: Brain, title: "Rekomendasi Personal", text: "Sistem AI memberikan saran cerdas untuk menjaga kesehatan postur anak." },
    { icon: Users, title: "Konsultasi Fisio", text: "Hubungi fisioterapis anak terverifikasi untuk pemeriksaan mendalam." },
  ];

  useEffect(() => {
    const loadTimer = setTimeout(() => setIsPageLoading(false), 600);
    startSlider();
    return () => { clearTimeout(loadTimer); stopSlider(); };
  }, []);

  const startSlider = () => {
    if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
    sliderIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
  };
  
  const stopSlider = () => { 
    if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current); 
  };

  // --- Handlers ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    try {
      const { user } = await login(loginData);
      const role = user.role?.toLowerCase();
      if (role === "physio") navigate("/physio/dashboard");
      else if (role === "admin") navigate("/admin/physiotherapists");
      else navigate("/dashboard");
    } catch (err) {
      setLoginError(err.response?.data?.message || "Email atau password salah.");
      setIsSubmitting(false);
    }
  };

  const handleRegisterParentSubmit = async (e) => {
    e.preventDefault();
    setRegParentError(null);
    if (regParentData.password !== regParentData.password_confirmation) {
      setRegParentError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/register", { ...regParentData, role: "parent" });
      setSuccessType("parent");
      setShowSuccessModal(true);
    } catch (err) {
      setRegParentError(err.response?.data?.message || "Gagal mendaftar. Periksa kembali data Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterPhysioSubmit = async (e) => {
    e.preventDefault();
    setRegPhysioError(null);
    if (regPhysioData.password !== regPhysioData.password_confirmation) {
      setRegPhysioError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setIsSubmitting(true);
    
    const formData = new FormData();
    Object.keys(regPhysioData).forEach((key) => formData.append(key, regPhysioData[key]));
    if (certificate) formData.append("certificate", certificate);

    try {
      await api.post("/register/physio", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccessType("physio");
      setShowSuccessModal(true);
    } catch (err) {
      setRegPhysioError(err.response?.data?.message || "Gagal mendaftar. Periksa kelengkapan file/data Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setRegPhysioError("Ukuran file maksimal 5MB"); return; }
      setCertificate(file);
      setRegPhysioError(null);
    }
  };

  const resetAndGoToLogin = () => {
    setShowSuccessModal(false);
    setActiveView("login");
    setRegParentData({ name: "", email: "", password: "", password_confirmation: "" });
    setRegPhysioData({ name: "", email: "", password: "", password_confirmation: "", phone: "", clinic_name: "", city: "", specialty: "" });
    setCertificate(null);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (isPageLoading) return <AuthSkeleton />;

  return (
    <div className="flex h-screen bg-white font-sans text-slate-800 overflow-hidden relative">
      
      {/* POP-UP LOADING GLOBAL */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4 animate-in zoom-in-95">
            <Loader size={40} className="animate-spin text-blue-600" />
            <p className="text-slate-900 font-bold">Sedang memproses...</p>
          </div>
        </div>
      )}

      {/* MODAL SUKSES REGISTRASI (DINAMIS UNTUK PARENT & PHYSIO) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-8 shadow-2xl border border-slate-100 flex flex-col items-center gap-4 animate-in zoom-in-95 relative">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shadow-inner">
              <CheckCircle size={32} strokeWidth={2} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">Pendaftaran Berhasil!</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {successType === 'parent' 
                  ? "Akun Anda berhasil dibuat. Silakan masuk menggunakan email dan kata sandi Anda."
                  : "Akun Anda sedang diverifikasi oleh admin. Anda dapat mencoba masuk setelah akun disetujui."
                }
              </p>
            </div>
            <button 
              onClick={resetAndGoToLogin}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-sm"
            >
              Kembali ke Login
            </button>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* SISI KIRI: AREA FORM LOGIN                  */}
      {/* ========================================= */}
      <div className={`w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 lg:px-24 relative transition-all duration-500 h-full ${activeView !== 'login' ? 'opacity-30 pointer-events-none scale-[0.98]' : 'opacity-100'}`}>
        
        {/* Logo */}
        <div className="absolute top-8 left-6 sm:left-16 lg:left-24 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate("/")}>
          <img src="/logo-posturely.svg" alt="Logo" className="h-10 sm:h-12 object-contain" />
        </div>

        <div className="max-w-sm w-full mx-auto lg:mx-0">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Selamat Datang</h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">Masuk untuk melanjutkan proses screening postur tubuh anak Anda.</p>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input 
                type="email" required placeholder="email@contoh.com"
                value={loginData.email} onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all shadow-inner" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Kata Sandi</label>
              <input 
                type="password" required placeholder="••••••••"
                value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all shadow-inner" 
              />
            </div>
            {loginError && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold flex items-center gap-2 rounded-lg"><AlertCircle size={16}/> {loginError}</div>}
            
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98] mt-2">Masuk ke Akun</button>
          </form>

          {/* CTA Daftar Baru */}
          <div className="mt-10 pt-6 border-t border-slate-100 text-center lg:text-left">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Pilihan Lainnya</p>
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { setActiveView("register_parent"); setRegParentError(null); }}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all active:scale-95 group"
                >
                   <span className="text-[10px] font-bold text-slate-400 mb-0.5 group-hover:text-blue-600 transition-colors">Daftar Akun</span>
                   <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Orang Tua</span>
                </button>
                <button 
                  onClick={() => { setActiveView("register_physio"); setRegPhysioError(null); }}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all active:scale-95 group"
                >
                   <span className="text-[10px] font-bold text-slate-400 mb-0.5 group-hover:text-blue-600 transition-colors">Fisioterapis?</span>
                   <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Daftar Fisio</span>
                </button>
             </div>
             <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-800 mt-8 font-medium transition-colors active:scale-95">
               <ChevronLeft size={16}/> Kembali ke Beranda
             </Link>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* SISI KANAN: SLIDER ATAU REGISTER PANEL      */}
      {/* ========================================= */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden h-full border-l border-slate-100">
        
        {/* VIEW 1: INFO SLIDER (Muncul saat Login Aktif) */}
        <div className={`absolute inset-0 z-10 flex flex-col justify-center items-center p-12 transition-all duration-700 ${activeView !== 'login' ? 'translate-x-full opacity-0 scale-90' : 'translate-x-0 opacity-100 scale-100'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-slate-900 opacity-90"></div>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
          
          <div className="relative z-20 max-w-md w-full animate-in fade-in zoom-in-95 duration-500" key={currentSlide}>
            <div className="w-16 h-16 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-blue-400 mb-8 backdrop-blur-sm shadow-xl">
              {(() => { const Icon = slides[currentSlide].icon; return <Icon size={32} strokeWidth={1.5} />; })()}
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 leading-tight">{slides[currentSlide].title}</h3>
            <p className="text-slate-300 text-lg leading-relaxed mb-12">{slides[currentSlide].text}</p>
            
            <div className="flex items-center gap-6">
              <div className="flex gap-2">
                <button onClick={prevSlide} className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all active:scale-95"><ChevronLeft size={18} /></button>
                <button onClick={nextSlide} className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all active:scale-95"><ChevronRight size={18} /></button>
              </div>
              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? "w-8 bg-blue-500" : "w-2 bg-slate-700"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* VIEW 2: REGISTER PARENT PANEL */}
        <div className={`absolute inset-0 z-20 bg-white flex flex-col justify-center px-12 xl:px-24 transition-transform duration-500 ease-in-out ${activeView === 'register_parent' ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="max-w-sm w-full mx-auto animate-in fade-in duration-700 delay-100">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Daftar Orang Tua</h2>
            <p className="text-sm text-slate-500 mb-8">Buat akun untuk mulai memantau postur tubuh anak Anda hari ini.</p>

            <form onSubmit={handleRegisterParentSubmit} className="space-y-4">
              <div className="space-y-1.5"><label className="text-sm font-semibold text-slate-700">Nama Lengkap</label><input type="text" required value={regParentData.name} onChange={(e) => setRegParentData({...regParentData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" /></div>
              <div className="space-y-1.5"><label className="text-sm font-semibold text-slate-700">Email</label><input type="email" required value={regParentData.email} onChange={(e) => setRegParentData({...regParentData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><label className="text-sm font-semibold text-slate-700">Password</label><input type="password" required value={regParentData.password} onChange={(e) => setRegParentData({...regParentData, password: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" /></div>
                <div className="space-y-1.5"><label className="text-sm font-semibold text-slate-700">Konfirmasi</label><input type="password" required value={regParentData.password_confirmation} onChange={(e) => setRegParentData({...regParentData, password_confirmation: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" /></div>
              </div>
              {regParentError && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2"><AlertCircle size={14}/> {regParentError}</div>}
              
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98] mt-4">Buat Akun</button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
              <span className="text-sm text-slate-400 font-medium">Sudah punya akun?</span>
              <button onClick={() => setActiveView("login")} className="mt-1 text-blue-600 font-bold hover:text-blue-700 text-base py-2 transition-all active:scale-95">
                Kembali Masuk
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 3: REGISTER PHYSIO PANEL (Scrollable) */}
        <div className={`absolute inset-0 z-30 bg-white flex flex-col px-12 xl:px-24 overflow-y-auto hide-scrollbar pt-12 pb-16 transition-transform duration-500 ease-in-out ${activeView === 'register_physio' ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="max-w-md w-full mx-auto animate-in fade-in duration-700 delay-100">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Mitra Fisioterapis</h2>
            <p className="text-sm text-slate-500 mb-8">Lengkapi data diri dan izin praktik Anda untuk bergabung bersama kami.</p>

            <form onSubmit={handleRegisterPhysioSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><label className="text-sm font-semibold text-slate-700">Nama Lengkap</label><input type="text" required value={regPhysioData.name} onChange={(e) => setRegPhysioData({...regPhysioData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" /></div>
                <div className="space-y-1.5"><label className="text-sm font-semibold text-slate-700">Email</label><input type="email" required value={regPhysioData.email} onChange={(e) => setRegPhysioData({...regPhysioData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><label className="text-sm font-semibold text-slate-700">Password</label><input type="password" required value={regPhysioData.password} onChange={(e) => setRegPhysioData({...regPhysioData, password: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" /></div>
                <div className="space-y-1.5"><label className="text-sm font-semibold text-slate-700">Konfirmasi</label><input type="password" required value={regPhysioData.password_confirmation} onChange={(e) => setRegPhysioData({...regPhysioData, password_confirmation: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" /></div>
              </div>
              
              <div className="space-y-1.5"><label className="text-sm font-semibold text-slate-700">No. Telepon</label><input type="tel" required value={regPhysioData.phone} onChange={(e) => setRegPhysioData({...regPhysioData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" /></div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><label className="text-sm font-semibold text-slate-700">Klinik/Praktik</label><input type="text" required value={regPhysioData.clinic_name} onChange={(e) => setRegPhysioData({...regPhysioData, clinic_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" /></div>
                <div className="space-y-1.5"><label className="text-sm font-semibold text-slate-700">Kota</label><input type="text" required value={regPhysioData.city} onChange={(e) => setRegPhysioData({...regPhysioData, city: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" /></div>
              </div>

              <div className="space-y-1.5"><label className="text-sm font-semibold text-slate-700">Spesialisasi</label><input type="text" required value={regPhysioData.specialty} onChange={(e) => setRegPhysioData({...regPhysioData, specialty: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" /></div>

              {/* Upload Berkas */}
              <div className="space-y-1.5 pt-2">
                <label className="text-sm font-semibold text-slate-700">Sertifikat / Izin (Max 5MB)</label>
                <input type="file" id="certificate" accept=".pdf,.jpg,.jpeg,.png" required onChange={handleFileChange} className="hidden" />
                <label htmlFor="certificate" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 bg-slate-50 rounded-xl cursor-pointer transition-all">
                  {certificate ? (
                    <><FileText size={24} className="text-blue-500 mb-1" /><span className="text-sm font-semibold text-slate-700 truncate px-4 max-w-full">{certificate.name}</span></>
                  ) : (
                    <><Upload size={24} className="text-slate-400 mb-1" /><span className="text-sm font-semibold text-slate-700">Unggah Dokumen (PDF/Image)</span></>
                  )}
                </label>
              </div>

              {regPhysioError && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2"><AlertCircle size={14}/> {regPhysioError}</div>}
              
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98] mt-4">Kirim Pendaftaran</button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
              <span className="text-sm text-slate-400 font-medium">Sudah terdaftar?</span>
              <button onClick={() => setActiveView("login")} className="mt-1 text-blue-600 font-bold hover:text-blue-700 text-base py-2 transition-all active:scale-95">
                Kembali Masuk
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* MOBILE ONLY: OVERLAYS UNTUK REGISTER        */}
      {/* ========================================= */}
      <div className={`lg:hidden fixed inset-0 z-50 bg-white p-6 transition-transform duration-300 overflow-y-auto hide-scrollbar ${activeView === 'register_parent' ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Daftar Orang Tua</h2>
            <button onClick={() => setActiveView("login")} className="p-2 bg-slate-100 rounded-full text-slate-600 active:scale-95"><X size={20}/></button>
          </div>
          <form onSubmit={handleRegisterParentSubmit} className="space-y-4 max-w-sm mx-auto">
              <div className="space-y-1.5"><label className="text-sm font-semibold">Nama Lengkap</label><input type="text" required value={regParentData.name} onChange={(e) => setRegParentData({...regParentData, name: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              <div className="space-y-1.5"><label className="text-sm font-semibold">Email</label><input type="email" required value={regParentData.email} onChange={(e) => setRegParentData({...regParentData, email: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              <div className="space-y-1.5"><label className="text-sm font-semibold">Password</label><input type="password" required value={regParentData.password} onChange={(e) => setRegParentData({...regParentData, password: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              <div className="space-y-1.5"><label className="text-sm font-semibold">Ulangi Password</label><input type="password" required value={regParentData.password_confirmation} onChange={(e) => setRegParentData({...regParentData, password_confirmation: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              {regParentError && <div className="text-red-600 text-xs font-bold">{regParentError}</div>}
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl mt-2 active:scale-95">Buat Akun</button>
              <button onClick={() => setActiveView("login")} type="button" className="w-full text-blue-600 font-bold py-3 mt-2 active:scale-95">Sudah punya akun? Masuk</button>
          </form>
      </div>

      <div className={`lg:hidden fixed inset-0 z-50 bg-white p-6 transition-transform duration-300 overflow-y-auto hide-scrollbar ${activeView === 'register_physio' ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Daftar Fisio</h2>
            <button onClick={() => setActiveView("login")} className="p-2 bg-slate-100 rounded-full text-slate-600 active:scale-95"><X size={20}/></button>
          </div>
          <form onSubmit={handleRegisterPhysioSubmit} className="space-y-4 max-w-sm mx-auto pb-12">
              <div className="space-y-1.5"><label className="text-sm font-semibold">Nama Lengkap</label><input type="text" required value={regPhysioData.name} onChange={(e) => setRegPhysioData({...regPhysioData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
              <div className="space-y-1.5"><label className="text-sm font-semibold">Email</label><input type="email" required value={regPhysioData.email} onChange={(e) => setRegPhysioData({...regPhysioData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><label className="text-sm font-semibold">Password</label><input type="password" required value={regPhysioData.password} onChange={(e) => setRegPhysioData({...regPhysioData, password: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
                <div className="space-y-1.5"><label className="text-sm font-semibold">Ulangi</label><input type="password" required value={regPhysioData.password_confirmation} onChange={(e) => setRegPhysioData({...regPhysioData, password_confirmation: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
              </div>
              <div className="space-y-1.5"><label className="text-sm font-semibold">No. Telepon</label><input type="tel" required value={regPhysioData.phone} onChange={(e) => setRegPhysioData({...regPhysioData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><label className="text-sm font-semibold">Klinik</label><input type="text" required value={regPhysioData.clinic_name} onChange={(e) => setRegPhysioData({...regPhysioData, clinic_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
                <div className="space-y-1.5"><label className="text-sm font-semibold">Kota</label><input type="text" required value={regPhysioData.city} onChange={(e) => setRegPhysioData({...regPhysioData, city: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
              </div>
              <div className="space-y-1.5"><label className="text-sm font-semibold">Spesialisasi</label><input type="text" required value={regPhysioData.specialty} onChange={(e) => setRegPhysioData({...regPhysioData, specialty: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
              <div className="space-y-1.5 pt-2">
                <label className="text-sm font-semibold">Sertifikat / Izin</label>
                <input type="file" id="certMobile" accept=".pdf,.jpg,.jpeg,.png" required onChange={handleFileChange} className="hidden" />
                <label htmlFor="certMobile" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl">
                  {certificate ? <span className="text-sm font-bold text-blue-600 truncate px-4">{certificate.name}</span> : <span className="text-sm font-semibold text-slate-500">Unggah File</span>}
                </label>
              </div>
              {regPhysioError && <div className="text-red-600 text-xs font-bold">{regPhysioError}</div>}
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl mt-2 active:scale-95">Kirim Pendaftaran</button>
              <button onClick={() => setActiveView("login")} type="button" className="w-full text-blue-600 font-bold py-3 mt-2 active:scale-95">Kembali Masuk</button>
          </form>
      </div>

    </div>
  );
}

// ==========================================
// Komponen Loading Skeleton
// ==========================================
function AuthSkeleton() {
  return (
    <div className="flex h-screen bg-white animate-pulse overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-16 lg:px-24">
        <div className="w-32 h-10 bg-slate-200 rounded-md mb-20"></div>
        <div className="h-10 bg-slate-200 w-48 mb-4"></div>
        <div className="h-12 bg-slate-100 rounded-xl mb-4"></div>
        <div className="h-12 bg-slate-100 rounded-xl mb-4"></div>
        <div className="h-14 bg-slate-200 rounded-xl"></div>
      </div>
      <div className="hidden lg:block w-1/2 bg-slate-800"></div>
    </div>
  );
}