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
  /** Internship period (ISO dates — first/last day of month per the prototype). */
  internshipStart: z.string(),
  internshipEnd: z.string(),
  /** Application window (ISO dates). */
  applicationOpen: z.string(),
  applicationClose: z.string(),
  status: z.enum(INTAKE_STATUSES).default("draft"),
  createdBy: z.string().min(1),
  createdAt: z.string(),
});

export type Intake = z.infer<typeof IntakeSchema>;

export const intakesRepository = createRepository<Intake>({
  resource: "intakes",
  schema: IntakeSchema,
  identify: (intake) => intake.id,
});

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
}): Intake {
  return {
    id: newId(),
    programmeId: input.programmeId,
    internshipStart: input.internshipStart,
    internshipEnd: input.internshipEnd,
    applicationOpen: input.applicationOpen,
    applicationClose: input.applicationClose,
    status: input.status ?? "draft",
    createdBy: input.createdBy,
    createdAt: input.createdAt,
  };
}
