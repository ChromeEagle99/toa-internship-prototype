import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";

import type { MonthValue } from "~/components/month-picker";
import { Required } from "~/components/required";

import type { IntakeDraft } from "./types";

/** Presentational building blocks shared across the Create Programme wizard steps. */

/** The wizard's ordered steps. */
export const STEPS = ["Details", "Intakes", "Review"] as const;

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** "Aug26" for a month value. */
function shortMonth(value: MonthValue): string {
  return `${MONTHS_SHORT[value.month]}${String(value.year).slice(2)}`;
}

/** "Aug26 – Dec26", or a fallback when the period isn't fully set. */
export function monthRangeLabel(
  intake: IntakeDraft,
  fallback = "Set internship period",
): string {
  if (intake.internshipStart && intake.internshipEnd) {
    return `${shortMonth(intake.internshipStart)} – ${shortMonth(intake.internshipEnd)}`;
  }
  return fallback;
}

/** The uppercase card section header with a divider, e.g. "DETAILS". */
export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 border-b border-border pb-3">
      <Text as="p" size="xs" variant="subtle" weight="semibold" className="uppercase tracking-wider">
        {children}
      </Text>
    </div>
  );
}

/** Label + optional hint stacked above a field's control. */
export function FieldBlock({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label className="text-sm font-medium text-fg">
          {label}{required ? <Required /> : null}
        </Label>
        {hint ? (
          <Text as="p" size="xs" variant="muted" className="mt-0.5">
            {hint}
          </Text>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** A label + value pair for the Review summary grid. */
export function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text as="p" size="xs" variant="muted">
        {label}
      </Text>
      <Text as="p" size="sm" weight="semibold" className="mt-0.5">
        {value || "—"}
      </Text>
    </div>
  );
}
