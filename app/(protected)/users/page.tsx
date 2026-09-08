import { RoleGuard } from '@/components/navigation/RoleGuard';
import { UsersPage } from '@/features/users/pages/admin/UsersPage';
export default function Page() { return <RoleGuard allow={['ADMIN']}><UsersPage /></RoleGuard>; }
