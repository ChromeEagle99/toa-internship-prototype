import type { ReactNode } from "react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/**
 * The application shell: a fixed sidebar, a top bar, and a scrolling main canvas
 * that feature pages render into (via the route `<Outlet />`). Bespoke chrome —
 * PRIZM enterprise ships no app-shell template (only C3 does).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg text-fg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
