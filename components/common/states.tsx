import React from 'react';
import { AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { Button, Card } from '@/components/ui/primitives';
import { cn } from '@/lib/format';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[6px] bg-[#f0eef8]', className)} />;
}

export function MetricCardSkeleton() {
  return <Card className="p-4">
    <Skeleton className="h-4 w-4" />
    <Skeleton className="mt-5 h-6 w-16" />
    <Skeleton className="mt-2 h-3 w-24" />
  </Card>;
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return <Card className="p-4">
    <Skeleton className="h-4 w-36" />
    <Skeleton className="mt-2 h-3 w-48" />
    <div className="mt-5 w-full animate-pulse rounded-[8px] bg-[#f0eef8]" style={{ height }} />
  </Card>;
}

export function TableSkeleton({ rows = 6, columns = 6 }: { rows?: number; columns?: number }) {
  return <Card className="overflow-hidden">
    <div className="border-b border-[#e7e5eb] px-4 py-3"><Skeleton className="h-4 w-32" /></div>
    <div className="divide-y divide-[#ece9f0]">
      {Array.from({ length: rows }).map((_, row) => <div key={row} className="flex items-center gap-4 px-4 py-3">
        {Array.from({ length: columns }).map((__, column) => <Skeleton key={column} className={cn('h-3.5', column === 0 ? 'w-36' : 'w-16')} />)}
      </div>)}
    </div>
  </Card>;
}

export function EmptyState({ title, description, action, icon }: { title: string; description: string; action?: React.ReactNode; icon?: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
    <span className="mb-3 inline-flex h-8 w-8 items-center justify-center text-[#938ca2]">{icon ?? <FileText className="h-5 w-5" />}</span>
    <h3 className="text-[13px] font-semibold text-[#4e4769]">{title}</h3>
    <p className="mt-1 max-w-sm text-[11px] leading-5 text-[#887f9d]">{description}</p>
    {action && <div className="mt-3">{action}</div>}
  </div>;
}

export function ErrorState({ title = 'Something went wrong.', description = "We couldn't load the requested data.", onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return <Card className="flex flex-col items-center justify-center px-5 py-10 text-center">
    <span className="mb-3 inline-flex h-8 w-8 items-center justify-center text-error-500"><AlertCircle className="h-5 w-5" /></span>
    <h3 className="text-[13px] font-semibold text-[#4e4769]">{title}</h3>
    <p className="mt-1 max-w-sm text-[11px] leading-5 text-[#887f9d]">{description}</p>
    {onRetry && <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}><RefreshCw className="h-3.5 w-3.5" />Try again</Button>}
  </Card>;
}
