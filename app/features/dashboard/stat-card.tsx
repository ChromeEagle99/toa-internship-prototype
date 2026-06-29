import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router";

import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/**
 * A headline figure with an icon, optionally linking through to its resource.
 * Shared across dashboard views so every role's dashboard reads the same.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  to?: string;
}) {
  const body = (
    <Card className={cn("h-full transition-colors", to && "hover:border-accent/50")}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-1">
          <Text size="sm" variant="muted">
            {label}
          </Text>
          <p className="text-3xl font-semibold tracking-tight text-fg">{value}</p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-accent/10 text-accent">
          {to ? <ArrowUpRight className="size-5" /> : <Icon className="size-5" />}
        </span>
      </CardContent>
    </Card>
  );

  return to ? (
    <Link
      to={to}
      className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {body}
    </Link>
  ) : (
    body
  );
}
