'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/primitives';
import { ReportCardSection } from './ReportCardSection';
import { ReportItemCard } from './ReportItemCard';
import { SafeNotes } from '@/features/reports/components/shared/ReportText';

export function ReportNotesCards({ notes }: { notes: string | null }) {
  const [open, setOpen] = useState(false);
  const rows = notes?.trim() ? [{ id: 'notes', title: 'Notes and reference links', text: notes.trim() }] : [];

  return (
    <>
      <ReportCardSection
        title="Notes"
        subtitle="Additional notes, links or important information for this version."
        icon={<FileText className="h-4 w-4" />}
        items={rows}
        searchText={row => `${row.title} ${row.text}`}
        searchPlaceholder="Search notes…"
        emptyTitle="No notes added"
        emptyDescription="This version does not include additional notes or reference links."
        renderCard={row => <ReportItemCard title={row.title} description={row.text} onView={() => setOpen(true)} className="border-l-2 border-l-[#cfc6ef]" />}
      />
      <Dialog open={open} onClose={() => setOpen(false)} title="Notes and reference links" size="lg" footer={<Button variant="outline" size="sm" onClick={() => setOpen(false)}>Close</Button>}>
        <SafeNotes text={notes || ''} />
      </Dialog>
    </>
  );
}
