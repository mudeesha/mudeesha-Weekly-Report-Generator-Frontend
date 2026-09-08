import type { ReactNode } from 'react';
import { ClipboardCheck } from 'lucide-react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#f6f2fe] p-0">
      <div className="grid min-h-screen w-full overflow-hidden bg-[#f6f2fe] lg:grid-cols-[.72fr_1.28fr]">
        <div className="hidden bg-[#272163] px-9 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="text-[22px] font-bold">WorkReport</div>
            <div className="mt-1 text-[9px] uppercase tracking-[.09em] text-white/52">Weekly Reporting</div>
            <div className="mt-20 max-w-sm">
              <p className="text-[11px] text-white/58">Simple weekly reporting for teams.</p>
              <h2 className="mt-3 text-[26px] font-semibold leading-[1.25] text-white">Clear work. Clear progress.</h2>
              <p className="mt-4 text-[12px] leading-6 text-white/65">Create weekly reports, keep historical versions and review team progress in one calm workspace.</p>
            </div>
          </div>
          <div className="rounded-[12px] bg-white/7 px-4 py-4">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-5 w-5 text-white/78" />
              <div>
                <p className="text-[12px] font-medium">Weekly reporting</p>
                <p className="mt-1 text-[10px] text-white/55">Monday–Sunday · Due Monday at 9:00 AM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-sm rounded-[12px] bg-white p-6 shadow-[0_7px_18px_rgba(67,58,103,.055)] sm:p-7">
            <div className="mb-6 lg:hidden">
              <div className="text-[20px] font-bold text-[#3c3374]">WorkReport</div>
              <div className="mt-1 text-[9px] uppercase tracking-[.08em] text-[#938ca2]">Weekly Reporting</div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
