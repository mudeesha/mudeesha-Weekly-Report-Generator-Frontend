'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn, initials } from '@/lib/format';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('wr-card', className)}>{children}</div>;
}

export function CardHeader({ title, subtitle, actions, className }: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5', className)}>
      <div>
        <h3 className="text-[15px] font-semibold text-[#393353]">{title}</h3>
        {subtitle && <p className="mt-1 text-[11px] text-[#8a839a]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'border border-[#594dba] bg-[#594dba] text-white hover:bg-[#463c98] disabled:border-[#bcb6d0] disabled:bg-[#bcb6d0]',
  outline: 'border border-[#d9d5e5] bg-white text-[#594dba] hover:border-[#bdb6d3] hover:bg-[#f7f5fb] disabled:text-[#aaa4b6]',
  ghost: 'border border-transparent bg-transparent text-[#655e79] hover:bg-[#f0eef8] hover:text-[#463c98]',
  danger: 'border border-[#ef6372] bg-[#ef6372] text-white hover:bg-[#d94a5b]',
  success: 'border border-[#52c58d] bg-[#52c58d] text-white hover:bg-[#2daa72]'
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-[12px]',
  md: 'h-[34px] gap-1.5 px-3.5 text-[12px]',
  lg: 'h-[38px] gap-2 px-4 text-[13px]'
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = 'primary', size = 'md', className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn('inline-flex items-center justify-center rounded-[7px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8878c1]/20 disabled:cursor-not-allowed', buttonVariants[variant], buttonSizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Label({ children, htmlFor, required }: { children: React.ReactNode; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[11px] font-medium text-[#655d82]">
      {children}{required && <span className="ml-0.5 text-error-500">*</span>}
    </label>
  );
}

export function Input({ className, error, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={cn(
        'h-9 w-full rounded-[7px] border bg-white px-3 text-[12px] text-[#4e4769] transition placeholder:text-[#aaa4b6] focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-[#f7f6f9] disabled:text-[#8d8798]',
        error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/10' : 'border-[#d9d8e0] focus:border-[#8878c1] focus:ring-[#8878c1]/10',
        className,
      )}
      {...rest}
    />
  );
}

export function Textarea({ className, error, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={cn(
        'w-full rounded-[7px] border bg-white px-3 py-2.5 text-[12px] text-[#4e4769] transition placeholder:text-[#aaa4b6] focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-[#f7f6f9] disabled:text-[#8d8798]',
        error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/10' : 'border-[#d9d8e0] focus:border-[#8878c1] focus:ring-[#8878c1]/10',
        className,
      )}
      {...rest}
    />
  );
}

export function Select({ className, children, size = 'md', error, ...rest }: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  size?: 'sm' | 'md';
  error?: boolean;
}) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full appearance-none rounded-[7px] border bg-white pl-3 pr-8 text-[12px] text-[#4e4769] transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-[#f7f6f9]',
          error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/10' : 'border-[#d9d8e0] focus:border-[#8878c1] focus:ring-[#8878c1]/10',
          size === 'sm' ? 'h-8' : 'h-9',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#938ca2]" aria-hidden="true" />
    </div>
  );
}

export function HelperText({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return <p className={cn('mt-1 text-[11px]', error ? 'text-error-500' : 'text-[#8a839a]')}>{children}</p>;
}

export function Checkbox({ checked, onChange, label, id }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  id?: string;
}) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2 text-[12px] text-[#544c74]">
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-4 w-4 cursor-pointer rounded border-[#cfcbd8] text-brand-600 focus:ring-2 focus:ring-brand-500/10" />
      {label}
    </label>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn('relative h-5 w-9 flex-shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20', checked ? 'bg-brand-600' : 'bg-[#d9d8e0]')}>
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all', checked ? 'left-[18px]' : 'left-0.5')} />
    </button>
  );
}

export type BadgeTone = 'brand' | 'success' | 'warning' | 'error' | 'neutral' | 'info';
const badgeTones: Record<BadgeTone, string> = {
  brand: 'bg-[#edf1ff] text-[#4f5fbb]',
  success: 'bg-[#e7f7ef] text-[#21845a]',
  warning: 'bg-[#fff0e7] text-[#c85d42]',
  error: 'bg-[#fff0f2] text-[#c74454]',
  neutral: 'bg-[#f0eef4] text-[#6e6687]',
  info: 'bg-[#f0eef8] text-[#594dba]'
};

export function Badge({ tone = 'neutral', children, className, icon }: { tone?: BadgeTone; children: React.ReactNode; className?: string; icon?: React.ReactNode }) {
  return (
    <span className={cn('inline-flex min-h-[22px] items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium', badgeTones[tone], className)}>
      {icon}{children}
    </span>
  );
}

export function Avatar({ name, src, size = 'md', className }: {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizes: Record<string, string> = { xs: 'h-6 w-6 text-[9px]', sm: 'h-8 w-8 text-[10px]', md: 'h-9 w-9 text-[11px]', lg: 'h-12 w-12 text-[13px]', xl: 'h-16 w-16 text-[17px]' };
  return (
    <span className={cn('inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eeeaf8] font-semibold text-[#594dba]', sizes[size], className)}>
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : <span aria-hidden="true">{initials(name)}</span>}
    </span>
  );
}

export function SegmentedTabs<T extends string>({ options, value, onChange, ariaLabel }: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="inline-flex rounded-[7px] border border-[#e0dce8] bg-[#f5f3f9] p-0.5">
      {options.map(option => (
        <button key={option.value} role="tab" type="button" aria-selected={value === option.value} onClick={() => onChange(option.value)} className={cn('rounded-[5px] px-2.5 py-1.5 text-[11px] font-medium transition focus:outline-none', value === option.value ? 'bg-white text-[#594dba]' : 'text-[#817a92] hover:text-[#544c74]')}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function UnderlineTabs<T extends string>({ options, value, onChange, ariaLabel }: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex gap-5 overflow-x-auto border-b border-[#e7e5eb]">
      {options.map(option => (
        <button key={option.value} role="tab" type="button" aria-selected={value === option.value} onClick={() => onChange(option.value)} className={cn('flex items-center gap-1.5 whitespace-nowrap border-b-2 pb-2.5 text-[12px] font-medium transition focus:outline-none', value === option.value ? 'border-[#594dba] text-[#594dba]' : 'border-transparent text-[#817a92] hover:text-[#544c74]')}>
          {option.label}
          {typeof option.count === 'number' && <span className="rounded-full bg-[#f0eef4] px-1.5 py-0.5 text-[9px] text-[#6e6687]">{option.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Dropdown({ trigger, children, align = 'right', className }: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  align?: 'left' | 'right';
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function onClick(event: MouseEvent) { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); }
    function onKey(event: KeyboardEvent) { if (event.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, []);
  return (
    <div className="relative" ref={ref}>
      {trigger({ open, toggle: () => setOpen(v => !v) })}
      {open && (
        <div className={cn('absolute z-40 mt-2 min-w-[190px] rounded-[8px] border border-[#e1dee7] bg-white p-1.5 shadow-theme-lg', align === 'right' ? 'right-0' : 'left-0', className)}>
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, tone = 'default' }: { children: React.ReactNode; onClick?: () => void; tone?: 'default' | 'danger' }) {
  return (
    <button type="button" onClick={onClick} className={cn('flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-left text-[12px] transition hover:bg-[#f4f1fb]', tone === 'danger' ? 'text-error-600 hover:bg-error-50' : 'text-[#544c74]')}>
      {children}
    </button>
  );
}
