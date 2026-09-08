import { RoleGuard } from '@/components/navigation/RoleGuard';
import { AnalyticsPage } from '@/features/analytics/pages/AnalyticsPage';
export default function Page() { return <RoleGuard allow={['MANAGER','ADMIN']}><AnalyticsPage /></RoleGuard>; }
