import { Hammer } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

/** Placeholder for routes that are reachable in the nav but not yet built. */
export function PagePlaceholder({ title }: { title: string }) {
  return (
    <EmptyState
      icon={<Hammer className="h-6 w-6" />}
      title={`${title} — coming soon`}
      description="This page is part of a later slice. The route and navigation work; the screen is not built yet."
    />
  );
}
