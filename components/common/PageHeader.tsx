import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface Crumb { label: string; to?: string; }

export function PageHeader({ title, subtitle, crumbs = [], actions }: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold leading-[1.2] text-[#594dba]">{title}</h1>
        {subtitle && <p className="mt-1 text-[12px] text-[#817a92]">{subtitle}</p>}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="hidden xl:block">
            <ol className="flex items-center gap-1.5 text-[10px] text-[#938ca2]">
              <li><Link href="/dashboard" className="transition hover:text-[#594dba]">Home</Link></li>
              {crumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3" />
                  {crumb.to && index !== crumbs.length - 1 ? <Link href={crumb.to} className="hover:text-[#594dba]">{crumb.label}</Link> : <span className="font-medium text-[#655e79]">{crumb.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
