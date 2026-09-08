import Link from 'next/link';
import { CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { relativeTime } from '@/lib/format';
import type { Activity } from '@/types';

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (!activities.length) return <p className="py-7 text-center text-[11px] text-[#938ca2]">No submission or review activity in this selection.</p>;

  return (
    <div className="divide-y divide-[#efedf2]">
      {activities.map(item => (
        <Link key={item.id} href={`/reports/${item.reportId}`} className="flex gap-2.5 py-3 first:pt-0 last:pb-0 hover:bg-[#fbfafd]">
          <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center text-[#594dba]">
            {item.activityType === 'REPORT_APPROVED' ? <CheckCircle2 className="h-3.5 w-3.5 text-[#52a97d]" /> : item.activityType === 'CHANGES_REQUESTED' ? <MessageSquare className="h-3.5 w-3.5 text-[#ff806c]" /> : <Send className="h-3.5 w-3.5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] leading-4 text-[#544c74]">{item.message}</p>
            <p className="mt-0.5 text-[9px] text-[#aaa4b6]">Version {item.versionNumber} · {relativeTime(item.createdAt)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
