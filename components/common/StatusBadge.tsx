import { Badge } from '@/components/ui/primitives';
import { priorityLabel, reportStatusLabel, taskStatusLabel } from '@/lib/format';
import type { Priority, ReportStatus, TaskStatus } from '@/types';
export function ReportStatusBadge({ status }: {
  status: ReportStatus;
}) {
  return <Badge tone={status === 'APPROVED' ? 'success' : status === 'NEEDS_CORRECTION' ? 'warning' : status === 'SUBMITTED' ? 'brand' : 'neutral'}>
    {reportStatusLabel[status]}
  </Badge>;
}
export function TaskStatusBadge({ status }: {
  status: TaskStatus | null;
}) {
  return <Badge tone={status === 'COMPLETED' ? 'success' : status === 'BLOCKED' ? 'error' : status === 'IN_PROGRESS' ? 'brand' : 'neutral'}>
    {status ? taskStatusLabel[status] : 'Not set'}
  </Badge>;
}
export function PriorityBadge({ priority }: {
  priority: Priority | null;
}) {
  return <Badge tone={priority === 'CRITICAL' ? 'error' : priority === 'HIGH' ? 'warning' : priority === 'MEDIUM' ? 'brand' : 'neutral'}>
    {priority ? priorityLabel[priority] : 'Not set'}
  </Badge>;
}
