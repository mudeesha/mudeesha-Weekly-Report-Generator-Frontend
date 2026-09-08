'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  FolderKanban,
  LayoutGrid,
  LogOut,
  MessageSquareText,
  UserCircle,
  Users,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useNavigate } from '@/lib/navigation';
import { cn } from '@/lib/format';

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  managerOnly?: boolean;
  adminOnly?: boolean;
  memberOnly?: boolean;
  separatorBefore?: boolean;
}

const items: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <LayoutGrid className="h-[17px] w-[17px]" /> },
  { label: 'My Reports', to: '/reports', icon: <ClipboardList className="h-[17px] w-[17px]" />, memberOnly: true },
  { label: 'Team Reports', to: '/team-reports', icon: <ClipboardCheck className="h-[17px] w-[17px]" />, managerOnly: true },
  { label: 'Projects', to: '/projects', icon: <FolderKanban className="h-[17px] w-[17px]" />, separatorBefore: true },
  { label: 'Team Members', to: '/team-members', icon: <UsersRound className="h-[17px] w-[17px]" />, managerOnly: true },
  { label: 'Users', to: '/users', icon: <Users className="h-[17px] w-[17px]" />, adminOnly: true },
  { label: 'Analytics', to: '/analytics', icon: <BarChart3 className="h-[17px] w-[17px]" />, managerOnly: true },
  { label: 'AI Assistant', to: '/ai-assistant', icon: <MessageSquareText className="h-[17px] w-[17px]" />, managerOnly: true },
  { label: 'Profile', to: '/profile', icon: <UserCircle className="h-[17px] w-[17px]" />, separatorBefore: true },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const sidebarRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    sidebarRef.current?.querySelector<HTMLElement>('a')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab' || window.matchMedia('(min-width: 990px)').matches) return;
      const items = [...(sidebarRef.current?.querySelectorAll<HTMLElement>('a, button:not([disabled])') || [])];
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [open]);
  const { isManager, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const navigate = useNavigate();
  const visibleItems = items.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.managerOnly && !isManager) return false;
    if (item.memberOnly && isManager) return false;
    return true;
  });

  const active = (to: string) => to === '/reports' ? pathname === '/reports' : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-[#171724]/55 desktop:hidden" onClick={onClose} aria-hidden="true" />}
      <aside id="workspace-sidebar" ref={sidebarRef} aria-label="Workspace sidebar" className={cn('wr-sidebar flex flex-col px-4 py-6', open ? 'translate-x-0 visible' : '-translate-x-full invisible desktop:visible desktop:translate-x-0')}>
        <div className="px-2 pb-8">
          <div className="wr-sidebar-brand text-[22px] font-bold leading-tight">WorkReport</div>
          <div className="wr-sidebar-muted mt-1 text-[9px] uppercase tracking-[.09em]">Weekly Reporting</div>
        </div>

        <nav aria-label="Main navigation" className="wr-scroll flex-1 overflow-y-auto pr-1">
          <ul>
            {visibleItems.map(item => (
              <li key={item.to} className={cn(item.separatorBefore && 'mt-2 border-t wr-sidebar-separator pt-2')}>
                <Link
                  href={item.to}
                  onClick={onClose}
                  className={cn(
                    'wr-nav-item mb-1 flex h-10 items-center gap-3 rounded-[7px] px-3 text-[12px] font-medium transition',
                    active(item.to) && 'wr-nav-item-active',
                  )}
                >
                  <span className="inline-flex w-5 justify-center">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="wr-sidebar-promo mt-5 rounded-[12px] px-4 py-4 text-white">
          <p className="text-[9px] text-white/55">Weekly reporting</p>
          <p className="mt-1.5 text-[13px] font-semibold">Keep reports on time</p>
          <p className="mt-1 text-[10px] leading-relaxed text-white/68">Monday–Sunday reports are due the following Monday at 9:00 AM.</p>
        </div>

        <button
          type="button"
          onClick={() => { logout(); navigate('/login', { replace: true }); onClose(); }}
          className="wr-nav-item mt-4 flex h-10 w-full items-center gap-3 border-t wr-sidebar-separator px-3 pt-2 text-left text-[12px] font-medium"
        >
          <span className="inline-flex w-5 justify-center"><LogOut className="h-[17px] w-[17px]" /></span>
          Log Out
        </button>
      </aside>
    </>
  );
}
