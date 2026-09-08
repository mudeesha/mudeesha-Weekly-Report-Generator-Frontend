'use client';

import { useAuth } from '@/features/auth/context/AuthContext';
import { AdminDashboard } from '@/features/dashboard/components/admin/AdminDashboard';
import { MemberDashboard } from '@/features/dashboard/components/member/MemberDashboard';
export function DashboardPage() {
  const { isManager } = useAuth();
  return isManager ? <AdminDashboard /> : <MemberDashboard />;
}
