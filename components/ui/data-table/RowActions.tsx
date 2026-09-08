import Link from 'next/link';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

export function RowActions({ name, onView, viewHref, onEdit, editHref, onDelete, children, disabled = false }: { name: string; onView?: () => void; viewHref?: string; onEdit?: () => void; editHref?: string; onDelete?: () => void; children?: ReactNode; disabled?: boolean }) {
  return <div className="flex items-center justify-end gap-1">
    {viewHref ? <Link href={viewHref} className="wr-action" title="View" aria-label={`View ${name}`}><Eye className="h-3.5 w-3.5" /></Link> : onView && <button type="button" disabled={disabled} className="wr-action" title="View" aria-label={`View ${name}`} onClick={onView}><Eye className="h-3.5 w-3.5" /></button>}
    {editHref ? <Link href={editHref} className="wr-action" title="Edit" aria-label={`Edit ${name}`}><Pencil className="h-3.5 w-3.5" /></Link> : onEdit && <button type="button" disabled={disabled} className="wr-action" title="Edit" aria-label={`Edit ${name}`} onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></button>}
    {children}
    {onDelete && <button type="button" disabled={disabled} className="wr-action wr-action-danger" title="Delete" aria-label={`Delete ${name}`} onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></button>}
  </div>;
}
