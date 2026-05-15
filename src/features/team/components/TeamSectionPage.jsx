import { ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import PublicNavbar from "../../../components/PublicNavbar";
import TeamCard from "./TeamCard";
import "./team-page.css";

const tabs = [
  {
    label: "All Team",
    href: "/team",
    value: "all",
  },
  {
    label: "Expert Team",
    href: "/team/expert",
    value: "expert",
  },
  {
    label: "Staff Mahasiswa",
    href: "/team/staff",
    value: "staff",
  },
];

export default function TeamSectionPage({
  title,
  subtitle,
  teams,
  active = "all",
}) {
  return (
    <main className="team-page">
      <PublicNavbar />

      <section className="team-hero">
        <div className="team-hero__pattern" />

        <div className="team-container team-hero__content">
          <div className="team-hero__inner">
            <div className="team-hero__badge">
              <span>Our Team</span>
              <ChevronDown size={16} />
            </div>

            <h1>{title}</h1>

            <p>{subtitle}</p>

            <div className="team-hero__line" />
          </div>
        </div>
      </section>

      <section className="team-content">
        <div className="team-container">
          <div className="team-tabs">
            {tabs.map((tab) => {
              const isActive = tab.value === active;

              return (
                <Link
                  key={tab.value}
                  to={tab.href}
                  className={`team-tab ${isActive ? "team-tab--active" : ""}`}
                >
                  {tab.label}
                  <ChevronRight size={16} />
                </Link>
              );
            })}
          </div>

          <div className="team-grid">
            {teams.map((member) => (
              <TeamCard key={`${member.name}-${member.role}`} {...member} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}