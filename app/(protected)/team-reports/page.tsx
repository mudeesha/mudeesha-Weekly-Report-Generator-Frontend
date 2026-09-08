import { RoleGuard } from '@/components/navigation/RoleGuard';
import { TeamReportsPage } from '@/features/reports/pages/admin/TeamReportsPage';
export default function Page() { return <RoleGuard allow={['MANAGER','ADMIN']}><TeamReportsPage /></RoleGuard>; }
