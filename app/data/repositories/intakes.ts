import { z } from "zod";

import { createRepository, newId } from "../repository";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  INTAKE — a recruitment window inside a [[programmes|Programme]].
 * ─────────────────────────────────────────────────────────────────────────────
 *  One Programme has many Intakes (e.g. "Jan–Jun 2026", "Jun–Dec 2026"). An
 *  Intake is the join that links approved Projects to a Programme: a Project is
 *  attached to an Intake (see `attachableToIntake` in [[projects]]) when the
 *  education level matches, the project is Approved, and its internship period
 *  falls within the intake's period.
 *
 *  Built now as data so the attach rule is implementable in the next slice; not
 *  yet surfaced in the Phase 1 UI.
 */

export const INTAKE_STATUSES = ["draft", "open", "closed", "completed"] as const;
export type IntakeStatus = (typeof INTAKE_STATUSES)[number];

export const IntakeSchema = z.object({
  id: z.string().min(1),
  /** FK → Programme.id. The intake inherits the programme's education level. */
  programmeId: z.string().min(1),
  /**
   * Auto-generated from the internship period (e.g. "Jan–Jun 2026") but editable
   * (v6 "Auto, editable"). Defaulted so pre-existing stored rows still parse.
   */
  intakeTitle: z.string().default(""),
  /** Internship period (ISO dates — first/last day of month per the prototype). */
  internshipStart: z.string(),
  internshipEnd: z.string(),
  /** Application window (ISO dates). */
  applicationOpen: z.string(),
  applicationClose: z.string(),
  status: z.enum(INTAKE_STATUSES).default("draft"),
  /** Calculated from the internship period (whole months, inclusive of both). */
  durationMonths: z.number().int().nonnegative().default(0),
  createdBy: z.string().min(1),
  createdAt: z.string(),
});

export type Intake = z.infer<typeof IntakeSchema>;

export const intakesRepository = createRepository<Intake>({
  resource: "intakes",
  schema: IntakeSchema,
  identify: (intake) => intake.id,
});

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** Whole months spanned by an ISO period, inclusive of both endpoints. */
export function intakeDurationMonths(start: string, end: string): number {
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  if (!sy || !sm || !ey || !em) return 0;
  return Math.max(0, (ey - sy) * 12 + (em - sm) + 1);
}

/** "Jan–Jun 2026" (same year) or "Nov 2025–Apr 2026" (spanning years). */
export function intakeTitleFromPeriod(start: string, end: string): string {
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  if (!sy || !sm || !ey || !em) return "";
  const s = MONTH_ABBR[sm - 1] ?? "";
  const e = MONTH_ABBR[em - 1] ?? "";
  return sy === ey ? `${s}–${e} ${ey}` : `${s} ${sy}–${e} ${ey}`;
}

/** Build a new draft Intake. Callers still go through the repository's `create`. */
export function makeIntake(input: {
  programmeId: string;
  internshipStart: string;
  internshipEnd: string;
  applicationOpen: string;
  applicationClose: string;
  createdBy: string;
  createdAt: string;
  status?: IntakeStatus;
  /** Override the auto-generated title; falls back to the derived period title. */
  intakeTitle?: string;
  /** Override the calculated duration; falls back to the derived month count. */
  durationMonths?: number;
}): Intake {
  return {
    id: newId(),
    programmeId: input.programmeId,
    intakeTitle:
      input.intakeTitle?.trim() ||
      intakeTitleFromPeriod(input.internshipStart, input.internshipEnd),
    internshipStart: input.internshipStart,
    internshipEnd: input.internshipEnd,
    applicationOpen: input.applicationOpen,
    applicationClose: input.applicationClose,
    status: input.status ?? "draft",
    durationMonths:
      input.durationMonths ?? intakeDurationMonths(input.internshipStart, input.internshipEnd),
    createdBy: input.createdBy,
    createdAt: input.createdAt,
  };
}
