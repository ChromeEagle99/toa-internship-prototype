import { NavLink } from "react-router";

import { cn } from "@/lib/utils";
import type { NavItem } from "~/lib/nav-model";

/**
 * One sidebar row: an icon + label that routes client-side and reflects the
 * active route. Uses react-router's `NavLink` (NOT PRIZM's `link.tsx`, which
 * imports `next/link` and is unusable in this app) styled with semantic tokens.
 */
export function NavLinkItem({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.nested === false}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-bg-muted font-medium text-fg"
            : "text-fg-muted hover:bg-bg-muted hover:text-fg",
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{item.label}</span>
    </NavLink>
  );
}
