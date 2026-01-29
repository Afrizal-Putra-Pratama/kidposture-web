import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Calendar, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "../services/authService.jsx";
import "../styles/dashboard.css";

function ParentProfilePage() {
  const [user] = useState(() => getCurrentUser()); // ✅ Init langsung

  if (!user) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-skeleton">
            <User size={48} strokeWidth={1.5} />
            <p>Memuat profil...</p>
          </div>
        </div>
      </div>
    );
  }

  const createdDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("id-ID")
    : new Date().toLocaleDateString("id-ID");

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="profile-page">
          <div className="profile-header">
            <Link to="/dashboard" className="profile-back">
              <ArrowLeft size={18} strokeWidth={2} />
              Kembali ke Dashboard
            </Link>
            <h1>Profil Saya</h1>
          </div>

          <div className="profile-card">
            <div className="profile-avatar">
              <User size={48} strokeWidth={1.5} />
            </div>

            <div className="profile-info">
              <div className="profile-info__item">
                <User size={18} strokeWidth={1.5} />
                <div>
                  <div className="profile-info__label">Nama</div>
                  <div className="profile-info__value">{user.name}</div>
                </div>
              </div>

              <div className="profile-info__item">
                <Mail size={18} strokeWidth={1.5} />
                <div>
                  <div className="profile-info__label">Email</div>
                  <div className="profile-info__value">{user.email}</div>
                </div>
              </div>

              <div className="profile-info__item">
                <Calendar size={18} strokeWidth={1.5} />
                <div>
                  <div className="profile-info__label">Bergabung</div>
                  <div className="profile-info__value">{createdDate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParentProfilePage;
