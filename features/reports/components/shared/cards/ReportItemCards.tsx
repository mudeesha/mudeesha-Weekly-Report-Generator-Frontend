'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';
import { AlertTriangle, Star } from 'lucide-react';

import { Dialog } from '@/components/ui/Dialog';
import { Badge, Button } from '@/components/ui/primitives';
import { ReportCardSection } from './ReportCardSection';
import { ReportItemCard } from './ReportItemCard';
import { SafeNotes } from '@/features/reports/components/shared/ReportText';

import type {
  ReportAchievement,
  ReportBlocker,
} from '@/types';

type Kind = 'blocker' | 'achievement';

export function ReportItemCards({
  kind,
  items,
}: {
  kind: 'blocker';
  items: ReportBlocker[];
}): ReactElement;

export function ReportItemCards({
  kind,
  items,
}: {
  kind: 'achievement';
  items: ReportAchievement[];
}): ReactElement;

export function ReportItemCards({
  kind,
  items,
}: {
  kind: Kind;
  items: (ReportBlocker | ReportAchievement)[];
}) {
  const [viewing, setViewing] = useState<
    ReportBlocker | ReportAchievement | null
  >(null);

  const blocker = kind === 'blocker';

  const title = blocker
    ? 'Blockers / challenges'
    : 'Achievements / highlights';

  const subtitle = blocker
    ? 'Issues that blocked progress or caused challenges.'
    : 'Key achievements, learnings or notable progress.';

  return (
    <>
      <ReportCardSection
        title={title}
        subtitle={subtitle}
        icon={
          blocker ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Star className="h-4 w-4" />
          )
        }
        items={items}
        layout="grid"
        pageSize={5}
        gridColumns={5}
        tone={blocker ? 'red' : 'green'}
        searchPlaceholder={
          blocker
            ? 'Search blockers…'
            : 'Search achievements…'
        }
        searchText={item =>
          `${item.title} ${item.description || ''} ${
            blocker
              ? (item as ReportBlocker).status
              : ''
          }`
        }
        emptyTitle={
          blocker
            ? 'No blockers reported'
            : 'No achievements reported'
        }
        emptyDescription={
          blocker
            ? 'No blockers or challenges were recorded for this version.'
            : 'No achievements or highlights were recorded for this version.'
        }
        renderCard={item =>
          blocker ? (
            <ReportItemCard
              title={item.title}
              description={item.description}
              badges={[
                {
                  label:
                    (item as ReportBlocker).status === 'RESOLVED'
                      ? 'Resolved'
                      : 'Open',
                  tone:
                    (item as ReportBlocker).status === 'RESOLVED'
                      ? 'success'
                      : 'warning',
                },

                ...((item as ReportBlocker).isKeyIssue
                  ? [
                      {
                        label: 'Key issue',
                        tone: 'warning' as const,
                      },
                    ]
                  : []),
              ]}
              onView={() => setViewing(item)}
            />
          ) : (
            <ReportItemCard
              title={item.title}
              description={item.description}
              badges={
                (item as ReportAchievement).isKeyAchievement
                  ? [
                      {
                        label: 'Key achievement',
                        tone: 'success',
                      },
                    ]
                  : []
              }
              onView={() => setViewing(item)}
            />
          )
        }
      />

      <Dialog
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.title || title}
        description={
          blocker
            ? 'Blocker / challenge details'
            : 'Achievement / highlight details'
        }
        size="md"
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
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {blocker ? (
                <>
                  <Badge
                    tone={
                      (viewing as ReportBlocker).status ===
                      'RESOLVED'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {(viewing as ReportBlocker).status ===
                    'RESOLVED'
                      ? 'Resolved'
                      : 'Open'}
                  </Badge>

                  {(viewing as ReportBlocker).isKeyIssue && (
                    <Badge tone="warning">
                      Key issue
                    </Badge>
                  )}
                </>
              ) : (
                (viewing as ReportAchievement)
                  .isKeyAchievement && (
                  <Badge tone="success">
                    Key achievement
                  </Badge>
                )
              )}
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-medium text-[#817a92]">
                Supporting details
              </p>

              {viewing.description ? (
                <SafeNotes text={viewing.description} />
              ) : (
                <p className="text-[11px] text-[#9a93a8]">
                  No supporting details were recorded.
                </p>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}