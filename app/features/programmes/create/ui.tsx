import { Fragment } from "react";
import { Check } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

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

/** The top step bar: numbered nodes joined by connectors, label beside each. */
export function StepBar({
  current,
  visited,
  onStepClick,
}: {
  current: number;
  visited: number;
  onStepClick: (index: number) => void;
}) {
  return (
    <div className="flex items-center">
      {STEPS.map((title, index) => {
        const isCompleted = index < current;
        const isCurrent = index === current;
        const isClickable = index <= visited;
        const isLast = index === STEPS.length - 1;
        return (
          <Fragment key={title}>
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(index)}
              className={cn(
                "flex shrink-0 items-center gap-2",
                isClickable ? "cursor-pointer" : "cursor-default",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isCompleted || isCurrent
                    ? "bg-accent text-accent-fg"
                    : "border border-border bg-bg text-fg-muted",
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  isCurrent ? "text-accent" : isCompleted ? "text-fg" : "text-fg-muted",
                )}
              >
                {title}
              </span>
            </button>
            {!isLast ? (
              <div
                className={cn(
                  "mx-4 h-px flex-1 transition-colors",
                  index < current ? "bg-accent" : "bg-border",
                )}
              />
            ) : null}
          </Fragment>
        );
      })}
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
