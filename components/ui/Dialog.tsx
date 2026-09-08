'use client';

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { cn } from '@/lib/format';

export function Dialog({ open, onClose, title, description, children, footer, size = 'md' }: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const main = document.querySelector<HTMLElement>('.wr-main');
    const mainOverflow = main?.style.overflow || '';
    if (main) main.style.overflow = 'hidden';
    (panelRef.current?.querySelector<HTMLElement>('input:not([disabled]), textarea:not([disabled]), select:not([disabled])') || panelRef.current)?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const elements = [...(panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]') || [])].filter(el => el.getClientRects().length);
      const first = elements[0], last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); panelRef.current?.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); document.body.style.overflow = previousOverflow; if (main) main.style.overflow = mainOverflow; previousFocus?.focus(); };
  }, [open]);

  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-[#171724]/55 p-0 sm:items-center sm:p-5">
      <button type="button" tabIndex={-1} aria-label="Close dialog backdrop" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={cn('relative z-10 my-0 max-h-[92vh] w-full overflow-y-auto rounded-t-[12px] bg-white shadow-[0_20px_55px_rgba(24,21,52,.24)] outline-none sm:my-5 sm:rounded-[12px]', widths[size])}>
        <div className="flex items-start justify-between gap-3 border-b border-[#ece9f0] px-4 py-3.5 sm:px-5">
          <div>
            <h2 id={titleId} className="text-[15px] font-semibold text-[#393353]">{title}</h2>
            {description && <p className="mt-1 text-[11px] text-[#8a839a]">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-[#938ca2] hover:bg-[#f0eef8] hover:text-[#594dba]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 py-4 sm:px-5">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-[#ece9f0] px-4 py-3.5 sm:flex-row sm:justify-end sm:px-5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Delete', tone = 'danger', loading }: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
  loading?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={() => { if (!loading) onClose(); }}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" disabled={loading} onClick={onClose}>Cancel</Button>
          <Button variant={tone} disabled={loading} onClick={onConfirm}>{loading ? 'Working…' : confirmLabel}</Button>
        </>
      }
    >
      <p className="text-[12px] leading-5 text-[#655e79]">{description}</p>
    </Dialog>
  );
}
