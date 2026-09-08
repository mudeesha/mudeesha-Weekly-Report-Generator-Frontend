import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/primitives';
import { cn } from '@/lib/format';

export function MetricCard({ label, value, helper, trend, trendLabel = 'vs last period', icon, tone = 'brand', compact = false, className }: {
  label: string;
  value: string;
  helper?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  tone?: 'brand' | 'success' | 'warning' | 'error';
  compact?: boolean;
  className?: string;
}) {
  const tones: Record<string, string> = {
    brand: 'text-[#594dba]',
    success: 'text-[#52c58d]',
    warning: 'text-[#ff806c]',
    error: 'text-[#ef6372]',
  };
  const up = (trend ?? 0) >= 0;

  return (
    <Card className={cn(compact ? 'min-h-[92px] p-3.5' : 'min-h-[118px] p-4 sm:p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn('inline-flex items-center justify-center', compact ? 'h-5 w-5' : 'h-6 w-6', tones[tone])}>{icon}</span>
        {typeof trend === 'number' && (
          <span className={cn('inline-flex items-center gap-1 text-[9px] font-medium', up ? 'text-[#52a97d]' : 'text-[#e36b78]')}>
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}% <span className="font-normal text-[#b1aabc]">{trendLabel}</span>
          </span>
        )}
      </div>
      <div className={compact ? 'mt-2' : 'mt-3'}>
        <h4 className={cn('font-semibold leading-none text-[#594dba]', compact ? 'text-[20px]' : 'text-[22px]')}>{value}</h4>
        <p className={cn('text-[#6f6788]', compact ? 'mt-1.5 text-[11px]' : 'mt-2 text-[11px]')}>{label}</p>
        {helper && <p className={cn('text-[9px] leading-relaxed text-[#a19aaa]', compact ? 'mt-0.5 line-clamp-1' : 'mt-1')}>{helper}</p>}
      </div>
    </Card>
  );
}
