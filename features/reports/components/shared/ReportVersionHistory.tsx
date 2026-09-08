'use client';

import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock3,
  History,
  MessageSquareText,
  GitCommitHorizontal,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

import { Badge } from '@/components/ui/primitives';
import {
  ReportContent,
  SafeNotes,
} from '@/features/reports/components/shared/ReportContent';
import { formatDateTime } from '@/lib/format';

import type {
  Project,
  ReportVersion,
  User,
} from '@/types';

export function ReportVersionHistory({
  versions,
  projects,
  users,
}: {
  versions: ReportVersion[];
  projects: Project[];
  users: User[];
}) {
  const sortedVersions = useMemo(
    () => [...versions].sort((a, b) => b.versionNumber - a.versionNumber),
    [versions]
  );

  const [open, setOpen] = useState<string | null>(
    () => sortedVersions[0]?.id ?? null
  );

  if (!sortedVersions.length) {
    return null;
  }

  return (
    <section className="mt-4">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#f0ecfb] text-[#594dba] shadow-[0_2px_7px_rgba(89,77,186,.08)]"><History className="h-4 w-4" /></span>

        <div>
          <h3 className="text-[13px] font-semibold text-[#393353]">
            Version history
          </h3>

          <p className="mt-0.5 text-[10px] text-[#938ca2]">
            Submitted versions and manager reviews.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-[#e8e4ef] bg-white shadow-[0_6px_18px_rgba(55,45,96,.065)]">
        {sortedVersions.map((version, index) => {
          const isOpen = open === version.id;

          return (
            <div
              key={version.id}
              className={
                index !== sortedVersions.length - 1
                  ? 'border-b border-[#efedf2]'
                  : ''
              }
            >
              <div className="px-3.5 py-2.5 sm:px-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#4e4769]">
                      <GitCommitHorizontal className="h-3.5 w-3.5 text-[#7761d8]" />
                      Version {version.versionNumber}
                    </strong>

                    <Badge tone={version.submittedAt ? 'brand' : 'neutral'}>
                      {version.submittedAt ? 'Submitted' : 'Editable'}
                    </Badge>

                    {version.submittedAt && (
                      <span className="inline-flex items-center gap-1 text-[9px] text-[#aaa4b6]">
                        <Clock3 className="h-3 w-3" />
                        {formatDateTime(version.submittedAt)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpen(current =>
                        current === version.id ? null : version.id
                      )
                    }
                    className="inline-flex h-7 items-center gap-1 rounded-[6px] px-2 text-[10px] font-medium text-[#594dba] hover:bg-[#f4f1fb]"
                  >
                    {isOpen ? 'Hide' : 'View'}

                    {isOpen ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </div>

                {version.reviews.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {version.reviews.map(review => {
                      const reviewer =
                        users.find(user => user.id === review.reviewerId)?.name ||
                        `Reviewer #${review.reviewerId}`;

                      const isApproved = review.action === 'APPROVE';

                      return (
                        <div
                          key={review.id}
                          className="pl-3"
                        >
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
                            <span className="font-medium text-[#544c74]">
                              {reviewer}
                            </span>

                            <span className="text-[#c1bacd]">·</span>

                            <span
                              className={
                                isApproved
                                  ? 'inline-flex items-center gap-1 font-medium text-[#27825a]'
                                  : 'inline-flex items-center gap-1 font-medium text-[#6654c8]'
                              }
                            >
                              {isApproved ? <CheckCircle2 className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
                              {isApproved ? 'Approved' : 'Requested changes'}
                            </span>

                            <span className="text-[#c1bacd]">·</span>

                            <span className="text-[9px] text-[#aaa4b6]">
                              {formatDateTime(review.createdAt)}
                            </span>
                          </div>

                          {review.comment && (
                            <div className="mt-1.5 flex items-start gap-2 rounded-[7px] bg-[#faf8ff] px-2.5 py-2 text-[10px] leading-5 text-[#655d79] shadow-[0_2px_7px_rgba(55,45,96,.035)]">
                              <MessageSquareText className="mt-[3px] h-3.5 w-3.5 flex-shrink-0 text-[#7761d8]" />

                              <div className="min-w-0">
                                <SafeNotes text={review.comment} />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {version.submittedAt && !version.reviews.length && (
                  <p className="mt-2 text-[10px] text-[#938ca2]">
                    Awaiting manager review.
                  </p>
                )}
              </div>

              {isOpen && (
                <div className="border-t border-[#efedf2] bg-[#fbfaff] px-3 py-3 sm:px-3.5">
                  <ReportContent
                    version={version}
                    projects={projects}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}