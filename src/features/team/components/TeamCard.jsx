import { useNavigate } from "react-router-dom";
import "./team-card.css";

export default function TeamCard({
  slug,
  name,
  role,
  image,
  description,
  variant = "light",
}) {
  const navigate = useNavigate();

  return (
    <article
      className={`team-card team-card--${variant}`}
      onClick={() => navigate(`/team/${slug}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          navigate(`/team/${slug}`);
        }
      }}
    >
      <div className="team-card__image-wrap">
        <img src={image} alt={name} className="team-card__image" loading="lazy" />

        <div className="team-card__overlay">
          <p className="team-card__role">{role}</p>
          <h3 className="team-card__name">{name}</h3>

          {description ? (
            <p className="team-card__description">{description}</p>
          ) : null}

          <span className="team-card__detail-link">Lihat Detail</span>
        </div>
      </div>
    </article>
  );
}