import { RoleGuard } from '@/components/navigation/RoleGuard';
import { TeamMembersPage } from '@/features/team/pages/admin/TeamMembersPage';
export default function Page() { return <RoleGuard allow={['MANAGER','ADMIN']}><TeamMembersPage /></RoleGuard>; }
