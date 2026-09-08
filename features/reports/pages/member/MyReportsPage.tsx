'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { ReportsExplorer } from '@/features/reports/components/shared/ReportsExplorer';
import { Button } from '@/components/ui/primitives';
export function MyReportsPage() {
  const { user } = useAuth();
  return <>
    <PageHeader
      title="My Reports"
      subtitle="Create, edit and submit your weekly work reports."
      actions={user?.role === 'TEAM_MEMBER' ? <Link href="/reports/new">
        <Button><Plus className="h-4 w-4" />New report</Button>
      </Link> : undefined} />
    <ReportsExplorer userId={user?.id} />
  </>;
}
