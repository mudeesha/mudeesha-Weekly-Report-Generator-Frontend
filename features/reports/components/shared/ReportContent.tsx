import { ReportItemCards } from '@/features/reports/components/shared/cards/ReportItemCards';
import { ReportNotesCards } from '@/features/reports/components/shared/cards/ReportNotesCards';
import { ReportTaskCards } from '@/features/reports/components/shared/cards/ReportTaskCards';
import type { Project, ReportVersion } from '@/types';

export { SafeNotes } from './ReportText';

export function ReportContent({ version, projects }: { version: ReportVersion; projects: Project[]; showHours?: boolean }) {
  return (
    <div className="space-y-3">
      <ReportTaskCards
        title="This week’s work"
        subtitle="Completed and ongoing work in this report version."
        tasks={version.tasks.filter(task => task.section === 'THIS_WEEK')}
        projects={projects}
      />

      <ReportTaskCards
        title="Tasks planned for next week"
        subtitle="Planned work for the next reporting week."
        tasks={version.tasks.filter(task => task.section === 'NEXT_WEEK')}
        projects={projects}
      />

      <ReportItemCards kind="blocker" items={version.blockers} />
      <ReportItemCards kind="achievement" items={version.achievements} />
      <ReportNotesCards notes={version.notes} />
    </div>
  );
}
