import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import PublicNavbar from "../components/PublicNavbar";
import { getTeamBySlug } from "../features/team/data/team.data";
import "../features/team/components/team-detail.css";

export default function TeamDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const member = getTeamBySlug(slug);

  if (!member) {
    return (
      <main className="team-detail-page">
        <PublicNavbar />

        <section className="team-detail-not-found">
          <h1>Team member tidak ditemukan</h1>
          <p>Data anggota tim yang kamu cari tidak tersedia.</p>

          <button type="button" onClick={() => navigate("/team")}>
            Kembali ke Tim
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="team-detail-page">
      <PublicNavbar />

      <section className="team-detail-hero">
        <div className="team-detail-hero__pattern" />

        <div className="team-detail-container team-detail-hero__inner">
          <button
            type="button"
            className="team-detail-back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Kembali
          </button>

          <div className="team-detail-layout">
            <div className="team-detail-photo-card">
              <img src={member.image} alt={member.name} />

              <div className="team-detail-photo-badge">
                <span>{member.type}</span>
              </div>
            </div>

            <div className="team-detail-content">
              <span className="team-detail-eyebrow">{member.type}</span>

              <h1>{member.name}</h1>

              <p className="team-detail-role">{member.role}</p>

              <p className="team-detail-description">{member.bio}</p>

              <div className="team-detail-actions">
                <button type="button" onClick={() => navigate("/team")}>
                  Semua Tim
                </button>

                <button type="button" onClick={() => navigate("/team/staff")}>
                  Student Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="team-detail-section">
        <div className="team-detail-container">
          <div className="team-detail-card">
            <h2>Peran dan Kontribusi</h2>

            <div className="team-detail-list">
              {member.responsibilities?.map((item, index) => (
                <div key={index} className="team-detail-list-item">
                  <CheckCircle2 size={20} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}