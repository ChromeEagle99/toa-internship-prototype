import { useEffect } from "react";
import { Outlet } from "react-router";

import { AppShell } from "~/components/layout/app-shell";
import { ActorProvider } from "~/context/actor-context";
import { seedIfEmpty } from "~/data";

/**
 * Layout route for the whole portal: provides the acting Actor, renders the app
 * shell, and seeds demo data on first client mount. Feature routes render into
 * the shell's main canvas via `<Outlet />`.
 */
export default function Shell() {
  // localStorage is browser-only, so seed after mount — never during SSR.
  useEffect(() => {
    void seedIfEmpty();
  }, []);

  return (
    <ActorProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </ActorProvider>
  );
}
