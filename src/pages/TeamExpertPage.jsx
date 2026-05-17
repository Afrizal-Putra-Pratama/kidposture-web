import TeamSectionPage from "../features/team/components/TeamSectionPage";
import { EXPERT_ADVISOR_TEAM } from "../features/team/data/team.data";

export default function TeamExpertPage() {
  return (
    <TeamSectionPage
      title="Expert & Advisor Team"
      subtitle="Para expert, advisor, dan validator yang membantu memastikan Posturely relevan secara klinis, edukatif, aman, dan sesuai kebutuhan pengguna."
      teams={EXPERT_ADVISOR_TEAM}
      active="experts"
    />
  );
}