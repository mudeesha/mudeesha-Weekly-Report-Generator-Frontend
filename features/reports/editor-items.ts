import type { ReportAchievement, ReportBlocker } from '@/types';

/** Replacing an entry retains its ID; selecting a key item unsets the previous key. */
export function saveBlocker(items: ReportBlocker[], value: ReportBlocker): ReportBlocker[] {
  const exists = items.some(item => item.id === value.id);
  const rows = exists ? items.map(item => item.id === value.id ? value : item) : [...items, value];
  return rows.map(item => value.isKeyIssue && item.id !== value.id ? { ...item, isKeyIssue: false } : item);
}
export function saveAchievement(items: ReportAchievement[], value: ReportAchievement): ReportAchievement[] {
  const exists = items.some(item => item.id === value.id);
  const rows = exists ? items.map(item => item.id === value.id ? value : item) : [...items, value];
  return rows.map(item => value.isKeyAchievement && item.id !== value.id ? { ...item, isKeyAchievement: false } : item);
}
export function reportEntryError(title: string, description: string): string | null {
  if (title.trim().length < 2 || title.trim().length > 255) return 'Use 2–255 characters for the title.';
  if (description.length > 10000) return 'Supporting details must not exceed 10,000 characters.';
  return null;
}
