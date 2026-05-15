import TeamSectionPage from "../features/team/components/TeamSectionPage";
import { ALL_TEAM } from "../features/team/data/team.data";

export default function TeamPage() {
  return (
    <TeamSectionPage
      title="Our Team"
      subtitle="Kami adalah tim multidisiplin yang berkomitmen menghadirkan solusi digital, edukasi, dan layanan yang membantu tumbuh kembang anak secara lebih sehat, aman, dan terarah."
      teams={ALL_TEAM}
      active="all"
    />
  );
}