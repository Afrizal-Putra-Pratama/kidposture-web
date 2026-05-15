import TeamSectionPage from "../features/team/components/TeamSectionPage";
import { STAFF_TEAM } from "../features/team/data/team.data";

export default function TeamStaffPage() {
  return (
    <TeamSectionPage
      title="Staff Team"
      subtitle="Tim operasional kami mendukung layanan, konten, komunikasi, dan pengembangan platform agar pengalaman pengguna berjalan nyaman dan profesional."
      teams={STAFF_TEAM}
      active="staff"
    />
  );
}