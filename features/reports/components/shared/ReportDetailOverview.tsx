import type { ReactNode } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FilePenLine,
  ListChecks,
  Send,
  TimerReset,
} from 'lucide-react';

import { ReportVersionHistory } from '@/features/reports/components/shared/ReportVersionHistory';
import { Badge } from '@/components/ui/primitives';
import { hoursByType } from '@/lib/api-adapters';
import {
  cn,
  formatDateTime,
  formatRange,
  reportStatusLabel,
} from '@/lib/format';

import type {
  Project,
  ReportStatus,
  ReportVersion,
  User,
  WeeklyReport,
} from '@/types';

const statusStyle: Record<
  ReportStatus,
  {
    badge: string;
    icon: ReactNode;
  }
> = {
  DRAFT: {
    badge: 'border-[#e1dde8] bg-[#f2f0f5] text-[#6e6687]',
    icon: <FilePenLine className="h-3.5 w-3.5" />,
  },

  SUBMITTED: {
    badge: 'border-[#ddd7f2] bg-[#eeeafd] text-[#594dba]',
    icon: <Send className="h-3.5 w-3.5" />,
  },

  NEEDS_CORRECTION: {
    badge: 'border-[#f1d9ca] bg-[#fff0e7] text-[#c85d42]',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },

  APPROVED: {
    badge: 'border-[#d5ecdf] bg-[#e7f7ef] text-[#21845a]',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
};

const taskTypeColors: Record<string, string> = {
  DEVELOPMENT: '#2563EB',
  TESTING: '#7C3AED',
  DOCUMENTATION: '#16A34A',
  SUPPORT: '#EA580C',
  MEETINGS: '#DB2777',
  RESEARCH: '#0F766E',
  OTHER: '#64748B',
};

function formatTaskType(type: string) {
  return type
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());
}

function SummaryItem({
  icon,
  value,
  label,
  helper,
  tone = 'brand',
}: {
  icon: ReactNode;
  value: string;
  label: string;
  helper?: string;
  tone?: 'brand' | 'success' | 'warning';
}) {
  const iconClass =
    tone === 'success'
      ? 'bg-[#e8f7ef] text-[#28a36c]'
      : tone === 'warning'
        ? 'bg-[#fff0e8] text-[#ff715b]'
        : 'bg-[#efecff] text-[#6154d9]';

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[12px] border border-[#ebe8f2] bg-white px-3 py-3 shadow-[0_4px_12px_rgba(55,45,96,.06)]">
      <div
        className={cn(
          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
          iconClass
        )}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <div className="text-[18px] font-semibold leading-none text-[#312866]">
          {value}
        </div>

        <div className="mt-1 text-[10px] font-medium text-[#625b79]">
          {label}
        </div>

        {helper && (
          <div className="mt-0.5 truncate text-[8px] text-[#9a94aa]">
            {helper}
          </div>
        )}
      </div>
    </div>
  );
}

