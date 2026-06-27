import {
  LayoutDashboard,
  BookOpen,
  Send,
  Boxes,
  Upload,
  type LucideIcon,
} from "lucide-react";

import { ROLES, type Role } from "~/data";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Navigation model — the single source of truth for the sidebar AND the top-bar
 *  breadcrumb/title. Pure data (no JSX) so both can read it.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Role-aware: each item lists the roles that may see it. `navFor(role)` returns
 *  the visible sections with empty ones dropped. Phase 1 covers the IO Admin and
 *  AD (P&C) journeys for programme creation, project requests, and project
 *  submission.
 */

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Match nested routes (e.g. /programmes/new) as active too. Default true. */
  nested?: boolean;
  roles: Role[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        to: "/dashboard",
        icon: LayoutDashboard,
        nested: false,
        roles: [ROLES.ioAdmin, ROLES.adPnc],
      },
    ],
  },
  {
    label: "Internship",
    items: [
      { label: "Programmes", to: "/programmes", icon: BookOpen, roles: [ROLES.ioAdmin] },
      { label: "Project requests", to: "/requests", icon: Send, roles: [ROLES.ioAdmin] },
      { label: "Projects", to: "/projects", icon: Boxes, roles: [ROLES.ioAdmin] },
    ],
  },
  {
    label: "Submissions",
    items: [
      { label: "My submissions", to: "/submissions", icon: Upload, roles: [ROLES.adPnc] },
    ],
  },
];

/** The nav sections a role may see, with empty sections removed. */
export function navFor(role: Role): NavSection[] {
  return NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role)),
  })).filter((section) => section.items.length > 0);
}

/** All nav items visible to a role, flattened — used for breadcrumb/title lookup. */
export function navItemsFor(role: Role): NavItem[] {
  return navFor(role).flatMap((section) => section.items);
}

/** The best-matching nav item for the current pathname (longest prefix wins). */
export function activeItem(role: Role, pathname: string): NavItem | undefined {
  return navItemsFor(role)
    .filter((item) =>
      item.nested === false ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/"),
    )
    .sort((a, b) => b.to.length - a.to.length)[0];
}
