'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Save, Send } from 'lucide-react';
import { Button, Card, HelperText, Input, Label } from '@/components/ui/primitives';
import { ReportItemsTable } from '@/features/reports/components/shared/ReportItemsTable';
import { NotesTable } from '@/features/reports/components/shared/NotesTable';
import { TaskTable } from '@/features/reports/components/shared/TaskTable';
import { addDays, cn, formatDateTime, formatRange } from '@/lib/format';
import { hoursByType } from '@/lib/api-adapters';
import { validateDraft } from '@/features/reports/validation';
import type { Project, ReportDraft, ReportStatus } from '@/types';

type SectionTone = 'neutral' | 'blue' | 'orange' | 'red' | 'green' | 'yellow';

const sectionToneStyles: Record<
  SectionTone,
  {
    card: string;
    header: string;
    step: string;
  }
> = {
  neutral: {
    card: '',
    header: 'border-[#ece9f0]',
    step: 'border-[#dcd7e8] bg-white text-[#594dba]',
  },

  blue: {
    card: 'border-[#dbe7ff] bg-[#f5f8ff]',
    header: 'border-[#dfe8f8]',
    step: 'border-[#cbdcff] bg-[#e8efff] text-[#4f63c6]',
  },

  orange: {
    card: 'border-[#f4ddc9] bg-[#fff8f2]',
    header: 'border-[#f2e1d2]',
    step: 'border-[#f2cfad] bg-[#fff0e3] text-[#d77b2e]',
  },

  red: {
    card: 'border-[#f3d8dc] bg-[#fff6f7]',
    header: 'border-[#f1dde0]',
    step: 'border-[#efcbd1] bg-[#ffeaed] text-[#d94f60]',
  },

  green: {
    card: 'border-[#d8ebdf] bg-[#f5fbf7]',
    header: 'border-[#dcebe1]',
    step: 'border-[#c8e5d2] bg-[#e7f6ec] text-[#378f5b]',
  },

  yellow: {
    card: 'border-[#eee3b7] bg-[#fffdf4]',
    header: 'border-[#efe6c5]',
    step: 'border-[#eadb9f] bg-[#fff5d9] text-[#ae8522]',
  },
};

