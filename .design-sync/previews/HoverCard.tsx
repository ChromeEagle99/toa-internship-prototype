import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "toa-project";
import { CalendarDays } from "lucide-react";

const triggerClass =
  "text-accent underline-offset-4 hover:underline cursor-pointer";

export function UserHoverCard() {
  return (
    <HoverCard defaultOpen>
      <HoverCardTrigger
        render={<a className={triggerClass}>@eleanor.whitfield</a>}
      />
      <HoverCardContent>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontWeight: 600 }} className="text-fg">
            Eleanor Whitfield
          </div>
          <p style={{ fontSize: 14, margin: 0 }} className="text-fg-muted">
            Head of Finance at Acme. Keeps the quarterly numbers honest.
          </p>
          <div
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}
            className="text-fg-subtle"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Joined March 2021
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export function RepoHoverCard() {
  return (
    <HoverCard defaultOpen>
      <HoverCardTrigger render={<a className={triggerClass}>acme/ledger</a>} />
      <HoverCardContent>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontWeight: 600 }} className="text-fg">
            acme/ledger
          </div>
          <p style={{ fontSize: 14, margin: 0 }} className="text-fg-muted">
            Double-entry bookkeeping engine powering the finance portal.
          </p>
          <div style={{ fontSize: 12 }} className="text-fg-subtle">
            Updated 2 hours ago
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
