'use client';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import { AlignLeft, ChevronDown, LogOut, Search, UserCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Avatar, Dropdown, DropdownItem } from '@/components/ui/primitives';
import { cn, roleLabel } from '@/lib/format';

export function Header({ onToggleSidebar, sidebarOpen }: { onToggleSidebar: () => void; sidebarOpen: boolean }) {
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!user) return null;

  return (
    <header className="wr-header sticky top-0 z-30">
      <div className="flex h-[66px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
          aria-controls="workspace-sidebar"
          className="inline-flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#e1dee7] bg-white text-[#655e79] desktop:hidden"
        >
          <AlignLeft className="h-4 w-4" />
        </button>

        <form
          className="wr-search relative hidden w-full max-w-[330px] rounded-full md:block"
          role="search"
          onSubmit={event => {
            event.preventDefault();
            navigate(`${isManager ? '/team-reports' : '/reports'}?q=${encodeURIComponent(search.trim())}`);
          }}
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9b95a8]" />
          <label className="sr-only" htmlFor="global-search">Search reports</label>
          <input
            ref={searchRef}
            id="global-search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search anything..."
            className="h-9 w-full rounded-full bg-transparent pl-10 pr-4 text-[12px] text-[#4e4769] outline-none placeholder:text-[#aaa4b6]"
          />
        </form>

        <div className="ml-auto flex items-center">
          <Dropdown
            className="w-[250px]"
            trigger={({ toggle, open }) => (
              <button
                type="button"
                onClick={toggle}
                aria-label="Account menu"
                aria-expanded={open}
                className="flex items-center gap-2 rounded-[8px] px-1.5 py-1 transition hover:bg-white/70"
              >
                <Avatar name={user.name} size="md" />
                <span className="hidden min-w-0 text-left sm:block">
                  <span className="block truncate text-[12px] font-semibold text-[#393353]">{user.name}</span>
                  <span className="block text-[10px] text-[#8a839a]">{roleLabel[user.role]}</span>
                </span>
                <ChevronDown className={cn('h-3.5 w-3.5 text-[#938ca2] transition', open && 'rotate-180')} />
              </button>
            )}
          >
            {close => (
              <div>
                <div className="border-b border-[#ece9f0] px-3 pb-2.5 pt-1">
                  <p className="text-[12px] font-semibold text-[#393353]">{user.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-[#8a839a]">{user.email}</p>
                </div>
                <div className="py-1.5">
                  <DropdownItem onClick={() => { close(); navigate('/profile'); }}><UserCircle className="h-3.5 w-3.5" />My profile</DropdownItem>
                </div>
                <div className="border-t border-[#ece9f0] pt-1.5">
                  <DropdownItem tone="danger" onClick={() => { close(); logout(); navigate('/login', { replace: true }); }}><LogOut className="h-3.5 w-3.5" />Sign out</DropdownItem>
                </div>
              </div>
            )}
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
