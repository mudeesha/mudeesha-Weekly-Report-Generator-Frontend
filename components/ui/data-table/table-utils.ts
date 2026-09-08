export function filterTableRows<T>(rows: T[], query: string, searchText?: (row: T) => string): T[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized || !searchText) return rows;
  return rows.filter(row => searchText(row).toLocaleLowerCase().includes(normalized));
}
export function lastPageIndex(total: number, pageSize: number): number {
  return Math.max(0, Math.ceil(total / Math.max(pageSize, 1)) - 1);
}
export function visibleRange(total: number, pageIndex: number, pageSize: number): [number, number] {
  if (!total) return [0, 0];
  return [pageIndex * pageSize + 1, Math.min((pageIndex + 1) * pageSize, total)];
}
