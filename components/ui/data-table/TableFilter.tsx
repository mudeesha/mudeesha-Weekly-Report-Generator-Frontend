'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';

export function TableFilter({ label, value, onChange, children, type = 'select' }: { label: string; value: string; onChange: (value: string) => void; children?: ReactNode; type?: 'select' | 'date' }) {
  const id = useId();
  return <div className="wr-data-filter">
    <label htmlFor={id} className="sr-only">{label}</label>
    {type === 'date' ? <div className="wr-data-date"><span aria-hidden="true">{label}</span><input id={id} type="date" value={value} onChange={event => onChange(event.target.value)} /></div> : <select id={id} title={label} className="wr-input !h-8 !text-[11px]" value={value} onChange={event => onChange(event.target.value)}>{children}</select>}
  </div>;
}
