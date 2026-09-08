'use client';

import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button, Card } from '@/components/ui/primitives';
import { EmptyState } from '@/components/common/states';
export function NotFoundPage() {
  return (<Card className="mt-10">
    <EmptyState
      title="Page not found"
      description="The page you are looking for does not exist or has moved."
      icon={<Compass className="h-6 w-6" />}
      action={<Link href="/dashboard">
        <Button size="sm">Back to dashboard</Button>
      </Link>} />
  </Card>);
}
