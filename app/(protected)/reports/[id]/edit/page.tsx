import { RoleGuard } from '@/components/navigation/RoleGuard';
import { ReportEditorPage } from '@/features/reports/pages/member/ReportEditorPage';
export default function Page() { return <RoleGuard allow={['TEAM_MEMBER']}><ReportEditorPage mode="edit" /></RoleGuard>; }
