import TeamSectionPage from "../features/team/components/TeamSectionPage";
import { CORE_DEVELOPMENT_TEAM } from "../features/team/data/team.data";

export default function TeamCorePage() {
  return (
    <TeamSectionPage
      title="Core Development Team"
      subtitle="Tim pengembangan inti Posturely yang terdiri dari founder dan kontributor aktif lintas bidang untuk memperkuat teknologi, fisioterapi, komunikasi, dan kesiapan implementasi."
      teams={CORE_DEVELOPMENT_TEAM}
      active="core"
    />
  );
}