function SectionCard({
  step,
  title,
  description,
  children,
  optional = false,
  table = false,
  tone = 'neutral',
}: {
  step: number;
  title: string;
  description: string;
  children: ReactNode;
  optional?: boolean;
  table?: boolean;
  tone?: SectionTone;
}) {
  const styles = sectionToneStyles[tone];

  return (
    <Card
      className={cn(
        'overflow-hidden',
        tone !== 'neutral' &&
          'shadow-[0_5px_16px_rgba(55,45,96,.055)]',
        styles.card
      )}
    >
      <div
        className={cn(
          'flex items-start gap-3 border-b px-4 py-3.5 sm:px-5',
          styles.header
        )}
      >
        <span
          className={cn(
            'inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
            styles.step
          )}
        >
          {step}
        </span>

        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[#393353]">
            {title}

            {optional && (
              <span className="text-[9px] font-normal text-[#aaa4b6]">
                Optional
              </span>
            )}
          </h2>

          <p className="mt-0.5 text-[10px] leading-4 text-[#938ca2]">
            {description}
          </p>
        </div>
      </div>

      <div className={table ? '' : 'px-4 py-4 sm:px-5'}>
        {children}
      </div>
    </Card>
  );
}

export function ReportEditor({
  initial,
  projects,
  saving,
  status,
  isNew,
  onSaveDraft,
  onSubmit,
}: {
  initial: ReportDraft;
  projects: Project[];
  saving: boolean;
  status: ReportStatus;
  isNew: boolean;
  onSaveDraft: (draft: ReportDraft) => Promise<void>;
  onSubmit: (draft: ReportDraft) => Promise<void>;
}) {
  const [draft, setDraft] = useState<ReportDraft>(initial);
  const [error, setError] = useState('');
  const baseline = useRef(JSON.stringify(initial));
  const dirty = JSON.stringify(draft) !== baseline.current;

  useEffect(() => {
    const leave = (e: BeforeUnloadEvent) => {
      if (dirty && !saving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const link = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href]');

      if (
        dirty &&
        !saving &&
        anchor &&
        !window.confirm(
          'Leave this page and discard unsaved report changes?'
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', leave);
    document.addEventListener('click', link, true);

    return () => {
      window.removeEventListener('beforeunload', leave);
      document.removeEventListener('click', link, true);
    };
  }, [dirty, saving]);

  function set<K extends keyof ReportDraft>(
    key: K,
    value: ReportDraft[K]
  ) {
    setDraft(current => ({
      ...current,
      [key]: value,
    }));

    setError('');
  }

  const hours = useMemo(
    () => hoursByType(draft.tasks),
    [draft.tasks]
  );

  async function save(submit: boolean) {
    const message = validateDraft(draft, submit);

    setError(message || '');

    if (message) {
      return;
    }

    if (submit) {
      await onSubmit(draft);
    } else {
      await onSaveDraft(draft);
    }
  }

  const weekEnd =
    /^\d{4}-\d{2}-\d{2}$/.test(draft.weekStart) &&
    Number.isFinite(Date.parse(draft.weekStart))
      ? addDays(draft.weekStart, 6)
      : '';

  // Keep /reports/new unchanged.
  // Apply the colored section treatment only on /reports/[id]/edit.
  const editTone = (
    tone: Exclude<SectionTone, 'neutral'>
  ): SectionTone => (isNew ? 'neutral' : tone);

  return (
    <fieldset
      disabled={saving}
      className="flex min-w-0 flex-col gap-4"
    >
      <SectionCard
        step={1}
        title="Report period"
        description="One report per member per Monday–Sunday reporting week."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="week" required>
              Week starts (Monday)
            </Label>

            <Input
              id="week"
              type="date"
              value={draft.weekStart}
              disabled={!isNew || saving}
              onChange={e =>
                set('weekStart', e.target.value)
              }
            />

            <HelperText>
              {isNew
                ? 'Select the reporting week.'
                : 'The week cannot be changed after creation.'}
            </HelperText>
          </div>

          <div>
            <Label>Date range</Label>

            <p className="pt-2 text-[11px] text-[#544c74]">
              {weekEnd
                ? formatRange(draft.weekStart, weekEnd)
                : 'Select a week'}
            </p>
          </div>

          <div>
            <Label>Submission deadline</Label>

            <p className="pt-2 text-[11px] text-[#544c74]">
              {weekEnd
                ? formatDateTime(
                    `${addDays(
                      weekEnd,
                      1
                    )}T09:00:00`
                  )
                : '—'}
            </p>

            <HelperText>Asia/Colombo</HelperText>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        step={2}
        title="This week’s tasks"
        description="Completed and ongoing work. Select a project and task type for each entry."
        table
        tone={editTone('blue')}
      >
        <TaskTable
          tasks={draft.tasks.filter(
            task => task.section === 'THIS_WEEK'
          )}
          section="THIS_WEEK"
          projects={projects}
          disabled={saving}
          onChange={tasks =>
            set('tasks', [
              ...tasks,
              ...draft.tasks.filter(
                task => task.section === 'NEXT_WEEK'
              ),
            ])
          }
        />
      </SectionCard>

      <SectionCard
        step={3}
        title="Next week’s plans"
        description="Planned work uses the same task structure; actual values may remain blank."
        table
        tone={editTone('orange')}
      >
        <TaskTable
          tasks={draft.tasks.filter(
            task => task.section === 'NEXT_WEEK'
          )}
          section="NEXT_WEEK"
          projects={projects}
          disabled={saving}
          onChange={tasks =>
            set('tasks', [
              ...draft.tasks.filter(
                task => task.section === 'THIS_WEEK'
              ),
              ...tasks,
            ])
          }
        />
      </SectionCard>

      <SectionCard
        step={4}
        title="Blockers / challenges"
        description="Record challenges and optionally mark one as the key issue."
        table
        tone={editTone('red')}
      >
        <ReportItemsTable
          kind="blocker"
          items={draft.blockers}
          disabled={saving}
          onChange={items =>
            set('blockers', items)
          }
        />
      </SectionCard>

      <SectionCard
        step={5}
        title="Achievements / highlights"
        description="Record outcomes and optionally mark one as the key achievement."
        table
        tone={editTone('green')}
      >
        <ReportItemsTable
          kind="achievement"
          items={draft.achievements}
          disabled={saving}
          onChange={items =>
            set('achievements', items)
          }
        />
      </SectionCard>

      <SectionCard
        step={7}
        title="Notes / links"
        description="Optional context and reference links saved with this report version."
        optional
        table
        tone={editTone('yellow')}
      >
        <NotesTable
          notes={draft.notes}
          disabled={saving}
          onChange={notes =>
            set('notes', notes)
          }
        />
      </SectionCard>

      <SectionCard
        step={6}
        title="Hours by task type"
        description="Automatically calculated from this week’s task entries."
        optional
      >
        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
          {hours.map(item => (
            <div
              key={item.type}
              className="flex items-center justify-between border-b border-[#efedf2] py-2"
            >
              <p className="text-[10px] text-[#817a92]">
                {item.type}
              </p>

              <p className="text-[11px] font-medium text-[#4e4769]">
                {item.hours}h
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-between border-t border-[#e7e5eb] pt-3">
          <p className="text-[10px] text-[#817a92]">
            Total hours reported
          </p>

          <p className="text-[12px] font-semibold text-[#4e4769]">
            {Math.round(
              hours.reduce(
                (sum, item) => sum + item.hours,
                0
              ) * 100
            ) / 100}
            h
          </p>
        </div>

        <HelperText>
          Next-week planned hours are excluded.
        </HelperText>
      </SectionCard>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-[#e7e5eb] bg-white/95 px-4 py-3 backdrop-blur-sm sm:-mx-5 sm:px-5">
        {error && (
          <p
            role="alert"
            className="mb-2 text-[10px] text-error-600"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-[#817a92]">
            {status === 'NEEDS_CORRECTION'
              ? 'Earlier submitted versions remain unchanged.'
              : 'Drafts are private until submitted.'}
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={() => void save(false)}
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : 'Save draft'}
            </Button>

            <Button
              size="sm"
              disabled={saving}
              onClick={() => void save(true)}
            >
              <Send className="h-3.5 w-3.5" />
              {status === 'NEEDS_CORRECTION'
                ? 'Resubmit'
                : 'Submit'}
            </Button>
          </div>
        </div>
      </div>
    </fieldset>
  );
}