import { GraduationCap } from "lucide-react";
import { Fragment } from "react";

import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useActor } from "~/context/actor-context";
import { navFor } from "~/lib/nav-model";
import { NavLinkItem } from "./nav-link-item";

/**
 * The left navigation rail. Composed from primitives — PRIZM enterprise ships no
 * sidebar template, so this is bespoke chrome. Sections and items come from the
 * role-aware nav model, so an IO Admin and an AD (P&C) see different rails.
 */
export function Sidebar() {
  const { role } = useActor();
  const sections = navFor(role);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-fg">
          <GraduationCap className="h-5 w-5" aria-hidden />
        </span>
        <div className="leading-tight">
          <Text size="sm" weight="semibold">
            TOA Portal
          </Text>
          <Text size="xs" variant="muted">
            Internship
          </Text>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {sections.map((section, i) => (
          <Fragment key={section.label}>
            {i > 0 && <Separator />}
            <div className="space-y-1">
              <Text
                as="p"
                size="xs"
                weight="medium"
                variant="subtle"
                className="px-3 pb-1 uppercase tracking-wide"
              >
                {section.label}
              </Text>
              {section.items.map((item) => (
                <NavLinkItem key={item.to} item={item} />
              ))}
            </div>
          </Fragment>
        ))}
      </nav>
    </aside>
  );
}
