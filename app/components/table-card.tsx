import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Framed container for a PRIZM `<Table>`, matching the TOA mockup's table look:
 * a rounded, bordered surface with a soft shadow and clipped corners, a subtle
 * muted header band with uppercase column labels, roomier cells, and an optional
 * footer (e.g. a result count). The design treatment is applied to the table
 * within via descendant selectors, so call sites keep using the plain PRIZM
 * table parts.
 */
export function TableCard({
  children,
  footer,
  className,
}: {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-surface shadow-sm",
        "[&_thead]:bg-bg-muted [&_thead_th]:px-4 [&_thead_th]:uppercase [&_thead_th]:tracking-wider",
        "[&_tbody_td]:px-4 [&_tbody_td]:py-3",
        className,
      )}
    >
      {children}
      {footer ? (
        <div className="border-t border-border px-4 py-2.5 text-xs text-fg-muted">{footer}</div>
      ) : null}
    </div>
  );
}
