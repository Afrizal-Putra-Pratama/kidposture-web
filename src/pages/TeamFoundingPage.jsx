import TeamSectionPage from "../features/team/components/TeamSectionPage";
import { FOUNDING_TEAM } from "../features/team/data/team.data";

export default function TeamFoundingPage() {
  return (
    <TeamSectionPage
      title="Founding Team"
      subtitle="Enam pendiri awal Posturely yang membangun fondasi visi, teknologi, riset, operasional, dan pengembangan produk."
      teams={FOUNDING_TEAM}
      active="founders"
    />
  );
}