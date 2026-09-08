import { RoleGuard } from '@/components/navigation/RoleGuard';
import { TeamMemberDetailPage } from '@/features/team/pages/admin/TeamMemberDetailPage';
export default function Page() { return <RoleGuard allow={['MANAGER','ADMIN']}><TeamMemberDetailPage /></RoleGuard>; }
