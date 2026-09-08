'use client';

import { useState } from 'react';
import {
  BriefcaseBusiness,
  Clock3,
  Gauge,
  ListChecks,
} from 'lucide-react';

import { Dialog } from '@/components/ui/Dialog';
import { Badge, Button } from '@/components/ui/primitives';
import {
  PriorityBadge,
  TaskStatusBadge,
} from '@/components/common/StatusBadge';
import { ReportCardSection } from './ReportCardSection';
import { ReportItemCard } from './ReportItemCard';
import { SafeNotes } from '@/features/reports/components/shared/ReportText';
import { TASK_TYPE_LABELS } from '@/types';
import {
  priorityLabel,
  taskStatusLabel,
} from '@/lib/format';

import type {
  Project,
  ReportTask,
} from '@/types';

function value(value: number | null, suffix = '') {
  return value === null ? '—' : `${value}${suffix}`;
}

export function ReportTaskCards({
  title,
  subtitle,
  tasks,
  projects,
}: {
  title: string;
  subtitle: string;
  tasks: ReportTask[];
  projects: Project[];
}) {
  const [viewing, setViewing] = useState<ReportTask | null>(null);

  const projectName = (id: string) =>
    projects.find(project => project.id === id)?.name ||
    `Project ${id}`;

  const nextWeek = title.toLowerCase().includes('next week');

  return (
    <>
      <ReportCardSection
        title={title}
        subtitle={subtitle}
        icon={<ListChecks className="h-4 w-4" />}
        items={tasks}
        pageSize={5}
        gridColumns={5}
        tone={nextWeek ? 'orange' : 'blue'}
        searchText={task =>
          `${task.name} ${task.output || ''} ${projectName(
            task.projectId
          )} ${TASK_TYPE_LABELS[task.taskType]} ${
            task.status || ''
          } ${task.priority || ''}`
        }
        searchPlaceholder="Search tasks…"
        emptyTitle="No tasks in this section"
        emptyDescription="This report version does not contain any tasks here."
        renderCard={task => (
          <ReportItemCard
            title={task.name}
            description={task.output}
            badges={[
              {
                label: TASK_TYPE_LABELS[task.taskType],
                tone: 'info',
              },

              ...(task.priority
                ? [
                    {
                      label: priorityLabel[task.priority],
                      tone:
                        task.priority === 'CRITICAL'
                          ? ('error' as const)
                          : task.priority === 'HIGH'
                            ? ('warning' as const)
                            : task.priority === 'MEDIUM'
                              ? ('brand' as const)
                              : ('neutral' as const),
                    },
                  ]
                : []),

              ...(task.status
                ? [
                    {
                      label: taskStatusLabel[task.status],
                      tone:
                        task.status === 'COMPLETED'
                          ? ('success' as const)
                          : task.status === 'BLOCKED'
                            ? ('error' as const)
                            : task.status === 'IN_PROGRESS'
                              ? ('brand' as const)
                              : ('neutral' as const),
                    },
                  ]
                : []),
            ]}
            meta={[
              {
                label: 'Project',
                value: projectName(task.projectId),
                icon: <BriefcaseBusiness className="h-3 w-3" />,
              },
              {
                label: 'Planned',
                value: value(task.plannedHours, 'h'),
                icon: <Clock3 className="h-3 w-3" />,
              },
              {
                label: 'Spent',
                value: value(task.spentHours, 'h'),
                icon: <Clock3 className="h-3 w-3" />,
              },
              {
                label: 'Progress',
                value: `${value(
                  task.plannedPercent,
                  '%'
                )} / ${value(task.actualPercent, '%')}`,
                icon: <Gauge className="h-3 w-3" />,
              },
            ]}
            onView={() => setViewing(task)}
            
          />
        )}
      />

      <Dialog
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.name || 'Task details'}
        description={
          viewing
            ? `${TASK_TYPE_LABELS[viewing.taskType]} · ${projectName(
                viewing.projectId
              )}`
            : undefined
        }
        size="lg"
        footer={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewing(null)}
          >
            Close
          </Button>
        }
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <PriorityBadge priority={viewing.priority} />
              <TaskStatusBadge status={viewing.status} />

              <Badge tone="info">
                {TASK_TYPE_LABELS[viewing.taskType]}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Detail
                label="Project"
                value={projectName(viewing.projectId)}
              />

              <Detail
                label="Planned / actual"
                value={`${value(
                  viewing.plannedPercent,
                  '%'
                )} / ${value(viewing.actualPercent, '%')}`}
              />

              <Detail
                label="Planned hours"
                value={value(viewing.plannedHours, 'h')}
              />

              <Detail
                label="Spent hours"
                value={value(viewing.spentHours, 'h')}
              />
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-medium text-[#817a92]">
                Output / details
              </p>

              {viewing.output ? (
                <SafeNotes text={viewing.output} />
              ) : (
                <p className="text-[11px] text-[#9a93a8]">
                  No output was recorded.
                </p>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[8px] bg-[#f8f6fb] px-3 py-2.5">
      <p className="text-[9px] text-[#9a93a8]">
        {label}
      </p>

      <p className="mt-1 text-[11px] font-medium text-[#554e6f]">
        {value}
      </p>
    </div>
  );
}