export function ReportDetailOverview({
  report,
  versions,
  projects,
  users,
  owner,
  banner,
  actions,
}: {
  report: WeeklyReport;
  versions: ReportVersion[];
  projects: Project[];
  users: User[];
  owner: string;
  banner?: ReactNode;
  actions?: ReactNode;
}) {
  const thisWeekTasks = report.currentVersion.tasks.filter(
    task => task.section === 'THIS_WEEK'
  );

  const completedTasks = thisWeekTasks.filter(
    task => task.status === 'COMPLETED'
  ).length;

  const plannedHours = thisWeekTasks.reduce(
    (sum, task) => sum + (task.plannedHours || 0),
    0
  );

  const spentHours = thisWeekTasks.reduce(
    (sum, task) => sum + (task.spentHours || 0),
    0
  );

  const status = statusStyle[report.status];
  const chartData = hoursByType(report.currentVersion.tasks);

  return (
    <>
      <section className="mb-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#312866]">
                Week {report.weekNumber} · {report.year}
              </h1>

              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium',
                  status.badge
                )}
              >
                {status.icon}
                {reportStatusLabel[report.status]}
              </span>

              <Badge tone="info">
                Version {report.currentVersion.versionNumber}
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#817a92]">
              <span className="font-medium text-[#5b5473]">
                {owner}
              </span>

              <span className="text-[#b0aabd]">|</span>

              <span>
                {formatRange(report.periodStart, report.periodEnd)}
              </span>

              <span className="text-[#b0aabd]">|</span>

              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-[#8175c7]" />
                Deadline {formatDateTime(report.dueAt)}
              </span>

              {report.currentVersion.submittedAt && (
                <>
                  <span className="text-[#b0aabd]">|</span>

                  <span>
                    Submitted{' '}
                    {formatDateTime(report.currentVersion.submittedAt)}
                  </span>
                </>
              )}

              <span className="text-[#b0aabd]">|</span>

              <span>
                Updated {formatDateTime(report.updatedAt)}
              </span>
            </div>

            {banner && (
              <div className="mt-2 text-[10px] text-[#938ca2]">
                {banner}
              </div>
            )}
          </div>

          {actions && (
            <div className="flex flex-shrink-0 items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </section>

      <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,0.78fr))_minmax(430px,1.9fr)]">
        <SummaryItem
          icon={<ListChecks className="h-4 w-4" />}
          value={String(thisWeekTasks.length)}
          label="This week tasks"
        />

        <SummaryItem
          icon={<CheckCircle2 className="h-4 w-4" />}
          value={`${completedTasks}/${thisWeekTasks.length}`}
          label="Completed"
          helper={
            thisWeekTasks.length
              ? `${Math.round(
                  (completedTasks / thisWeekTasks.length) * 100
                )}% completion`
              : 'No tasks'
          }
          tone="success"
        />

        <SummaryItem
          icon={<TimerReset className="h-4 w-4" />}
          value={`${plannedHours}h`}
          label="Planned hours"
        />

        <SummaryItem
          icon={<Clock3 className="h-4 w-4" />}
          value={`${spentHours}h`}
          label="Spent hours"
          tone="warning"
        />

        <div className="flex min-w-0 items-center gap-5 rounded-[12px] border border-[#ebe8f2] bg-white px-4 py-3 shadow-[0_4px_12px_rgba(55,45,96,.06)] sm:col-span-2 xl:col-span-1">
          <div className="min-w-[94px] flex-shrink-0">
            <div className="text-[12px] font-semibold text-[#312866]">
              Reported Hours
            </div>

            <div className="mt-0.5 text-[9px] text-[#9a94aa]">
              Version {report.currentVersion.versionNumber}
            </div>
          </div>

          <div className="relative h-[82px] w-[82px] flex-shrink-0">
            <div
              className="h-full w-full rounded-full"
              style={{
                background: `conic-gradient(
                  #7761d8 0deg ${spentHours > 0 ? 360 : 0}deg,
                  #eeeaf8 ${spentHours > 0 ? 360 : 0}deg 360deg
                )`,
              }}
            />

            <div className="absolute inset-[14px] flex items-center justify-center rounded-full bg-white">
              <div className="text-center">
                <div className="text-[17px] font-semibold leading-none text-[#312866]">
                  {spentHours}
                </div>

                <div className="mt-1 whitespace-nowrap text-[7px] text-[#9a94aa]">
                  Total hours
                </div>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-5 gap-y-1.5">
            {chartData.map((item, index) => {
              const type = String(item.type || 'OTHER').toUpperCase();

              return (
                <div
                  key={`${type}-${index}`}
                  className="flex min-w-0 items-center justify-between gap-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          taskTypeColors[type] || taskTypeColors.OTHER,
                      }}
                    />

                    <span className="truncate text-[9px] text-[#736d83]">
                      {formatTaskType(type)}
                    </span>
                  </div>

                  <span className="flex-shrink-0 text-[9px] font-medium text-[#544c74]">
                    {item.hours}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ReportVersionHistory
        versions={versions}
        projects={projects}
        users={users}
      />
    </>
  );
}