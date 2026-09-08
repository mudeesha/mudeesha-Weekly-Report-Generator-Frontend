'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RotateCcw, Search, X } from 'lucide-react';
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef, PaginationState, SortingState, Updater } from '@tanstack/react-table';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/format';
import { filterTableRows, lastPageIndex, visibleRange } from './table-utils';

export interface ServerPagination extends PaginationState {
  total: number;
  onChange: (pagination: PaginationState) => void;
}
export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  label: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  onReset?: () => void;
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  serverPagination?: ServerPagination;
  pageSize?: number;
  paginate?: boolean;
  embedded?: boolean;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyDescription?: string;
  getRowId?: (row: T, index: number) => string;
  minWidth?: number;
  resetKey?: string;
}

export function DataTable<T>({ data, columns, label, title, description, actions, filters, onReset, searchText, searchPlaceholder = 'Search…', searchValue, onSearchChange, serverPagination, pageSize = 10, paginate = true, embedded = false, loading = false, error, onRetry, emptyMessage = 'No results found', emptyDescription = 'Try another search or adjust the filters.', getRowId, minWidth = 640, resetKey = '' }: DataTableProps<T>) {
  const searchId = useId();
  const pageSizeId = useId();
  const [localSearch, setLocalSearch] = useState('');
  const [localPagination, setLocalPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });
  const [sorting, setSorting] = useState<SortingState>([]);
  const query = searchValue ?? localSearch;
  const filteredData = useMemo(() => filterTableRows(data, query, searchText), [data, query, searchText]);
  const pagination = serverPagination ?? localPagination;
  const total = serverPagination?.total ?? filteredData.length;
  const lastPage = lastPageIndex(total, pagination.pageSize);

  useEffect(() => { setLocalPagination(current => ({ ...current, pageIndex: 0 })); }, [query, resetKey]);
  useEffect(() => {
    if (!serverPagination) setLocalPagination(current => current.pageIndex > lastPage ? { ...current, pageIndex: lastPage } : current);
  }, [lastPage, serverPagination]);

  function changePagination(updater: Updater<PaginationState>) {
    const next = typeof updater === 'function' ? updater(pagination) : updater;
    if (serverPagination) serverPagination.onChange(next);
    else setLocalPagination(next);
  }
  const table = useReactTable({
    data: filteredData, columns, getRowId,
    state: { pagination, sorting },
    onPaginationChange: changePagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: !!serverPagination || !paginate,
    rowCount: total,
    autoResetPageIndex: false,
  });
  const range = visibleRange(total, pagination.pageIndex, pagination.pageSize);
  const searchable = !!searchText;
  const rows = table.getRowModel().rows;

  return (
    <section aria-label={label} className={cn('wr-data-table', embedded && 'wr-data-table-embedded')} aria-busy={loading}>
      {(title || description) && <div className="wr-data-titlebar">
        <div className="min-w-0">{title && <h3 className="text-[13px] font-semibold text-[#3c3374]">{title}</h3>}{description && <p className="mt-1 text-[11px] text-[#817a92]">{description}</p>}</div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>}
      {(searchable || filters || onReset || actions) && <div className="wr-data-toolbar">
        {searchable && <div className="wr-data-search">
          <label htmlFor={searchId} className="sr-only">Search {label.toLowerCase()}</label>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#887f9d]" />
          <input id={searchId} value={query} onChange={event => { setLocalSearch(event.target.value); onSearchChange?.(event.target.value); }} placeholder={searchPlaceholder} className="wr-input !h-8 !pl-8 !pr-8" />
          {query && <button type="button" aria-label={`Clear search for ${label.toLowerCase()}`} className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1.5 text-[#887f9d] hover:text-[#594dba]" onClick={() => { setLocalSearch(''); onSearchChange?.(''); }}><X className="h-3 w-3" /></button>}
        </div>}
        {filters}
        {!title && !description && actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
        {onReset && <button type="button" onClick={() => { setLocalSearch(''); onSearchChange?.(''); setSorting([]); onReset(); }} title="Reset filters" aria-label={`Reset filters for ${label.toLowerCase()}`} className="wr-action !h-8 !w-8 shrink-0"><RotateCcw className="h-3.5 w-3.5" /></button>}
      </div>}
      <div className="wr-data-viewport wr-scroll" tabIndex={0} role="region" aria-label={`${label} table. Scroll horizontally for more columns.`}>
        <Table style={{ minWidth }}>
          <TableCaption>{label}</TableCaption>
          <TableHeader>{table.getHeaderGroups().map(group => <TableRow key={group.id}>{group.headers.map(header => {
            const isActions = header.column.id === 'actions';
            const sorted = header.column.getIsSorted();
            return <TableHead key={header.id} scope="col" className={cn(isActions && 'wr-data-actions')} aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : header.column.getCanSort() ? 'none' : undefined}>
              {header.isPlaceholder ? null : header.column.getCanSort() ? <button type="button" onClick={header.column.getToggleSortingHandler()} className="inline-flex items-center gap-1.5 py-1 text-left hover:text-[#272163]" title={serverPagination ? 'Sort loaded page' : 'Sort column'}>
                {flexRender(header.column.columnDef.header, header.getContext())}
                {sorted === 'asc' ? <ArrowUp className="h-3 w-3" /> : sorted === 'desc' ? <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-45" />}
              </button> : flexRender(header.column.columnDef.header, header.getContext())}
            </TableHead>;
          })}</TableRow>)}</TableHeader>
          <TableBody>
            {loading ? Array.from({ length: 3 }, (_, i) => <TableRow key={`loading-${i}`}>{columns.map((_, j) => <TableCell key={j}><div className="h-4 animate-pulse rounded bg-[#eeeaf8]" /></TableCell>)}</TableRow>) : error ? <TableRow><TableCell colSpan={columns.length}><div className="py-5 text-center" role="alert"><p className="text-error-700">{error}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-2 text-brand-600 underline">Try again</button>}</div></TableCell></TableRow> : rows.length ? rows.map(row => <TableRow key={row.id}>{row.getVisibleCells().map(cell => <TableCell key={cell.id} className={cn(cell.column.id === 'actions' && 'wr-data-actions')}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length}><div className="py-6 text-center"><p className="font-medium text-[#544c74]">{emptyMessage}</p><p className="mt-1 text-[11px] text-[#817a92]">{emptyDescription}</p></div></TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      {paginate && <div className="wr-data-footer">
        <div aria-live="polite" className="text-[11px] text-[#736a88]">
          {loading ? 'Loading…' : error ? 'Unable to load data' : `${range[0]}–${range[1]} of ${total}`}
          {serverPagination && query.trim() && !loading && <span className="ml-2">· {rows.length} match on this page</span>}
          {serverPagination && sorting.length > 0 && <span className="ml-2">· Sorted within this page</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={pageSizeId} className="text-[11px] text-[#736a88]">Rows</label>
          <select id={pageSizeId} className="wr-input !h-7 !w-[58px] !px-1.5 !text-[11px]" value={pagination.pageSize} disabled={loading} onChange={event => changePagination({ pageIndex: 0, pageSize: Number(event.target.value) })}>{[...new Set([5, 10, 25, 50, pagination.pageSize])].sort((a, b) => a - b).map(size => <option key={size} value={size}>{size}</option>)}</select>
          <span className="mx-1 text-[11px] text-[#544c74]">Page {total ? pagination.pageIndex + 1 : 1} of {lastPage + 1}</span>
          <button type="button" className="wr-action !h-7 !w-7" aria-label={`First page of ${label.toLowerCase()}`} disabled={loading || !table.getCanPreviousPage()} onClick={() => table.setPageIndex(0)}><ChevronsLeft className="h-3.5 w-3.5" /></button>
          <button type="button" className="wr-action !h-7 !w-7" aria-label={`Previous page of ${label.toLowerCase()}`} disabled={loading || !table.getCanPreviousPage()} onClick={() => table.previousPage()}><ChevronLeft className="h-3.5 w-3.5" /></button>
          <button type="button" className="wr-action !h-7 !w-7" aria-label={`Next page of ${label.toLowerCase()}`} disabled={loading || !table.getCanNextPage()} onClick={() => table.nextPage()}><ChevronRight className="h-3.5 w-3.5" /></button>
          <button type="button" className="wr-action !h-7 !w-7" aria-label={`Last page of ${label.toLowerCase()}`} disabled={loading || !table.getCanNextPage()} onClick={() => table.setPageIndex(lastPage)}><ChevronsRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>}
    </section>
  );
}
