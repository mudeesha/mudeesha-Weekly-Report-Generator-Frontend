'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppShell({ children }: { children: ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); }, [pathname]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 990px)');
    const changed = () => { if (desktop.matches) setSidebarOpen(false); };
    desktop.addEventListener('change', changed);
    return () => desktop.removeEventListener('change', changed);
  }, []);

  return (
    <div className="wr-stage">
      <div className="wr-shell">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="wr-workspace">
          <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(value => !value)} />
          <main ref={mainRef} id="main-content" className="wr-main wr-scroll">
            <div className="wr-page">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
