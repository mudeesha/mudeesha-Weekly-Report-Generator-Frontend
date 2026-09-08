import { Component } from 'react';
import type { ReactNode } from 'react';

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="flex min-h-screen items-center justify-center bg-[#f6f2fe] p-5">
      <section className="w-full max-w-sm rounded-[12px] border border-[#e7e5eb] bg-white p-5 text-center shadow-[0_7px_18px_rgba(67,58,103,.055)]">
        <h1 className="text-[18px] font-semibold text-[#3c3374]">Unable to display this page</h1>
        <p className="mt-2 text-[11px] leading-5 text-[#887f9d]">An unexpected error occurred. Reload to try again. Unsaved changes may be lost.</p>
        <button className="mt-4 h-8 rounded-[7px] border border-[#594dba] bg-[#594dba] px-3 text-[12px] font-medium text-white hover:bg-[#463c98]" onClick={() => window.location.reload()}>Reload application</button>
      </section>
    </main>;
  }
}
