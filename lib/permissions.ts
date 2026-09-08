import type { UserRole } from '@/types';

export const managementRoles: UserRole[] = ['MANAGER', 'ADMIN'];

export const permissions = {
  canCreateReport: (role: UserRole | null) => role === 'TEAM_MEMBER',
  canReviewReports: (role: UserRole | null) => role === 'MANAGER' || role === 'ADMIN',
  canViewDashboardAnalytics: (role: UserRole | null) => role === 'MANAGER' || role === 'ADMIN',
  canManageProjects: (role: UserRole | null) => role === 'MANAGER' || role === 'ADMIN',
  canManageUsers: (role: UserRole | null) => role === 'ADMIN',
  canUseAiAssistant: (role: UserRole | null) => role === 'MANAGER' || role === 'ADMIN',
};
