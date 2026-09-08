import type { ReactNode } from 'react';
import { Card } from '@/components/ui/primitives';
import { cn } from '@/lib/format';

export function ChartCard({ title, subtitle, actions, children, className }: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  menu?: boolean;
}) {
  return (
    <Card className={cn('flex min-w-0 flex-col', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <div>
          <h3 className="text-[14px] font-semibold text-[#393353]">{title}</h3>
          {subtitle && <p className="mt-1 text-[10px] text-[#8f889c]">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5">{children}</div>
    </Card>
  );
}
