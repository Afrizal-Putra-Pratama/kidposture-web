import TeamSectionPage from "../features/team/components/TeamSectionPage";
import {
  CORE_DEVELOPMENT_TEAM,
  EXPERT_ADVISOR_TEAM,
} from "../features/team/data/team.data";

const TEAM_PAGE_MEMBERS = [
  ...EXPERT_ADVISOR_TEAM,
  ...CORE_DEVELOPMENT_TEAM,
];

export default function TeamPage() {
  return (
    <TeamSectionPage
      title="Our Team"
      subtitle="Kolaborasi tim Posturely terdiri dari expert, advisor, founder, dan kontributor aktif lintas bidang yang mendukung pengembangan solusi deteksi dini postur anak."
      teams={TEAM_PAGE_MEMBERS}
      active="all"
    />
  );
}