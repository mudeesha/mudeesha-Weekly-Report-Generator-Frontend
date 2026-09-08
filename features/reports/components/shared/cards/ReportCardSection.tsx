'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

import { Input } from '@/components/ui/primitives';
import { cn } from '@/lib/format';

type SectionTone = 'blue' | 'orange' | 'red' | 'green' | 'yellow';

const toneStyles: Record<
  SectionTone,
  {
    section: string;
    icon: string;
    header: string;
    footer: string;
  }
> = {
  blue: {
    section: 'border-[#dbe7ff] bg-[#f5f8ff]',
    icon: 'bg-[#e8efff] text-[#5b5bd6]',
    header: 'border-[#dfe8f8]',
    footer: 'border-[#dfe8f8]',
  },

  orange: {
    section: 'border-[#f4ddc9] bg-[#fff8f2]',
    icon: 'bg-[#fff0e3] text-[#e58b3c]',
    header: 'border-[#f2e1d2]',
    footer: 'border-[#f2e1d2]',
  },

  red: {
    section: 'border-[#f3d8dc] bg-[#fff6f7]',
    icon: 'bg-[#ffeaed] text-[#e85d6c]',
    header: 'border-[#f1dde0]',
    footer: 'border-[#f1dde0]',
  },

  green: {
    section: 'border-[#d8ebdf] bg-[#f5fbf7]',
    icon: 'bg-[#e7f6ec] text-[#45a46b]',
    header: 'border-[#dcebe1]',
    footer: 'border-[#dcebe1]',
  },

  yellow: {
    section: 'border-[#eee3b7] bg-[#fffdf4]',
    icon: 'bg-[#fff5d9] text-[#c89d2f]',
    header: 'border-[#efe6c5]',
    footer: 'border-[#efe6c5]',
  },
};

export function ReportCardSection<T>({
  title,
  subtitle,
  icon,
  items,
  searchText,
  renderCard,
  searchPlaceholder = 'Search…',
  emptyTitle = 'Nothing added yet',
  emptyDescription,
  layout = 'grid',
  pageSize = 4,
  gridColumns = 4,
  tone = 'blue',
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  items: T[];
  searchText: (item: T) => string;
  renderCard: (item: T, index: number) => ReactNode;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  layout?: 'grid' | 'list';
  pageSize?: number;
  gridColumns?: 4 | 5;
  tone?: SectionTone;
  className?: string;
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const normalized = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      normalized
        ? items.filter(item =>
            searchText(item).toLowerCase().includes(normalized)
          )
        : items,
    [items, normalized, searchText]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  useEffect(() => {
    setPage(1);
  }, [normalized, items.length]);

  const gridClass =
    gridColumns === 5
      ? 'grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
      : 'grid gap-3 sm:grid-cols-2 xl:grid-cols-4';

  const styles = toneStyles[tone];

  return (
    <section
      className={cn(
        'overflow-hidden rounded-[14px] border shadow-[0_5px_16px_rgba(55,45,96,.055)]',
        styles.section,
        className
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-2.5 border-b px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4',
          styles.header
        )}
      >
        <div className="flex min-w-0 items-start gap-2.5">
          {icon && (
            <span
              className={cn(
                'mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] shadow-[0_2px_7px_rgba(55,45,96,.06)]',
                styles.icon
              )}
            >
              {icon}
            </span>
          )}

          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold text-[#393353]">
              {title}
            </h3>

            {subtitle && (
              <p className="mt-0.5 text-[10px] text-[#938ca2]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="relative w-full sm:w-[210px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a29bad]" />

          <Input
            aria-label={`Search ${title}`}
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="!h-8 bg-white pl-9"
          />
        </div>
      </div>

      <div className="p-3">
        {pageItems.length > 0 ? (
          <div
            className={
              layout === 'grid'
                ? gridClass
                : 'space-y-2.5'
            }
          >
            {pageItems.map((item, index) => (
              <div key={start + index} className="contents">
                {renderCard(item, start + index)}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[92px] flex-col items-center justify-center rounded-[10px] border border-dashed border-black/10 bg-white/70 px-4 text-center">
            <p className="text-[11px] font-medium text-[#655d82]">
              {emptyTitle}
            </p>

            {emptyDescription && (
              <p className="mt-1 max-w-[420px] text-[10px] leading-5 text-[#9a93a8]">
                {emptyDescription}
              </p>
            )}
          </div>
        )}
      </div>

      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-3 border-t px-3.5 py-2 sm:px-4',
          styles.footer
        )}
      >
        <p className="text-[10px] text-[#938ca2]">
          {filtered.length
            ? `${start + 1}–${Math.min(
                start + pageSize,
                filtered.length
              )} of ${filtered.length}`
            : '0 items'}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#817a92]">
            Page {safePage} of {pageCount}
          </span>

          <button
            type="button"
            className="wr-action !h-7 !w-7 bg-white"
            disabled={safePage <= 1}
            onClick={() =>
              setPage(current => Math.max(1, current - 1))
            }
            aria-label={`Previous ${title} page`}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            className="wr-action !h-7 !w-7 bg-white"
            disabled={safePage >= pageCount}
            onClick={() =>
              setPage(current =>
                Math.min(pageCount, current + 1)
              )
            }
            aria-label={`Next ${title} page`}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}