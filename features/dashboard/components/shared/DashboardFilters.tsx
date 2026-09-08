'use client';

import { RotateCcw } from 'lucide-react';
import { TableFilter } from '@/components/ui/data-table/TableFilter';
import { useData } from '@/providers/DataProvider';
import { mondayOf, weekOptions } from '@/lib/format';
import type { ReportFilters } from '@/types';

export function DashboardFilters({ value, onChange, weekly = false }: { value: ReportFilters; onChange: (value: ReportFilters) => void; weekly?: boolean }) {
  const { users, projects } = useData();
  const set = (key: keyof ReportFilters, next: string) => onChange({ ...value, [key]: next || undefined });
  return <section aria-label="Dashboard filters" className="wr-data-table mb-4"><div className="wr-data-toolbar !border-b-0">
    <span className="mr-1 text-[11px] font-medium text-[#655d82]">Filter overview</span>
    <TableFilter label="Team member" value={value.userId || ''} onChange={value => set('userId', value)}><option value="">All members</option>{users.map(item => <option key={item.id} value={item.id}>{item.name}{!item.isActive ? ' (inactive)' : ''}</option>)}</TableFilter>
    <TableFilter label="Project" value={value.projectId || ''} onChange={value => set('projectId', value)}><option value="">All projects</option>{projects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</TableFilter>
    {weekly ? <TableFilter label="Reporting week" value={value.from || mondayOf()} onChange={week => onChange({ ...value, from: week, to: week })}>{weekOptions(55).map(item => <option key={item.start} value={item.start}>{item.label}</option>)}</TableFilter> : <><TableFilter label="From" type="date" value={value.from || ''} onChange={value => set('from', value)} /><TableFilter label="To" type="date" value={value.to || ''} onChange={value => set('to', value)} /></>}
    <button type="button" className="wr-action" title="Reset filters" aria-label="Reset overview filters" onClick={() => onChange(weekly ? { from: mondayOf(), to: mondayOf() } : {})}><RotateCcw className="h-3.5 w-3.5" /></button>
  </div></section>;
}
