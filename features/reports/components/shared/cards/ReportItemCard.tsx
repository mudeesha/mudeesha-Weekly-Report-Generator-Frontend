'use client';

import type { ReactNode } from 'react';
import { Eye } from 'lucide-react';

import { Badge, type BadgeTone } from '@/components/ui/primitives';
import { cn } from '@/lib/format';

export interface ReportCardBadge {
  label: string;
  tone?: BadgeTone;
}

export interface ReportCardMeta {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}

export function ReportItemCard({
  title,
  description,
  badges = [],
  meta = [],
  onView,
  variant = 'grid',
  className,
}: {
  title: string;
  description?: string | null;
  badges?: ReportCardBadge[];
  meta?: ReportCardMeta[];
  onView?: () => void;
  variant?: 'grid' | 'list';
  className?: string;
}) {
  if (variant === 'list') {
    return (
      <article
        className={cn(
          'relative rounded-[10px] border border-[#e4e0ea] bg-white px-3 py-2.5 shadow-[0_3px_10px_rgba(55,45,96,.06)]',
          className
        )}
      >
        {onView && (
          <button
            type="button"
            onClick={onView}
            className="absolute right-2.5 top-2.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full text-[#6654d9] transition-colors hover:bg-[#f1edff] hover:text-[#4f3fc1] focus:outline-none focus:ring-2 focus:ring-[#d9d2f5]"
            aria-label={`View ${title}`}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}

        <div className="min-w-0 pr-9">
          {badges.length > 0 && (
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {badges.map((badge, index) => (
                <Badge key={`${badge.label}-${index}`} tone={badge.tone}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          <h4 className="text-[12px] font-semibold leading-5 text-[#3e3759]">
            {title}
          </h4>

          {description && (
            <p className="mt-0.5 line-clamp-1 text-[11px] leading-5 text-[#817a92]">
              {description}
            </p>
          )}

          {meta.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-[#efedf3] pt-2">
              {meta.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="flex min-w-0 items-center gap-1.5 text-[10px]"
                >
                  {item.icon && (
                    <span className="text-[#8175c7]">
                      {item.icon}
                    </span>
                  )}

                  <span className="text-[#9a93a8]">
                    {item.label}
                  </span>

                  <span className="font-medium text-[#554e6f]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        'relative flex min-h-[130px] flex-col rounded-[10px] border border-[#e4e0ea] bg-white p-3 shadow-[0_3px_10px_rgba(55,45,96,.065)] transition hover:-translate-y-[1px] hover:shadow-[0_6px_16px_rgba(55,45,96,.09)]',
        className
      )}
    >
      {onView && (
        <button
          type="button"
          onClick={onView}
          className="absolute right-2.5 top-2.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full text-[#6654d9] transition-colors hover:bg-[#f1edff] hover:text-[#4f3fc1] focus:outline-none focus:ring-2 focus:ring-[#d9d2f5]"
          aria-label={`View ${title}`}
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </button>
      )}

      {badges.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1.5 pr-8">
          {badges.map((badge, index) => (
            <Badge key={`${badge.label}-${index}`} tone={badge.tone}>
              {badge.label}
            </Badge>
          ))}
        </div>
      )}

      <div className="min-w-0 pr-8">
        <h4 className="truncate text-[12px] font-semibold leading-5 text-[#3e3759]">
          {title}
        </h4>

        {description && (
          <p className="mt-0.5 line-clamp-1 text-[11px] leading-5 text-[#817a92]">
            {description}
          </p>
        )}
      </div>

      {meta.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-[#efedf3] pt-2">
          {meta.map((item, index) => (
            <div key={`${item.label}-${index}`} className="min-w-0">
              <p className="flex items-center gap-1 text-[9px] text-[#9a93a8]">
                {item.icon && (
                  <span className="text-[#8175c7]">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </p>

              <div className="mt-0.5 truncate text-[10px] font-medium text-[#554e6f]">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}