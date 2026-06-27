import { useLocation } from "react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useActor, ACTOR_NAMES } from "~/context/actor-context";
import { ROLE_LABELS } from "~/data";
import { activeItem } from "~/lib/nav-model";
import { RoleSwitcher } from "./role-switcher";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** The top bar: current page title (from the nav model) + role switcher + actor. */
export function Topbar() {
  const { actor, role } = useActor();
  const { pathname } = useLocation();
  const current = activeItem(role, pathname);
  const name = ACTOR_NAMES[actor.id] ?? actor.id;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
      <Heading as="h1" size="lg">
        {current?.label ?? "TOA Portal"}
      </Heading>

      <div className="flex items-center gap-3">
        <RoleSwitcher />
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight md:block">
            <Text size="sm" weight="medium">
              {name}
            </Text>
            <Text size="xs" variant="muted">
              {ROLE_LABELS[role]}
            </Text>
          </div>
        </div>
      </div>
    </header>
  );
}
