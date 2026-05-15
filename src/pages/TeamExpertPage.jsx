import TeamSectionPage from "../features/team/components/TeamSectionPage";
import { EXPERT_TEAM } from "../features/team/data/team.data";

export default function TeamExpertPage() {
  return (
    <TeamSectionPage
      title="Expert Team"
      subtitle="Tim ahli kami terdiri dari profesional yang mendukung pengembangan layanan, edukasi, dan pendekatan berbasis keilmuan untuk membantu pemantauan postur anak."
      teams={EXPERT_TEAM}
      active="expert"
    />
  );
}